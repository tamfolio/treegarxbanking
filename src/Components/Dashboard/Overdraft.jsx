import React, { useState } from "react";
import {
  CreditCardIcon,
  ArrowPathIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
  useOverdraftSummary,
  useApplicationStatus,
  useInterestHistory,
  useApplyOverdraft,
  useDrawOverdraft,
  useRepayOverdraft,
} from "../../hooks/useOverdraft";
import AmountInputModal from "../Modals/AmountInputModal";

const Overdraft = () => {
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const {
    data: appData,
    isLoading: appLoading,
    refetch: refetchApp,
  } = useApplicationStatus();

  const applicationStatus = appData?.data?.status; // "Pending" | "Approved" | "Rejected" | undefined
  const isApproved = applicationStatus === "Approved";

  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useOverdraftSummary({ enabled: isApproved });

  const { data: interestData, isLoading: interestLoading } = useInterestHistory(
    { page, pageSize },
    { enabled: isApproved },
  );

  const applyMutation = useApplyOverdraft();
  const drawMutation = useDrawOverdraft();
  const repayMutation = useRepayOverdraft();

  const summary = summaryData?.data;
  const application = appData?.data;
  const interestHistory = interestData?.data;

  const handleApply = () => {
    applyMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Overdraft application submitted!");
        refetchApp();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to submit application");
      },
    });
  };

  const handleDraw = ({ amount }) => {
    drawMutation.mutate(
      { amount },
      {
        onSuccess: () => {
          toast.success(`Drew ₦${amount.toLocaleString()} from overdraft`);
          setShowDrawModal(false);
          refetchSummary();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to draw");
        },
      },
    );
  };

  const handleRepay = ({ amount }) => {
    repayMutation.mutate(
      { amount },
      {
        onSuccess: () => {
          toast.success(`Repaid ₦${amount.toLocaleString()}`);
          setShowRepayModal(false);
          refetchSummary();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to repay");
        },
      },
    );
  };

  const formatNaira = (val) =>
    `₦${parseFloat(val || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const formatDate = (str) =>
    str
      ? new Date(str).toLocaleDateString("en-NG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  // ── LOADING ────────────────────────────────────────
  if (appLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-slate-600">Loading overdraft details...</span>
        </div>
      </div>
    );
  }

  // ── NO APPLICATION YET ─────────────────────────────
  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Overdraft
            </h1>
            <p className="text-slate-600">
              Access extra funds beyond your balance when you need them
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCardIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Apply for an Overdraft Facility
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Get a flexible credit line to cover short-term funding gaps. Repay
              anytime with no fixed schedule.
            </p>
            <button
              onClick={handleApply}
              disabled={applyMutation.isLoading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {applyMutation.isLoading ? "Submitting..." : "Apply Now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PENDING ───────────────────────────────────────
  if (applicationStatus === "Pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Overdraft
            </h1>
          </div>
          <div className="bg-white rounded-2xl border border-yellow-200 shadow-lg p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Application Under Review
            </h2>
            <p className="text-slate-600 mb-2">
              Your overdraft application is being reviewed. We'll notify you
              once a decision is made.
            </p>
            <p className="text-sm text-slate-500">
              Submitted on {formatDate(application.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── REJECTED ───────────────────────────────────────
  if (applicationStatus === "Rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Overdraft
            </h1>
          </div>
          <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Application Rejected
            </h2>
            {application.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <p className="text-xs font-medium text-red-800 uppercase tracking-wider mb-1">
                  Reason
                </p>
                <p className="text-sm text-red-700">
                  {application.rejectionReason}
                </p>
              </div>
            )}
            <p className="text-sm text-slate-500 mb-6">
              Reviewed on {formatDate(application.reviewedAt)}
            </p>
            <button
              onClick={handleApply}
              disabled={applyMutation.isLoading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {applyMutation.isLoading ? "Submitting..." : "Reapply"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── APPROVED — Full Dashboard ──────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">Overdraft</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  summary?.status === "Active"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                {summary?.status || "—"}
              </span>
            </div>
            <p className="text-slate-600">
              Manage your overdraft facility, draw funds, and view interest
              history
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => refetchSummary()}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowRepayModal(true)}
              disabled={
                !summary || parseFloat(summary.outstandingBalance) === 0
              }
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpCircleIcon className="w-4 h-4" />
              <span>Repay</span>
            </button>
            <button
              onClick={() => setShowDrawModal(true)}
              disabled={!summary || parseFloat(summary.headroomAvailable) === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownCircleIcon className="w-4 h-4" />
              <span>Draw Funds</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {summaryLoading ? (
          <div className="py-10 text-center text-slate-600">
            <ArrowPathIcon className="w-5 h-5 animate-spin inline mr-2" />
            Loading summary...
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Overdraft Limit"
                value={formatNaira(summary.overdraftLimit)}
                icon={<BanknotesIcon className="w-6 h-6 text-blue-600" />}
                bgColor="bg-blue-50"
              />
              <StatCard
                label="Available Headroom"
                value={formatNaira(summary.headroomAvailable)}
                icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
                bgColor="bg-green-50"
              />
              <StatCard
                label="Outstanding Balance"
                value={formatNaira(summary.outstandingBalance)}
                icon={
                  <ArrowDownCircleIcon className="w-6 h-6 text-orange-600" />
                }
                bgColor="bg-orange-50"
              />
              <StatCard
                label="Accrued Interest"
                value={formatNaira(summary.accruedInterest)}
                icon={
                  <InformationCircleIcon className="w-6 h-6 text-purple-600" />
                }
                bgColor="bg-purple-50"
              />
            </div>

            {/* Secondary info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <InfoRow
                label="Daily Interest Rate"
                value={`${(parseFloat(summary.dailyInterestRate) * 100).toFixed(4)}%`}
              />{" "}
              <InfoRow
                label="Days Overdrawn"
                value={summary.daysOverdrawn ?? 0}
              />
              <InfoRow
                label="Overdrawn Since"
                value={formatDate(summary.overdrawnSince)}
              />
            </div>
          </>
        ) : null}

        {/* Interest History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              Interest History
              {interestHistory?.totalCount > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({interestHistory.totalCount} total)
                </span>
              )}
            </h3>
          </div>

          {interestLoading ? (
            <div className="p-8 text-center">
              <ArrowPathIcon className="w-5 h-5 animate-spin inline mr-2 text-blue-600" />
              <span className="text-slate-600">Loading...</span>
            </div>
          ) : !interestHistory?.items?.length ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <InformationCircleIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                No interest accrued yet
              </h3>
              <p className="text-slate-600">
                Interest charges on your outstanding balance will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Balance at Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Rate Applied
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {interestHistory.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(item.accruedAt || item.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {formatNaira(item.interestAmount || item.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatNaira(item.outstandingBalance || item.balance)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.rate
                            ? `${(parseFloat(item.rate) * 100).toFixed(2)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {interestHistory.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Page {interestHistory.pageNumber} of{" "}
                    {interestHistory.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={!interestHistory.hasPreviousPage}
                      className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!interestHistory.hasNextPage}
                      className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Draw Modal */}
      <AmountInputModal
        isOpen={showDrawModal}
        onClose={() => setShowDrawModal(false)}
        onSubmit={handleDraw}
        title="Draw from Overdraft"
        description="Withdraw funds from your available overdraft headroom into your main balance."
        ctaLabel="Draw Funds"
        ctaColorClass="bg-blue-600 hover:bg-blue-700"
        isLoading={drawMutation.isLoading}
        maxAmount={summary ? parseFloat(summary.headroomAvailable) : null}
        maxLabel="Available headroom"
      />

      {/* Repay Modal */}
      <AmountInputModal
        isOpen={showRepayModal}
        onClose={() => setShowRepayModal(false)}
        onSubmit={handleRepay}
        title="Repay Overdraft"
        description="Repay all or part of your outstanding overdraft balance."
        ctaLabel="Repay"
        ctaColorClass="bg-green-600 hover:bg-green-700"
        isLoading={repayMutation.isLoading}
        maxAmount={summary ? parseFloat(summary.outstandingBalance) : null}
        maxLabel="Outstanding balance"
      />
    </div>
  );
};

// ── helper components ──────────────────────────────
const StatCard = ({ label, value, icon, bgColor }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}
      >
        {icon}
      </div>
    </div>
    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
      {label}
    </p>
    <p className="text-xl font-bold text-slate-900">{value}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
    <p className="text-xs text-slate-500 mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export default Overdraft;
