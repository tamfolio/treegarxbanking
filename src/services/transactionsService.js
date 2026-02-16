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

// Transactions API service
export const transactionsService = {
  // Get transactions with filters
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();

    // Add filters to params if they exist
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        params.append(key, filters[key]);
      }
    });

    const response = await apiClient.get(
      `/customer/transfers/transactions?${params.toString()}`
    );
    return response.data;
  },

  // Request transfer OTP
  requestTransferOtp: async (purpose = "transfer") => {
    const response = await apiClient.post("/customer/transfers/otp/request", {
      purpose,
    });
    return response.data;
  },

  // Get banks list
  getBanks: async () => {
    const response = await apiClient.get("/customer/transfers/banks");
    return response.data;
  },

  // Get products list
  getProducts: async () => {
    const response = await apiClient.get("/customer/transfers/products");
    return response.data;
  },

  // Resolve account details
  resolveAccount: async (bankId, accountNumber) => {
    const response = await apiClient.post(
      "/customer/transfers/resolve-account",
      {
        bankId: parseInt(bankId),
        accountNumber: accountNumber,
      }
    );
    return response.data;
  },

  // Make payout
  payout: async (payoutData) => {
    const payload = {
      bankId: parseInt(payoutData.bankId),
      amount: parseFloat(payoutData.amount),
      narration: payoutData.narration,
      accountNumber: payoutData.accountNumber,
      beneficiaryName: payoutData.beneficiaryName,
      saveBeneficiary: payoutData.saveBeneficiary || false,
      pin: payoutData.pin,
    };
  
    // Add OTP only if it exists
    if (payoutData.otpCode) {
      payload.otpCode = payoutData.otpCode;
      payload.otpChallengeId = payoutData.otpChallengeId;
    }
  
    try {
      const response = await apiClient.post(
        "/customer/transfers/payout",
        payload
      );
      return response.data;
    } catch (error) {
      // Extract and throw the actual API error message
      const apiErrorMessage = extractApiErrorMessage(error);
      const enhancedError = new Error(apiErrorMessage);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },

  resolveCustomer: async (identifier) => {
    const response = await apiClient.post(
      "/customer/transfers/resolve-customer",
      {
        identifier: identifier,
      }
    );
    return response.data;
  },

  // Make bulk payout - CORRECTED: PIN and OTP both at root level
  bulkPayout: async (bulkPayoutData) => {
    const payload = {
      groupKey: bulkPayoutData.groupKey,
      pin: bulkPayoutData.pin,
      otpChallengeId: bulkPayoutData.otpChallengeId, // Challenge ID before otpCode
      otpCode: bulkPayoutData.otpCode, // OTP code after challenge ID
      items: bulkPayoutData.items.map((item) => ({
        bankId: parseInt(item.bankId),
        amount: parseFloat(item.amount),
        narration: item.narration,
        accountNumber: item.accountNumber,
        beneficiaryName: item.beneficiaryName,
        saveBeneficiary: item.saveBeneficiary || true,
      })),
    };

    try {
      const response = await apiClient.post("/customer/transfers/payout/bulk", payload);
      return response.data;
    } catch (error) {
      // Extract and throw the actual API error message
      const apiErrorMessage = extractApiErrorMessage(error);
      const enhancedError = new Error(apiErrorMessage);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },

  tagPay: async (tagPayData) => {
    try {
      const response = await apiClient.post("/customer/transfers/p2p", {
        amount: parseFloat(tagPayData.amount),
        narration: tagPayData.narration,
        destinationTagOrCode: tagPayData.destinationTagOrCode,
        pin: tagPayData.pin, // Add PIN to payload
      });
      return response.data;
    } catch (error) {
      // Extract and throw the actual API error message
      const apiErrorMessage = extractApiErrorMessage(error);
      const enhancedError = new Error(apiErrorMessage);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      
      throw enhancedError;
    }
  },
};

export default transactionsService;