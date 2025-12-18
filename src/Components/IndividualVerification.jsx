import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useRefreshProfile } from "../hooks/useProfile";

const IndividualVerification = ({
  customerId,
  customerCode,
  verifications = [],
  onVerificationSuccess,
  isSubmitting = false,
}) => {
  const { refreshProfile } = useRefreshProfile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleProfileRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      console.log("Refreshing profile data...");
      const result = await refreshProfile();
      console.log("Profile refreshed successfully:", result);
      return result;
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  // Get verification status
  const bvnVerification = verifications.find((v) => v.type === "bvn") || {};
  const ninVerification = verifications.find((v) => v.type === "nin") || {};
  const livenessVerification =
    verifications.find((v) => v.type === "liveness") || {};

  // Determine initial active step based on completion status
  const getInitialStep = () => {
    console.log("=== STEP DETERMINATION DEBUG ===");
    console.log("BVN verification:", bvnVerification);
    console.log("NIN verification:", ninVerification);
    console.log("BVN completed:", bvnVerification.isCompleted);
    console.log("NIN completed:", ninVerification.isCompleted);

    if (!bvnVerification.isCompleted) {
      console.log("Starting with BVN step");
      return "bvn";
    }
    if (!ninVerification.isCompleted) {
      console.log("Starting with NIN step");
      return "nin";
    }
    console.log("Starting with liveness step");
    return "liveness";
  };

  const [activeStep, setActiveStep] = useState(getInitialStep());

  // Update active step when verifications change (e.g., after refresh or API update)
  useEffect(() => {
    const newStep = getInitialStep();
    if (newStep !== activeStep) {
      setActiveStep(newStep);
    }
  }, [verifications]);

  const [formData, setFormData] = useState({
    bvn: "",
    nin: "",
  });
  const [showBVN, setShowBVN] = useState(false);
  const [showNIN, setShowNIN] = useState(false);
  const [errors, setErrors] = useState({});
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateBVN = () => {
    const newErrors = {};
    if (!formData.bvn || formData.bvn.length !== 11) {
      newErrors.bvn = "BVN must be exactly 11 digits";
    }
    if (!/^\d+$/.test(formData.bvn)) {
      newErrors.bvn = "BVN must contain only numbers";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNIN = () => {
    const newErrors = {};
    if (!formData.nin || formData.nin.length !== 11) {
      newErrors.nin = "NIN must be exactly 11 digits";
    }
    if (!/^\d+$/.test(formData.nin)) {
      newErrors.nin = "NIN must contain only numbers";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBVNSubmit = async () => {
    if (!validateBVN()) return;

    setLocalSubmitting(true);
    try {
      const { verificationService } = await import(
        "../services/verificationServicee"
      );

      const result = await verificationService.submitIndividualKYC({
        customerCode,
        customerId,
        bvn: formData.bvn,
      });

      if (result.success) {
        onVerificationSuccess("bvn", result);
        setActiveStep("nin"); // Move to next step

        // ADD THIS - refresh after BVN verification
        setTimeout(async () => {
          console.log("Refreshing profile after BVN verification...");
          await handleProfileRefresh();
        }, 2000);
      } else {
        setErrors({ submit: result.message || "BVN verification failed" });
      }
    } catch (error) {
      setErrors({ submit: error.message || "BVN verification failed" });
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleNINSubmit = async () => {
    if (!validateNIN()) return;

    setLocalSubmitting(true);
    try {
      const { verificationService } = await import(
        "../services/verificationServicee"
      );

      const result = await verificationService.submitIndividualKYC({
        customerCode,
        customerId,
        nin: formData.nin,
      });

      if (result.success) {
        onVerificationSuccess("nin", result);
        setActiveStep("liveness"); // Move to next step

        // ADD THIS - refresh after NIN verification
        setTimeout(async () => {
          console.log("Refreshing profile after NIN verification...");
          await handleProfileRefresh();
        }, 2000);
      } else {
        setErrors({ submit: result.message || "NIN verification failed" });
      }
    } catch (error) {
      setErrors({ submit: error.message || "NIN verification failed" });
    } finally {
      setLocalSubmitting(false);
    }
  };

  const getStepStatus = (step) => {
    const verification = verifications.find((v) => v.type === step);
    const isCompleted =
      verification?.isCompleted || verification?.status === "VERIFIED";
    const isPending = verification?.status === "Pending";
    const isNotStarted =
      verification?.status === "NotStarted" || !verification?.status;

    console.log(`Step ${step} status:`, {
      verification,
      isCompleted,
      isPending,
      isNotStarted,
      rawStatus: verification?.status,
    });

    return {
      completed: isCompleted,
      pending: isPending,
      notStarted: isNotStarted,
    };
  };

  const renderStepIndicator = (step, title, index) => {
    const status = getStepStatus(step);
    const isActive = activeStep === step;

    return (
      <div className="flex items-center">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            status.completed
              ? "bg-green-100 border-green-500 text-green-600"
              : status.pending
              ? "bg-yellow-100 border-yellow-500 text-yellow-600"
              : isActive
              ? "bg-blue-100 border-blue-500 text-blue-600"
              : "bg-gray-100 border-gray-300 text-gray-400"
          }`}
        >
          {status.completed ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <span className="text-sm font-medium">{index}</span>
          )}
        </div>
        <span
          className={`ml-2 text-sm font-medium ${
            status.completed
              ? "text-green-600"
              : isActive
              ? "text-blue-600"
              : "text-gray-500"
          }`}
        >
          {title}
        </span>
      </div>
    );
  };

  const renderBVNStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Bank Verification Number (BVN)
        </h3>
        <p className="text-gray-600 text-sm">
          Enter your 11-digit BVN to verify your identity. This helps us confirm
          your bank account details.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          BVN *
        </label>
        <div className="relative">
          <input
            type={showBVN ? "text" : "password"}
            value={formData.bvn}
            onChange={(e) => handleInputChange("bvn", e.target.value)}
            placeholder="Enter your 11-digit BVN"
            maxLength={11}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
              errors.bvn ? "border-red-300" : "border-gray-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowBVN(!showBVN)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showBVN ? (
              <EyeSlashIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.bvn && (
          <p className="mt-1 text-xs text-red-600">{errors.bvn}</p>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">
              Why do we need your BVN?
            </p>
            <p className="text-blue-700 mt-1">
              Your BVN helps us verify your identity securely and comply with
              banking regulations. We use bank-grade security to protect your
              information.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleBVNSubmit}
        disabled={
          localSubmitting || !formData.bvn || formData.bvn.length !== 11
        }
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {localSubmitting ? "Verifying..." : "Verify BVN"}
      </button>
    </div>
  );

  const renderNINStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          National Identification Number (NIN)
        </h3>
        <p className="text-gray-600 text-sm">
          Enter your 11-digit NIN to complete your identity verification
          process.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          NIN *
        </label>
        <div className="relative">
          <input
            type={showNIN ? "text" : "password"}
            value={formData.nin}
            onChange={(e) => handleInputChange("nin", e.target.value)}
            placeholder="Enter your 11-digit NIN"
            maxLength={11}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
              errors.nin ? "border-red-300" : "border-gray-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowNIN(!showNIN)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNIN ? (
              <EyeSlashIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.nin && (
          <p className="mt-1 text-xs text-red-600">{errors.nin}</p>
        )}
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-900">
              Final verification step
            </p>
            <p className="text-green-700 mt-1">
              This is the last step in your identity verification process. Once
              completed, you'll have full access to all features.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleNINSubmit}
        disabled={
          localSubmitting || !formData.nin || formData.nin.length !== 11
        }
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {localSubmitting ? "Verifying..." : "Verify NIN"}
      </button>
    </div>
  );

  const renderLivenessStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Liveness Check
        </h3>
        <p className="text-gray-600 text-sm">
          The liveness verification will be implemented in a future update. Your
          identity verification is complete for now.
        </p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-900">Coming Soon</p>
            <p className="text-yellow-700 mt-1">
              Liveness verification will be added soon to enhance account
              security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {isRefreshing && (
        <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-blue-800 text-sm">
              Updating verification status...
            </span>
          </div>
        </div>
      )}
      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8 px-4">
        {renderStepIndicator("bvn", "BVN", 1)}
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        {renderStepIndicator("nin", "NIN", 2)}
        <div className="flex-1 h-px bg-gray-200 mx-4"></div>
        {renderStepIndicator("liveness", "Liveness", 3)}
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        {activeStep === "bvn" && renderBVNStep()}
        {activeStep === "nin" && renderNINStep()}
        {activeStep === "liveness" && renderLivenessStep()}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            if (activeStep === "nin") setActiveStep("bvn");
            if (activeStep === "liveness") setActiveStep("nin");
          }}
          disabled={activeStep === "bvn"}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <button
          onClick={() => {
            if (activeStep === "bvn" && getStepStatus("bvn").completed)
              setActiveStep("nin");
            if (activeStep === "nin" && getStepStatus("nin").completed)
              setActiveStep("liveness");
          }}
          disabled={
            (activeStep === "bvn" && !getStepStatus("bvn").completed) ||
            (activeStep === "nin" && !getStepStatus("nin").completed) ||
            activeStep === "liveness"
          }
          className="px-4 py-2 text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {activeStep === "liveness" ? "Complete" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default IndividualVerification;
