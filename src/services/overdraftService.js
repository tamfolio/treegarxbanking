import apiClient from "../api/client";

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

export const overdraftService = {
  getOverdraftSummary: async () => {
    const response = await apiClient.get("/customer/overdraft");
    return response.data;
  },

  getApplicationStatus: async () => {
    try {
      const response = await apiClient.get("/customer/overdraft/application");
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }
      throw error;
    }
  },

  applyForOverdraft: async () => {
    try {
      const response = await apiClient.post("/customer/overdraft/apply");
      return response.data;
    } catch (error) {
      const apiErrorMessage = extractApiErrorMessage(error);
      const enhancedError = new Error(apiErrorMessage);
      enhancedError.originalError = error;
      enhancedError.response = error.response;
      throw enhancedError;
    }
  },

  drawOverdraft: async ({ amount }) => {
    try {
      const response = await apiClient.post("/customer/overdraft/draw", {
        amount: parseFloat(amount),
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

  repayOverdraft: async ({ amount }) => {
    try {
      const response = await apiClient.post("/customer/overdraft/repay", {
        amount: parseFloat(amount),
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

  getInterestHistory: async (filters = {}) => {
    const params = new URLSearchParams();
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
      `/customer/overdraft/interest-history?${params.toString()}`
    );
    return response.data;
  },
};

export default overdraftService;