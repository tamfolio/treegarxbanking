// src/Components/Modals/SubWalletsModal.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  ArrowsRightLeftIcon,
  WalletIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import {
  useWallets,
  useCreateSubWallet,
  useWalletTransfer,
} from "../../hooks/useWallets";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  `₦${parseFloat(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;

const statusColors = {
  Active: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Inactive: "text-slate-500 bg-slate-100 border-slate-200",
  Suspended: "text-red-700 bg-red-50 border-red-200",
};

// ─── PIN Input ────────────────────────────────────────────────────────────────

const PinInput = ({ pin, setPin, error, disabled }) => {
  const refs = useRef([]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...pin];
    next[index] = value;
    setPin(next);
    if (value && index < 3) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const next = [...pin];
      next[index - 1] = "";
      setPin(next);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = ["", "", "", ""];
    text.split("").forEach((d, i) => (next[i] = d));
    setPin(next);
    refs.current[Math.min(text.length, 3)]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-3">
        {pin.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="password"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-xl bg-white focus:outline-none focus:ring-4 transition-all ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            } ${disabled ? "opacity-50" : ""}`}
            placeholder="•"
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
};

// ─── Create Sub-wallet View ───────────────────────────────────────────────────

const CreateSubWalletView = ({ onBack, onSuccess }) => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [nameError, setNameError] = useState("");
  const [pinError, setPinError] = useState("");
  const createMutation = useCreateSubWallet();
  const pinRefs = useRef([]);

  const handlePinChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...pin];
    next[index] = value;
    setPin(next);
    if (pinError) setPinError("");
    if (value && index < 3) pinRefs.current[index + 1]?.focus();
  };

  const handlePinKeyDown = (e, index) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
      const next = [...pin];
      next[index - 1] = "";
      setPin(next);
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = ["", "", "", ""];
    text.split("").forEach((d, i) => (next[i] = d));
    setPin(next);
    pinRefs.current[Math.min(text.length, 3)]?.focus();
  };

  const handleCreate = async () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Wallet name is required");
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      valid = false;
    }
    const pinStr = pin.join("");
    if (pinStr.length !== 4) {
      setPinError("Enter your 4-digit PIN");
      valid = false;
    }
    if (!valid) return;

    try {
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        pin: pinStr,
      });
      if (result.success) {
        toast.success(`"${name}" wallet created!`);
        onSuccess?.();
        onBack();
      } else {
        toast.error(result.message || "Failed to create wallet");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create wallet");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 flex-1 space-y-4">
        <div className="mb-2">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
            <PlusIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            New Sub-wallet
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Create a separate wallet to organise your funds
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Wallet Name
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="e.g. House Rent, Savings, Payroll..."
            autoFocus
            className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              nameError ? "border-red-300" : "border-slate-200"
            }`}
          />
          {nameError && (
            <p className="mt-1 text-xs text-red-600">{nameError}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Enter PIN to authorise
          </label>
          <div className="flex justify-center gap-3">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (pinRefs.current[i] = el)}
                type="password"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(e, i)}
                onPaste={handlePinPaste}
                disabled={createMutation.isPending}
                className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-xl bg-white focus:outline-none focus:ring-4 transition-all ${
                  pinError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                } ${createMutation.isPending ? "opacity-50" : ""}`}
                placeholder="•"
              />
            ))}
          </div>
          {pinError && (
            <p className="mt-2 text-xs text-red-600 text-center">{pinError}</p>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleCreate}
          disabled={
            createMutation.isPending || !name.trim() || pin.some((d) => !d)
          }
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {createMutation.isPending ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Wallet"
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Transfer View ────────────────────────────────────────────────────────────

const TransferView = ({ allWallets, mainWalletId, onBack, onSuccess }) => {
  const [step, setStep] = useState("form");
  // direction: "toSub" = main -> sub, "toMain" = sub -> main
  const [direction, setDirection] = useState("toMain");
  const [subWalletId, setSubWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [pendingPayload, setPendingPayload] = useState(null);
  const transferMutation = useWalletTransfer();

  const subWallets = allWallets.filter((w) => w.walletType === "Sub");
  const mainWallet = allWallets.find((w) => w.walletType === "Main");
  const selectedSub = subWallets.find((w) => String(w.id) === String(subWalletId));

  // Source and destination depend on direction
  const sourceWallet = direction === "toMain" ? selectedSub : mainWallet;
  const destinationWallet = direction === "toMain" ? mainWallet : selectedSub;

  const formatAmountDisplay = (v) => {
    if (!v) return "";
    const n = v.toString().replace(/[^0-9.]/g, "");
    const parts = n.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const parseAmount = (v) => parseFloat((v || "").replace(/,/g, "")) || 0;

  const validate = () => {
    const e = {};
    if (!subWalletId) e.subWallet = "Select a sub-wallet";
    if (!amount || parseAmount(displayAmount) <= 0)
      e.amount = "Enter a valid amount";
    if (sourceWallet && parseAmount(displayAmount) > sourceWallet.currentBalance)
      e.amount = `Insufficient balance in ${sourceWallet.name}`;
    if (!narration.trim()) e.narration = "Narration is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validate()) return;
    setPendingPayload({
      sourceWalletId: direction === "toMain" ? Number(subWalletId) : mainWalletId,
      destinationWalletId: direction === "toMain" ? mainWalletId : Number(subWalletId),
      amount: parseAmount(displayAmount),
      narration: narration.trim(),
    });
    setStep("pin");
  };

  const handlePinSubmit = async () => {
    const pinStr = pin.join("");
    if (pinStr.length !== 4) {
      setErrors({ pin: "Enter your 4-digit PIN" });
      return;
    }
    try {
      const result = await transferMutation.mutateAsync({
        ...pendingPayload,
        pin: pinStr,
      });
      if (result.success) {
        toast.success("Transfer successful!");
        onSuccess?.();
        onBack();
      } else {
        toast.error(result.message || "Transfer failed");
        setErrors({ pin: result.message || "Transfer failed" });
        setPin(["", "", "", ""]);
      }
    } catch (err) {
      toast.error(err.message || "Transfer failed");
      setErrors({ pin: err.message || "Transfer failed" });
      setPin(["", "", "", ""]);
    }
  };

  // Reset sub-wallet selection when direction changes
  const handleDirectionChange = (dir) => {
    setDirection(dir);
    setSubWalletId("");
    setErrors({});
  };

  if (step === "pin") {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-5 flex-1">
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
              <LockClosedIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Authorize Transfer
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Enter your PIN to confirm
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">From</span>
              <span className="font-medium text-slate-800">
                {sourceWallet?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">To</span>
              <span className="font-medium text-slate-800">
                {destinationWallet?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Narration</span>
              <span className="font-medium text-slate-800 text-right max-w-[55%]">
                {narration}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-700">Amount</span>
              <span className="font-bold text-slate-900 text-base">
                {formatCurrency(parseAmount(displayAmount))}
              </span>
            </div>
          </div>

          <PinInput
            pin={pin}
            setPin={setPin}
            error={errors.pin}
            disabled={transferMutation.isPending}
          />
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={() => {
              setStep("form");
              setErrors({});
              setPin(["", "", "", ""]);
            }}
            disabled={transferMutation.isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handlePinSubmit}
            disabled={transferMutation.isPending || pin.some((d) => !d)}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {transferMutation.isPending ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Transfer"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 flex-1 space-y-4 overflow-y-auto">
        <div className="mb-2">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
            <ArrowsRightLeftIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Transfer Funds
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Move funds between your main wallet and sub-wallets
          </p>
        </div>

        {/* Direction toggle */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Transfer Direction
          </label>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleDirectionChange("toMain")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                direction === "toMain"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sub &#8594; Main
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange("toSub")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                direction === "toSub"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Main &#8594; Sub
            </button>
          </div>
        </div>

        {/* Sub-wallet selector */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Sub-wallet
          </label>
          <select
            value={subWalletId}
            onChange={(e) => {
              setSubWalletId(e.target.value);
              if (errors.subWallet) setErrors((p) => ({ ...p, subWallet: "" }));
            }}
            className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.subWallet ? "border-red-300" : "border-slate-200"
            }`}
          >
            <option value="">Select sub-wallet...</option>
            {subWallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — {formatCurrency(w.currentBalance)}
              </option>
            ))}
          </select>
          {errors.subWallet && (
            <p className="mt-1 text-xs text-red-600">{errors.subWallet}</p>
          )}
        </div>

        {/* From / To summary */}
        {subWalletId && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex-1 text-center">
              <div className="text-slate-500 mb-0.5">From</div>
              <div className="font-semibold text-slate-800">
                {sourceWallet?.name}
              </div>
              <div className="text-slate-400 mt-0.5">
                {formatCurrency(sourceWallet?.currentBalance)}
              </div>
            </div>
            <ArrowsRightLeftIcon className="h-4 w-4 text-blue-400 shrink-0" />
            <div className="flex-1 text-center">
              <div className="text-slate-500 mb-0.5">To</div>
              <div className="font-semibold text-slate-800">
                {destinationWallet?.name}
              </div>
              <div className="text-slate-400 mt-0.5">
                {formatCurrency(destinationWallet?.currentBalance)}
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Amount (₦)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              ₦
            </span>
            <input
              value={displayAmount}
              onChange={(e) => {
                const fmt = formatAmountDisplay(e.target.value);
                setDisplayAmount(fmt);
                setAmount(parseAmount(fmt));
                if (errors.amount) setErrors((p) => ({ ...p, amount: "" }));
              }}
              placeholder="0.00"
              className={`w-full pl-7 pr-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.amount ? "border-red-300" : "border-slate-200"
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
          )}
          {sourceWallet && (
            <p className="mt-1 text-xs text-slate-500">
              Available:{" "}
              <span className="font-semibold text-slate-700">
                {formatCurrency(sourceWallet.currentBalance)}
              </span>
            </p>
          )}
        </div>

        {/* Narration */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Narration
          </label>
          <input
            value={narration}
            onChange={(e) => {
              setNarration(e.target.value);
              if (errors.narration) setErrors((p) => ({ ...p, narration: "" }));
            }}
            placeholder="Purpose of transfer"
            className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.narration ? "border-red-300" : "border-slate-200"
            }`}
          />
          {errors.narration && (
            <p className="mt-1 text-xs text-red-600">{errors.narration}</p>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleFormSubmit}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// ─── Wallet Card ──────────────────────────────────────────────────────────────

const WalletCard = ({ wallet, isMain }) => (
  <div
    className={`p-4 rounded-2xl border transition-all ${
      isMain
        ? "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-700 text-white"
        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg ${isMain ? "bg-white/20" : "bg-blue-50"}`}>
        <WalletIcon className={`h-4 w-4 ${isMain ? "text-white" : "text-blue-600"}`} />
      </div>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
          isMain
            ? "bg-white/20 text-white border-white/30"
            : statusColors[wallet.status] || statusColors.Active
        }`}
      >
        {isMain ? "Main" : wallet.status}
      </span>
    </div>
    <div className={`text-xs mb-1 ${isMain ? "text-blue-200" : "text-slate-500"}`}>
      {wallet.name}
    </div>
    <div className={`text-xl font-bold ${isMain ? "text-white" : "text-slate-900"}`}>
      {formatCurrency(wallet.currentBalance)}
    </div>
    {!isMain && (
      <div className="text-xs text-slate-400 mt-1">
        Created{" "}
        {new Date(wallet.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
    )}
  </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

const SubWalletsModal = ({ isOpen, onClose, initialView = "list" }) => {
  const [view, setView] = useState(initialView);

  useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  const {
    data: walletsData,
    isLoading,
    refetch: refetchWallets,
  } = useWallets({ enabled: isOpen });

  const allItems = walletsData?.data?.items || [];
  const mainWalletId = walletsData?.data?.mainWalletId;
  const mainWallet = allItems.find((w) => w.walletType === "Main");
  const subWallets = allItems.filter((w) => w.walletType === "Sub");

  const refetchAll = () => refetchWallets();

  const totalSubBalance = subWallets.reduce(
    (sum, w) => sum + (w.currentBalance || 0),
    0
  );

  const handleClose = () => {
    setView("list");
    onClose();
  };

  if (!isOpen) return null;

  const viewTitles = {
    list: "Sub-wallets",
    create: "Create Sub-wallet",
    transfer: "Transfer Funds",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-800/50 backdrop-blur-sm"
        onClick={view === "list" ? handleClose : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            {view !== "list" && (
              <button
                onClick={() => setView("list")}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="p-2 bg-blue-50 rounded-lg">
              <WalletIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {viewTitles[view]}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {view === "list" && (
              <button
                onClick={refetchAll}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {view === "list" && (
            <div className="p-5 space-y-4">
              {isLoading ? (
                <div className="py-12 text-center">
                  <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Loading wallets...</p>
                </div>
              ) : (
                <>
                  {mainWallet && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                        Main Wallet
                      </p>
                      <WalletCard wallet={mainWallet} isMain />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Sub-wallets ({subWallets.length})
                      </p>
                      {subWallets.length > 0 && (
                        <span className="text-xs text-slate-400">
                          Total: {formatCurrency(totalSubBalance)}
                        </span>
                      )}
                    </div>

                    {subWallets.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl">
                        <WalletIcon className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 font-medium">
                          No sub-wallets yet
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Create one to start organising your funds
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {subWallets.map((wallet) => (
                          <WalletCard key={wallet.id} wallet={wallet} isMain={false} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setView("create")}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                      New Sub-wallet
                    </button>
                    <button
                      onClick={() => setView("transfer")}
                      disabled={subWallets.length === 0}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-xl border border-blue-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowsRightLeftIcon className="h-4 w-4" />
                      Transfer
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {view === "create" && (
            <CreateSubWalletView
              onBack={() => setView("list")}
              onSuccess={refetchAll}
            />
          )}

          {view === "transfer" && (
            <TransferView
              allWallets={allItems}
              mainWalletId={mainWalletId}
              onBack={() => setView("list")}
              onSuccess={refetchAll}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SubWalletsModal;