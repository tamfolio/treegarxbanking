import React, { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import VerificationStepIndicator from "./Dashboard/BusinessVerification/VerificationStepIndicator";
import BVNVerificationStep from "./Dashboard/BusinessVerification/BVNStep";
import NINVerificationStep from "./Dashboard/BusinessVerification/NINStep";
import DocumentsStep from "./Dashboard/BusinessVerification/DocumentUploadStep";
import { useRefreshProfile } from "../hooks/useProfile";

const BusinessVerification = ({
  customerId,
  customerCode,
  verifications = [],
  documents,
  onVerificationSuccess,
  onDocumentUploadSuccess,
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
  /* ------------------ VERIFICATION HELPERS ------------------ */
  const getVerification = (type) =>
    verifications.find((v) => v.type === type) || {};

  const bvnVerification = getVerification("bvn");
  const ninVerification = getVerification("nin");

  const isBVNVerified =
    bvnVerification.status === "VERIFIED" || bvnVerification.isCompleted;

  const isNINVerified =
    ninVerification.status === "VERIFIED" || ninVerification.isCompleted;

  const canAccessDocuments = isBVNVerified && isNINVerified;

  /* ------------------ STEP RESOLUTION - FIXED ------------------ */
  const determineStep = () => {
    console.log("=== STEP DETERMINATION - BLOCKING LIVENESS ===");
    console.log("BVN verified:", isBVNVerified);
    console.log("NIN verified:", isNINVerified);

    // STRICT BUSINESS FLOW: Only BVN, NIN, Documents
    // NEVER allow liveness to be selected
    if (!isBVNVerified) {
      console.log("-> Returning BVN step");
      return "bvn";
    }
    if (!isNINVerified) {
      console.log("-> Returning NIN step");
      return "nin";
    }

    // FORCE documents - NEVER liveness for business
    console.log("-> FORCING DOCUMENTS STEP (blocking liveness)");
    return "documents";
  };

  // Initialize with correct step
  const [activeStep, setActiveStep] = useState(() => {
    const initialStep = determineStep();
    console.log("Initial step determined:", initialStep);
    return initialStep;
  });

  const [errors, setErrors] = useState({});

  // Force correct step on verification updates
  useEffect(() => {
    const correctStep = determineStep();
    console.log("useEffect - correct step should be:", correctStep);

    // FORCE the correct step - override any liveness logic
    if (activeStep !== correctStep) {
      console.log(`FORCING STEP CHANGE: ${activeStep} -> ${correctStep}`);
      setActiveStep(correctStep);
    }
  }, [verifications, isBVNVerified, isNINVerified]);

  // Additional safety check - prevent liveness from ever being active
  useEffect(() => {
    if (activeStep === "liveness") {
      console.log(
        "EMERGENCY OVERRIDE: Preventing liveness step, forcing documents"
      );
      setActiveStep("documents");
    }
  }, [activeStep]);

  console.log("=== CURRENT RENDER STATE ===");
  console.log("activeStep:", activeStep);
  console.log("isBVNVerified:", isBVNVerified);
  console.log("isNINVerified:", isNINVerified);
  console.log("canAccessDocuments:", canAccessDocuments);

  /* ------------------ EVENT HANDLERS ------------------ */
  const handleVerificationSuccess = async (type, result) => {
    console.log(`${type} verification successful:`, result);
    onVerificationSuccess(type, result);
    setErrors({});

    // ADD THIS - refresh after verification
    setTimeout(async () => {
      console.log(`Refreshing profile after ${type} verification...`);
      await handleProfileRefresh();
    }, 2000);
  };

  const handleDocumentSuccess = async (documentKey, result) => {
    console.log(`Document ${documentKey} uploaded successfully:`, result);
    onDocumentUploadSuccess(documentKey, result);
    setErrors({});

    // ADD THIS - refresh after document upload
    setTimeout(async () => {
      console.log(`Refreshing profile after ${documentKey} document upload...`);
      await handleProfileRefresh();
    }, 2000);
  };

  const handleError = (errorMsg) => {
    setErrors({ general: errorMsg });
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {isRefreshing && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-blue-800 text-sm">
              Updating verification status...
            </span>
          </div>
        </div>
      )}
      {/* Step Indicator */}
      <VerificationStepIndicator
        activeStep={activeStep}
        isBVNVerified={isBVNVerified}
        isNINVerified={isNINVerified}
      />

      {/* General Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700 rounded">
          {errors.general}
        </div>
      )}

      {/* EMERGENCY LIVENESS BLOCKER */}
      {activeStep === "liveness" && (
        <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
          <p className="text-red-800 font-semibold">
            ⚠️ ERROR: Liveness step detected
          </p>
          <p className="text-red-700 text-sm">
            This should not happen. Forcing documents step...
          </p>
          <button
            onClick={() => setActiveStep("documents")}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Force Documents Step
          </button>
        </div>
      )}

      {/* Step Content */}
      {activeStep === "bvn" && (
        <BVNVerificationStep
          customerCode={customerCode}
          customerId={customerId}
          onVerificationSuccess={handleVerificationSuccess}
          onError={handleError}
        />
      )}

      {activeStep === "nin" && (
        <NINVerificationStep
          customerCode={customerCode}
          customerId={customerId}
          onVerificationSuccess={handleVerificationSuccess}
          onError={handleError}
        />
      )}

      {activeStep === "documents" && (
        <>
          {canAccessDocuments ? (
            <DocumentsStep
              customerId={customerId}
              documents={documents}
              onDocumentUploadSuccess={handleDocumentSuccess}
              onError={handleError}
            />
          ) : (
            <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                <p className="text-gray-600">
                  Complete BVN and NIN verification to access document upload
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    BVN Status:{" "}
                    {isBVNVerified ? "✅ Verified" : "❌ Not Verified"}
                  </p>
                  <p>
                    NIN Status:{" "}
                    {isNINVerified ? "✅ Verified" : "❌ Not Verified"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessVerification;
