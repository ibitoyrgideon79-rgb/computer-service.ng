"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Package, Clock, Loader2, TrendingUp, CheckCircle,
  Truck, XCircle, Search, RefreshCw, X, ChevronDown,
  Phone, Mail, MapPin, Layers, MessageCircle, Trash2, Download,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  Pending:      { badge: "bg-yellow-100 text-yellow-700 border-yellow-200",  dot: "bg-yellow-400"  },
  "In Progress":{ badge: "bg-blue-100   text-blue-700   border-blue-200",    dot: "bg-blue-400"    },
  "In Transit": { badge: "bg-orange-100 text-orange-700 border-orange-200",  dot: "bg-orange-400"  },
  Completed:    { badge: "bg-green-100  text-green-700  border-green-200",   dot: "bg-green-400"   },
  Delivered:    { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  Cancelled:    { badge: "bg-red-100    text-red-700    border-red-200",     dot: "bg-red-400"     },
};

const STATUS_LIST = ["Pending", "In Progress", "In Transit", "Completed", "Delivered", "Cancelled"];

const TABS = ["All", ...STATUS_LIST];

// ─── Stat card ─────────────────────────────────────────────────────────────────

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

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Status updater ────────────────────────────────────────────────────────────

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
        headers: { "Content-Type": "application/json" },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

// ─── Order detail panel ────────────────────────────────────────────────────────

function DetailPanel({ order, onClose, onDelete }: { order: Order; onClose: () => void; onDelete: (id: string) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete(order.id);
      onClose();
      toast.success(`Order ${order.order_id} deleted`);
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
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

        <div className="flex-grow px-6 py-5 space-y-6">
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
              {order.delivery_method === "Pick Up" ? (
                <>
                  {order.pickup_location && <DetailRow label="Street / Landmark" value={order.pickup_location} />}
                  {order.pickup_city && <DetailRow label="City / Area" value={order.pickup_city} />}
                  {order.pickup_state && <DetailRow label="State" value={order.pickup_state} />}
                </>
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
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

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [stats, setStats]             = useState<Stats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch]           = useState("");
  const [activeTab, setActiveTab]     = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [liveCount, setLiveCount]     = useState(0);
  const isFirstLoad                   = useRef(true);

  // ── Fetch orders ──────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/stats");
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
      const res  = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // ── Supabase real-time ────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel("admin-orders-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev]);
            setLiveCount((c) => c + 1);
            if (!isFirstLoad.current) {
              toast.success(`New order: ${newOrder.order_id} — ${newOrder.service}`, {
                duration: 5000,
                icon: "📦",
              });
            }
            // Refresh stats
            fetchStats();
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setSelectedOrder((sel) => (sel?.id === updated.id ? updated : sel));
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setOrders((prev) => prev.filter((o) => o.id !== deleted.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") isFirstLoad.current = false;
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  // ── Update handler ────────────────────────────────────────────────────────

  const handleStatusUpdate = useCallback((id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSelectedOrder((sel) => (sel?.id === id ? { ...sel, status } : sel));
    fetchStats();
  }, [fetchStats]);

  const handleDeleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    fetchStats();
  }, [fetchStats]);

  // ── Stats config ──────────────────────────────────────────────────────────

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

  // ── Tab counts ────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-[#f4f5f7]">
        {/* ── Header ── */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-bold text-black">Dashboard</h1>
            <p className="text-xs text-gray-400">computerservice.ng — Admin Portal</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
              {liveCount > 0 && <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">{liveCount}</span>}
            </div>
            <button
              type="button"
              onClick={() => { fetchOrders(); fetchStats(); }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* ── Stats ── */}
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

          {/* ── Orders table ── */}
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
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
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
                          <span className="font-mono text-xs font-semibold text-[#5123d4]">
                            {order.order_id}
                          </span>
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
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-700"
                            title="View details"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
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
        </div>
      </div>

      {/* ── Order detail panel ── */}
      {selectedOrder && (
        <DetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} onDelete={handleDeleteOrder} />
      )}
    </>
  );
}
