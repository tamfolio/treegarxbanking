import apiClient from "../api/client";

// Utility to extract API error messages
const extractApiErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstError = Object.values(errors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError;
  }
  return error.message || "An error occurred";
};

// Approvals API service
export const approvalsService = {
  // Get transaction queue
  getTransactionQueue: async () => {
    const response = await apiClient.get("/customer/transfers/queue");
    return response.data;
  },

  // Get business users (Checkers / Makers)
  getBusinessUsers: async () => {
    const response = await apiClient.get("/customer/auth/business-users");
    return response.data;
  },

  // Create checker
  createChecker: async (checkerData) => {
    const response = await apiClient.post("/customer/auth/business-users", {
      email: checkerData.email,
      firstName: checkerData.firstName,
      lastName: checkerData.lastName,
    });
    return response.data;
  },

  // Request approval OTP
  requestApprovalOtp: async (purpose = "ApproveTransfer") => {
    const response = await apiClient.post("/customer/transfers/otp/request", {
      purpose,
    });
    return response.data;
  },

  // Approve transaction
  approveTransaction: async (transactionId, otpCode, otpChallengeId) => {
    console.log("🔄 Approving transaction:", {
      transactionId,
      otpCode: otpCode ? "***provided***" : "***missing***",
      otpChallengeId: otpChallengeId ? "***provided***" : "***missing***"
    });

    try {
      const response = await apiClient.post(
        `/customer/transfers/queue/${transactionId}/approve`,
        {
          otpCode,
          otpChallengeId,
        }
      );

      console.log("✅ Transaction approved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Transaction approval failed:", error);
      
      // Extract and throw the actual API error message
      const apiErrorMessage = extractApiErrorMessage(error);
      const enhancedError = new Error(apiErrorMessage);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },

  // Reject transaction
  rejectTransaction: async (transactionId, reason) => {
    console.log("🔄 Rejecting transaction:", {
      transactionId,
      reason
    });

    try {
      const response = await apiClient.post(
        `/customer/transfers/queue/${transactionId}/reject`,
        {
          reason,
        }
      );

      console.log("✅ Transaction rejected successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Transaction rejection failed:", error);
      
      // Extract and throw the actual API error message
      const apiErrorMessage = extractApiErrorMessage(error);
      const enhancedError = new Error(apiErrorMessage);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },
};

export default approvalsService;