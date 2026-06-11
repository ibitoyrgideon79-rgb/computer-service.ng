"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown, Trash2, Download, Image, Search, X, MessageSquare, Send, Paperclip, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") ?? "";
}

function authHeaders(): HeadersInit {
  return { authorization: `Bearer ${getToken()}` };
}

interface PartnerApplication {
  id: string;
  full_name: string;
  company_name: string;
  email: string;
  phone_number: string;
  address: string;
  position: string;
  business_details: string;
  services: string;
  photo_count: number;
  status: "Pending" | "Reviewed" | "Approved" | "Rejected";
  created_at: string;
}

interface PartnerPhoto {
  id: string;
  label: string;
  dataUrl: string;
}

interface PartnerUpdate {
  id: string;
  message: string;
  imageDataUrl: string | null;
  createdAt: string;
}

export default function PartnersAdmin() {
  const router = useRouter();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [photoCache, setPhotoCache] = useState<Record<string, PartnerPhoto[]>>({});
  const [loadingPhotos, setLoadingPhotos] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lightboxPhoto, setLightboxPhoto] = useState<PartnerPhoto | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<{ src: string; label: string } | null>(null);
  const [updates, setUpdates] = useState<Record<string, PartnerUpdate[]>>({});
  const [updateMessage, setUpdateMessage] = useState<Record<string, string>>({});
  const [updateImage, setUpdateImage] = useState<Record<string, string>>({});
  const [postingUpdate, setPostingUpdate] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/partners", { headers: authHeaders() });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : (data.applications || []));
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!getToken()) { router.push("/admin/login"); return; }
    fetchApplications();
  }, [fetchApplications, router]);

  const fetchPhotos = async (id: string) => {
    if (photoCache[id]) return;
    setLoadingPhotos(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}/photos`, { headers: authHeaders() });
      if (res.ok) {
        const photos = await res.json() as PartnerPhoto[];
        setPhotoCache(prev => ({ ...prev, [id]: photos }));
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoadingPhotos(null);
    }
  };

  const fetchUpdates = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/partners/${id}/updates`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json() as PartnerUpdate[];
        setUpdates(prev => ({ ...prev, [id]: data }));
      }
    } catch (error) {
      console.error("Error fetching updates:", error);
    }
  };

  const handleExpand = (id: string) => {
    const newId = expandedId === id ? null : id;
    setExpandedId(newId);
    if (newId) {
      fetchPhotos(newId);
      fetchUpdates(newId);
    }
  };

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new window.Image();
        img.onerror = reject;
        img.onload = () => {
          const MAX = 1400;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(reader.result as string); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleUpdateImageChange = async (id: string, file: File | null) => {
    if (!file) { setUpdateImage(prev => ({ ...prev, [id]: "" })); return; }
    try {
      const dataUrl = await compressImage(file);
      setUpdateImage(prev => ({ ...prev, [id]: dataUrl }));
    } catch (err) {
      console.error("image compress failed", err);
    }
  };

  const postUpdate = async (id: string) => {
    const message = (updateMessage[id] || "").trim();
    if (!message) return;
    setPostingUpdate(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message, imageDataUrl: updateImage[id] || null }),
      });
      if (res.ok) {
        const created = await res.json() as PartnerUpdate;
        setUpdates(prev => ({ ...prev, [id]: [created, ...(prev[id] || [])] }));
        setUpdateMessage(prev => ({ ...prev, [id]: "" }));
        setUpdateImage(prev => ({ ...prev, [id]: "" }));
      }
    } catch (error) {
      console.error("Error posting update:", error);
    } finally {
      setPostingUpdate(null);
    }
  };

  const deleteUpdate = async (partnerId: string, updateId: string) => {
    if (!confirm("Delete this update?")) return;
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}/updates/${updateId}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (res.ok) {
        setUpdates(prev => ({ ...prev, [partnerId]: (prev[partnerId] || []).filter(u => u.id !== updateId) }));
      }
    } catch (error) {
      console.error("Error deleting update:", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications(prev =>
          prev.map(app => app.id === id ? { ...app, status: newStatus as PartnerApplication["status"] } : app)
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Delete this partner application? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const downloadPhoto = (photo: PartnerPhoto) => {
    const a = document.createElement("a");
    a.href = photo.dataUrl;
    a.download = `${photo.label.replace(/\s+/g, "_")}.jpg`;
    a.click();
  };

  const filteredApps = applications.filter(app => {
    const statusMatch = filter === "all" || app.status.toLowerCase() === filter;
    if (!statusMatch) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (app.full_name || "").toLowerCase().includes(q) ||
      (app.company_name || "").toLowerCase().includes(q) ||
      (app.email || "").toLowerCase().includes(q) ||
      (app.phone_number || "").toLowerCase().includes(q) ||
      (app.address || "").toLowerCase().includes(q) ||
      (app.position || "").toLowerCase().includes(q) ||
      (app.business_details || "").toLowerCase().includes(q) ||
      (app.services || "").toLowerCase().includes(q) ||
      (app.status || "").toLowerCase().includes(q)
    );
  });

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === "Pending").length,
    approved: applications.filter(a => a.status === "Approved").length,
    rejected: applications.filter(a => a.status === "Rejected").length,
  };

  const statusConfig = {
    Pending:  { icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-200" },
    Reviewed: { icon: ChevronDown,  color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200"   },
    Approved: { icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200"  },
    Rejected: { icon: XCircle,      color: "text-red-600",    bg: "bg-red-50",     border: "border-red-200"    },
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading partner applications…</div>;
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Partner Applications</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, company, city, state or service…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5123d4]/40"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === tab ? "bg-[#5123d4] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="text-center text-gray-400 py-12">No applications found.</div>
      )}

      <div className="space-y-3">
        {filteredApps.map(app => {
          const StatusIcon = statusConfig[app.status].icon;
          const photos = photoCache[app.id] ?? [];
          const serviceList = app.services ? app.services.split(", ").filter(Boolean) : [];

          return (
            <div
              key={app.id}
              className={`border-2 rounded-xl overflow-hidden ${statusConfig[app.status].bg} ${statusConfig[app.status].border}`}
            >
              {/* Header row */}
              <div
                className="flex items-start justify-between p-4 cursor-pointer"
                onClick={() => handleExpand(app.id)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <StatusIcon className={`w-5 h-5 mt-0.5 shrink-0 ${statusConfig[app.status].color}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black">{app.full_name}</h3>
                    <p className="text-sm text-gray-600">{app.company_name}</p>
                    {serviceList.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {serviceList.map(s => (
                          <span key={s} className="text-xs bg-white border border-gray-300 text-gray-800 px-2 py-0.5 rounded font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString()}</p>
                  <p className={`font-bold text-sm ${statusConfig[app.status].color}`}>{app.status}</p>
                  {app.photo_count > 0 && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                      <Image className="w-3 h-3" /> {app.photo_count} photo{app.photo_count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === app.id && (
                <div className="border-t border-current border-opacity-20 bg-white/60 p-4 space-y-5">

                  {/* Info grid */}
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Email</p><p className="text-black">{app.email}</p></div>
                    <div><p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Phone</p><p className="text-black">{app.phone_number || "—"}</p></div>
                    <div><p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Position</p><p className="text-black">{app.position || "—"}</p></div>
                    <div><p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Address</p><p className="text-black">{app.address || "—"}</p></div>
                    {app.business_details && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">Business Details</p>
                        <p className="text-black text-sm leading-relaxed">{app.business_details}</p>
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  {loadingPhotos === app.id ? (
                    <p className="text-xs text-gray-400">Loading photos…</p>
                  ) : photos.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Photos & Documents</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {photos.map(photo => (
                          <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.dataUrl}
                              alt={photo.label}
                              onClick={() => setLightboxPhoto(photo)}
                              className="w-full h-32 object-cover cursor-zoom-in"
                            />
                            <div
                              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-none"
                            >
                              <button
                                type="button"
                                onClick={() => setLightboxPhoto(photo)}
                                className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-medium shadow pointer-events-auto"
                              >
                                Click to enlarge
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadPhoto(photo)}
                                className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow pointer-events-auto"
                              >
                                <Download className="w-3 h-3" /> Download
                              </button>
                            </div>
                            <p className="px-2 py-1.5 text-xs font-medium text-gray-700 truncate">{photo.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : app.photo_count > 0 ? (
                    <p className="text-xs text-gray-400">Photos could not be loaded.</p>
                  ) : null}

                  {/* Updates section */}
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Updates & Messages
                    </p>

                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
                      <textarea
                        placeholder="Write a message to this partner (they'll receive it by email)…"
                        value={updateMessage[app.id] || ""}
                        onChange={(e) => setUpdateMessage(prev => ({ ...prev, [app.id]: e.target.value }))}
                        rows={3}
                        className="w-full text-sm text-black bg-[#F1F5F9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5123d4] resize-none"
                      />
                      {updateImage[app.id] && (
                        <div className="relative inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={updateImage[app.id]} alt="attachment preview" className="h-20 rounded-md border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => handleUpdateImageChange(app.id, null)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#5123d4] cursor-pointer">
                          <Paperclip className="w-3.5 h-3.5" />
                          {updateImage[app.id] ? "Change image" : "Attach image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpdateImageChange(app.id, e.target.files?.[0] || null)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => postUpdate(app.id)}
                          disabled={postingUpdate === app.id || !(updateMessage[app.id] || "").trim()}
                          className="inline-flex items-center gap-1.5 bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-xs font-medium"
                        >
                          {postingUpdate === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          {postingUpdate === app.id ? "Sending…" : "Post & Email Partner"}
                        </button>
                      </div>
                    </div>

                    {(updates[app.id] || []).length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No updates yet for this partner.</p>
                    ) : (
                      <div className="space-y-2">
                        {(updates[app.id] || []).map(u => (
                          <div key={u.id} className="bg-white border border-gray-200 rounded-lg p-3 flex gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap wrap-break-word">{u.message}</p>
                              {u.imageDataUrl && (
                                <button
                                  type="button"
                                  onClick={() => setLightboxSrc({ src: u.imageDataUrl as string, label: "Update image" })}
                                  className="mt-2 inline-block"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={u.imageDataUrl} alt="update" className="h-24 rounded-md border border-gray-200 hover:opacity-90 cursor-zoom-in" />
                                </button>
                              )}
                              <p className="text-[11px] text-gray-400 mt-1.5">{new Date(u.createdAt).toLocaleString()}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteUpdate(app.id, u.id)}
                              className="text-gray-400 hover:text-red-600 self-start"
                              title="Delete update"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    {app.status !== "Approved" && (
                      <button
                        onClick={() => updateStatus(app.id, "Approved")}
                        disabled={updatingId === app.id}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {app.status !== "Rejected" && (
                      <button
                        onClick={() => updateStatus(app.id, "Rejected")}
                        disabled={updatingId === app.id}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    {app.status === "Pending" && (
                      <button
                        onClick={() => updateStatus(app.id, "Reviewed")}
                        disabled={updatingId === app.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteApplication(app.id)}
                      disabled={deletingId === app.id}
                      className="ml-auto bg-white border border-red-300 hover:bg-red-50 disabled:opacity-50 text-red-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === app.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold text-sm">{lightboxPhoto.label}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => downloadPhoto(lightboxPhoto)}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-medium"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxPhoto.dataUrl}
              alt={lightboxPhoto.label}
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-black"
            />
            <p className="text-white/40 text-xs text-center mt-3">Click outside to close</p>
          </div>
        </div>
      )}

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold text-sm">{lightboxSrc.label}</span>
              <div className="flex items-center gap-1">
                <a
                  href={lightboxSrc.src}
                  download={`${lightboxSrc.label.replace(/\s+/g, "_")}.jpg`}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-medium"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxSrc(null)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxSrc.src}
              alt={lightboxSrc.label}
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-black"
            />
            <p className="text-white/40 text-xs text-center mt-3">Click outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
