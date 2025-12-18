import apiClient from "../api/client";

// Transaction Limits API service
export const transactionLimitsService = {
  // Get daily transaction limits
  getDailyLimits: async () => {
    const response = await apiClient.get("/customer/transfers/limits/daily");
    return response.data;
  },

  // Future endpoints can be added here
  // getMonthlyLimits: async () => { ... },
  // updateLimits: async (limitsData) => { ... },
};

export default transactionLimitsService;