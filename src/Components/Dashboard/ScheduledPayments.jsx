import React, { useState } from "react";
import {
  CalendarDaysIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useScheduledPayments,
  useCreateScheduledPayment,
  useCreateBulkScheduledPayment,
  useCreateBulkP2PScheduledPayment,
  useCancelScheduledPayment,
} from "../../hooks/useScheduledPayments";
import { useBeneficiaries } from "../../hooks/useBeneficiaries";
import { useResolveCustomer } from "../../hooks/useTransactions";
import PinVerificationModal from "../../Components/Modals/PinVerificationModal";
import OtpVerificationModal from "../../Components/Modals/OtpVerificationModal";
import { toast } from "react-hot-toast";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  `₦${parseFloat(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDateShort = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
};

const statusConfig = {
  Pending: {
    label: "Pending",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
  },
  Successful: {
    label: "Successful",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Failed: {
    label: "Failed",
    color: "text-red-700 bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
  Cancelled: {
    label: "Cancelled",
    color: "text-slate-600 bg-slate-100 border-slate-200",
    dot: "bg-slate-400",
  },
  Rejected: {
    label: "Rejected",
    color: "text-red-700 bg-red-50 border-red-200",
    dot: "bg-red-400",
  },
  Processing: {
    label: "Processing",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
};

const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("userData")) || {};
  } catch {
    return {};
  }
};

// ─── Shared Schedule Fields Component ─────────────────────────────────────────

const ScheduleFields = ({ form, setForm, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  return (
    <>
      {/* Schedule type */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">
          Schedule Type
        </label>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          {["OneTime", "Recurring"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, scheduleType: t, frequency: "" }))
              }
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                form.scheduleType === t
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "OneTime" ? "One-time" : "Recurring"}
            </button>
          ))}
        </div>
      </div>

      {/* Frequency */}
      {form.scheduleType === "Recurring" && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Frequency
          </label>
          <select
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.frequency ? "border-red-300" : "border-slate-200"
            }`}
          >
            <option value="">Select frequency</option>
            {["Daily", "Weekly", "Monthly", "Quarterly", "Annually"].map(
              (f) => (
                <option key={f}>{f}</option>
              )
            )}
          </select>
          {errors.frequency && (
            <p className="mt-1 text-xs text-red-600">{errors.frequency}</p>
          )}
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {form.scheduleType === "Recurring"
              ? "Start Date & Time"
              : "Scheduled Date & Time"}
          </label>
          <input
            name="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.startAt ? "border-red-300" : "border-slate-200"
            }`}
          />
          {errors.startAt && (
            <p className="mt-1 text-xs text-red-600">{errors.startAt}</p>
          )}
        </div>
        {form.scheduleType === "Recurring" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              End Date (optional)
            </label>
            <input
              name="endAt"
              type="datetime-local"
              value={form.endAt}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </>
  );
};

// ─── Cancel Confirm Modal ─────────────────────────────────────────────────────

const CancelModal = ({ item, onConfirm, onClose, isLoading }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Cancel Scheduled Payment?
        </h3>
        <p className="text-sm text-slate-500 mb-2">
          This will cancel the scheduled payment to{" "}
          <span className="font-medium text-slate-700">{item.accountName}</span>
          .
        </p>
        <p className="text-sm font-semibold text-slate-700 mb-6">
          {formatCurrency(item.amount)}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Keep It
          </button>
          <button
            onClick={() => onConfirm(item.id)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const DetailDrawer = ({ item, onClose, onCancel }) => {
  if (!item) return null;
  const status = statusConfig[item.status] || statusConfig.Pending;
  const canCancel = item.status === "Pending";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-800/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Payment Details
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-6 bg-slate-50 border-b border-slate-200 text-center">
          <div className="text-3xl font-bold text-slate-900 mb-2">
            {formatCurrency(item.amount)}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border ${status.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
        <div className="flex-1 px-5 py-5 space-y-4">
          {[
            { label: "Recipient", value: item.accountName },
            { label: "Account Number", value: item.accountNumber },
            {
              label: "Bank",
              value:
                item.bankName ||
                (item.type === "P2P" ? "Internal Transfer" : "—"),
            },
            { label: "Transfer Type", value: item.type },
            { label: "Schedule Type", value: item.scheduleType },
            { label: "Frequency", value: item.frequency || "One-time" },
            { label: "Scheduled For", value: formatDate(item.startAt) },
            item.nextRunAt && {
              label: "Next Run",
              value: formatDate(item.nextRunAt),
            },
            item.lastRunAt && {
              label: "Last Run",
              value: formatDate(item.lastRunAt),
            },
            item.endAt && { label: "Ends At", value: formatDate(item.endAt) },
            { label: "Total Attempts", value: item.totalAttempts },
            { label: "Created", value: formatDate(item.createdAt) },
          ]
            .filter(Boolean)
            .map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-start gap-4"
              >
                <span className="text-xs text-slate-500 shrink-0 pt-0.5">
                  {label}
                </span>
                <span className="text-sm font-medium text-slate-800 text-right break-all">
                  {value}
                </span>
              </div>
            ))}
          {item.failureReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <div className="text-xs font-medium text-red-600 mb-0.5">
                Failure Reason
              </div>
              <div className="text-sm text-red-700">{item.failureReason}</div>
            </div>
          )}
        </div>
        {canCancel && (
          <div className="px-5 py-4 border-t border-slate-200">
            <button
              onClick={() => onCancel(item)}
              className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              Cancel This Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Single / P2P Create Modal ────────────────────────────────────────────────

const CreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState("type");
  const [transferType, setTransferType] = useState("Payout");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [beneficiarySearch, setBeneficiarySearch] = useState("");
  const [resolvedCustomer, setResolvedCustomer] = useState(null);
  const [isResolvingCustomer, setIsResolvingCustomer] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    amount: "",
    displayAmount: "",
    narration: "",
    scheduleType: "OneTime",
    frequency: "",
    startAt: "",
    endAt: "",
    destinationTagOrCode: "",
  });

  const { data: beneficiariesData, isLoading: beneficiariesLoading } =
    useBeneficiaries({ category: "Single" });
  const resolveCustomerMutation = useResolveCustomer();
  const createMutation = useCreateScheduledPayment();

  const userData = getUserData();
  const isIndividual = userData?.customer?.customerTypeCode === "Individual";

  let beneficiaries = [];
  if (beneficiariesData?.success) {
    const raw = beneficiariesData.data;
    if (Array.isArray(raw)) beneficiaries = raw;
    else if (Array.isArray(raw?.data)) beneficiaries = raw.data;
    else beneficiaries = raw?.items || raw?.beneficiaries || [];
  }

  const filteredBeneficiaries = beneficiaries.filter(
    (b) =>
      !beneficiarySearch ||
      b.name?.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
      b.accountNumber?.includes(beneficiarySearch) ||
      b.bankName?.toLowerCase().includes(beneficiarySearch.toLowerCase())
  );

  const formatAmountDisplay = (v) => {
    if (!v) return "";
    const n = v.toString().replace(/[^0-9.]/g, "");
    const parts = n.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };
  const parseAmount = (v) => parseFloat((v || "").replace(/,/g, "")) || 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleAmountChange = (e) => {
    const formatted = formatAmountDisplay(e.target.value);
    setForm((p) => ({
      ...p,
      displayAmount: formatted,
      amount: parseAmount(formatted),
    }));
    if (errors.amount) setErrors((p) => ({ ...p, amount: "" }));
  };

  const handleResolveCustomer = async () => {
    if (!form.destinationTagOrCode) return;
    setIsResolvingCustomer(true);
    try {
      const result = await resolveCustomerMutation.mutateAsync({
        identifier: form.destinationTagOrCode,
      });
      if (result.success) setResolvedCustomer(result.data);
    } catch {
      setResolvedCustomer(null);
      toast.error("Could not resolve customer tag");
    } finally {
      setIsResolvingCustomer(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.amount || parseAmount(form.displayAmount) <= 0)
      e.amount = "Enter a valid amount";
    if (!form.narration) e.narration = "Narration is required";
    if (!form.startAt) e.startAt = "Start date is required";
    if (form.scheduleType === "Recurring" && !form.frequency)
      e.frequency = "Select a frequency";
    if (transferType === "P2P" && !resolvedCustomer)
      e.destinationTagOrCode = "Resolve customer tag first";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      type: transferType,
      amount: parseAmount(form.displayAmount),
      narration: form.narration,
      scheduleType: form.scheduleType,
      frequency: form.scheduleType === "Recurring" ? form.frequency : null,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
    };
    if (transferType === "Payout")
      payload.beneficiaryId = selectedBeneficiary.id;
    else payload.destinationTagOrCode = form.destinationTagOrCode;
    setPendingPayload(payload);
    setStep(isIndividual ? "pin" : "otp");
  };

  const handleOtpSuccess = ({ otpCode, otpChallengeId }) => {
    setPendingPayload((p) => ({ ...p, otpCode, otpChallengeId }));
    setStep("pin");
  };

  const handlePinVerified = async ({ pin }) => {
    try {
      const result = await createMutation.mutateAsync({
        ...pendingPayload,
        pin,
      });
      if (result.success) {
        toast.success("Scheduled payment created!");
        onSuccess?.();
        handleClose();
      } else {
        toast.error(result.message || "Failed");
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed");
      throw error;
    }
  };

  const handleClose = () => {
    setStep("type");
    setTransferType("Payout");
    setSelectedBeneficiary(null);
    setPendingPayload(null);
    setBeneficiarySearch("");
    setResolvedCustomer(null);
    setErrors({});
    setForm({
      amount: "",
      displayAmount: "",
      narration: "",
      scheduleType: "OneTime",
      frequency: "",
      startAt: "",
      endAt: "",
      destinationTagOrCode: "",
    });
    onClose();
  };

  const handleBack = () => {
    if (step === "beneficiary") setStep("type");
    else if (step === "form")
      setStep(transferType === "Payout" ? "beneficiary" : "type");
  };

  if (!isOpen) return null;

  const steps =
    transferType === "Payout"
      ? ["type", "beneficiary", "form"]
      : ["type", "form"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              {step !== "type" && (
                <button
                  onClick={handleBack}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Schedule a Payment
                </h2>
                <p className="text-xs text-slate-400">
                  {step === "type" && "Choose transfer type"}
                  {step === "beneficiary" && "Select a beneficiary"}
                  {step === "form" &&
                    (selectedBeneficiary
                      ? `To: ${selectedBeneficiary.name}`
                      : "Payment details")}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          {["type", "beneficiary", "form"].includes(step) && (
            <div className="px-6 pt-4 shrink-0">
              <div className="flex gap-1.5">
                {steps.map((s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= currentStepIndex ? "bg-blue-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step: type */}
          {step === "type" && (
            <div className="flex-1 px-6 py-6 space-y-3 overflow-y-auto">
              <p className="text-sm text-slate-500 mb-4">
                What kind of payment do you want to schedule?
              </p>
              <button
                onClick={() => {
                  setTransferType("Payout");
                  setStep("beneficiary");
                }}
                className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group text-left"
              >
                <div className="p-3 bg-slate-100 group-hover:bg-blue-100 rounded-xl transition-colors">
                  <BanknotesIcon className="h-6 w-6 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Bank Transfer (Payout)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Schedule to a saved bank beneficiary
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-slate-300 group-hover:text-blue-400 ml-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  setTransferType("P2P");
                  setStep("form");
                }}
                className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group text-left"
              >
                <div className="p-3 bg-slate-100 group-hover:bg-blue-100 rounded-xl transition-colors">
                  <ArrowsRightLeftIcon className="h-6 w-6 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Tag / P2P Transfer
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Schedule to a customer tag or code
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-slate-300 group-hover:text-blue-400 ml-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Step: beneficiary */}
          {step === "beneficiary" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 shrink-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={beneficiarySearch}
                    onChange={(e) => setBeneficiarySearch(e.target.value)}
                    placeholder="Search beneficiaries..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {beneficiariesLoading ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading beneficiaries...
                  </div>
                ) : filteredBeneficiaries.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No beneficiaries found.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredBeneficiaries.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBeneficiary(b);
                          setStep("form");
                        }}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {b.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {b.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {b.accountNumber} · {b.bankName}
                          </div>
                          {b.lastAmount && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              Last: {formatCurrency(b.lastAmount)}
                            </div>
                          )}
                        </div>
                        <svg
                          className="h-4 w-4 text-slate-300 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step: form */}
          {step === "form" && (
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto flex-1 px-6 py-5 space-y-4"
            >
              {transferType === "Payout" && selectedBeneficiary && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">
                      {selectedBeneficiary.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {selectedBeneficiary.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {selectedBeneficiary.accountNumber} ·{" "}
                      {selectedBeneficiary.bankName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("beneficiary")}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              {transferType === "P2P" && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Customer Tag or Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="destinationTagOrCode"
                      value={form.destinationTagOrCode}
                      onChange={(e) => {
                        handleChange(e);
                        setResolvedCustomer(null);
                      }}
                      placeholder="e.g. @username or CUSTID..."
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.destinationTagOrCode
                          ? "border-red-300"
                          : "border-slate-200"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleResolveCustomer}
                      disabled={
                        !form.destinationTagOrCode || isResolvingCustomer
                      }
                      className="px-3 py-2 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors shrink-0"
                    >
                      {isResolvingCustomer ? "..." : "Verify"}
                    </button>
                  </div>
                  {resolvedCustomer && (
                    <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3" />
                      {resolvedCustomer.name ||
                        resolvedCustomer.customerName ||
                        resolvedCustomer.accountName}
                    </p>
                  )}
                  {errors.destinationTagOrCode && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.destinationTagOrCode}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                    ₦
                  </span>
                  <input
                    value={form.displayAmount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.amount ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Narration
                </label>
                <input
                  name="narration"
                  value={form.narration}
                  onChange={handleChange}
                  placeholder="Purpose of payment"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.narration ? "border-red-300" : "border-slate-200"
                  }`}
                />
                {errors.narration && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.narration}
                  </p>
                )}
              </div>

              <ScheduleFields form={form} setForm={setForm} errors={errors} />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Schedule Payment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <PinVerificationModal
        isOpen={step === "pin"}
        onClose={() => setStep("form")}
        onSuccess={handlePinVerified}
        transactionData={pendingPayload}
        transactionType="scheduled-payment"
      />
      {!isIndividual && (
        <OtpVerificationModal
          isOpen={step === "otp"}
          onClose={() => setStep("form")}
          onSuccess={handleOtpSuccess}
          purpose="CreateTransfer"
        />
      )}
    </>
  );
};

// ─── Bulk Payout Schedule Modal ───────────────────────────────────────────────

const BulkPayoutModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState("group"); // group | form | pin | otp
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [pendingPayload, setPendingPayload] = useState(null);
    const [groupSearch, setGroupSearch] = useState("");
    const [editableItems, setEditableItems] = useState([]);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
      groupKey: "",
      scheduleType: "OneTime",
      frequency: "",
      startAt: "",
      endAt: "",
    });
  
    const { data: beneficiariesData, isLoading: groupsLoading } =
      useBeneficiaries({ category: "Bulk" });
    const createMutation = useCreateBulkScheduledPayment();
  
    const userData = getUserData();
    const isIndividual = userData?.customer?.customerTypeCode === "Individual";
  
    // ── helpers ──────────────────────────────────────────────────────────────
    const formatAmountDisplay = (v) => {
      if (!v) return "";
      const n = v.toString().replace(/[^0-9.]/g, "");
      const parts = n.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    };
    const parseAmount = (v) => parseFloat((v || "").replace(/,/g, "")) || 0;
  
    // ── group list ────────────────────────────────────────────────────────────
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
  
    const groups = Object.entries(groupedBeneficiaries).map(
      ([groupKey, items]) => ({
        groupKey,
        items,
        count: items.length,
      })
    );
  
    const filteredGroups = groups.filter(
      (g) =>
        !groupSearch ||
        g.groupKey.toLowerCase().includes(groupSearch.toLowerCase()) ||
        g.items.some((i) =>
          i.name?.toLowerCase().includes(groupSearch.toLowerCase())
        )
    );
  
    // ── when a group is selected, seed editableItems from it ─────────────────
    const handleSelectGroup = (g) => {
      setSelectedGroup(g);
      setEditableItems(
        g.items.map((b) => ({
          ...b,
          displayAmount: b.lastAmount
            ? formatAmountDisplay(String(b.lastAmount))
            : "",
          amount: b.lastAmount || 0,
          narration: b.lastNarration || "",
        }))
      );
      setStep("form");
    };
  
    // ── validation ────────────────────────────────────────────────────────────
    const validate = () => {
      const e = {};
      if (!form.groupKey.trim()) e.groupKey = "Group key / label is required";
      if (!form.startAt) e.startAt = "Start date is required";
      if (form.scheduleType === "Recurring" && !form.frequency)
        e.frequency = "Select a frequency";
      editableItems.forEach((item, i) => {
        if (!item.amount || parseAmount(item.displayAmount) <= 0)
          e[`amount_${i}`] = "Enter a valid amount";
        if (!item.narration) e[`narration_${i}`] = "Narration is required";
      });
      setErrors(e);
      return Object.keys(e).length === 0;
    };
  
    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!validate()) return;
  
      const payload = {
        groupKey: form.groupKey.trim(),
        scheduleType: form.scheduleType,
        frequency: form.scheduleType === "Recurring" ? form.frequency : null,
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
        items: editableItems.map((item) => ({
          bankId: item.bankId,
          amount: parseAmount(item.displayAmount),
          narration: item.narration,
          accountNumber: item.accountNumber,
          beneficiaryName: item.name,
        })),
      };
  
      setPendingPayload(payload);
      setStep(isIndividual ? "pin" : "otp");
    };
  
    const handleOtpSuccess = ({ otpCode, otpChallengeId }) => {
      setPendingPayload((p) => ({ ...p, otpCode, otpChallengeId }));
      setStep("pin");
    };
  
    const handlePinVerified = async ({ pin }) => {
      try {
        const result = await createMutation.mutateAsync({
          ...pendingPayload,
          pin,
        });
        if (result.success) {
          toast.success("Bulk scheduled payment created!");
          onSuccess?.();
          handleClose();
        } else {
          toast.error(result.message || "Failed");
          throw new Error(result.message);
        }
      } catch (error) {
        toast.error(error.message || "Failed");
        throw error;
      }
    };
  
    const handleClose = () => {
      setStep("group");
      setSelectedGroup(null);
      setPendingPayload(null);
      setGroupSearch("");
      setEditableItems([]);
      setErrors({});
      setForm({ groupKey: "", scheduleType: "OneTime", frequency: "", startAt: "", endAt: "" });
      onClose();
    };
  
    if (!isOpen) return null;
  
    const steps = ["group", "form"];
    const currentStepIndex = steps.indexOf(step);
  
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                {step === "form" && (
                  <button
                    onClick={() => setStep("group")}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <div className="p-2 bg-purple-50 rounded-lg">
                  <UserGroupIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Schedule Bulk Payout</h2>
                  <p className="text-xs text-slate-400">
                    {step === "group"
                      ? "Select a beneficiary group"
                      : `Group: ${selectedGroup?.groupKey}`}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
  
            {/* Progress */}
            {["group", "form"].includes(step) && (
              <div className="px-6 pt-4 shrink-0">
                <div className="flex gap-1.5">
                  {steps.map((s, i) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= currentStepIndex ? "bg-purple-500" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
  
            {/* Step: group selection */}
            {step === "group" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 shrink-0">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                      placeholder="Search groups..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {groupsLoading ? (
                    <div className="p-8 text-center text-sm text-slate-400">
                      <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto mb-2 text-purple-500" />
                      Loading groups...
                    </div>
                  ) : filteredGroups.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-400">No bulk beneficiary groups found.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredGroups.map((g) => (
                        <button
                          key={g.groupKey}
                          onClick={() => handleSelectGroup(g)}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                            <UserGroupIcon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate font-mono">{g.groupKey}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{g.count} recipient{g.count !== 1 ? "s" : ""}</div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {g.items.slice(0, 3).map((item) => (
                                <span key={item.id} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                  {item.name}
                                </span>
                              ))}
                              {g.items.length > 3 && (
                                <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">+{g.items.length - 3} more</span>
                              )}
                            </div>
                          </div>
                          <svg className="h-4 w-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
  
            {/* Step: form */}
            {step === "form" && selectedGroup && (
              <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                {/* Group summary */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <UserGroupIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-slate-800">Selected Group</span>
                    <button type="button" onClick={() => setStep("group")} className="ml-auto text-xs text-purple-600 hover:text-purple-800 font-medium">
                      Change
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-600">{selectedGroup.groupKey}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedGroup.count} recipients</p>
                </div>
  
                {/* Schedule group key / label */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Schedule Label / Group Key
                  </label>
                  <input
                    value={form.groupKey}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, groupKey: e.target.value }));
                      if (errors.groupKey) setErrors((p) => ({ ...p, groupKey: "" }));
                    }}
                    placeholder="e.g. salary-mar-2026"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.groupKey ? "border-red-300" : "border-slate-200"
                    }`}
                  />
                  {errors.groupKey && <p className="mt-1 text-xs text-red-600">{errors.groupKey}</p>}
                </div>
  
                {/* Editable recipient cards */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Recipients & Amounts
                  </label>
                  <div className="space-y-3">
                    {editableItems.map((item, index) => (
                      <div key={item.id ?? index} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {/* Recipient info */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                            <span className="text-purple-600 font-semibold text-xs">{item.name?.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-800 truncate">{item.name}</div>
                            <div className="text-xs text-slate-400">{item.accountNumber} · {item.bankName}</div>
                          </div>
                        </div>
  
                        {/* Amount */}
                        <div className="mb-2">
                          <label className="block text-xs text-slate-500 mb-1">Amount (₦)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">₦</span>
                            <input
                              value={item.displayAmount}
                              onChange={(e) => {
                                const formatted = formatAmountDisplay(e.target.value);
                                setEditableItems((prev) =>
                                  prev.map((r, i) =>
                                    i === index ? { ...r, displayAmount: formatted, amount: parseAmount(formatted) } : r
                                  )
                                );
                                if (errors[`amount_${index}`]) setErrors((p) => ({ ...p, [`amount_${index}`]: "" }));
                              }}
                              placeholder="0.00"
                              className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors[`amount_${index}`] ? "border-red-300" : "border-slate-200"
                              }`}
                            />
                          </div>
                          {errors[`amount_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`amount_${index}`]}</p>}
                        </div>
  
                        {/* Narration */}
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Narration</label>
                          <input
                            value={item.narration}
                            onChange={(e) => {
                              setEditableItems((prev) =>
                                prev.map((r, i) => (i === index ? { ...r, narration: e.target.value } : r))
                              );
                              if (errors[`narration_${index}`]) setErrors((p) => ({ ...p, [`narration_${index}`]: "" }));
                            }}
                            placeholder="Purpose of payment"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                              errors[`narration_${index}`] ? "border-red-300" : "border-slate-200"
                            }`}
                          />
                          {errors[`narration_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`narration_${index}`]}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
  
                <ScheduleFields form={form} setForm={setForm} errors={errors} />
  
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                    Schedule Bulk
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
  
        <PinVerificationModal
          isOpen={step === "pin"}
          onClose={() => setStep("form")}
          onSuccess={handlePinVerified}
          transactionData={pendingPayload}
          transactionType="scheduled-payment"
        />
        {!isIndividual && (
          <OtpVerificationModal
            isOpen={step === "otp"}
            onClose={() => setStep("form")}
            onSuccess={handleOtpSuccess}
            purpose="CreateTransfer"
          />
        )}
      </>
    );
  };

// ─── Bulk P2P Schedule Modal ──────────────────────────────────────────────────

const BulkP2PModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState("form"); // form | pin | otp
  const [pendingPayload, setPendingPayload] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    scheduleType: "OneTime",
    frequency: "",
    startAt: "",
    endAt: "",
  });
  const [items, setItems] = useState([
    {
      destinationTagOrCode: "",
      amount: "",
      displayAmount: "",
      narration: "",
      resolved: null,
      resolving: false,
    },
  ]);

  const createMutation = useCreateBulkP2PScheduledPayment();
  const resolveCustomerMutation = useResolveCustomer();

  const userData = getUserData();
  const isIndividual = userData?.customer?.customerTypeCode === "Individual";

  const formatAmountDisplay = (v) => {
    if (!v) return "";
    const n = v.toString().replace(/[^0-9.]/g, "");
    const parts = n.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };
  const parseAmount = (v) => parseFloat((v || "").replace(/,/g, "")) || 0;

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
              ...(field === "destinationTagOrCode" ? { resolved: null } : {}),
            }
          : item
      )
    );
  };

  const handleAmountChange = (index, value) => {
    const formatted = formatAmountDisplay(value);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              displayAmount: formatted,
              amount: parseAmount(formatted),
            }
          : item
      )
    );
  };

  const handleResolve = async (index) => {
    const tag = items[index].destinationTagOrCode;
    if (!tag) return;
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, resolving: true } : item))
    );
    try {
      const result = await resolveCustomerMutation.mutateAsync({
        identifier: tag,
      });
      if (result.success) {
        setItems((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, resolved: result.data, resolving: false }
              : item
          )
        );
      }
    } catch {
      toast.error("Could not resolve tag");
      setItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, resolving: false } : item
        )
      );
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        destinationTagOrCode: "",
        amount: "",
        displayAmount: "",
        narration: "",
        resolved: null,
        resolving: false,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e = {};
    if (!form.startAt) e.startAt = "Start date is required";
    if (form.scheduleType === "Recurring" && !form.frequency)
      e.frequency = "Select a frequency";
    items.forEach((item, i) => {
      if (!item.destinationTagOrCode) e[`tag_${i}`] = "Tag is required";
      if (!item.resolved) e[`resolve_${i}`] = "Verify this tag";
      if (!item.amount || parseAmount(item.displayAmount) <= 0)
        e[`amount_${i}`] = "Enter a valid amount";
      if (!item.narration) e[`narration_${i}`] = "Narration is required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      groupKey: `SCHED-P2P-BULK-${Date.now()}`,
      items: items.map((item) => ({
        destinationTagOrCode: item.destinationTagOrCode,
        amount: parseAmount(item.displayAmount),
        narration: item.narration,
      })),
      scheduleType: form.scheduleType,
      frequency: form.scheduleType === "Recurring" ? form.frequency : null,
      startAt: new Date(form.startAt).toISOString(),
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
    };
    setPendingPayload(payload);
    setStep(isIndividual ? "pin" : "otp");
  };

  const handleOtpSuccess = ({ otpCode, otpChallengeId }) => {
    setPendingPayload((p) => ({ ...p, otpCode, otpChallengeId }));
    setStep("pin");
  };

  const handlePinVerified = async ({ pin }) => {
    try {
      const result = await createMutation.mutateAsync({
        ...pendingPayload,
        pin,
      });
      if (result.success) {
        toast.success("Bulk P2P scheduled!");
        onSuccess?.();
        handleClose();
      } else {
        toast.error(result.message || "Failed");
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed");
      throw error;
    }
  };

  const handleClose = () => {
    setStep("form");
    setPendingPayload(null);
    setErrors({});
    setForm({ scheduleType: "OneTime", frequency: "", startAt: "", endAt: "" });
    setItems([
      {
        destinationTagOrCode: "",
        amount: "",
        displayAmount: "",
        narration: "",
        resolved: null,
        resolving: false,
      },
    ]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <ArrowsRightLeftIcon className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Schedule Bulk P2P
                </h2>
                <p className="text-xs text-slate-400">
                  Schedule multiple P2P transfers at once
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          {step === "form" && (
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto flex-1 px-6 py-5 space-y-5"
            >
              {/* Recipients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-slate-600">
                    Recipients ({items.length})
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium"
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                    Add Recipient
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600">
                          Recipient {index + 1}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Tag */}
                      <div className="mb-2">
                        <div className="flex gap-2">
                          <input
                            value={item.destinationTagOrCode}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "destinationTagOrCode",
                                e.target.value
                              )
                            }
                            placeholder="Customer tag or code"
                            className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              errors[`tag_${index}`] ||
                              errors[`resolve_${index}`]
                                ? "border-red-300"
                                : "border-slate-200"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleResolve(index)}
                            disabled={
                              !item.destinationTagOrCode || item.resolving
                            }
                            className="px-3 py-2 text-xs bg-teal-50 text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-100 disabled:opacity-40 transition-colors shrink-0"
                          >
                            {item.resolving ? "..." : "Verify"}
                          </button>
                        </div>
                        {item.resolved && (
                          <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3" />
                            {item.resolved.name ||
                              item.resolved.customerName ||
                              item.resolved.accountName}
                          </p>
                        )}
                        {errors[`tag_${index}`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`tag_${index}`]}
                          </p>
                        )}
                        {errors[`resolve_${index}`] && !item.resolved && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`resolve_${index}`]}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="mb-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                            ₦
                          </span>
                          <input
                            value={item.displayAmount}
                            onChange={(e) =>
                              handleAmountChange(index, e.target.value)
                            }
                            placeholder="0.00"
                            className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                              errors[`amount_${index}`]
                                ? "border-red-300"
                                : "border-slate-200"
                            }`}
                          />
                        </div>
                        {errors[`amount_${index}`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`amount_${index}`]}
                          </p>
                        )}
                      </div>

                      {/* Narration */}
                      <div>
                        <input
                          value={item.narration}
                          onChange={(e) =>
                            updateItem(index, "narration", e.target.value)
                          }
                          placeholder="Narration"
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            errors[`narration_${index}`]
                              ? "border-red-300"
                              : "border-slate-200"
                          }`}
                        />
                        {errors[`narration_${index}`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`narration_${index}`]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ScheduleFields form={form} setForm={setForm} errors={errors} />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                >
                  Schedule Bulk P2P
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <PinVerificationModal
        isOpen={step === "pin"}
        onClose={() => setStep("form")}
        onSuccess={handlePinVerified}
        transactionData={pendingPayload}
        transactionType="scheduled-payment"
      />
      {!isIndividual && (
        <OtpVerificationModal
          isOpen={step === "otp"}
          onClose={() => setStep("form")}
          onSuccess={handleOtpSuccess}
          purpose="CreateTransfer"
        />
      )}
    </>
  );
};

// ─── Schedule Type Picker ─────────────────────────────────────────────────────

const ScheduleTypePicker = ({ onSelect, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          New Scheduled Payment
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Choose the type of scheduled payment to create:
      </p>
      <div className="space-y-3">
        {[
          {
            key: "single",
            title: "Single / P2P",
            desc: "One recipient — bank transfer or P2P",
            icon: <CalendarDaysIcon className="h-6 w-6 text-blue-600" />,
            bg: "bg-blue-50",
            hover: "hover:border-blue-300 hover:bg-blue-50/50",
          },
          {
            key: "bulk",
            title: "Bulk Payout",
            desc: "Multiple recipients from a saved group",
            icon: <UserGroupIcon className="h-6 w-6 text-purple-600" />,
            bg: "bg-purple-50",
            hover: "hover:border-purple-300 hover:bg-purple-50/50",
          },
          {
            key: "bulkp2p",
            title: "Bulk P2P",
            desc: "Multiple P2P transfers at once",
            icon: <ArrowsRightLeftIcon className="h-6 w-6 text-teal-600" />,
            bg: "bg-teal-50",
            hover: "hover:border-teal-300 hover:bg-teal-50/50",
          },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={`w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl ${opt.hover} transition-all group text-left`}
          >
            <div className={`p-2.5 ${opt.bg} rounded-xl shrink-0`}>
              {opt.icon}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {opt.title}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
            </div>
            <svg
              className="h-4 w-4 text-slate-300 group-hover:text-slate-400 ml-auto shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ScheduledPayments = () => {
  const [filters, setFilters] = useState({ pageNumber: 1, pageSize: 20 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkP2POpen, setBulkP2POpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [cancelItem, setCancelItem] = useState(null);

  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = useScheduledPayments(filters);
  const cancelMutation = useCancelScheduledPayment();

  const rawItems = paymentsData?.data?.items || [];
  const filtered = rawItems.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.accountName?.toLowerCase().includes(q) ||
      p.accountNumber?.toLowerCase().includes(q) ||
      p.bankName?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const pending = rawItems.filter((p) => p.status === "Pending");
  const nextPayment = [...pending].sort(
    (a, b) => new Date(a.nextRunAt) - new Date(b.nextRunAt)
  )[0];

  const handleCancel = async (id) => {
    try {
      await cancelMutation.mutateAsync(id);
      toast.success("Scheduled payment cancelled");
      setCancelItem(null);
      if (detailItem?.id === id) setDetailItem(null);
    } catch (err) {
      toast.error(err.message || "Failed to cancel payment");
    }
  };

  const handlePickerSelect = (type) => {
    setPickerOpen(false);
    if (type === "single") setCreateOpen(true);
    else if (type === "bulk") setBulkOpen(true);
    else if (type === "bulkp2p") setBulkP2POpen(true);
  };

  const totalPages = Math.ceil(
    (paymentsData?.data?.totalCount || 0) / filters.pageSize
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Scheduled Payments
            </h1>
            <p className="text-slate-600">
              Manage your recurring and future-dated transfers
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => refetch()}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Schedule</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Total Schedules
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {rawItems.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {pending.length} pending
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Successful
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {rawItems.filter((p) => p.status === "Successful").length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Completed payments
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <ClockIcon className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Next Payment
              </span>
            </div>
            {nextPayment ? (
              <>
                <div className="text-base font-bold text-slate-900 truncate">
                  {nextPayment.accountName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {formatCurrency(nextPayment.amount)} ·{" "}
                  {getDaysUntil(nextPayment.nextRunAt)}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">No upcoming payments</div>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-800 flex-1">
                Payment Schedules
                {rawItems.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({paymentsData?.data?.totalCount || rawItems.length} total)
                  </span>
                )}
              </h3>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                {[
                  "all",
                  "Pending",
                  "Successful",
                  "Failed",
                  "Cancelled",
                  "Rejected",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                      filterStatus === s
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                />
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="p-10 text-center">
              <div className="inline-flex items-center gap-2 text-slate-500">
                <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />
                Loading scheduled payments...
              </div>
            </div>
          )}
          {error && (
            <div className="p-10 text-center">
              <p className="text-red-600 mb-2">
                Failed to load scheduled payments
              </p>
              <button
                onClick={() => refetch()}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="p-12 text-center">
              <CalendarDaysIcon className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">
                No scheduled payments found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {rawItems.length > 0
                  ? "Try adjusting your filters"
                  : "Create your first scheduled payment"}
              </p>
              {rawItems.length === 0 && (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" /> New Schedule
                </button>
              )}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Recipient",
                        "Type",
                        "Amount",
                        "Schedule",
                        "Next Run",
                        "Status",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((payment) => {
                      const status =
                        statusConfig[payment.status] || statusConfig.Pending;
                      return (
                        <tr
                          key={payment.id}
                          className="hover:bg-slate-50 cursor-pointer"
                          onClick={() => setDetailItem(payment)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900 text-sm">
                              {payment.accountName}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {payment.accountNumber}
                              {payment.bankName && ` · ${payment.bankName}`}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">
                              {payment.type}
                            </div>
                            <div className="text-xs text-slate-400">
                              {payment.scheduleType}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-800">
                              {formatCurrency(payment.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">
                              {payment.frequency || "One-time"}
                            </div>
                            <div className="text-xs text-slate-400">
                              Starts {formatDateShort(payment.startAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {payment.nextRunAt ? (
                              <>
                                <div className="text-sm text-slate-700">
                                  {formatDateShort(payment.nextRunAt)}
                                </div>
                                <div
                                  className={`text-xs mt-0.5 ${
                                    getDaysUntil(payment.nextRunAt) ===
                                    "Overdue"
                                      ? "text-red-500"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {getDaysUntil(payment.nextRunAt)}
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${status.color}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                              />
                              {status.label}
                            </span>
                          </td>
                          <td
                            className="px-6 py-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {payment.status === "Pending" && (
                              <button
                                onClick={() => setCancelItem(payment)}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden divide-y divide-slate-100">
                {filtered.map((payment) => {
                  const status =
                    statusConfig[payment.status] || statusConfig.Pending;
                  return (
                    <div
                      key={payment.id}
                      className="p-4 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setDetailItem(payment)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-sm truncate">
                            {payment.accountName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {payment.accountNumber}
                            {payment.bankName && ` · ${payment.bankName}`}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${status.color}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                              />
                              {status.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {payment.frequency || "One-time"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-semibold text-slate-800 text-sm">
                            {formatCurrency(payment.amount)}
                          </div>
                          {payment.nextRunAt && (
                            <div className="text-xs text-slate-400 mt-1">
                              {getDaysUntil(payment.nextRunAt)}
                            </div>
                          )}
                          {payment.status === "Pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCancelItem(payment);
                              }}
                              className="mt-1 text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Page {filters.pageNumber} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setFilters((p) => ({
                          ...p,
                          pageNumber: p.pageNumber - 1,
                        }))
                      }
                      disabled={filters.pageNumber <= 1}
                      className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setFilters((p) => ({
                          ...p,
                          pageNumber: p.pageNumber + 1,
                        }))
                      }
                      disabled={filters.pageNumber >= totalPages}
                      className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
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

      {/* Schedule type picker */}
      {pickerOpen && (
        <ScheduleTypePicker
          onSelect={handlePickerSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* Modals */}
      <CreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => refetch()}
      />
      <BulkPayoutModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={() => refetch()}
      />
      <BulkP2PModal
        isOpen={bulkP2POpen}
        onClose={() => setBulkP2POpen(false)}
        onSuccess={() => refetch()}
      />
      <DetailDrawer
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onCancel={(item) => {
          setDetailItem(null);
          setCancelItem(item);
        }}
      />
      <CancelModal
        item={cancelItem}
        onConfirm={handleCancel}
        onClose={() => setCancelItem(null)}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
};

export default ScheduledPayments;
