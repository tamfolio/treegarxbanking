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

export const scheduledPaymentsService = {
  // GET /api/customer/scheduled-payments
  getScheduledPayments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    const response = await apiClient.get(
      `/customer/scheduled-payments?${params.toString()}`
    );
    return response.data;
  },

  // GET /api/customer/scheduled-payments/{id}
  getScheduledPayment: async (id) => {
    const response = await apiClient.get(`/customer/scheduled-payments/${id}`);
    return response.data;
  },

  // POST /api/customer/scheduled-payments
  createScheduledPayment: async (payload) => {
    try {
      const response = await apiClient.post("/customer/scheduled-payments", payload);
      return response.data;
    } catch (error) {
      const msg = extractApiErrorMessage(error);
      const err = new Error(msg);
      err.originalError = error;
      err.response = error.response;
      throw err;
    }
  },

  // POST /api/customer/scheduled-payments/{id}/cancel
  cancelScheduledPayment: async (id) => {
    try {
      const response = await apiClient.post(
        `/customer/scheduled-payments/${id}/cancel`
      );
      return response.data;
    } catch (error) {
      const msg = extractApiErrorMessage(error);
      const err = new Error(msg);
      err.originalError = error;
      err.response = error.response;
      throw err;
    }
  },
};

export default scheduledPaymentsService;