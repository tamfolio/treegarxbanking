import apiClient from "../api/client";

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
      throw error;
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
      throw error;
    }
  },
};

export default approvalsService;