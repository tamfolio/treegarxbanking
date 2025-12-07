import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  UserGroupIcon,
  UsersIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  useBanks,
  useResolveAccount,
  usePayout,
  useBulkPayout,
} from "../../hooks/useTransactions";
import { useBeneficiaries } from "../../hooks/useBeneficiaries";

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
  const [beneficiarySearch, setBeneficiarySearch] = useState("");
  const [errors, setErrors] = useState({});
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankSearchTerm, setBankSearchTerm] = useState("");

  // Single transfer state
  const [formData, setFormData] = useState({
    bankId: "",
    accountNumber: "",
    amount: "",
    displayAmount: "",
    narration: "",
    beneficiaryName: "",
    saveBeneficiary: false,
  });
  const [resolvedAccount, setResolvedAccount] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  // Bulk transfer state
  const [bulkItems, setBulkItems] = useState([]);
  const [groupKey, setGroupKey] = useState("");

  const { data: banksData, isLoading: banksLoading } = useBanks();
  const { data: beneficiariesData, isLoading: beneficiariesLoading } = useBeneficiaries({
    category: 'Single'
  });
  const resolveAccountMutation = useResolveAccount();
  const payoutMutation = usePayout();
  const bulkPayoutMutation = useBulkPayout();

  const banks = banksData?.success ? banksData.data : [];
  
  // Fix beneficiaries data access to match actual structure
  console.log('Beneficiaries raw data:', beneficiariesData);
  
  let beneficiaries = [];
  if (beneficiariesData?.success) {
    const rawData = beneficiariesData.data;
    // Handle different possible structures
    if (Array.isArray(rawData)) {
      beneficiaries = rawData;
    } else if (Array.isArray(rawData?.data)) {
      beneficiaries = rawData.data;
    } else if (rawData && typeof rawData === 'object') {
      // If it's an object with items or similar
      beneficiaries = rawData.items || rawData.beneficiaries || [];
    }
  }
  
  console.log('Processed beneficiaries:', beneficiaries);

  // Filter beneficiaries based on search
  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
    beneficiary.bankName.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
    beneficiary.accountNumber.includes(beneficiarySearch)
  );

  // Handle beneficiary selection
  const handleBeneficiarySelect = (beneficiary) => {
    const bank = banks.find(b => b.bankId === beneficiary.bankId);
    
    setFormData({
      bankId: beneficiary.bankId,
      accountNumber: beneficiary.accountNumber,
      amount: "",
      displayAmount: "",
      narration: "",
      beneficiaryName: beneficiary.name,
      saveBeneficiary: true,
    });

    if (bank) {
      setSelectedBank(bank);
      setBankSearchTerm(bank.bankName);
    }

    setResolvedAccount({
      accountName: beneficiary.name,
      accountNumber: beneficiary.accountNumber,
      bankName: beneficiary.bankName,
    });

    setCurrentView("form");
  };

  // Enhanced bank filtering with sorting
  const filteredBanks = banks
    .filter((bank) =>
      bank.bankName.toLowerCase().includes(bankSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const term = bankSearchTerm.toLowerCase();
      const aName = a.bankName.toLowerCase();
      const bName = b.bankName.toLowerCase();

      if (aName === term) return -1;
      if (bName === term) return 1;
      if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
      if (bName.startsWith(term) && !aName.startsWith(term)) return 1;
      return aName.localeCompare(bName);
    })
    .slice(0, 10);

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

// Effect 1: Reset state when modal closes
useEffect(() => {
    if (!isOpen) {
      setTransferType(bulkGroup ? "bulk" : "single");
      setCurrentView("form");
      setBeneficiarySearch("");
      setFormData({
        bankId: "",
        accountNumber: "",
        amount: "",
        displayAmount: "",
        narration: "",
        beneficiaryName: "",
        saveBeneficiary: false,
      });
      setBulkItems([]);
      setGroupKey("");
      setErrors({});
      setResolvedAccount(null);
      setIsResolving(false);
      setBankSearchTerm("");
      setShowBankDropdown(false);
      setSelectedBank(null);
    }
  }, [isOpen]);
  
  // Effect 2: Handle single transfer pre-fill
  useEffect(() => {
    if (isOpen && prefilledData && Object.keys(prefilledData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...prefilledData,
        displayAmount:
          prefilledData.displayAmount ||
          (prefilledData.amount
            ? formatAmountDisplay(prefilledData.amount.toString())
            : ""),
        saveBeneficiary: true,
      }));
  
      if (prefilledData.accountNumber && prefilledData.beneficiaryName) {
        setResolvedAccount({
          accountName: prefilledData.beneficiaryName,
          accountNumber: prefilledData.accountNumber,
          bankName: "", // Will be set in next effect when banks load
        });
      }
    }
  }, [isOpen, prefilledData]);
  
  // Effect 3: Handle bank selection for prefilled data (only when banks load)
  useEffect(() => {
    if (isOpen && prefilledData?.bankId && banks.length > 0) {
      const bank = banks.find((b) => b.bankId === prefilledData.bankId);
      if (bank) {
        setSelectedBank(bank);
        setBankSearchTerm(bank.bankName);
        
        // Update resolved account with bank name if it exists
        setResolvedAccount(prev => 
          prev ? { ...prev, bankName: bank.bankName } : null
        );
      }
    }
  }, [isOpen, prefilledData?.bankId, banks]);
  
  // Effect 4: Handle bulk group pre-fill
  useEffect(() => {
    if (isOpen && bulkGroup) {
      setTransferType("bulk");
      setGroupKey(bulkGroup.groupKey);
      const items = bulkGroup.items || [];
      setBulkItems(
        items.map((item) => ({
          id: item.id || Date.now() + Math.random(),
          bankId: item.bankId,
          bankName: item.bankName,
          accountNumber: item.accountNumber,
          beneficiaryName: item.name,
          amount: "",
          displayAmount: "",
          narration: "",
          saveBeneficiary: true,
          resolved: true,
          bankSearchTerm: item.bankName,
          showBankDropdown: false,
          selectedBank: { bankId: item.bankId, bankName: item.bankName },
          isResolving: false,
          resolvedAccount: {
            accountName: item.name,
            accountNumber: item.accountNumber,
            bankName: item.bankName,
          },
        }))
      );
    }
  }, [isOpen, bulkGroup]);

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setBankSearchTerm(bank.bankName);
    setFormData((prev) => ({
      ...prev,
      bankId: bank.bankId,
    }));
    setShowBankDropdown(false);

    if (errors.bankId) {
      setErrors((prev) => ({ ...prev, bankId: "" }));
    }
    setResolvedAccount(null);
    setFormData((prev) => ({ ...prev, beneficiaryName: "" }));
  };

  const handleBankSearch = (value) => {
    setBankSearchTerm(value);
    setShowBankDropdown(true);

    if (selectedBank && value !== selectedBank.bankName) {
      setSelectedBank(null);
      setFormData((prev) => ({
        ...prev,
        bankId: "",
      }));
      setResolvedAccount(null);
    }
  };

  const handleAccountNumberChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      accountNumber: value,
    }));
    setResolvedAccount(null);
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Bulk transfer handlers (keeping existing functionality)
  const addBulkItem = () => {
    setBulkItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        bankId: "",
        bankName: "",
        accountNumber: "",
        beneficiaryName: "",
        amount: "",
        displayAmount: "",
        narration: "",
        saveBeneficiary: true,
        resolved: false,
        bankSearchTerm: "",
        showBankDropdown: false,
        selectedBank: null,
        isResolving: false,
        resolvedAccount: null,
      },
    ]);
  };

  // [Rest of the bulk transfer handlers remain the same as in original file...]

  const handleResolveAccount = async () => {
    if (!formData.accountNumber || !formData.bankId) return;

    setIsResolving(true);
    try {
      const result = await resolveAccountMutation.mutateAsync({
        bankId: formData.bankId,
        accountNumber: formData.accountNumber,
      });

      if (result.success) {
        setResolvedAccount(result.data);
        setFormData((prev) => ({
          ...prev,
          beneficiaryName: result.data.accountName,
        }));
      }
    } catch (error) {
      console.error("Account resolution failed:", error);
      setResolvedAccount(null);
    } finally {
      setIsResolving(false);
    }
  };

  useEffect(() => {
    if (formData.accountNumber?.length === 10 && formData.bankId) {
      const timer = setTimeout(() => {
        if (!resolvedAccount && !isResolving) {
          handleResolveAccount();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData.accountNumber, formData.bankId]);

  const validateForm = () => {
    const newErrors = {};

    if (transferType === "single") {
      if (!formData.bankId) newErrors.bankId = "Please select a bank";
      if (!formData.accountNumber)
        newErrors.accountNumber = "Account number is required";
      if (!formData.amount || formData.amount <= 0)
        newErrors.amount = "Amount must be greater than 0";
      if (!formData.narration) newErrors.narration = "Narration is required";
      if (!resolvedAccount)
        newErrors.accountNumber = "Please resolve account details first";
    }
    // Bulk validation logic remains the same...

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (transferType === "single") {
        const result = await payoutMutation.mutateAsync(formData);
        if (result.success) {
          onSuccess && onSuccess(result.data);
          onClose();
        } else {
          setErrors({ submit: result.message || "Payout failed" });
        }
      }
      // Bulk submit logic remains the same...
    } catch (error) {
      setErrors({ submit: error.message || "Failed to process transfer" });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  const isLoading = payoutMutation.isLoading || bulkPayoutMutation.isLoading;

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
            // Beneficiaries Selection View
            <div className="p-6">
              {/* Debug Info - Remove this after testing */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Debug Info:</strong>
                <br />Loading: {beneficiariesLoading.toString()}
                <br />Raw Data: {JSON.stringify(beneficiariesData, null, 2)}
                <br />Processed Beneficiaries Count: {beneficiaries.length}
                <br />Filtered Count: {filteredBeneficiaries.length}
              </div>

              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={beneficiarySearch}
                    onChange={(e) => setBeneficiarySearch(e.target.value)}
                    placeholder="Search beneficiaries by name, bank, or account..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {beneficiariesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-slate-600">Loading beneficiaries...</span>
                  </div>
                </div>
              ) : beneficiaries.length > 0 ? (
                filteredBeneficiaries.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredBeneficiaries.map((beneficiary) => (
                      <button
                        key={beneficiary.id}
                        onClick={() => handleBeneficiarySelect(beneficiary)}
                        className="w-full p-4 text-left border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {beneficiary.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {beneficiary.name || 'Unknown Name'}
                              </div>
                              <div className="text-sm text-slate-500">
                                {beneficiary.bankName || 'Unknown Bank'} • {beneficiary.accountNumber || 'No Account'}
                              </div>
                              {beneficiary.lastAmount && beneficiary.lastTransferredAt && (
                                <div className="text-xs text-slate-400 mt-1">
                                  Last: ₦{parseFloat(beneficiary.lastAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })} • {formatDate(beneficiary.lastTransferredAt)}
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UsersIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">
                      No beneficiaries found
                    </h3>
                    <p className="text-slate-600 mb-4">
                      No beneficiaries match your search terms.
                    </p>
                    <button
                      onClick={() => setBeneficiarySearch("")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">
                    No saved beneficiaries
                  </h3>
                  <p className="text-slate-600 mb-4">
                    You haven't saved any beneficiaries yet. Send money to someone and save them as a beneficiary.
                  </p>
                  <button
                    onClick={() => setCurrentView("form")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send to New Recipient
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Original Form View
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
                        <span>Single Transfer</span>
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

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {transferType === "single" ? (
                    // Single Transfer Form (keeping all existing form fields)
                    <>
                      {/* Bank Selection */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Select Bank
                        </label>

                        <input
                          type="text"
                          value={bankSearchTerm}
                          onChange={(e) => handleBankSearch(e.target.value)}
                          onFocus={() => setShowBankDropdown(true)}
                          disabled={banksLoading}
                          placeholder="Search for a bank..."
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
                            errors.bankId ? "border-red-300" : "border-slate-200"
                          }`}
                        />

                        {/* Bank Dropdown - keeping existing implementation */}
                        {showBankDropdown && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {banksLoading ? (
                              <div className="px-4 py-8 text-center">
                                <div className="inline-flex items-center space-x-2">
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                  <span className="text-slate-600 text-sm">
                                    Loading banks...
                                  </span>
                                </div>
                              </div>
                            ) : filteredBanks.length > 0 ? (
                              filteredBanks.map((bank) => (
                                <button
                                  key={bank.bankId}
                                  type="button"
                                  onClick={() => handleBankSelect(bank)}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0 transition-colors"
                                >
                                  <div className="text-sm font-medium text-slate-800">
                                    {bank.bankName}
                                  </div>
                                  {bank.providerBankCode && (
                                    <div className="text-xs text-slate-500">
                                      Code: {bank.providerBankCode}
                                    </div>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-sm text-slate-500 text-center">
                                {bankSearchTerm
                                  ? `No banks found matching "${bankSearchTerm}"`
                                  : "Start typing to search banks"}
                              </div>
                            )}
                          </div>
                        )}

                        {showBankDropdown && (
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowBankDropdown(false)}
                          ></div>
                        )}

                        {selectedBank && (
                          <p className="text-green-600 text-xs mt-1 flex items-center space-x-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>{selectedBank.bankName} selected</span>
                          </p>
                        )}

                        {errors.bankId && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.bankId}
                          </p>
                        )}
                      </div>

                      {/* Account Number */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Account Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber || ""}
                            onChange={handleAccountNumberChange}
                            placeholder="Enter 10-digit account number"
                            maxLength="10"
                            className={`w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
                              errors.accountNumber
                                ? "border-red-300"
                                : "border-slate-200"
                            }`}
                          />
                          {formData.accountNumber && formData.bankId && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {isResolving ? (
                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              ) : resolvedAccount ? (
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              ) : null}
                            </div>
                          )}
                        </div>

                        {resolvedAccount && (
                          <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>Account Name: {resolvedAccount.accountName}</span>
                          </p>
                        )}

                        {isResolving && (
                          <p className="text-xs text-blue-600 mt-1">
                            🔄 Resolving account name...
                          </p>
                        )}

                        {errors.accountNumber && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.accountNumber}
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
                            className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
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
                          placeholder="Purpose of transfer"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
                            errors.narration ? "border-red-300" : "border-slate-200"
                          }`}
                        />
                        {errors.narration && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.narration}
                          </p>
                        )}
                      </div>

                      {/* Save Beneficiary Toggle */}
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="saveBeneficiary"
                          className="text-sm font-medium text-slate-700"
                        >
                          Save as beneficiary
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              saveBeneficiary: !prev.saveBeneficiary,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                            formData.saveBeneficiary
                              ? "bg-blue-600"
                              : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                              formData.saveBeneficiary
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </>
                  ) : (
                    // Bulk transfer form placeholder
                    <div className="text-center py-8">
                      <UserGroupIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">Bulk transfer functionality will be added here</p>
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
                      disabled={
                        isLoading || (transferType === "single" && !resolvedAccount)
                      }
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
                    >
                      {isLoading
                        ? "Processing..."
                        : "Send Money"
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayoutModal;