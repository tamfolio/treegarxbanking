import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useBanks,
  useResolveAccount,
  useBulkPayout,
} from "../../hooks/useTransactions";
import { useBeneficiaries } from "../../hooks/useBeneficiaries";
import { toast } from "react-hot-toast";
import PinVerificationModal from "../Modals/PinVerificationModal";
import OtpVerificationModal from "../Modals/OtpVerificationModal";

const BulkTransferForm = ({ bulkGroup = null, onSuccess, onClose }) => {
  const [bulkItems, setBulkItems] = useState([]);
  const [groupKey, setGroupKey] = useState("");
  const [errors, setErrors] = useState({});
  const [showPinModal, setShowPinModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingTransactionData, setPendingTransactionData] = useState(null);

  // ── Beneficiary group selector state ──
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [selectedGroupKey, setSelectedGroupKey] = useState(null);

  const { data: banksData, isLoading: banksLoading } = useBanks();
  const { data: beneficiariesData } = useBeneficiaries({ category: "Bulk" });
  const resolveAccountMutation = useResolveAccount();
  const bulkPayoutMutation = useBulkPayout();

  const banks = banksData?.success ? banksData.data : [];

  // Process bulk beneficiaries and group by groupKey
  let allBulkBeneficiaries = [];
  if (beneficiariesData?.success) {
    const raw = beneficiariesData.data;
    if (Array.isArray(raw)) allBulkBeneficiaries = raw;
    else if (Array.isArray(raw?.data)) allBulkBeneficiaries = raw.data;
    else allBulkBeneficiaries = raw?.items || raw?.beneficiaries || [];
  }

  const groupedBeneficiaries = allBulkBeneficiaries.reduce((acc, b) => {
    if (!acc[b.groupKey]) acc[b.groupKey] = [];
    acc[b.groupKey].push(b);
    return acc;
  }, {});

  const groups = Object.entries(groupedBeneficiaries).map(([gKey, items]) => ({
    groupKey: gKey,
    items,
    count: items.length,
  }));

  const filteredGroups = groups.filter(
    (g) =>
      !groupSearch ||
      g.groupKey.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.items.some((i) => i.name?.toLowerCase().includes(groupSearch.toLowerCase()))
  );

  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem("userData"));
    } catch {
      return null;
    }
  };

  const userData = getUserData();
  const customerTypeCode = userData?.customer?.customerTypeCode;
  const isIndividualCustomer = customerTypeCode === "Individual";

  const formatAmountDisplay = (value) => {
    if (!value) return "";
    const numericValue = value.toString().replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const parseAmount = (formattedAmount) =>
    parseFloat((formattedAmount || "").replace(/,/g, "")) || 0;

  // Build bulk items from a beneficiary group
  const buildItemsFromGroup = (groupItems) =>
    groupItems.map((item) => ({
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
    }));

  // Handle beneficiary group selection
  const handleGroupSelect = (group) => {
    setSelectedGroupKey(group.groupKey);
    setGroupKey(group.groupKey);
    setBulkItems(buildItemsFromGroup(group.items));
    setShowGroupSelector(false);
    setGroupSearch("");
    setErrors({});
  };

  // Clear selected group
  const handleClearGroup = () => {
    setSelectedGroupKey(null);
    setGroupKey("");
    setBulkItems([]);
  };

  // Handle bulk group pre-fill from prop
  useEffect(() => {
    if (bulkGroup) {
      setGroupKey(bulkGroup.groupKey);
      setSelectedGroupKey(bulkGroup.groupKey);
      setBulkItems(buildItemsFromGroup(bulkGroup.items || []));
    }
  }, [bulkGroup]);

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

  const removeBulkItem = (id) => {
    setBulkItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateBulkItem = (id, field, value) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === "displayAmount") {
            const formattedValue = formatAmountDisplay(value);
            return { ...item, displayAmount: formattedValue, amount: parseAmount(formattedValue) };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleBulkBankSelect = (itemId, bank) => {
    setBulkItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              selectedBank: bank,
              bankSearchTerm: bank.bankName,
              bankId: bank.bankId,
              bankName: bank.bankName,
              showBankDropdown: false,
              resolvedAccount: null,
              beneficiaryName: "",
            }
          : item
      )
    );
  };

  const handleBulkBankSearch = (itemId, value) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updates = { bankSearchTerm: value, showBankDropdown: true };
          if (item.selectedBank && value !== item.selectedBank.bankName) {
            updates.selectedBank = null;
            updates.bankId = "";
            updates.bankName = "";
            updates.resolvedAccount = null;
            updates.beneficiaryName = "";
          }
          return { ...item, ...updates };
        }
        return item;
      })
    );
  };

  const resolveBulkAccount = useCallback(
    async (itemId) => {
      const item = bulkItems.find((b) => b.id === itemId);
      if (!item || !item.accountNumber || !item.bankId) return;

      setBulkItems((prev) =>
        prev.map((b) => (b.id === itemId ? { ...b, isResolving: true } : b))
      );

      try {
        const result = await resolveAccountMutation.mutateAsync({
          bankId: item.bankId,
          accountNumber: item.accountNumber,
        });

        if (result.success) {
          setBulkItems((prev) =>
            prev.map((b) =>
              b.id === itemId
                ? {
                    ...b,
                    resolvedAccount: result.data,
                    beneficiaryName: result.data.accountName,
                    resolved: true,
                    isResolving: false,
                  }
                : b
            )
          );
        }
      } catch {
        setBulkItems((prev) =>
          prev.map((b) =>
            b.id === itemId ? { ...b, isResolving: false, resolvedAccount: null } : b
          )
        );
      }
    },
    [resolveAccountMutation]
  );

  const handleBulkAccountNumberChange = (itemId, value) => {
    setBulkItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, accountNumber: value, resolvedAccount: null, beneficiaryName: "", resolved: false }
          : item
      )
    );
  };

  const bulkItemsKey = useMemo(
    () => bulkItems.map((item) => `${item.id}-${item.accountNumber}-${item.bankId}-${item.resolved}-${item.isResolving}`).join("|"),
    [bulkItems]
  );

  useEffect(() => {
    if (bulkItems.length === 0) return;
    const timers = [];
    bulkItems.forEach((item) => {
      if (item.accountNumber?.length === 10 && item.bankId && !item.resolved && !item.isResolving) {
        const timer = setTimeout(() => resolveBulkAccount(item.id), 500);
        timers.push(timer);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [bulkItemsKey, resolveBulkAccount]);

  const getBulkFilteredBanks = (searchTerm) =>
    banks
      .filter((bank) => bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const term = searchTerm.toLowerCase();
        const an = a.bankName.toLowerCase();
        const bn = b.bankName.toLowerCase();
        if (an === term) return -1;
        if (bn === term) return 1;
        if (an.startsWith(term) && !bn.startsWith(term)) return -1;
        if (bn.startsWith(term) && !an.startsWith(term)) return 1;
        return an.localeCompare(bn);
      })
      .slice(0, 10);

  const validateForm = () => {
    const newErrors = {};
    if (bulkItems.length === 0) {
      newErrors.bulk = "Please add at least one recipient";
    } else {
      bulkItems.forEach((item, index) => {
        if (!item.bankId) newErrors[`bulk_${index}_bank`] = "Bank required";
        if (!item.accountNumber) newErrors[`bulk_${index}_accountNumber`] = "Account number required";
        if (!item.resolvedAccount && !item.resolved) newErrors[`bulk_${index}_accountNumber`] = "Account must be resolved";
        if (!item.amount || item.amount <= 0) newErrors[`bulk_${index}_amount`] = "Amount required";
        if (!item.narration) newErrors[`bulk_${index}_narration`] = "Narration required";
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const bulkData = {
      groupKey: groupKey || `BULK-${Date.now()}`,
      items: bulkItems.map((item) => ({
        bankId: item.bankId,
        bankName: item.bankName || item.selectedBank?.bankName || "Unknown Bank",
        amount: item.amount,
        narration: item.narration,
        accountNumber: item.accountNumber,
        beneficiaryName: item.beneficiaryName,
        saveBeneficiary: item.saveBeneficiary,
      })),
    };

    setPendingTransactionData(bulkData);
    if (isIndividualCustomer) setShowPinModal(true);
    else setShowOtpModal(true);
  };

  const handleOtpSuccess = ({ otpCode, otpChallengeId }) => {
    setPendingTransactionData((prev) => ({ ...prev, otpCode, otpChallengeId }));
    setShowOtpModal(false);
    setShowPinModal(true);
  };

  const handlePinVerified = async ({ pin, transactionData }) => {
    try {
      const payloadData = { ...transactionData, pin };
      if (!isIndividualCustomer && transactionData.otpCode && transactionData.otpChallengeId) {
        payloadData.otpCode = transactionData.otpCode;
        payloadData.otpChallengeId = transactionData.otpChallengeId;
      }

      const result = await bulkPayoutMutation.mutateAsync(payloadData);
      if (result.success) {
        toast.success(`Bulk transfer completed! ${bulkItems.length} recipients processed.`);
        setShowPinModal(false);
        onSuccess?.(result.data);
      } else {
        toast.error(result.message || "Bulk transfer failed");
        setErrors({ submit: result.message || "Bulk payout failed" });
      }
    } catch (error) {
      toast.error(error.message || "Failed to process bulk transfer");
      setErrors({ submit: error.message || "Failed to process bulk transfer" });
      throw error;
    }
  };

  const isLoading = bulkPayoutMutation.isPending;

  return (
    <>
      <div className="space-y-6">

        {/* ── Beneficiary Group Selector ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              Load from Saved Group (optional)
            </label>
            {selectedGroupKey && (
              <button
                type="button"
                onClick={handleClearGroup}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <XMarkIcon className="h-3 w-3" />
                Clear group
              </button>
            )}
          </div>

          {selectedGroupKey ? (
            // Show selected group
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <UserGroupIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 font-mono truncate">
                  {selectedGroupKey}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {bulkItems.length} recipient{bulkItems.length !== 1 ? "s" : ""} loaded
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupSelector(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
              >
                Change
              </button>
            </div>
          ) : (
            // Show selector button
            <button
              type="button"
              onClick={() => setShowGroupSelector(true)}
              className="w-full flex items-center gap-3 p-3 border border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left group"
            >
              <div className="p-2 bg-slate-100 group-hover:bg-blue-100 rounded-lg shrink-0 transition-colors">
                <UserGroupIcon className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-600 group-hover:text-blue-700">
                  Select a saved beneficiary group
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Pre-fill recipients from a previously saved bulk transfer
                </div>
              </div>
              <ChevronDownIcon className="h-4 w-4 text-slate-300 group-hover:text-blue-400 shrink-0" />
            </button>
          )}

          {/* Group selector dropdown */}
          {showGroupSelector && (
            <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    autoFocus
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Search groups..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Group list */}
              <div className="max-h-52 overflow-y-auto">
                {filteredGroups.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">
                    No saved bulk groups found.
                  </div>
                ) : (
                  filteredGroups.map((g) => (
                    <button
                      key={g.groupKey}
                      type="button"
                      onClick={() => handleGroupSelect(g)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
                        <UserGroupIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 font-mono truncate">
                          {g.groupKey}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {g.count} recipient{g.count !== 1 ? "s" : ""}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {g.items.slice(0, 3).map((item) => (
                            <span key={item.id} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                              {item.name}
                            </span>
                          ))}
                          {g.items.length > 3 && (
                            <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                              +{g.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Cancel */}
              <div className="p-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowGroupSelector(false); setGroupSearch(""); }}
                  className="w-full px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Recipients header ── */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Bulk Transfer Recipients
            {bulkItems.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({bulkItems.length})
              </span>
            )}
          </h3>
          <button
            type="button"
            onClick={addBulkItem}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Recipient</span>
          </button>
        </div>

        {errors.bulk && (
          <p className="text-sm text-red-600">{errors.bulk}</p>
        )}

        {bulkItems.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No recipients added yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Select a saved group above or add recipients manually
            </p>
            <button
              type="button"
              onClick={addBulkItem}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              Add First Recipient
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bulkItems.map((item, index) => {
                const filteredBanksForItem = getBulkFilteredBanks(item.bankSearchTerm || "");

                return (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-800">
                        Recipient {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeBulkItem(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bank Selection */}
                      <div className="md:col-span-2">
                        <label className="block text-sm text-slate-600 mb-1">Select Bank</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={item.bankSearchTerm || ""}
                            onChange={(e) => handleBulkBankSearch(item.id, e.target.value)}
                            onFocus={() => updateBulkItem(item.id, "showBankDropdown", true)}
                            disabled={banksLoading || item.resolved}
                            placeholder="Search for a bank..."
                            className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
                          />

                          {item.showBankDropdown && !item.resolved && (
                            <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                              {banksLoading ? (
                                <div className="px-3 py-4 text-center">
                                  <div className="inline-flex items-center space-x-2">
                                    <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
                                    <span className="text-slate-600 text-xs">Loading...</span>
                                  </div>
                                </div>
                              ) : filteredBanksForItem.length > 0 ? (
                                filteredBanksForItem.map((bank) => (
                                  <button
                                    key={bank.bankId}
                                    type="button"
                                    onClick={() => handleBulkBankSelect(item.id, bank)}
                                    className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                                  >
                                    <div className="text-xs font-medium text-slate-800">{bank.bankName}</div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-3 text-xs text-slate-500 text-center">
                                  {item.bankSearchTerm ? "No banks found" : "Start typing..."}
                                </div>
                              )}
                            </div>
                          )}

                          {item.showBankDropdown && !item.resolved && (
                            <div className="fixed inset-0 z-20" onClick={() => updateBulkItem(item.id, "showBankDropdown", false)} />
                          )}
                        </div>
                      </div>

                      {/* Account Number */}
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Account Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={item.accountNumber}
                            onChange={(e) => handleBulkAccountNumberChange(item.id, e.target.value)}
                            placeholder="Enter account number"
                            maxLength="10"
                            readOnly={item.resolved}
                            className="w-full px-3 py-2 pr-10 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 read-only:bg-slate-100 read-only:text-slate-500"
                          />
                          {item.accountNumber && item.bankId && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {item.isResolving ? (
                                <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full" />
                              ) : (item.resolvedAccount || item.resolved) ? (
                                <CheckCircleIcon className="w-3 h-3 text-green-600" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {item.isResolving && (
                          <p className="text-xs text-blue-600 mt-1">🔄 Verifying account...</p>
                        )}
                      </div>

                      {/* Beneficiary Name */}
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Beneficiary Name</label>
                        <input
                          type="text"
                          value={item.beneficiaryName}
                          onChange={(e) => updateBulkItem(item.id, "beneficiaryName", e.target.value)}
                          placeholder="Enter beneficiary name"
                          readOnly={item.resolved || !!item.resolvedAccount}
                          className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600 read-only:bg-slate-100 read-only:text-slate-500"
                        />
                      </div>

                      {/* Amount */}
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Amount</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">₦</span>
                          <input
                            type="text"
                            value={item.displayAmount}
                            onChange={(e) => updateBulkItem(item.id, "displayAmount", e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-6 pr-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-600 ${
                              errors[`bulk_${index}_amount`] ? "border-red-300" : "border-slate-200"
                            }`}
                          />
                        </div>
                        {errors[`bulk_${index}_amount`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`bulk_${index}_amount`]}</p>
                        )}
                      </div>

                      {/* Narration */}
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Narration</label>
                        <input
                          type="text"
                          value={item.narration}
                          onChange={(e) => updateBulkItem(item.id, "narration", e.target.value)}
                          placeholder="Purpose of transfer"
                          className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-blue-600 ${
                            errors[`bulk_${index}_narration`] ? "border-red-300" : "border-slate-200"
                          }`}
                        />
                        {errors[`bulk_${index}_narration`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`bulk_${index}_narration`]}</p>
                        )}
                      </div>

                      {/* Save as Beneficiary Toggle */}
                      <div className="md:col-span-2 flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                        <label className="text-sm font-medium text-slate-700">Save as beneficiary</label>
                        <button
                          type="button"
                          onClick={() => updateBulkItem(item.id, "saveBeneficiary", !item.saveBeneficiary)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            item.saveBeneficiary ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition-transform ${
                            item.saveBeneficiary ? "translate-x-5" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors">
                {isLoading ? "Processing..." : `Send Money (${bulkItems.length} recipients)`}
              </button>
            </div>
          </form>
        )}
      </div>

      <PinVerificationModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinVerified}
        transactionData={pendingTransactionData}
        transactionType="bulk"
      />
      {!isIndividualCustomer && (
        <OtpVerificationModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          purpose="CreateTransfer"
        />
      )}
    </>
  );
};

export default BulkTransferForm;