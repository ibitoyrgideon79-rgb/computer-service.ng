"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown, Trash2, Download, Image, Search } from "lucide-react";

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

export default function PartnersAdmin() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [photoCache, setPhotoCache] = useState<Record<string, PartnerPhoto[]>>({});
  const [loadingPhotos, setLoadingPhotos] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : (data.applications || []));
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const fetchPhotos = async (id: string) => {
    if (photoCache[id]) return;
    setLoadingPhotos(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}/photos`);
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

  const handleExpand = (id: string) => {
    const newId = expandedId === id ? null : id;
    setExpandedId(newId);
    if (newId) fetchPhotos(newId);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
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
      (app.address || "").toLowerCase().includes(q) ||
      (app.services || "").toLowerCase().includes(q)
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
    <div className="p-6 max-w-6xl mx-auto">
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
                        {serviceList.slice(0, 4).map(s => (
                          <span key={s} className="text-xs bg-white/80 border border-white px-2 py-0.5 rounded font-medium">{s}</span>
                        ))}
                        {serviceList.length > 4 && (
                          <span className="text-xs text-gray-500">+{serviceList.length - 4} more</span>
                        )}
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
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => downloadPhoto(photo)}
                                className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow"
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
    </div>
  );
}
