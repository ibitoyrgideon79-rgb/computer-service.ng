"use client";

import { useState } from "react";
import { Lock, Trash2, Shield } from "lucide-react";

interface SaveProjectModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDelete: () => void;
}

export default function SaveProjectModal({ isOpen, onSave, onDelete }: SaveProjectModalProps) {
  const [view, setView] = useState<"choice" | "saved" | "deleteConfirm">("choice");

  if (!isOpen) return null;

  if (view === "saved") {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Saved for Recall!</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your project is securely stored. Retrieve it anytime using your phone number and a
            verification code — no account needed.
          </p>
          <button
            type="button"
            onClick={() => { setView("choice"); onSave(); }}
            className="w-full bg-[#5123d4] hover:bg-[#401AA0] text-white font-medium py-3 rounded-xl transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (view === "deleteConfirm") {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
          <h2 className="text-xl font-bold text-black mb-2">Delete After Completion?</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your project will be permanently deleted after we deliver it. You won&apos;t be able to
            access it again.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setView("choice")}
              className="flex-1 border border-gray-200 text-black font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors text-sm"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        {/* Privacy notice banner */}
        <div className="bg-[#f0ebff] px-6 py-4 rounded-t-2xl border-b border-purple-100">
          <p className="text-xs text-[#5123d4] font-medium text-center flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            For your privacy, all projects are deleted automatically 48 hours after delivery
          </p>
        </div>

        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-black text-center">Save This Project?</h2>

          {/* Save to Recall */}
          <button
            type="button"
            onClick={() => setView("saved")}
            className="w-full bg-[#5123d4] hover:bg-[#401AA0] rounded-xl p-5 text-left transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Save to Recall</p>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  We&apos;ll securely store it so you can access or request it again anytime — using
                  your phone number + a verification code.
                </p>
              </div>
            </div>
          </button>

          {/* Delete after delivery */}
          <button
            type="button"
            onClick={() => setView("deleteConfirm")}
            className="w-full border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-xl p-5 text-left transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Don&apos;t save</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Delete this project immediately after delivery is complete.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
