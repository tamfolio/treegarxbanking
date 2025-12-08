import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  HashtagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  useResolveCustomer,
  useTagPay,
} from '../../hooks/useTransactions';

const TagPayForm = ({
  onSuccess,
  onClose,
}) => {
  const [errors, setErrors] = useState({});
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedCustomer, setResolvedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    destinationTag: "",
    amount: "",
    displayAmount: "",
    narration: "",
  });

  const resolveCustomerMutation = useResolveCustomer();
  const tagPayMutation = useTagPay();

  // Format amount input with commas
  const formatAmountDisplay = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const parseAmount = (formattedAmount) => {
    return parseFloat(formattedAmount.replace(/,/g, "")) || 0;
  };

  // Customer tag resolution
  const handleResolveCustomer = async () => {
    if (!formData.destinationTag) return;

    setIsResolving(true);
    try {
      const result = await resolveCustomerMutation.mutateAsync({
        identifier: formData.destinationTag,
      });

      if (result.success) {
        setResolvedCustomer(result.data);
        setErrors(prev => ({ ...prev, destinationTag: "" }));
      } else {
        setResolvedCustomer(null);
        setErrors(prev => ({ 
          ...prev, 
          destinationTag: result.message || "Customer tag not found" 
        }));
      }
    } catch (error) {
      console.error("Customer resolution failed:", error);
      setResolvedCustomer(null);
      setErrors(prev => ({ 
        ...prev, 
        destinationTag: error.message || "Failed to resolve customer tag" 
      }));
    } finally {
      setIsResolving(false);
    }
  };

  // Auto-resolve customer when tag changes
  useEffect(() => {
    if (formData.destinationTag?.length >= 3) {
      const timer = setTimeout(() => {
        if (!resolvedCustomer && !isResolving) {
          handleResolveCustomer();
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setResolvedCustomer(null);
    }
  }, [formData.destinationTag]);

  // Input handlers
  const handleTagChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      destinationTag: value,
    }));
    setResolvedCustomer(null);
    
    // Clear tag error when user starts typing
    if (errors.destinationTag) {
      setErrors((prev) => ({ ...prev, destinationTag: "" }));
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatAmountDisplay(value);
    setFormData((prev) => ({
      ...prev,
      displayAmount: formattedValue,
      amount: parseAmount(formattedValue),
    }));

    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.destinationTag) 
      newErrors.destinationTag = "Customer tag is required";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!formData.narration) 
      newErrors.narration = "Narration is required";
    if (!resolvedCustomer)
      newErrors.destinationTag = "Please resolve customer tag first";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payloadData = {
        amount: formData.amount,
        narration: formData.narration,
        destinationTagOrCode: formData.destinationTag,
      };

      const result = await tagPayMutation.mutateAsync(payloadData);
      if (result.success) {
        onSuccess(result.data);
      } else {
        setErrors({ submit: result.message || "Tag Pay failed" });
      }
    } catch (error) {
      setErrors({ submit: error.message || "Failed to process Tag Pay" });
    }
  };

  const isLoading = tagPayMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Info */}


      {/* Customer Tag Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Customer Tag
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <HashtagIcon className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={formData.destinationTag}
            onChange={handleTagChange}
            placeholder="tg-abc123 or customer tag"
            className={`w-full pl-9 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all ${
              errors.destinationTag ? "border-red-300" : "border-slate-200"
            }`}
          />
          {formData.destinationTag && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isResolving ? (
                <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
              ) : resolvedCustomer ? (
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              ) : null}
            </div>
          )}
        </div>

        {resolvedCustomer && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {resolvedCustomer.name || resolvedCustomer.fullName || 'Customer Found'}
                </p>
                <p className="text-xs text-green-600">
                  Tag: {resolvedCustomer.customerTag || resolvedCustomer.tag || formData.destinationTag}
                </p>
              </div>
            </div>
          </div>
        )}

        {isResolving && (
          <p className="text-xs text-orange-600 mt-1">
            🔄 Resolving customer tag...
          </p>
        )}

        {errors.destinationTag && (
          <p className="mt-1 text-xs text-red-600">
            {errors.destinationTag}
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm pointer-events-none z-10">
            ₦
          </span>
          <input
            type="text"
            name="displayAmount"
            value={formData.displayAmount || ""}
            onChange={handleAmountChange}
            placeholder="0.00"
            className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all ${
              errors.amount ? "border-red-300" : "border-slate-200"
            }`}
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>
        {formData.amount > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            Amount: ₦
            {parseAmount(
              formData.displayAmount || "0"
            ).toLocaleString()}
          </p>
        )}
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">
            {errors.amount}
          </p>
        )}
      </div>

      {/* Narration */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Narration
        </label>
        <input
          type="text"
          name="narration"
          value={formData.narration || ""}
          onChange={handleInputChange}
          placeholder="What's this payment for?"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all ${
            errors.narration ? "border-red-300" : "border-slate-200"
          }`}
        />
        {errors.narration && (
          <p className="mt-1 text-xs text-red-600">
            {errors.narration}
          </p>
        )}
      </div>

      {/* Transfer Info */}
      {resolvedCustomer && formData.amount > 0 && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-800 mb-2">Transfer Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">To:</span>
              <span className="font-medium text-slate-800">
                {resolvedCustomer.name || resolvedCustomer.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tag:</span>
              <span className="font-mono text-slate-800">
                {resolvedCustomer.customerTag || resolvedCustomer.tag || formData.destinationTag}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Amount:</span>
              <span className="font-bold text-slate-800">
                ₦{formData.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !resolvedCustomer}
          className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
        >
          {isLoading ? "Processing..." : "Send Money"}
        </button>
      </div>
    </form>
  );
};

export default TagPayForm;