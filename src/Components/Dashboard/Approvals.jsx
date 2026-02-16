import React, { useState } from "react";
import {
  ArrowPathIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  useTransactionQueue,
  useApproveTransaction,
  useRejectTransaction,
} from "../../hooks/useApprovals";
import CreateCheckerModal from "../Modals/CreateCheckerModal";
import BusinessUsersModal from "../Modals/BusinessUsersModal";
import OtpVerificationModal from "../Modals/OtpVerificationModal";
import RejectTransactionModal from "../Modals/RejectTransactionModal";
import { toast } from "react-hot-toast";

const Approvals = () => {
  const [showCreateCheckerModal, setShowCreateCheckerModal] = useState(false);
  const [showBusinessUsersModal, setShowBusinessUsersModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [otpChallengeId, setOtpChallengeId] = useState(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const actor = userData?.actor;

  const canCreateChecker = actor?.type === "Customer";
  const canApproveTransactions =
    actor?.role === "Checker" ||
    actor?.role === "Admin" ||
    actor.type === "Customer";

  const { data, isLoading, refetch } = useTransactionQueue();
  const approveTransactionMutation = useApproveTransaction();
  const rejectTransactionMutation = useRejectTransaction();

  const transactions = data?.data || [];
  const pendingTransactions = transactions.filter(
    (t) => t.status === "Pending"
  );

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Approved: "bg-green-100 text-green-700 border-green-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      Processing: "bg-blue-100 text-blue-700 border-blue-200",
    };

    const icons = {
      Pending: <ClockIcon className="w-3 h-3" />,
      Approved: <CheckCircleIcon className="w-3 h-3" />,
      Rejected: <XCircleIcon className="w-3 h-3" />,
      Processing: <ArrowPathIcon className="w-3 h-3 animate-spin" />,
    };

    return (
      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[status] || styles.Pending
        }`}
      >
        {icons[status]}
        <span>{status}</span>
      </span>
    );
  };

  const formatCurrency = (amount, currency = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = (transaction) => {
    setSelectedTransaction(transaction);
    setShowOtpModal(true);
  };

  const handleReject = (transaction) => {
    setSelectedTransaction(transaction);
    setShowRejectModal(true);
  };

  const handleOtpSuccess = async ({ otpCode, otpChallengeId }) => {
    try {
      await approveTransactionMutation.mutateAsync({
        transactionId: selectedTransaction.id,
        otpCode,
        otpChallengeId,
      });

      toast.success("Transaction approved successfully!");
      setShowOtpModal(false);
      setSelectedTransaction(null);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to approve transaction");
    }
  };

  const handleRejectSuccess = async (reason) => {
    try {
      await rejectTransactionMutation.mutateAsync({
        transactionId: selectedTransaction.id,
        reason,
      });

      toast.success("Transaction rejected successfully!");
      setShowRejectModal(false);
      setSelectedTransaction(null);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to reject transaction");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Transaction Approvals
            </h1>
            <p className="text-slate-600">
              Review and approve pending transactions
              {pendingTransactions.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                  {pendingTransactions.length} pending
                </span>
              )}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowBusinessUsersModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              <UserGroupIcon className="w-4 h-4" />
              <span>View Users</span>
            </button>

            <button
              onClick={() =>
                canCreateChecker && setShowCreateCheckerModal(true)
              }
              disabled={!canCreateChecker}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-white
                ${
                  canCreateChecker
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Initiator</span>
            </button>
          </div>
        </div>

        {/* Transaction Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              Transaction Queue
              {!isLoading && transactions.length > 0 && (
                <span className="ml-2 text-sm text-slate-500">
                  ({transactions.length} total)
                </span>
              )}
            </h3>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="p-8 text-center">
              <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600">Loading transactions...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && transactions.length === 0 && (
            <div className="p-8 text-center">
              <ClockIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No transactions in queue</p>
            </div>
          )}

          {/* Table */}
          {!isLoading && transactions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {transactions.map((transaction,i) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Transaction Info */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            #{i + 1}
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {transaction.accountName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {transaction.accountNumber}
                          </div>
                          <div className="text-xs text-slate-400">
                            {transaction.narration}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(transaction.status)}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(transaction.createdAt)}
                        {transaction.processedAt && (
                          <div className="text-xs text-slate-400 mt-1">
                            Processed: {formatDate(transaction.processedAt)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {transaction.status === "Pending" &&
                        canApproveTransactions ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(transaction)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                            >
                              <CheckCircleIcon className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(transaction)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                            >
                              <XCircleIcon className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {transaction.status === "Pending"
                              ? "No permission"
                              : "Processed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateCheckerModal
        isOpen={showCreateCheckerModal}
        onClose={() => setShowCreateCheckerModal(false)}
      />

      <BusinessUsersModal
        isOpen={showBusinessUsersModal}
        onClose={() => setShowBusinessUsersModal(false)}
      />

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
        purpose="ApproveTransfer"
      />

      <RejectTransactionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSuccess={handleRejectSuccess}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Approvals;
