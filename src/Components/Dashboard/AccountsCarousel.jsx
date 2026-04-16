import React, { useState, useRef } from "react";
import {
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  BanknotesIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAccounts, useAccountProviders, useProvisionAccount } from "../../hooks/useAccounts";
import toast from "react-hot-toast";

// ─── Copy Button ──────────────────────────────────────────────────────────────
const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label || "Copied"}!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-1 rounded-md text-white/60 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0"
      title={`Copy ${label}`}
    >
      {copied ? (
        <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-green-300" />
      ) : (
        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
      )}
    </button>
  );
};

// ─── Account Card ─────────────────────────────────────────────────────────────
const AccountCard = ({ account, index }) => {
  const gradients = [
    "from-blue-600 to-blue-800",
    "from-violet-600 to-violet-800",
    "from-emerald-600 to-emerald-800",
    "from-rose-600 to-rose-800",
    "from-amber-600 to-amber-800",
  ];
  const gradient = gradients[index % gradients.length];

  const statusColor = {
    Active: "bg-green-400",
    Inactive: "bg-slate-400",
    Suspended: "bg-red-400",
    Pending: "bg-yellow-400",
  };

  return (
    <div
      className={`relative flex-shrink-0 w-72 sm:w-80 rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg select-none`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">
            {account.providerName}
          </p>
          <p className="text-white font-semibold text-sm">{account.accountName}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor[account.status] || "bg-slate-400"}`} />
          <span className="text-white/90 text-xs font-medium">{account.status}</span>
        </div>
      </div>

      {/* Account number */}
      <div className="mb-5">
        <p className="text-white/60 text-xs mb-1">Account Number</p>
        <div className="flex items-center">
          <span className="font-mono text-white font-bold text-lg tracking-widest">
            {account.accountNumber}
          </span>
          <CopyButton text={account.accountNumber} label="Account number" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs mb-0.5">Currency</p>
          <span className="text-white font-semibold text-sm">{account.currencyCode}</span>
        </div>
        {/* Decorative bank icon */}
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <BanknotesIcon className="w-5 h-5 text-white/70" />
        </div>
      </div>

      {/* Subtle decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
    </div>
  );
};

// ─── Add Account Card ─────────────────────────────────────────────────────────
const AddAccountCard = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex-shrink-0 w-72 sm:w-80 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[168px] group disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors">
      <PlusCircleIcon className="w-6 h-6 text-blue-500 group-hover:text-blue-600" />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">
        Generate Account
      </p>
      <p className="text-xs text-slate-400 mt-0.5">Add a new virtual account</p>
    </div>
  </button>
);

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
      <div className="absolute inset-0 bg-slate-800 bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 pb-8 sm:pb-6">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden" />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Generate New Account</h2>
            <p className="text-sm text-slate-500 mt-0.5">Select a provider to create a virtual account</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {availableProviders.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">You already have accounts with all available providers.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {availableProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(selectedProvider?.id === provider.id ? null : provider)}
                className={`w-full flex items-start space-x-4 p-4 rounded-xl border-2 transition-all ${
                  selectedProvider?.id === provider.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedProvider?.id === provider.id ? "bg-blue-100" : "bg-slate-100"
                }`}>
                  <BanknotesIcon className={`w-5 h-5 ${selectedProvider?.id === provider.id ? "text-blue-600" : "text-slate-500"}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-slate-900">{provider.displayName}</div>
                  {provider.description && (
                    <div className="text-sm text-slate-500 mt-0.5">{provider.description}</div>
                  )}
                  {provider.provisioningStatus && (
                    <div className="flex items-center space-x-1 mt-1">
                      <ClockIcon className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-xs text-yellow-600">{provider.provisioningStatus}</span>
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
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedProvider || isProvisioning}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {isProvisioning ? (
                <><ArrowPathIcon className="w-4 h-4 animate-spin" /><span>Generating...</span></>
              ) : (
                <><PlusCircleIcon className="w-4 h-4" /><span>Generate Account</span></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main AccountsCarousel ────────────────────────────────────────────────────
const AccountsCarousel = () => {
  const [showModal, setShowModal] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  const { data: accountsData, isLoading: accountsLoading, error: accountsError, refetch } = useAccounts();
  const { data: providersData, isLoading: providersLoading } = useAccountProviders();
  const { mutate: provisionAccount, isLoading: isProvisioning } = useProvisionAccount();

  const accounts = accountsData?.success ? accountsData.data : [];
  const providers = providersData?.success ? providersData.data : [];

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const handleProvision = (providerId) => {
    provisionAccount(providerId, {
      onSuccess: (data) => {
        toast.success(data.message || "Account provisioning has been queued");
        setShowModal(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to provision account");
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <BanknotesIcon className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Virtual Accounts</h2>
          {!accountsLoading && accounts.length > 0 && (
            <span className="text-xs text-slate-400 font-medium">({accounts.length})</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => refetch()}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${accountsLoading ? "animate-spin" : ""}`} />
          </button>
          {/* Carousel arrows — only show when there are cards */}
          {accounts.length > 1 && (
            <>
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
              >
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {accountsLoading && (
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-500 mr-2" />
          <span className="text-sm text-slate-500">Loading accounts...</span>
        </div>
      )}

      {/* Error */}
      {accountsError && (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <ExclamationCircleIcon className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-500 font-medium">Failed to load accounts</p>
          <button onClick={() => refetch()} className="text-xs text-blue-600 hover:underline">Try again</button>
        </div>
      )}

      {/* Carousel */}
      {!accountsLoading && !accountsError && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {accounts.map((account, i) => (
            <AccountCard key={account.id} account={account} index={i} />
          ))}

          {/* Add account card always at the end */}
          <AddAccountCard
            onClick={() => setShowModal(true)}
            disabled={providersLoading}
          />
        </div>
      )}

      {/* Dot indicators */}
      {accounts.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {accounts.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          ))}
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> {/* for add card */}
        </div>
      )}

      <ProvisionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        providers={providers}
        onProvision={handleProvision}
        isProvisioning={isProvisioning}
      />
    </div>
  );
};

export default AccountsCarousel;