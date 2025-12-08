import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  useBanks,
  useResolveAccount,
  usePayout,
} from '../../hooks/useTransactions';

const SingleTransferForm = ({
  prefilledData = {},
  selectedBeneficiary = null,
  onSuccess,
  onClose,
}) => {
  const [errors, setErrors] = useState({});
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankSearchTerm, setBankSearchTerm] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedAccount, setResolvedAccount] = useState(null);

  const [formData, setFormData] = useState({
    bankId: "",
    accountNumber: "",
    amount: "",
    displayAmount: "",
    narration: "",
    beneficiaryName: "",
    saveBeneficiary: false,
  });

  const { data: banksData, isLoading: banksLoading } = useBanks();
  const resolveAccountMutation = useResolveAccount();
  const payoutMutation = usePayout();

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

  // Enhanced bank filtering
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

  // Handle prefilled data
  useEffect(() => {
    if (prefilledData && Object.keys(prefilledData).length > 0) {
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
          bankName: "",
        });
      }
    }
  }, [prefilledData]);

  // Handle selected beneficiary
  useEffect(() => {
    if (selectedBeneficiary) {
      const bank = banks.find(b => b.bankId === selectedBeneficiary.bankId);
      
      setFormData({
        bankId: selectedBeneficiary.bankId,
        accountNumber: selectedBeneficiary.accountNumber,
        amount: "",
        displayAmount: "",
        narration: "",
        beneficiaryName: selectedBeneficiary.name,
        saveBeneficiary: true,
      });

      if (bank) {
        setSelectedBank(bank);
        setBankSearchTerm(bank.bankName);
      }

      setResolvedAccount({
        accountName: selectedBeneficiary.name,
        accountNumber: selectedBeneficiary.accountNumber,
        bankName: selectedBeneficiary.bankName,
      });
    }
  }, [selectedBeneficiary, banks]);

  // Handle bank selection for prefilled data
  useEffect(() => {
    if (prefilledData?.bankId && banks.length > 0) {
      const bank = banks.find((b) => b.bankId === prefilledData.bankId);
      if (bank) {
        setSelectedBank(bank);
        setBankSearchTerm(bank.bankName);
        
        setResolvedAccount(prev => 
          prev ? { ...prev, bankName: bank.bankName } : null
        );
      }
    }
  }, [prefilledData?.bankId, banks]);

  // Bank selection handlers
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

  // Account resolution
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

  // Auto-resolve account
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

  // Input handlers
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

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankId) newErrors.bankId = "Please select a bank";
    if (!formData.accountNumber)
      newErrors.accountNumber = "Account number is required";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!formData.narration) newErrors.narration = "Narration is required";
    if (!resolvedAccount)
      newErrors.accountNumber = "Please resolve account details first";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await payoutMutation.mutateAsync(formData);
      if (result.success) {
        onSuccess(result.data);
      } else {
        setErrors({ submit: result.message || "Payout failed" });
      }
    } catch (error) {
      setErrors({ submit: error.message || "Failed to process transfer" });
    }
  };

  const isLoading = payoutMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Bank Dropdown */}
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
          disabled={isLoading || !resolvedAccount}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
        >
          {isLoading ? "Processing..." : "Send Money"}
        </button>
      </div>
    </form>
  );
};

export default SingleTransferForm;