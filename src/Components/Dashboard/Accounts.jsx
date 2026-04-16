import React, { useState } from "react";
import {
  ArrowPathIcon,
  PlusCircleIcon,
  BanknotesIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useAccounts, useAccountProviders, useProvisionAccount } from "../../hooks/useAccounts";
import toast from "react-hot-toast";

// ─── Copy Button ──────────────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Account number copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0"
      title="Copy account number"
    >
      {copied ? (
        <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" />
      ) : (
        <ClipboardDocumentIcon className="w-4 h-4" />
      )}
    </button>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const getStatusBadge = (status) => {
  const styles = {
    Active: "bg-green-100 text-green-800 border-green-200",
    Inactive: "bg-slate-100 text-slate-600 border-slate-200",
    Suspended: "bg-red-100 text-red-800 border-red-200",
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || "bg-slate-100 text-slate-800 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
};

// ─── Provision Modal ──────────────────────────────────────────────────────────
const ProvisionModal = ({ isOpen, onClose, providers, onProvision, isProvisioning }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleSubmit = () => {
    if (!selectedProvider) return;
    onProvision(selectedProvider.id);
  };

  if (!isOpen) return null;

  const availableProviders = providers.filter((p) => !p.hasAccount);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-800 bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal — slides up on mobile, centered on desktop */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 pb-8 sm:pb-6">
        {/* Handle bar (mobile only) */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Generate New Account
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Select a provider to create a virtual account
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Providers List */}
        {availableProviders.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">
              You already have accounts with all available providers.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {availableProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() =>
                  setSelectedProvider(
                    selectedProvider?.id === provider.id ? null : provider
                  )
                }
                className={`w-full flex items-start space-x-4 p-4 rounded-xl border-2 transition-all ${
                  selectedProvider?.id === provider.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedProvider?.id === provider.id ? "bg-blue-100" : "bg-slate-100"
                  }`}
                >
                  <BanknotesIcon
                    className={`w-5 h-5 ${
                      selectedProvider?.id === provider.id ? "text-blue-600" : "text-slate-500"
                    }`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-slate-900">
                    {provider.displayName}
                  </div>
                  {provider.description && (
                    <div className="text-sm text-slate-500 mt-0.5">
                      {provider.description}
                    </div>
                  )}
                  {provider.provisioningStatus && (
                    <div className="flex items-center space-x-1 mt-1">
                      <ClockIcon className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs text-yellow-600">
                        {provider.provisioningStatus}
                      </span>
                    </div>
                  )}
                </div>
                {selectedProvider?.id === provider.id && (
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
        )}

        {availableProviders.length > 0 && (
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedProvider || isProvisioning}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {isProvisioning ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-4 h-4" />
                  <span>Generate Account</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Accounts Page ───────────────────────────────────────────────────────
const Accounts = () => {
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  const {
    data: accountsData,
    isLoading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useAccounts();

  const { data: providersData, isLoading: providersLoading } = useAccountProviders();
  const { mutate: provisionAccount, isLoading: isProvisioning } = useProvisionAccount();

  const accounts = accountsData?.success ? accountsData.data : [];
  const providers = providersData?.success ? providersData.data : [];

  const handleProvision = (providerId) => {
    provisionAccount(providerId, {
      onSuccess: (data) => {
        toast.success(data.message || "Account provisioning has been queued");
        setShowProvisionModal(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to provision account");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
              Accounts
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Manage your virtual accounts across providers
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => refetchAccounts()}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setShowProvisionModal(true)}
              disabled={providersLoading}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors text-sm"
            >
              <PlusCircleIcon className="w-4 h-4" />
              <span>Generate Account</span>
            </button>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800">
              Your Accounts
              {accounts.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({accounts.length} total)
                </span>
              )}
            </h3>
          </div>

          {/* Loading */}
          {accountsLoading && (
            <div className="p-10 text-center">
              <div className="inline-flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-slate-600">Loading accounts...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {accountsError && (
            <div className="p-10 text-center">
              <ExclamationCircleIcon className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 font-medium mb-2">Failed to load accounts</p>
              <button
                onClick={() => refetchAccounts()}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!accountsLoading && !accountsError && accounts.length === 0 && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <BanknotesIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No accounts yet</h3>
              <p className="text-slate-500 mb-5 text-sm">
                Generate your first virtual account to start receiving payments.
              </p>
              <button
                onClick={() => setShowProvisionModal(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <PlusCircleIcon className="w-4 h-4" />
                <span>Generate Account</span>
              </button>
            </div>
          )}

          {!accountsLoading && accounts.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Account Number", "Account Name", "Currency", "Status", "Provider", "Date Added"].map(
                        (col) => (
                          <th
                            key={col}
                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="font-mono font-medium text-slate-900 text-sm">
                              {account.accountNumber}
                            </span>
                            <CopyButton text={account.accountNumber} />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {account.accountName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {account.currencyCode}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(account.status)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {account.providerName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(account.createdAt).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-200">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4">
                    {/* Account number + status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center min-w-0">
                        <span className="font-mono font-semibold text-slate-900 text-sm">
                          {account.accountNumber}
                        </span>
                        <CopyButton text={account.accountNumber} />
                      </div>
                      {getStatusBadge(account.status)}
                    </div>

                    {/* Account name */}
                    <div className="text-sm font-medium text-slate-800 mb-3">
                      {account.accountName}
                    </div>

                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {account.currencyCode}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {account.providerName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(account.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Provision Modal */}
      <ProvisionModal
        isOpen={showProvisionModal}
        onClose={() => setShowProvisionModal(false)}
        providers={providers}
        onProvision={handleProvision}
        isProvisioning={isProvisioning}
      />
    </div>
  );
};

export default Accounts;