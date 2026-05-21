"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Truck, Package, Search, Trash2, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  delivery_details: string;
  amount: number;
  status: string;
  created_at: string;
}

const STATUS_FILTERS = ["All", "Pending", "In Progress", "In Transit", "Completed", "Delivered", "Cancelled"];

const statusBadge: Record<string, string> = {
  "Pending Approval":    "bg-gray-100 text-gray-700 border-gray-200",
  "Approved for Payment":"bg-amber-100 text-amber-700 border-amber-200",
  Pending:               "bg-yellow-100 text-yellow-700 border-yellow-200",
  "In Progress":         "bg-blue-100 text-blue-700 border-blue-200",
  "Ready for Delivery":  "bg-purple-100 text-purple-700 border-purple-200",
  "In Transit":          "bg-orange-100 text-orange-700 border-orange-200",
  Completed:             "bg-green-100 text-green-700 border-green-200",
  Delivered:             "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled:             "bg-red-100 text-red-700 border-red-200",
};

export default function OrdersAdmin() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "All") params.set("status", filter);
      const res = await fetch(`/api/admin/orders?${params}`, { headers: authHeaders() });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    if (!getToken()) { router.push("/admin/login"); return; }
    fetchOrders();
  }, [fetchOrders, router]);

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) setOrders(prev => prev.filter(o => o.id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = orders.filter(o => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.order_id || "").toLowerCase().includes(q) ||
      (o.customer_name || "").toLowerCase().includes(q) ||
      (o.email || "").toLowerCase().includes(q) ||
      (o.phone_number || "").toLowerCase().includes(q) ||
      (o.service || "").toLowerCase().includes(q) ||
      (o.category || "").toLowerCase().includes(q) ||
      (o.location || "").toLowerCase().includes(q) ||
      (o.delivery_method || "").toLowerCase().includes(q) ||
      (o.delivery_details || "").toLowerCase().includes(q) ||
      (o.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-black mb-6">Orders</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by order ID, name, email, phone, service or address…"
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

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTERS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === tab ? "bg-[#5123d4] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading orders…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Package className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="border-2 border-gray-200 rounded-xl bg-white overflow-hidden">
              <div className="flex items-start justify-between p-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-sm font-bold text-[#5123d4]">{order.order_id}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge[order.status] || statusBadge.Pending}`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-black">{order.customer_name}</h3>
                  <p className="text-sm text-gray-600">{order.service}{order.category ? ` — ${order.category}` : ""}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span>{order.phone_number}</span>
                    {order.email && <span>{order.email}</span>}
                    {order.location && (
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{order.location}</span>
                    )}
                    {order.delivery_method && (
                      <span className="inline-flex items-center gap-1"><Truck className="w-3 h-3" />{order.delivery_method}</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-black">₦{(order.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  <div className="flex items-center gap-1 justify-end mt-2">
                    <Link
                      href={`/admin/dashboard/orders/${order.id}`}
                      className="p-1.5 rounded-lg hover:bg-[#f0ebff] text-gray-400 hover:text-[#5123d4] transition-colors"
                      title="View details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.id)}
                      disabled={deletingId === order.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

