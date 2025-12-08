import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  useBanks,
  useResolveAccount,
  useBulkPayout,
} from '../../hooks/useTransactions';

const BulkTransferForm = ({
  bulkGroup = null,
  onSuccess,
  onClose,
}) => {
  const [bulkItems, setBulkItems] = useState([]);
  const [groupKey, setGroupKey] = useState("");
  const [errors, setErrors] = useState({});

  const { data: banksData, isLoading: banksLoading } = useBanks();
  const resolveAccountMutation = useResolveAccount();
  const bulkPayoutMutation = useBulkPayout();

  const banks = banksData?.success ? banksData.data : [];

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

  // Handle bulk group pre-fill
  useEffect(() => {
    if (bulkGroup) {
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
  }, [bulkGroup]);

  // Bulk item management
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
            return {
              ...item,
              displayAmount: formattedValue,
              amount: parseAmount(formattedValue),
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Bank selection for bulk items
  const handleBulkBankSelect = (itemId, bank) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            selectedBank: bank,
            bankSearchTerm: bank.bankName,
            bankId: bank.bankId,
            bankName: bank.bankName,
            showBankDropdown: false,
            resolvedAccount: null,
            beneficiaryName: "",
          };
        }
        return item;
      })
    );
  };

  const handleBulkBankSearch = (itemId, value) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updates = {
            bankSearchTerm: value,
            showBankDropdown: true,
          };

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

  // Account resolution for bulk items
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
            prev.map((b) => {
              if (b.id === itemId) {
                return {
                  ...b,
                  resolvedAccount: result.data,
                  beneficiaryName: result.data.accountName,
                  resolved: true,
                  isResolving: false,
                };
              }
              return b;
            })
          );
        }
      } catch (error) {
        console.error("Bulk account resolution failed:", error);
        setBulkItems((prev) =>
          prev.map((b) =>
            b.id === itemId
              ? { ...b, isResolving: false, resolvedAccount: null }
              : b
          )
        );
      }
    },
    [resolveAccountMutation]
  );

  const handleBulkAccountNumberChange = (itemId, value) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            accountNumber: value,
            resolvedAccount: null,
            beneficiaryName: "",
            resolved: false,
          };
        }
        return item;
      })
    );
  };

  const bulkItemsKey = useMemo(
    () =>
      bulkItems
        .map(
          (item) =>
            `${item.id}-${item.accountNumber}-${item.bankId}-${item.resolved}-${item.isResolving}`
        )
        .join("|"),
    [bulkItems]
  );

  // Auto-resolve for bulk items
  useEffect(() => {
    if (bulkItems.length === 0) return;

    const timers = [];

    bulkItems.forEach((item) => {
      if (
        item.accountNumber?.length === 10 &&
        item.bankId &&
        !item.resolved &&
        !item.isResolving
      ) {
        const timer = setTimeout(() => {
          resolveBulkAccount(item.id);
        }, 500);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [bulkItemsKey, resolveBulkAccount]);

  // Filter banks for bulk items
  const getBulkFilteredBanks = (searchTerm) => {
    return banks
      .filter((bank) =>
        bank.bankName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const term = searchTerm.toLowerCase();
        const aName = a.bankName.toLowerCase();
        const bName = b.bankName.toLowerCase();

        if (aName === term) return -1;
        if (bName === term) return 1;
        if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
        if (bName.startsWith(term) && !aName.startsWith(term)) return 1;
        return aName.localeCompare(bName);
      })
      .slice(0, 10);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (bulkItems.length === 0) {
      newErrors.bulk = "Please add at least one recipient";
    } else {
      bulkItems.forEach((item, index) => {
        if (!item.bankId) newErrors[`bulk_${index}_bank`] = "Bank required";
        if (!item.accountNumber)
          newErrors[`bulk_${index}_accountNumber`] = "Account number required";
        if (!item.resolvedAccount && !item.resolved)
          newErrors[`bulk_${index}_accountNumber`] = "Account must be resolved";
        if (!item.amount || item.amount <= 0)
          newErrors[`bulk_${index}_amount`] = "Amount required";
        if (!item.narration)
          newErrors[`bulk_${index}_narration`] = "Narration required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const bulkData = {
        groupKey: groupKey || `BULK-${Date.now()}`,
        items: bulkItems.map((item) => ({
          bankId: item.bankId,
          amount: item.amount,
          narration: item.narration,
          accountNumber: item.accountNumber,
          beneficiaryName: item.beneficiaryName,
          saveBeneficiary: item.saveBeneficiary,
        })),
      };

      const result = await bulkPayoutMutation.mutateAsync(bulkData);
      if (result.success) {
        onSuccess(result.data);
      } else {
        setErrors({ submit: result.message || "Bulk payout failed" });
      }
    } catch (error) {
      setErrors({ submit: error.message || "Failed to process bulk transfer" });
    }
  };

  const isLoading = bulkPayoutMutation.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          Bulk Transfer Recipients
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

      {bulkItems.length === 0 ? (
        <div className="text-center py-8">
          <UserGroupIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No recipients added yet</p>
          <button
            type="button"
            onClick={addBulkItem}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add First Recipient
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {bulkItems.map((item, index) => {
              const filteredBanksForItem = getBulkFilteredBanks(
                item.bankSearchTerm || ""
              );

              return (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                >
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
                      <label className="block text-sm text-slate-600 mb-1">
                        Select Bank
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.bankSearchTerm || ""}
                          onChange={(e) =>
                            handleBulkBankSearch(item.id, e.target.value)
                          }
                          onFocus={() =>
                            updateBulkItem(item.id, "showBankDropdown", true)
                          }
                          disabled={banksLoading || item.resolved}
                          placeholder="Search for a bank..."
                          className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                        />

                        {/* Bank Dropdown */}
                        {item.showBankDropdown && !item.resolved && (
                          <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {banksLoading ? (
                              <div className="px-3 py-4 text-center">
                                <div className="inline-flex items-center space-x-2">
                                  <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
                                  <span className="text-slate-600 text-xs">
                                    Loading...
                                  </span>
                                </div>
                              </div>
                            ) : filteredBanksForItem.length > 0 ? (
                              filteredBanksForItem.map((bank) => (
                                <button
                                  key={bank.bankId}
                                  type="button"
                                  onClick={() =>
                                    handleBulkBankSelect(item.id, bank)
                                  }
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0 transition-colors"
                                >
                                  <div className="text-xs font-medium text-slate-800">
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
                              <div className="px-3 py-3 text-xs text-slate-500 text-center">
                                {item.bankSearchTerm
                                  ? `No banks found`
                                  : "Start typing..."}
                              </div>
                            )}
                          </div>
                        )}

                        {item.showBankDropdown && !item.resolved && (
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() =>
                              updateBulkItem(item.id, "showBankDropdown", false)
                            }
                          ></div>
                        )}

                        {item.selectedBank && (
                          <p className="text-green-600 text-xs mt-1 flex items-center space-x-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>{item.selectedBank.bankName} selected</span>
                          </p>
                        )}

                        {item.resolved && (
                          <p className="text-blue-600 text-xs mt-1 flex items-center space-x-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>From saved beneficiaries</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Account Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.accountNumber}
                          onChange={(e) =>
                            handleBulkAccountNumberChange(item.id, e.target.value)
                          }
                          placeholder="Enter account number"
                          maxLength="10"
                          readOnly={item.resolved}
                          className="w-full px-3 py-2 pr-10 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                        />
                        {item.accountNumber && item.bankId && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {item.isResolving ? (
                              <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
                            ) : item.resolvedAccount || item.resolved ? (
                              <CheckCircleIcon className="w-3 h-3 text-green-600" />
                            ) : null}
                          </div>
                        )}
                      </div>

                      {item.resolvedAccount && (
                        <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                          <CheckCircleIcon className="w-2 h-2" />
                          <span>Verified: {item.resolvedAccount.accountName}</span>
                        </p>
                      )}

                      {item.isResolving && (
                        <p className="text-xs text-blue-600 mt-1">
                          🔄 Verifying account...
                        </p>
                      )}
                    </div>

                    {/* Beneficiary Name */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Beneficiary Name
                      </label>
                      <input
                        type="text"
                        value={item.beneficiaryName}
                        onChange={(e) =>
                          updateBulkItem(item.id, "beneficiaryName", e.target.value)
                        }
                        placeholder="Enter beneficiary name"
                        readOnly={item.resolved || item.resolvedAccount}
                        className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                          ₦
                        </span>
                        <input
                          type="text"
                          value={item.displayAmount}
                          onChange={(e) =>
                            updateBulkItem(item.id, "displayAmount", e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      {errors[`bulk_${index}_amount`] && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors[`bulk_${index}_amount`]}
                        </p>
                      )}
                    </div>

                    {/* Narration */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Narration
                      </label>
                      <input
                        type="text"
                        value={item.narration}
                        onChange={(e) =>
                          updateBulkItem(item.id, "narration", e.target.value)
                        }
                        placeholder="Purpose of transfer"
                        className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-600"
                      />
                      {errors[`bulk_${index}_narration`] && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors[`bulk_${index}_narration`]}
                        </p>
                      )}
                    </div>

                    {/* Save as Beneficiary Toggle */}
                    <div className="md:col-span-2 flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                      <label className="text-sm font-medium text-slate-700">
                        Save as beneficiary
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateBulkItem(
                            item.id,
                            "saveBeneficiary",
                            !item.saveBeneficiary
                          )
                        }
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          item.saveBeneficiary ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-lg transition-transform ${
                            item.saveBeneficiary ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {errors.bulk && (
            <p className="text-sm text-red-600">{errors.bulk}</p>
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
            >
              {isLoading
                ? "Processing..."
                : `Send Money (${bulkItems.length} recipients)`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BulkTransferForm;