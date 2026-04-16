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

// Accounts API service
export const accountsService = {
  // Get all accounts
  getAccounts: async () => {
    const response = await apiClient.get("/customer/accounts");
    return response.data;
  },

  // Get available providers
  getProviders: async () => {
    const response = await apiClient.get("/customer/accounts/providers");
    return response.data;
  },

  // Provision a new account with a provider
  provisionAccount: async (providerId) => {
    try {
      const response = await apiClient.post("/customer/accounts/provision", {
        providerId,
      });
      return response.data;
    } catch (error) {
      const apiErrorMessage = extractApiErrorMessage(error);
      const enhancedError = new Error(apiErrorMessage);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },
};

export default accountsService;