import React, { useState, useEffect } from "react";
import {
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowDownIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useProfileData } from "../../hooks/useProfile";
import { useTransactions } from "../../hooks/useTransactions";
import { getTimeBasedGreeting } from "../../utils/timeGreeting";
import StatementDownloadModal from "../Modals/StatementDownloadModal";
import PayoutModal from "../Modals/PayoutModal";
import SetPinModal from "../Modals/SetPinModal";
import TransactionLimits from "./TransactionLimit";

const Overview = () => {
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [showSetPinModal, setShowSetPinModal] = useState(false);

  // Get profile data from global state
  const {
    firstName,
    lastName,
    walletBalance,
    customerType,
    kycStatus,
    verifications,
    profile,
    businessName,
    isPending,
    customerTypeCode,
  } = useProfileData();

  // Check if PIN is set and show modal if not
  useEffect(() => {
    if (profile && profile.pinSet === false) {
      setShowSetPinModal(true);
    }
  }, [profile]);

  // Handle PIN setup success
  const handlePinSetSuccess = () => {
    console.log("PIN set successfully");
    // Profile will be refetched automatically by the mutation
  };

  // Get recent transactions (last 5)
  const { data: transactionsData, isPending: transactionsLoading } =
    useTransactions({
      pageNumber: 1,
      pageSize: 5,
    });

  // Fallback user data
  const fallbackUserData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userFirstName = customerTypeCode === 'Business' 
  ? (businessName || fallbackUserData.businessName || "Business") 
  : (firstName || fallbackUserData.firstName || "User");

  // Get additional profile data
  const profileData = profile?.data || fallbackUserData;
  console.log("profiledata", profileData);
  const customerTag = profileData?.customer?.tag;
  const accountNumber =
    profileData?.customer?.accountNumber || // ← Direct path first
    profileData?.accountNumber || // ← Fallback 1
    profileData?.customer?.accounts?.[0]?.accountNumber; // ← Fallback 2
  const interestInfo = profileData?.customer?.interest;
  const transactions = transactionsData?.success
    ? transactionsData.data.items
    : [];

  console.log("interestInfo", interestInfo);
  // Format wallet balance
  const formatCurrency = (amount) => {
    if (amount) {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
    }
    return "₦0.00";
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const totalBalance = formatCurrency(walletBalance) || "₦34,720,451.25";

  // Format date for transactions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format amount with direction
  const formatAmount = (amount, direction) => {
    const formattedAmount = `₦${parseFloat(amount).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
    })}`;
    return direction === "Credit"
      ? `+${formattedAmount}`
      : `-${formattedAmount}`;
  };

  // Get status badge for transactions
  const getStatusBadge = (status) => {
    const statusStyles = {
      Success: "bg-green-100 text-green-800",
      Failed: "bg-red-100 text-red-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Processing: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-slate-100 text-slate-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // Get direction icon for transactions
  const getDirectionIcon = (direction) => {
    return direction === "Credit" ? (
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8l-8-8-8 8"
          />
        </svg>
      </div>
    ) : (
      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 20V4m-8 8l8 8 8-8"
          />
        </svg>
      </div>
    );
  };

  // Statement download handlers
  const handleDownloadStatement = () => {
    setShowStatementModal(true);
  };

  const handleDownloadStart = () => {
    console.log("Download started...");
  };

  const handleDownloadComplete = (success, message) => {
    if (success) {
      console.log("Download completed successfully");
    } else {
      console.error("Download failed:", message);
    }
  };

  // Coming soon handler
  const handleComingSoon = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000); // Auto hide after 3 seconds
  };

  // Handler for KYC verification - routes to profile page
  const handleKYCVerification = () => {
    window.location.href = "/dashboard/profile";
  };

  const quickActions = [
    {
      name: "Send Money",
      icon: PaperAirplaneIcon,
      color: "bg-blue-50 text-blue-600",
      onClick: () => setShowPayoutModal(true),
    },
    {
      name: "Receive Money",
      icon: ArrowDownTrayIcon,
      color: "bg-green-50 text-green-600",
      onClick: handleComingSoon,
    },
    {
      name: "Open Virtual Account",
      icon: CreditCardIcon,
      color: "bg-purple-50 text-purple-600",
      onClick: handleComingSoon,
    },
    {
      name: "Pay a Bill",
      icon: DocumentTextIcon,
      color: "bg-orange-50 text-orange-600",
      onClick: handleComingSoon,
    },
    {
      name: "Download Statement",
      icon: ArrowDownIcon,
      color: "bg-slate-50 text-slate-600",
      onClick: handleDownloadStatement,
    },
  ];

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {getTimeBasedGreeting()}, {userFirstName}
            </h1>
            <p className="text-slate-600">
              Here is a quick view of your Nexus accounts
            </p>
          </div>

          {/* KYC Status badge / CTA */}
          {kycStatus === "Pending" ? (
            <button
              onClick={handleKYCVerification}
              className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              <div className="w-2 h-2 rounded-full bg-white/80"></div>
              <span className="text-sm font-medium">
                Complete verification to activate our services
              </span>
            </button>
          ) : (
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                kycStatus === "Verified"
                  ? "bg-green-50 text-green-600"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  kycStatus === "Verified" ? "bg-green-400" : "bg-slate-400"
                }`}
              ></div>
              <span className="text-sm font-medium">
                KYC {kycStatus || "Unknown"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Balance and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Total Balance */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Total Balance
              </h2>
            </div>
            <div className="text-4xl font-bold text-slate-900 mb-4">
              {totalBalance}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              {/* Customer Tag */}
              {customerTag && (
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-medium">
                    Customer Tag
                  </p>
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
              )}
              {/* Bank Name */}
              <div>
                <p className="text-sm text-slate-600 mb-1 font-medium">Bank</p>
                <div className="text-slate-900 font-bold">Polaris Bank</div>
              </div>

              {/* Account Number */}
              {accountNumber && (
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-medium">
                    Account Number
                  </p>
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
              )}

              {/* Interest Accrued */}
              {interestInfo && (
                <div>
                  <p className="text-sm text-slate-600 mb-1 font-medium">
                    Interest Accrued
                  </p>
                  <div className="text-green-600 font-bold text-lg">
                    {formatCurrency(interestInfo.accruedAmount)}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {interestInfo.daysUntilPayout} days until payout
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.onClick}
                  className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 text-center">
                    {action.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Limits - Full width above balance */}
          <TransactionLimits />
        </div>

        {/* Right column - Recent Transactions */}
        <div className="space-y-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Transactions
              </h2>
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
                  <div
                    key={i}
                    className="animate-pulse flex items-center space-x-3 p-3"
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {getDirectionIcon(transaction.direction)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {transaction.accountName ||
                              transaction.productName ||
                              "Transaction"}
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
                        <div className="text-right flex-shrink-0">
                          <div
                            className={`text-sm font-bold ${
                              transaction.direction === "Credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatAmount(
                              transaction.amount,
                              transaction.direction
                            )}
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

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center transform transition-all duration-300 scale-105">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Coming Soon!
            </h3>
            <p className="text-slate-600 mb-6">
              This feature is currently in development and will be available
              soon.
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Set PIN Modal */}
      <SetPinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        onSuccess={handlePinSetSuccess}
      />

      {/* Statement Download Modal */}
      <StatementDownloadModal
        isOpen={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        onDownloadStart={handleDownloadStart}
        onDownloadComplete={handleDownloadComplete}
      />

      {/* Payout Modal */}
      <PayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSuccess={() => {
          // Refresh transactions when payout is successful
          console.log("Payout successful - refreshing data");
        }}
      />
    </div>
  );
};

export default Overview;
