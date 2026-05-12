"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Package, Clock, Loader2, TrendingUp, CheckCircle,
  Truck, XCircle, Search, RefreshCw, X, ChevronDown,
  Phone, Mail, MapPin, Layers, MessageCircle, Trash2, Download, LogOut, ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") ?? "";
}

function authHeaders(): HeadersInit {
  return { authorization: `Bearer ${getToken()}` };
}


interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  phone_number: string;
  email: string;
  service: string;
  category: string;
  location: string;
  delivery_method: string;
  deadline: string;
  amount: number;
  status: string;
  print_color: string;
  paper_type: string;
  pages: number;
  copies: number;
  express_service: boolean;
  print_layout: string;
  finishing_option: string;
  specific_instruction: string;
  pickup_state: string;
  pickup_city: string;
  pickup_location: string;
  delivery_details: string;
  paystack_ref: string;
  file_url: string | null;
  document_text: string | null;
  created_at: string;
}

interface PartnerPhoto {
  id: string;
  label: string;
  dataUrl: string;
}

interface PartnerApplication {
  id: string;
  full_name: string;
  company_name: string;
  email: string;
  address: string;
  phone_number: string;
  position: string;
  business_details: string;
  services: string;
  photo_count: number;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  inTransit: number;
  completed: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}


const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  "Pending Approval":    { badge: "bg-gray-100    text-gray-600    border-gray-200",   dot: "bg-gray-400"    },
  "Approved for Payment":{ badge: "bg-amber-100   text-amber-700   border-amber-200",  dot: "bg-amber-400"   },
  Pending:               { badge: "bg-yellow-100  text-yellow-700  border-yellow-200", dot: "bg-yellow-400"  },
  "In Progress":         { badge: "bg-blue-100    text-blue-700    border-blue-200",   dot: "bg-blue-400"    },
  "Ready for Delivery":  { badge: "bg-purple-100  text-purple-700  border-purple-200", dot: "bg-purple-400"  },
  "In Transit":          { badge: "bg-orange-100  text-orange-700  border-orange-200", dot: "bg-orange-400"  },
  Completed:             { badge: "bg-green-100   text-green-700   border-green-200",  dot: "bg-green-400"   },
  Delivered:             { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  Cancelled:             { badge: "bg-red-100     text-red-700     border-red-200",    dot: "bg-red-400"     },
};

const STATUS_LIST = [
  "Pending Approval", "Approved for Payment",
  "Pending", "In Progress", "Ready for Delivery",
  "In Transit", "Completed", "Delivered", "Cancelled",
];

const TABS = ["All", "Pending Approval", "Approved for Payment", "Pending", "In Progress", "In Transit", "Completed", "Delivered", "Cancelled"];


function StatCard({
  label, value, icon: Icon, color,
}: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-black leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}


function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}


function StatusUpdater({ order, onUpdate }: { order: Order; onUpdate: (id: string, status: string) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choose = async (status: string) => {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      onUpdate(order.id, status);
      toast.success(`Order ${order.order_id} → ${status}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors"
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && (
        <div className="absolute right-0 top-6 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
          {STATUS_LIST.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => choose(s)}
              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${s === order.status ? "text-[#5123d4] font-semibold" : "text-gray-700"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


const fmt = (v: string | null | undefined) => v || "—";

function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? "234" + digits.slice(1) : digits;
  return `https://wa.me/${normalized}`;
}

function exportCSV(orders: Order[]) {
  const cols = [
    "Order ID", "Customer", "Phone", "Email", "Service", "Category",
    "Amount", "Status", "Delivery", "Location", "Pages", "Copies",
    "Print Color", "Paper", "Express", "Finishing", "Date",
  ];
  const rows = orders.map((o) => [
    o.order_id, o.customer_name, o.phone_number, o.email,
    o.service, o.category || "",
    o.amount, o.status, o.delivery_method || "",
    o.location || "", o.pages || 1, o.copies || 1,
    o.print_color || "", o.paper_type || "",
    o.express_service ? "Yes" : "No",
    o.finishing_option || "",
    format(new Date(o.created_at), "d MMM yyyy HH:mm"),
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`));

  const csv = [cols.map((c) => `"${c}"`).join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPhoto(dataUrl: string, label: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  const ext = dataUrl.includes("image/png") ? "png" : "jpg";
  a.download = `${label.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}


function DetailPanel({ order, onClose, onDelete }: { order: Order; onClose: () => void; onDelete: (id: string) => void }) {
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError,    setDeleteError]    = useState("");
  const [deleting,       setDeleting]       = useState(false);

  const cancelDelete = () => {
    setConfirmDelete(false);
    setDeletePassword("");
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!deletePassword) { setDeleteError("Please enter your admin password to confirm."); return; }
    setDeleting(true); setDeleteError("");
    try {
      // Verify admin password first
      const verifyRes = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!verifyRes.ok) {
        setDeleteError("Incorrect password. Please try again.");
        setDeleting(false);
        return;
      }
      // Password confirmed — proceed with delete
      const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      onDelete(order.id);
      onClose();
      toast.success(`Order ${order.order_id} deleted`);
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium">Order Details</p>
            <h2 className="text-lg font-bold text-black">{order.order_id}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grow px-6 py-5 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusBadge status={order.status} />
            <span className="text-xs text-gray-400">{format(new Date(order.created_at), "d MMM yyyy, h:mm a")}</span>
          </div>

          {/* Amount */}
          <div className="bg-[#f0ebff] rounded-xl p-4 text-center">
            <p className="text-xs text-[#5123d4] font-medium mb-1">Order Amount</p>
            <p className="text-3xl font-bold text-[#5123d4]">₦{order.amount?.toLocaleString()}</p>
          </div>

          {/* Customer */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#5123d4] text-white flex items-center justify-center text-sm font-bold">
                  {order.customer_name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-black">{fmt(order.customer_name)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Phone" value={fmt(order.phone_number)} />
                <DetailRow label="Email" value={fmt(order.email)} />
              </div>
            </div>
          </section>

          {/* Service */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Service</h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Service" value={fmt(order.service)} />
              <DetailRow label="Category" value={fmt(order.category)} />
              <DetailRow label="Deadline" value={fmt(order.deadline)} />
              <DetailRow label="Delivery" value={fmt(order.delivery_method)} />
            </div>
          </section>

          {/* Print options (show if relevant) */}
          {(order.print_color || order.paper_type || order.copies > 1 || order.pages > 1) && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Print Options</h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailRow label="Colour" value={fmt(order.print_color)} />
                <DetailRow label="Paper" value={fmt(order.paper_type)} />
                <DetailRow label="Pages" value={String(order.pages || 1)} />
                <DetailRow label="Copies" value={String(order.copies || 1)} />
                <DetailRow label="Layout" value={fmt(order.print_layout)} />
                <DetailRow label="Finishing" value={fmt(order.finishing_option)} />
                <DetailRow label="Express" value={order.express_service ? "Yes (+50%)" : "No"} />
              </div>
            </section>
          )}

          {/* Delivery */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Delivery / Pickup</h3>
            <div className="grid grid-cols-1 gap-3">
              <DetailRow label="Method" value={fmt(order.delivery_method)} />
              {["Express Delivery", "Standard Delivery", "Economy Delivery"].includes(order.delivery_method) ? (
                <>
                  {order.pickup_location && <DetailRow label="Street / Landmark" value={order.pickup_location} />}
                  {order.pickup_city     && <DetailRow label="City / Area"        value={order.pickup_city} />}
                  {order.pickup_state    && <DetailRow label="State"              value={order.pickup_state} />}
                </>
              ) : order.delivery_method === "Schedule Delivery" && order.delivery_details ? (
                (() => {
                  try {
                    const stops = JSON.parse(order.delivery_details) as { address: string; date: string; time: string }[];
                    return (
                      <>
                        {stops.map((s, i) => (
                          <DetailRow key={i} label={`Stop ${i + 1}`} value={`${s.address} — ${s.date} at ${s.time}`} />
                        ))}
                      </>
                    );
                  } catch {
                    return <DetailRow label="Delivery Details" value={order.delivery_details} />;
                  }
                })()
              ) : order.delivery_method === "Special Submission" ? (
                <DetailRow label="Action" value="Submitar.com submission" />
              ) : (
                order.delivery_details && <DetailRow label="Delivery Address" value={order.delivery_details} />
              )}
            </div>
          </section>

          {/* Notes */}
          {order.specific_instruction && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Special Instructions</h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {order.specific_instruction}
              </p>
            </section>
          )}

          {/* Ref */}
          {order.paystack_ref && (
            <DetailRow label="Payment Reference" value={order.paystack_ref} />
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-3">
          <div className="flex gap-2">
            <a
              href={`tel:${order.phone_number}`}
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
            <a
              href={whatsappUrl(order.phone_number)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 rounded-xl py-2.5 text-sm font-medium text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            {order.email && (
              <a
                href={`mailto:${order.email}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#5123d4] hover:bg-[#401AA0] rounded-xl py-2.5 text-sm font-medium text-white transition-colors"
              >
                <Mail className="w-4 h-4" /> Email
              </a>
            )}
          </div>

          {/* Delete */}
          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium">Enter your admin password to confirm deletion:</p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }}
                placeholder="Admin password"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                autoFocus
              />
              {deleteError && <p className="text-red-500 text-xs">{deleteError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={cancelDelete}
                  className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} disabled={deleting || !deletePassword}
                  className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl py-2 text-sm font-medium text-white transition-colors disabled:opacity-50">
                  {deleting ? "Deleting…" : "Confirm Delete"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl py-2 text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders]               = useState<Order[]>([]);
  const [stats, setStats]                 = useState<Stats | null>(null);
  const [loading, setLoading]             = useState(true);
  const [statsLoading, setStatsLoading]   = useState(true);
  const [search, setSearch]               = useState("");
  const [activeTab, setActiveTab]         = useState("All");
  const [selectedOrder, setSelectedOrder]     = useState<Order | null>(null);
  const [liveCount, setLiveCount]             = useState(0);
  const [partners, setPartners]               = useState<PartnerApplication[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null);
  const [partnerPhotos, setPartnerPhotos] = useState<Record<string, PartnerPhoto[]>>({});
  const [photosLoading, setPhotosLoading] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ dataUrl: string; label: string } | null>(null);
  const prevCountRef                          = useRef(0);

  const handleLogout = async () => {
    localStorage.removeItem("admin_token");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };


  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/stats", { headers: authHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setStats(data);
    } catch {
      /* silent */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "All") params.set("status", activeTab);
      if (search) params.set("search", search);
      const res  = await fetch(`/api/admin/orders?${params}`, { headers: authHeaders() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);
  useEffect(() => { void fetchStats();  }, [fetchStats]);

  useEffect(() => {
    document.title = liveCount > 0
      ? `(${liveCount}) Dashboard — computerservice.ng`
      : "Dashboard — computerservice.ng";
  }, [liveCount]);


  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res  = await fetch("/api/admin/orders", { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json() as Order[];
        if (!Array.isArray(data)) return;
        const newCount = data.length;
        if (newCount > prevCountRef.current && prevCountRef.current > 0) {
          const added = newCount - prevCountRef.current;
          setLiveCount((c) => c + added);
          toast.success(`${added} new order${added > 1 ? "s" : ""} received`, { duration: 5000, icon: "📦" });
          void fetchStats();
        }
        prevCountRef.current = newCount;
        setOrders(data);
      } catch { /* silent */ }
    }, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleStatusUpdate = useCallback((id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSelectedOrder((sel) => (sel?.id === id ? { ...sel, status } : sel));
    fetchStats();
  }, [fetchStats]);

  const handleDeleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    fetchStats();
  }, [fetchStats]);

  const fetchPartners = useCallback(async () => {
    setPartnersLoading(true);
    try {
      const res  = await fetch("/api/admin/partners", { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setPartners(data);
    } catch { /* silent */ } finally {
      setPartnersLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPartners(); }, [fetchPartners]);

  const fetchPartnerPhotos = useCallback(async (id: string) => {
    if (partnerPhotos[id]) return;
    setPhotosLoading(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}/photos`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setPartnerPhotos(prev => ({ ...prev, [id]: data }));
    } catch { /* silent */ } finally {
      setPhotosLoading(null);
    }
  }, [partnerPhotos]);

  const handlePartnerStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      toast.success(`Application marked as ${status}`);
    } catch {
      toast.error("Failed to update application");
    }
  }, []);


  const statCards = stats
    ? [
        { label: "Total Orders",  value: stats.total,       icon: Package,      color: "bg-[#5123d4]" },
        { label: "Pending",       value: stats.pending,     icon: Clock,        color: "bg-yellow-500" },
        { label: "In Progress",   value: stats.inProgress,  icon: Loader2,      color: "bg-blue-500"   },
        { label: "In Transit",    value: stats.inTransit,   icon: Truck,        color: "bg-orange-500" },
        { label: "Delivered",     value: stats.delivered,   icon: CheckCircle,  color: "bg-emerald-500" },
        { label: "Cancelled",     value: stats.cancelled,   icon: XCircle,      color: "bg-red-500"    },
        { label: "Revenue",       value: `₦${(stats.revenue || 0).toLocaleString()}`, icon: TrendingUp, color: "bg-[#190934]" },
      ]
    : [];


  const tabCount = (tab: string): number => {
    if (!stats) return 0;
    const map: Record<string, number> = {
      All:          stats.total,
      Pending:      stats.pending,
      "In Progress":stats.inProgress,
      "In Transit": stats.inTransit,
      Completed:    stats.completed,
      Delivered:    stats.delivered,
      Cancelled:    stats.cancelled,
    };
    return map[tab] ?? 0;
  };


  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-[#f4f5f7]">
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-bold text-black">Dashboard</h1>
            <p className="text-xs text-gray-400">computerservice.ng — Admin Portal</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live indicator */}
            <button
              type="button"
              onClick={() => liveCount > 0 ? setLiveCount(0) : undefined}
              className={`flex items-center gap-1.5 border text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full transition-colors ${liveCount > 0 ? "bg-[#5123d4] border-[#401AA0] text-white" : "bg-green-50 border-green-200 text-green-700"}`}
              title={liveCount > 0 ? "Click to clear notifications" : "Live"}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${liveCount > 0 ? "bg-white" : "bg-green-500"}`} />
              <span className="hidden sm:inline">Live</span>
              {liveCount > 0 && <span className="bg-white text-[#5123d4] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">{liveCount}</span>}
            </button>
            <button
              type="button"
              onClick={() => { fetchOrders(); fetchStats(); }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                    {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
              {statCards.map((c) => (
                <StatCard key={c.label} {...c} />
              ))}
            </div>
          )}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <h2 className="text-base font-bold text-black">Orders</h2>
              <div className="grow" />
              {/* CSV export */}
              <button
                type="button"
                onClick={() => exportCSV(orders)}
                disabled={orders.length === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ID or name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
                />
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-100 overflow-x-auto">
              {TABS.map((tab) => {
                const count = tabCount(tab);
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "bg-[#5123d4] text-white"
                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                    {count > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading orders…
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Package className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-medium">Order ID</th>
                      <th className="text-left px-5 py-3 font-medium">Customer</th>
                      <th className="text-left px-5 py-3 font-medium">Contact</th>
                      <th className="text-left px-5 py-3 font-medium">Location</th>
                      <th className="text-left px-5 py-3 font-medium">Service</th>
                      <th className="text-left px-5 py-3 font-medium">Amount</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium sr-only">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 hover:bg-[#f8f7ff] transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/dashboard/orders/${order.id}`)}
                            className="font-mono text-xs font-semibold text-[#5123d4] hover:underline"
                          >
                            {order.order_id}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-black">{order.customer_name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{order.phone_number}</td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {order.location || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <span className="text-black font-medium">{order.service}</span>
                            {order.category && (
                              <span className="text-xs text-gray-400 ml-1">— {order.category}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-black">
                          ₦{(order.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={order.status} />
                            <StatusUpdater order={order} onUpdate={handleStatusUpdate} />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                          {format(new Date(order.created_at), "d MMM")}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            {/* Quick-peek panel */}
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                              title="Quick view"
                            >
                              <Layers className="w-4 h-4" />
                            </button>
                            {/* Full project details + download */}
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/dashboard/orders/${order.id}`)}
                              className="p-1.5 rounded-lg hover:bg-[#f0ebff] transition-colors text-gray-400 hover:text-[#5123d4]"
                              title="View project details & download"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            {/* Direct download (only when file attached) */}
                            {order.file_url && (
                              <a
                                href={order.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg hover:bg-green-50 transition-colors text-gray-400 hover:text-green-600"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table footer */}
            {!loading && orders.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
                {activeTab !== "All" ? ` — ${activeTab}` : ""}
              </div>
            )}
          </div>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-black">Partner Applications</h2>
                <p className="text-xs text-gray-400 mt-0.5">Submitted via the &quot;Become a Partner&quot; form</p>
              </div>
              <button
                type="button"
                onClick={fetchPartners}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {partnersLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
              </div>
            ) : partners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <p className="text-sm">No partner applications yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-medium">Full Name</th>
                      <th className="text-left px-5 py-3 font-medium">Company / Org</th>
                      <th className="text-left px-5 py-3 font-medium">Email</th>
                      <th className="text-left px-5 py-3 font-medium">Services</th>
                      <th className="text-left px-5 py-3 font-medium">Address</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="text-left px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((p) => (
                      <>
                        <tr
                          key={p.id}
                          className="border-b border-gray-50 hover:bg-[#f8f7ff] transition-colors cursor-pointer"
                          onClick={() => {
                            const next = expandedPartnerId === p.id ? null : p.id;
                            setExpandedPartnerId(next);
                            if (next) fetchPartnerPhotos(next);
                          }}
                        >
                          <td className="px-5 py-3.5 font-medium text-black flex items-center gap-1.5">
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedPartnerId === p.id ? "rotate-180" : ""}`} />
                            {p.full_name}
                          </td>
                          <td className="px-5 py-3.5 text-gray-700">{p.company_name}</td>
                          <td className="px-5 py-3.5">
                            <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} className="text-[#5123d4] hover:underline text-sm">{p.email}</a>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 max-w-48 truncate" title={p.services}>{p.services || "—"}</td>
                          <td className="px-5 py-3.5 text-gray-500 max-w-48 truncate" title={p.address}>{p.address}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              p.status === "Approved"  ? "bg-green-100 text-green-700 border-green-200" :
                              p.status === "Rejected"  ? "bg-red-100 text-red-700 border-red-200" :
                              p.status === "Reviewed"  ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                         "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                            {format(new Date(p.created_at), "d MMM yyyy")}
                          </td>
                          <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              {p.status === "Pending" && (
                                <button
                                  type="button"
                                  onClick={() => handlePartnerStatus(p.id, "Reviewed")}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
                                >
                                  Mark Reviewed
                                </button>
                              )}
                              {p.status !== "Approved" && (
                                <button
                                  type="button"
                                  onClick={() => handlePartnerStatus(p.id, "Approved")}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {p.status !== "Rejected" && p.status !== "Approved" && (
                                <button
                                  type="button"
                                  onClick={() => handlePartnerStatus(p.id, "Rejected")}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedPartnerId === p.id && (
                          <tr key={`${p.id}-detail`} className="bg-[#f8f7ff] border-b border-purple-100">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 text-sm">
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Phone</p>
                                  <a href={`tel:${p.phone_number}`} className="text-gray-800 font-medium hover:text-[#5123d4]">{p.phone_number || "—"}</a>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Position</p>
                                  <p className="text-gray-800 font-medium">{p.position || "—"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Photos Uploaded</p>
                                  <p className="text-gray-800 font-medium">{p.photo_count}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-3">
                                  <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Business Details</p>
                                  <p className="text-gray-700 leading-relaxed">{p.business_details || "—"}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-3">
                                  <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Services Offered</p>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {p.services ? p.services.split(",").map(s => (
                                      <span key={s.trim()} className="px-2.5 py-0.5 bg-[#5123d4]/10 text-[#5123d4] rounded-full text-xs font-medium">{s.trim()}</span>
                                    )) : <span className="text-gray-400">—</span>}
                                  </div>
                                </div>
                                {/* Photos */}
                                <div className="col-span-2 sm:col-span-3">
                                  <p className="text-xs text-gray-400 uppercase font-medium mb-3">Application Photos</p>
                                  {photosLoading === p.id ? (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading photos…</div>
                                  ) : (partnerPhotos[p.id] ?? []).length === 0 ? (
                                    <p className="text-gray-400 text-sm italic">No photos uploaded.</p>
                                  ) : (() => {
                                    const photos = partnerPhotos[p.id] ?? [];
                                    const officePhotos  = photos.filter(ph => ph.label.startsWith("Office Photo"));
                                    const personalPhoto = photos.find(ph => ph.label === "Personal Photo");
                                    const idPhoto       = photos.find(ph => !ph.label.startsWith("Office Photo") && ph.label !== "Personal Photo");
                                    return (
                                      <div className="space-y-5">
                                        {/* Personal + ID side by side — bigger cards */}
                                        {(personalPhoto || idPhoto) && (
                                          <div className="grid grid-cols-2 gap-4">
                                            {personalPhoto && (
                                              <div className="group relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-[#5123d4]/50 hover:shadow-md transition-all">
                                                <div
                                                  className="bg-gray-800 flex items-center justify-center min-h-44 cursor-pointer"
                                                  onClick={() => setLightboxPhoto({ dataUrl: personalPhoto.dataUrl, label: personalPhoto.label })}
                                                >
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img src={personalPhoto.dataUrl} alt="Personal Photo" className="max-w-full max-h-52 object-contain" />
                                                </div>
                                                <div className="px-3 py-2 flex items-center justify-between">
                                                  <span className="text-xs font-semibold text-gray-700">Personal Photo</span>
                                                  <div className="flex items-center gap-1.5">
                                                    <button
                                                      type="button"
                                                      onClick={() => downloadPhoto(personalPhoto.dataUrl, personalPhoto.label)}
                                                      className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                                                      title="Download"
                                                    >
                                                      <Download className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span
                                                      className="text-[10px] text-[#5123d4] group-hover:underline cursor-pointer"
                                                      onClick={() => setLightboxPhoto({ dataUrl: personalPhoto.dataUrl, label: personalPhoto.label })}
                                                    >Click to enlarge</span>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                            {idPhoto && (
                                              <div className="group relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-[#5123d4]/50 hover:shadow-md transition-all">
                                                <div
                                                  className="bg-gray-800 flex items-center justify-center min-h-44 cursor-pointer"
                                                  onClick={() => setLightboxPhoto({ dataUrl: idPhoto.dataUrl, label: idPhoto.label })}
                                                >
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img src={idPhoto.dataUrl} alt={idPhoto.label} className="max-w-full max-h-52 object-contain" />
                                                </div>
                                                <div className="px-3 py-2 flex items-center justify-between">
                                                  <span className="text-xs font-semibold text-gray-700">{idPhoto.label}</span>
                                                  <div className="flex items-center gap-1.5">
                                                    <button
                                                      type="button"
                                                      onClick={() => downloadPhoto(idPhoto.dataUrl, idPhoto.label)}
                                                      className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                                                      title="Download"
                                                    >
                                                      <Download className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span
                                                      className="text-[10px] text-[#5123d4] group-hover:underline cursor-pointer"
                                                      onClick={() => setLightboxPhoto({ dataUrl: idPhoto.dataUrl, label: idPhoto.label })}
                                                    >Click to enlarge</span>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        {/* Office photos grid */}
                                        {officePhotos.length > 0 && (
                                          <div>
                                            <p className="text-xs text-gray-500 font-semibold mb-2">Office Photos ({officePhotos.length})</p>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                                              {officePhotos.map(photo => (
                                                <div
                                                  key={photo.id}
                                                  className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-200 hover:border-[#5123d4]/50 hover:shadow-md transition-all aspect-square cursor-pointer"
                                                  onClick={() => setLightboxPhoto({ dataUrl: photo.dataUrl, label: photo.label })}
                                                >
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img src={photo.dataUrl} alt={photo.label} className="w-full h-full object-contain" />
                                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                                                    <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-medium bg-black/60 px-2 py-0.5 rounded-full transition-opacity">View</span>
                                                    <button
                                                      type="button"
                                                      onClick={(e) => { e.stopPropagation(); downloadPhoto(photo.dataUrl, photo.label); }}
                                                      className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all"
                                                      title="Download"
                                                    >
                                                      <Download className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!partnersLoading && partners.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                {partners.length} application{partners.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

        </div>
      </div>

            {selectedOrder && (
        <DetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} onDelete={handleDeleteOrder} />
      )}

      {/* Photo lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold text-sm">{lightboxPhoto.label}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => downloadPhoto(lightboxPhoto.dataUrl, lightboxPhoto.label)}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-medium"
                  title="Download photo"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
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
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="text-white/40 text-xs text-center mt-3">Click outside to close</p>
          </div>
        </div>
      )}
    </>
  );
}
