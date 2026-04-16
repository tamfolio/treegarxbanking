import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
  WalletIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  MegaphoneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useProfileData } from "../../hooks/useProfile";
import { useTransactions } from "../../hooks/useTransactions";
import { getTimeBasedGreeting } from "../../utils/timeGreeting";
import StatementDownloadModal from "../Modals/StatementDownloadModal";
import InterestBreakdownModal from "../Modals/InterestBreakdownModal";
import PayoutModal from "../Modals/PayoutModal";
import SetPinModal from "../Modals/SetPinModal";
import TransactionLimits from "./TransactionLimit";
import VerificationRequiredModal from "../Modals/VerificationRequiredModal";
import SubWalletsModal from "../Modals/SubWalletsModal";
import { useWallets } from "../../hooks/useWallets";
import AccountsCarousel from "./AccountsCarousel";

// ─── Marquee Banner ───────────────────────────────────────────────────────────
const MarqueeBanner = () => {
  const message =
    "🎉 Earn 20% per annum on your Nexus wallet balance — funds grow automatically every day!  ✨ Your money works for you — 20% p.a. interest, no hidden fees.  📈 20% annual interest credited daily. Keep saving, keep earning!";
  const repeated = `${message}          ${message}`;

  return (
    <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-blue-200 bg-blue-50 mb-6">
      <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600">
        <MegaphoneIcon className="h-3.5 w-3.5 text-white shrink-0" />
        <span className="text-[10px] font-bold text-white tracking-wide uppercase whitespace-nowrap">
          20% p.a.
        </span>
      </div>
      <div className="flex-1 overflow-hidden py-2 px-2">
        <div
          className="whitespace-nowrap text-xs font-medium text-blue-700"
          style={{ display: "inline-block", animation: "marquee 40s linear infinite" }}
        >
          {repeated}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

// ─── Sub-wallets Panel ────────────────────────────────────────────────────────
const SubWalletsPanel = ({ onOpenModal }) => {
  const { data: walletsData, isLoading, refetch: refetchWallets } = useWallets();

  const allItems = walletsData?.data?.items || [];
  const mainWallet = allItems.find((w) => w.walletType === "Main");
  const subWallets = allItems.filter((w) => w.walletType === "Sub");

  const formatCurrency = (amount) =>
    `₦${parseFloat(amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const statusDot = {
    Active: "bg-emerald-400",
    Inactive: "bg-slate-300",
    Suspended: "bg-red-400",
  };

  const allDisplayWallets = [
    ...(mainWallet ? [{ ...mainWallet, isMain: true }] : []),
    ...subWallets.map((w) => ({ ...w, isMain: false })),
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <WalletIcon className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900">Wallets</h2>
          {!isLoading && (
            <span className="text-xs text-slate-400 font-medium">
              ({allDisplayWallets.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => refetchWallets()}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => onOpenModal("manage")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <PlusIcon className="h-3 w-3" />
            Manage
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-52 divide-y divide-slate-50">
        {isLoading ? (
          <div className="py-8 text-center">
            <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-400 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400">Loading wallets...</p>
          </div>
        ) : allDisplayWallets.length === 0 ? (
          <div className="py-8 text-center">
            <WalletIcon className="h-6 w-6 text-slate-200 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400">No wallets found</p>
          </div>
        ) : (
          allDisplayWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onOpenModal(wallet.isMain ? "manage" : "transfer", wallet)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left group"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  wallet.isMain
                    ? "bg-gradient-to-br from-blue-500 to-blue-700"
                    : "bg-slate-100 group-hover:bg-blue-50"
                }`}
              >
                <WalletIcon
                  className={`h-4 w-4 ${
                    wallet.isMain ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-slate-800 truncate">{wallet.name}</span>
                  {wallet.isMain && (
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 shrink-0">
                      Main
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[wallet.status] || "bg-slate-300"}`} />
                  <span className="text-xs text-slate-400">{wallet.status}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-slate-900">
                  {formatCurrency(wallet.currentBalance)}
                </div>
                {!wallet.isMain && (
                  <div className="flex items-center justify-end gap-0.5 mt-0.5">
                    <ArrowsRightLeftIcon className="h-3 w-3 text-slate-300 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] text-slate-300 group-hover:text-blue-500 transition-colors font-medium">
                      Transfer
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {!isLoading && subWallets.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 rounded-b-xl flex items-center justify-between">
          <span className="text-xs text-slate-500">Sub-wallet total</span>
          <span className="text-xs font-semibold text-slate-700">
            {formatCurrency(subWallets.reduce((s, w) => s + (w.currentBalance || 0), 0))}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Overview ─────────────────────────────────────────────────────────────────
const Overview = () => {
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [subWalletsOpen, setSubWalletsOpen] = useState(false);
  const [subWalletsInitialView, setSubWalletsInitialView] = useState("list");

  const {
    firstName,
    walletBalance,
    customerType,
    kycStatus,
    verifications,
    profile,
    businessName,
    customerTypeCode,
  } = useProfileData();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isBusiness = userData?.customer?.customerTypeCode === "Business";

  useEffect(() => {
    if (profile && profile.pinSet === false) {
      setShowSetPinModal(true);
    }
  }, [profile]);

  const handlePinSetSuccess = () => console.log("PIN set successfully");

  const checkVerificationStatus = () => {
    if (!verifications || verifications.length === 0) return false;
    const bvn = verifications.find((v) => v.type === "bvn");
    const nin = verifications.find((v) => v.type === "nin");
    return (bvn?.isCompleted || false) && (nin?.isCompleted || false);
  };

  const handleOpenSubWallets = (intent = "manage") => {
    setSubWalletsInitialView(intent === "transfer" ? "transfer" : "list");
    setSubWalletsOpen(true);
  };

  const { data: transactionsData, isPending: transactionsLoading } =
    useTransactions({ pageNumber: 1, pageSize: 5 });

  const fallbackUserData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userFirstName =
    customerTypeCode === "Business"
      ? businessName || fallbackUserData.businessName || "Business"
      : firstName || fallbackUserData.firstName || "User";

  const profileData = profile?.data || fallbackUserData;
  const customerTag = profileData?.customer?.tag;
  const accountNumber =
    profileData?.customer?.accountNumber ||
    profileData?.accountNumber ||
    profileData?.customer?.accounts?.[0]?.accountNumber;
  const interestInfo = profileData?.customer?.interest;
  const transactions = transactionsData?.success ? transactionsData.data.items : [];

  const formatCurrency = (amount) => {
    if (amount) {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);
    }
    return "₦0.00";
  };

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const totalBalance = formatCurrency(walletBalance) || "₦0.00";

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAmount = (amount, direction) => {
    const fmt = `₦${parseFloat(amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
    return direction === "Credit" ? `+${fmt}` : `-${fmt}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      Success: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-800"}`}>
        {status}
      </span>
    );
  };

  const getDirectionIcon = (direction) =>
    direction === "Credit" ? (
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
        </svg>
      </div>
    ) : (
      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m-8 8l8 8 8-8" />
        </svg>
      </div>
    );

  const handleKYCVerification = () => {
    window.location.href = "/dashboard/profile";
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {getTimeBasedGreeting()}, {userFirstName}
            </h1>
            <p className="text-slate-600">Here is a quick view of your Nexus accounts</p>
          </div>
          {kycStatus === "Pending" ? (
            <button
              onClick={handleKYCVerification}
              className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <div className="w-2 h-2 rounded-full bg-white/80" />
              <span className="text-sm font-medium">Complete verification to activate our services</span>
            </button>
          ) : (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${kycStatus === "Verified" ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-600"}`}>
              <div className={`w-2 h-2 rounded-full ${kycStatus === "Verified" ? "bg-green-400" : "bg-slate-400"}`} />
              <span className="text-sm font-medium">KYC {kycStatus || "Unknown"}</span>
            </div>
          )}
        </div>
        <MarqueeBanner />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Total Balance</h2>
            <div className="text-4xl font-bold text-slate-900 mb-4">{totalBalance}</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div>
                {customerTag ? (
                  <div>
                    <p className="text-sm text-slate-600 mb-1 font-medium">Customer Tag</p>
                    <button
                      onClick={() => copyToClipboard(customerTag, "tag")}
                      className="flex items-center space-x-2 text-slate-900 hover:text-blue-600 transition-colors group"
                    >
                      <span className="font-mono font-bold">{customerTag}</span>
                      {copiedField === "tag" ? (
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  </div>
                ) : <div />}
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1 font-medium">Bank</p>
                <div className="text-slate-900 font-bold">Polaris Bank</div>
              </div>

              <div>
                {accountNumber ? (
                  <div>
                    <p className="text-sm text-slate-600 mb-1 font-medium">Account Number</p>
                    <button
                      onClick={() => copyToClipboard(accountNumber, "account")}
                      className="flex items-center space-x-2 text-slate-900 hover:text-blue-600 transition-colors group"
                    >
                      <span className="font-mono font-bold">{accountNumber}</span>
                      {copiedField === "account" ? (
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  </div>
                ) : <div />}
              </div>

              <div>
                {interestInfo ? (
                  <div className="cursor-pointer" onClick={() => setShowInterestModal(true)}>
                    <p className="text-sm text-slate-600 mb-1 font-medium">Interest Accrued</p>
                    <div className="text-green-600 font-bold text-lg underline decoration-dotted">
                      {formatCurrency(interestInfo.accruedAmount)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">View breakdown &#8594;</p>
                  </div>
                ) : <div />}
              </div>
            </div>
          </div>

          {/* ── Accounts Carousel (replaces Quick Actions) ── */}
          <AccountsCarousel />

          <TransactionLimits />
        </div>

        <div className="space-y-6">
          {isBusiness && <SubWalletsPanel onOpenModal={handleOpenSubWallets} />}

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
              <a
                href="/dashboard/transactions"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <span>See all</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>

            {transactionsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    {getDirectionIcon(transaction.direction)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {transaction.accountName || transaction.productName || "Transaction"}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5 leading-relaxed">
                            {transaction.narration}
                          </p>
                          <div className="flex items-center justify-between mt-2 w-full">
                            <span className="text-xs text-slate-400 font-medium">
                              {formatDate(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-sm font-bold ${transaction.direction === "Credit" ? "text-green-600" : "text-red-600"}`}>
                            {formatAmount(transaction.amount, transaction.direction)}
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DocumentTextIcon className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InterestBreakdownModal isOpen={showInterestModal} onClose={() => setShowInterestModal(false)} />
      <SetPinModal isOpen={showSetPinModal} onClose={() => setShowSetPinModal(false)} onSuccess={handlePinSetSuccess} />
      <StatementDownloadModal
        isOpen={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        onDownloadStart={() => console.log("Download started...")}
        onDownloadComplete={(success, msg) => {
          if (success) console.log("Download complete");
          else console.error("Download failed:", msg);
        }}
      />
      <PayoutModal isOpen={showPayoutModal} onClose={() => setShowPayoutModal(false)} onSuccess={() => console.log("Payout successful")} />
      <VerificationRequiredModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        verifications={verifications}
        customerType={customerType}
      />
      <SubWalletsModal isOpen={subWalletsOpen} onClose={() => setSubWalletsOpen(false)} initialView={subWalletsInitialView} />
    </div>
  );
};

export default Overview;