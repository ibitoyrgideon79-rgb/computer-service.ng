"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface SaveProjectModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDelete: () => void;
}

export default function SaveProjectModal({
  isOpen,
  onSave,
  onDelete,
}: SaveProjectModalProps) {
  const [selectedOption, setSelectedOption] = useState<"save" | "delete" | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSelectedOption("save");
    setShowExplanation(true);
  };

  const handleDelete = () => {
    setSelectedOption("delete");
  };

  const handleConfirmSave = () => {
    onSave();
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
        {showExplanation ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Project Saved! 🎉</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p className="font-semibold text-black">You&apos;ll be able to access this project anytime using your phone number and a one-time code.</p>
              <p className="text-sm text-gray-700">Your project is now securely saved and linked to your phone number. No account needed!</p>
            </div>
            <button
              onClick={handleConfirmSave}
              className="w-full bg-[#5123d4] hover:bg-[#401AA0] text-white font-medium py-3 rounded-md transition-colors"
            >
              Continue
            </button>
          </div>
        ) : selectedOption === "delete" ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Delete After Completion?</h2>
            <p className="text-gray-600">
              This project will be permanently deleted after completion. You won&apos;t be able to access it again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedOption(null)}
                className="flex-1 border border-gray-300 text-black font-medium py-2.5 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black">Save This Project?</h2>
            <p className="text-gray-600">
              Would you like to save this project for easy recall anytime?
            </p>

            {/* Option 1: Save */}
            <button
              onClick={handleSave}
              className="w-full border-2 border-green-500 bg-green-50 rounded-lg p-4 text-left hover:bg-green-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-black">✅ Yes — Save for easy recall anytime</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Access this project anytime using your phone number
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Delete */}
            <button
              onClick={handleDelete}
              className="w-full border-2 border-red-500 bg-red-50 rounded-lg p-4 text-left hover:bg-red-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-black">❌ No — Delete after completion</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Project will be permanently deleted
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
