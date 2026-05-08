"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Download, Send, ChevronDown,
  XCircle, Loader2, FileText,
} from "lucide-react";
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
  delivery_method: string;
  delivery_details: string;
  pickup_state: string;
  pickup_city: string;
  pickup_location: string;
  amount: number;
  status: string;
  print_color: string;
  paper_type: string;
  pages: number;
  finishing_option: string;
  specific_instruction: string;
  express_service: boolean;
  file_url: string | null;
  document_text: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") ?? "";
}
function authHeaders(): HeadersInit {
  return { authorization: `Bearer ${getToken()}` };
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_LIST = [
  "Pending",
  "In Progress",
  "Ready for Delivery",
  "In Transit",
  "Delivered",
  "Completed",
  "Cancelled",
];

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  Pending:              { badge: "bg-yellow-100 text-yellow-700 border-yellow-200",   dot: "bg-yellow-400"  },
  "In Progress":        { badge: "bg-blue-100   text-blue-700   border-blue-200",     dot: "bg-blue-400"    },
  "Ready for Delivery": { badge: "bg-purple-100 text-purple-700 border-purple-200",   dot: "bg-purple-500"  },
  "In Transit":         { badge: "bg-orange-100 text-orange-700 border-orange-200",   dot: "bg-orange-500"  },
  Delivered:            { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Completed:            { badge: "bg-green-100  text-green-700  border-green-200",    dot: "bg-green-500"   },
  Cancelled:            { badge: "bg-red-100    text-red-700    border-red-200",       dot: "bg-red-500"     },
};

// Activity dot colour by activity type
const ACTIVITY_DOT: Record<string, string> = {
  created:              "bg-green-500",
  uploaded:             "bg-green-500",
  Pending:              "bg-green-500",
  "In Progress":        "bg-orange-400",
  "Ready for Delivery": "bg-red-500",
  "In Transit":         "bg-red-500",
  Delivered:            "bg-red-500",
  Completed:            "bg-red-500",
  Cancelled:            "bg-red-500",
};

// Build the activity timeline from order data
function buildActivity(order: Order) {
  const base = new Date(order.created_at);
  const updated = new Date(order.updated_at);

  const items: { label: string; time: Date; dot: string }[] = [
    { label: "Order created",  time: base,                               dot: ACTIVITY_DOT.created   },
    { label: order.file_url || order.document_text ? "Files uploaded" : "Order received",
      time: new Date(base.getTime() + 2 * 60000),                        dot: ACTIVITY_DOT.uploaded  },
    { label: "Order Pending",  time: new Date(base.getTime() + 3 * 60000), dot: ACTIVITY_DOT.Pending },
  ];

  const progression = ["In Progress", "Ready for Delivery", "In Transit", "Delivered", "Completed"];
  const currentIdx = progression.indexOf(order.status);

  progression.forEach((s, i) => {
    if (i <= currentIdx) {
      const stepTime = i === currentIdx
        ? updated
        : new Date(base.getTime() + (10 + i * 30) * 60000);
      items.push({ label: `Order ${s}`, time: stepTime, dot: ACTIVITY_DOT[s] ?? "bg-gray-400" });
    }
  });

  if (order.status === "Cancelled") {
    items.push({ label: "Order Cancelled", time: updated, dot: ACTIVITY_DOT.Cancelled });
  }

  return items;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Status dropdown
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [updating,       setUpdating]       = useState(false);

  // Forward modal
  const [showForward, setShowForward] = useState(false);
  const [forwardTo,   setForwardTo]   = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res  = await fetch(`/api/admin/orders/${id}`, { headers: authHeaders() });
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) { setError("Order not found."); return; }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    setShowStatusMenu(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
      }
    } finally {
      setUpdating(false);
    }
  };

  // ── Loading / error states ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5123d4]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center gap-3">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600">{error || "Order not found."}</p>
        <button onClick={() => router.back()} className="text-[#5123d4] text-sm underline">Go back</button>
      </div>
    );
  }

  const activity = buildActivity(order);
  const placedAt = format(new Date(order.created_at), "MMMM d, yyyy '@' h:mmaaa");

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Top search bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <div className="relative max-w-sm">
          <input
            readOnly
            placeholder="Search order ID, Name"
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 bg-gray-50 focus:outline-none"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => router.push("/admin/dashboard")} className="hover:text-[#5123d4]">Orders</button>
          <span>/</span>
          <button onClick={() => router.push("/admin/dashboard")} className="hover:text-[#5123d4]">All Orders</button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{order.order_id}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 mr-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-[#5123d4]">Project Details</h1>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-sm text-gray-500 mb-8 ml-10">
          <span className="font-medium text-gray-700">Order ID: {order.order_id}</span>
          &nbsp;&nbsp;•&nbsp;&nbsp;
          Placed on {placedAt}
        </p>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ── Left: document panel ─────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Document viewer */}
            <div className="flex min-h-120">
              {order.file_url ? (
                /* Split view: thumbnail strip + main preview */
                <div className="flex w-full">
                  {/* Thumbnail strip */}
                  <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-3 shrink-0">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="w-14 h-18 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center text-[10px] text-gray-400"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  {/* Main preview */}
                  <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                    {order.file_url.match(/\.(pdf)$/i) ? (
                      <iframe
                        src={order.file_url}
                        className="w-full h-100 rounded border border-gray-200"
                        title="Document preview"
                      />
                    ) : order.file_url.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={order.file_url}
                        alt="Document"
                        className="max-h-100 max-w-full object-contain rounded border border-gray-200"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <FileText className="w-16 h-16" />
                        <p className="text-sm">File attached</p>
                        <a
                          href={order.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#5123d4] text-sm underline"
                        >
                          Open file
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : order.document_text ? (
                /* Text document */
                <div className="flex w-full">
                  <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-3 shrink-0">
                    {[1].map((n) => (
                      <div
                        key={n}
                        className="w-14 h-18 bg-white border border-gray-200 rounded shadow-sm flex items-center justify-center text-[10px] text-gray-400"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto max-h-120 bg-white">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
                      {order.document_text}
                    </p>
                  </div>
                </div>
              ) : (
                /* No document */
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-300 p-12">
                  <FileText className="w-20 h-20" />
                  <p className="text-sm text-gray-400">No document uploaded for this order</p>
                </div>
              )}
            </div>

            {/* Order details strip */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Customer</p>
                <p className="font-semibold text-gray-800">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Service</p>
                <p className="font-semibold text-gray-800">{order.service}{order.category ? ` / ${order.category}` : ""}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Delivery</p>
                <p className="font-semibold text-gray-800">{order.delivery_method}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                <p className="font-semibold text-[#5123d4]">₦{Number(order.amount).toLocaleString()}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-gray-100 px-6 py-5 flex flex-wrap gap-3">

              {/* Download */}
              {(order.file_url || order.document_text) && (
                <a
                  href={order.file_url ?? `data:text/plain;charset=utf-8,${encodeURIComponent(order.document_text ?? "")}`}
                  download={order.file_url ? undefined : `${order.order_id}.txt`}
                  target={order.file_url ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}

              {/* Update Status */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu((p) => !p)}
                  disabled={updating}
                  className="flex items-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                  Update Status
                </button>
                {showStatusMenu && (
                  <div className="absolute bottom-full mb-2 left-0 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {STATUS_LIST.filter((s) => s !== order.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(s)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f0ebff] hover:text-[#5123d4] transition-colors flex items-center gap-2"
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLES[s]?.dot ?? "bg-gray-400"}`} />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Forward */}
              <button
                onClick={() => setShowForward(true)}
                className="flex items-center gap-2 bg-[#5123d4] hover:bg-[#401AA0] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Forward
              </button>
            </div>
          </div>

          {/* ── Right: activity timeline ──────────────────────────────────────── */}
          <div>
            <h2 className="text-2xl font-bold text-[#5123d4] mb-5">Project Activity</h2>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <ol className="relative">
                {activity.map((item, i) => (
                  <li key={i} className="flex gap-4 pb-6 last:pb-0">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 ${item.dot}`} />
                      {i < activity.length - 1 && (
                        <span className="w-px flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    {/* Text */}
                    <div className="pb-0.5">
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(item.time, "MMMM d, yyyy '@' h:mm aaa")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Forward modal */}
      {showForward && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForward(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Forward Order</h3>
            <p className="text-sm text-gray-500 mb-4">Send order details to an email or phone number.</p>
            <input
              type="text"
              value={forwardTo}
              onChange={(e) => setForwardTo(e.target.value)}
              placeholder="Email or phone number"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5123d4] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowForward(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowForward(false); setForwardTo(""); }}
                className="flex-1 bg-[#5123d4] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#401AA0]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
