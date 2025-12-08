import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  UserGroupIcon,
  UsersIcon,
  ArrowLeftIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { useBeneficiaries } from "../../hooks/useBeneficiaries";
import BeneficiariesSelection from "./BeneficiariesSelection ";
import SingleTransferForm from "./SingleTransferForm";
import BulkTransferForm from "./BulkTransferForm";
import TagPayForm from "./TagPayForm";

const PayoutModal = ({
  isOpen,
  onClose,
  onSuccess,
  prefilledData = {},
  bulkGroup = null,
}) => {
  const [transferType, setTransferType] = useState(
    bulkGroup ? "bulk" : "single"
  );
  const [currentView, setCurrentView] = useState("form"); // "form" or "beneficiaries"
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  // Get beneficiaries for selection
  const { data: beneficiariesData, isLoading: beneficiariesLoading } = useBeneficiaries({
    category: 'Single'
  });

  // Process beneficiaries data
  let beneficiaries = [];
  if (beneficiariesData?.success) {
    const rawData = beneficiariesData.data;
    if (Array.isArray(rawData)) {
      beneficiaries = rawData;
    } else if (Array.isArray(rawData?.data)) {
      beneficiaries = rawData.data;
    } else if (rawData && typeof rawData === 'object') {
      beneficiaries = rawData.items || rawData.beneficiaries || [];
    }
  }

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTransferType(bulkGroup ? "bulk" : "single");
      setCurrentView("form");
      setSelectedBeneficiary(null);
    }
  }, [isOpen, bulkGroup]);

  // Handle beneficiary selection
  const handleBeneficiarySelect = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setCurrentView("form");
  };

  // Handle successful transfer
  const handleTransferSuccess = (result) => {
    onSuccess && onSuccess(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              {currentView === "beneficiaries" && (
                <button
                  onClick={() => setCurrentView("form")}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 text-slate-600" />
                </button>
              )}
              <h2 className="text-xl font-bold text-slate-800">
                {currentView === "beneficiaries" ? "Select Beneficiary" : "Send Money"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {currentView === "beneficiaries" ? (
            // Beneficiaries Selection Component
            <BeneficiariesSelection
              beneficiaries={beneficiaries}
              isLoading={beneficiariesLoading}
              onSelect={handleBeneficiarySelect}
              onBackToForm={() => setCurrentView("form")}
            />
          ) : (
            // Transfer Form View
            <div>
              {/* Transfer Type Selector */}
              {!bulkGroup && (
                <div className="p-6 border-b border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
                      <button
                        onClick={() => setTransferType("single")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                          transferType === "single"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Bank Transfer</span>
                      </button>
                      
                      <button
                        onClick={() => setTransferType("tagpay")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                          transferType === "tagpay"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <HashtagIcon className="w-4 h-4" />
                        <span>Tag Pay</span>
                      </button>
                      
                      <button
                        onClick={() => setTransferType("bulk")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                          transferType === "bulk"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        <UserGroupIcon className="w-4 h-4" />
                        <span>Bulk Transfer</span>
                      </button>
                    </div>

                    {transferType === "single" && (
                      <button
                        onClick={() => setCurrentView("beneficiaries")}
                        className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <UsersIcon className="w-4 h-4" />
                        <span className="text-sm">Select Beneficiary</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form Components */}
              <div className="p-6">
                {transferType === "single" ? (
                  <SingleTransferForm
                    prefilledData={prefilledData}
                    selectedBeneficiary={selectedBeneficiary}
                    onSuccess={handleTransferSuccess}
                    onClose={onClose}
                  />
                ) : transferType === "tagpay" ? (
                  <TagPayForm
                    onSuccess={handleTransferSuccess}
                    onClose={onClose}
                  />
                ) : (
                  <BulkTransferForm
                    bulkGroup={bulkGroup}
                    onSuccess={handleTransferSuccess}
                    onClose={onClose}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayoutModal;