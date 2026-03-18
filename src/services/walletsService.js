// src/services/walletsService.js
import apiClient from "../api/client";

const extractApiErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstError = Object.values(errors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError;
  }
  return error.message || "An error occurred";
};

const walletsService = {
  getWallets: async () => {
    const response = await apiClient.get("/customer/wallets");
    return response.data;
  },

  createSubWallet: async (payload) => {
    try {
      const response = await apiClient.post("/customer/wallets/sub-wallets", payload);
      return response.data;
    } catch (error) {
      const msg = extractApiErrorMessage(error);
      const err = new Error(msg);
      err.response = error.response;
      throw err;
    }
  },

  walletTransfer: async (payload) => {
    try {
      const response = await apiClient.post("/customer/wallets/transfers", payload);
      return response.data;
    } catch (error) {
      const msg = extractApiErrorMessage(error);
      const err = new Error(msg);
      err.response = error.response;
      throw err;
    }
  },
};

export default walletsService;