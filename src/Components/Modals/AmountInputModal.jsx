import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const AmountInputModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  ctaLabel,
  ctaColorClass = "bg-blue-600 hover:bg-blue-700",
  isLoading = false,
  maxAmount = null,
  maxLabel = null,
}) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (maxAmount && parsed > maxAmount) {
      setError(`Amount cannot exceed ₦${maxAmount.toLocaleString()}`);
      return;
    }
    setError("");
    onSubmit({ amount: parsed });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {description && (
            <p className="text-sm text-slate-600">{description}</p>
          )}

          {maxAmount !== null && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
              <span className="text-slate-500">{maxLabel || "Available"}: </span>
              <span className="font-semibold text-slate-900">
                ₦{parseFloat(maxAmount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount (₦)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${ctaColorClass}`}
            >
              {isLoading ? "Processing..." : ctaLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmountInputModal;