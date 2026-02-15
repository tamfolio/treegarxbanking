import apiClient from "../api/client";

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
  
    const response = await apiClient.post(
      "/customer/transfers/payout",
      payload
    );
  
    return response.data;
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
      pin: bulkPayoutData.pin, // PIN at root level
      otpCode: bulkPayoutData.otpCode, // OTP at root level
      otpChallengeId: bulkPayoutData.otpChallengeId, // Challenge ID at root level
      items: bulkPayoutData.items.map((item) => ({
        bankId: parseInt(item.bankId),
        amount: parseFloat(item.amount),
        narration: item.narration,
        accountNumber: item.accountNumber,
        beneficiaryName: item.beneficiaryName,
        saveBeneficiary: item.saveBeneficiary || true,
        // NO OTP fields in items - they go at root level
      })),
    };

    const response = await apiClient.post("/customer/transfers/payout/bulk", payload);
    return response.data;
  },

  tagPay: async (tagPayData) => {
    const response = await apiClient.post("/customer/transfers/p2p", {
      amount: parseFloat(tagPayData.amount),
      narration: tagPayData.narration,
      destinationTagOrCode: tagPayData.destinationTagOrCode,
      pin: tagPayData.pin, // Add PIN to payload
    });
    return response.data;
  },
};

export default transactionsService;