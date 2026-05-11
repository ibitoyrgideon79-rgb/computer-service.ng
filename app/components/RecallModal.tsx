"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";

interface RecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (identifier: string) => void;
}

export default function RecallModal({ isOpen, onClose }: RecallModalProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) { setError("Please enter your Order ID"); return; }
    onClose();
    router.push(`/order/tracking?orderId=${encodeURIComponent(orderId.trim())}`);
  };

  const handleClose = () => {
    setOrderId("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Recall / Track Order</h2>
          <button type="button" onClick={handleClose} aria-label="Close" className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <p className="text-gray-600 text-sm">
            Enter your Order ID to track or recall your project.
          </p>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Order ID</label>
            <input
              type="text"
              placeholder="e.g. CSN-20260508-1234"
              value={orderId}
              onChange={(e) => { setOrderId(e.target.value); setError(""); }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!orderId.trim()}
            className="w-full bg-[#5123d4] hover:bg-[#401AA0] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Track Order
          </button>
        </form>
      </div>
    </div>
  );
}
