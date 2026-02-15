import React, { useState, useRef, useEffect } from "react";
import { XMarkIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useRequestTransferOtp } from "../../hooks/useTransactions";

const OtpVerificationModal = ({
  isOpen,
  onClose,
  onSuccess,
  purpose = "CreateTransfer",
}) => {
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [otpChallengeId, setOtpChallengeId] = useState(null);
  const [error, setError] = useState("");
  
  const { mutateAsync: requestTransferOtp } = useRequestTransferOtp();
  const inputRefs = useRef([]);

  // Initialize input refs
  if (inputRefs.current.length !== 6) {
    inputRefs.current = Array(6)
      .fill()
      .map((_, i) => inputRefs.current[i] || React.createRef());
  }

  // Request OTP when modal opens
  useEffect(() => {
    if (isOpen) {
      requestOtp();
    } else {
      // Reset state when modal closes
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpChallengeId(null);
    setError("");
    setIsRequesting(false);
  };

  const requestOtp = async () => {
    try {
      setIsRequesting(true);
      setError("");

      const response = await requestTransferOtp(purpose);
      
      if (response?.success && response?.data?.challengeId) {
        // API returns challengeId, but we need to map it to otpChallengeId for payout
        setOtpChallengeId(response.data.challengeId);
        toast.success(response.message || "OTP sent successfully");
        
        // Focus first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        throw new Error(response?.message || "Failed to request OTP");
      }
    } catch (err) {
      console.error("OTP request failed:", err);
      const errorMessage = err.message || "Failed to request OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDigitChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Clear any previous error
    if (error) setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newDigits = [...otpDigits];
        
        digits.forEach((digit, i) => {
          if (i < 6) {
            newDigits[i] = digit;
          }
        });
        
        setOtpDigits(newDigits);
        
        // Focus last filled input or next empty one
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      });
    }
  };

  // Simple submit - just pass the data back, no async processing
  const handleSubmit = () => {
    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    if (!otpChallengeId) {
      setError("OTP session expired. Please request a new OTP");
      return;
    }

    // Just pass the data back - no async processing here
    onSuccess({
      otpCode: otp,
      otpChallengeId: otpChallengeId, // Map challengeId to otpChallengeId
    });

    // Reset form
    setOtpDigits(["", "", "", "", "", ""]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-lg">Enter OTP</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-6 text-center">
          Enter the 6-digit code sent to your registered email
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center space-x-2 mb-6">
          {otpDigits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isRequesting}
              className={`w-12 h-12 text-center border-2 rounded-lg text-lg font-semibold 
                focus:outline-none focus:border-blue-500 transition-colors
                ${error ? 'border-red-300' : 'border-slate-200'}
                ${isRequesting ? 'bg-slate-100' : 'bg-white'}
              `}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={requestOtp}
            disabled={isRequesting}
            className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2 
              hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 
              transition-colors"
          >
            {isRequesting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full"></div>
                <span>Sending...</span>
              </div>
            ) : (
              "Resend OTP"
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRequesting || otpDigits.join("").length !== 6}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 
              hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
          >
            Continue
          </button>
        </div>

        {/* Challenge ID Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && otpChallengeId && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            Challenge ID: {otpChallengeId}
          </div>
        )}
      </div>
    </div>
  );
};

export default OtpVerificationModal;