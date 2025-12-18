import apiClient from "../api/client";

// PIN API service
export const pinService = {
  // Set PIN
  setPin: async (pinData) => {
    const response = await apiClient.post("/customer/auth/pin/set", {
      pin: pinData.pin,
      confirmPin: pinData.confirmPin,
    });
    return response.data;
  },

  // Change PIN (for future use)
  changePin: async (pinData) => {
    const response = await apiClient.post("/customer/auth/pin/change", {
      currentPin: pinData.currentPin,
      newPin: pinData.newPin,
      confirmPin: pinData.confirmPin,
    });
    return response.data;
  },

  // Verify PIN (for future use)
  verifyPin: async (pin) => {
    const response = await apiClient.post("/customer/auth/pin/verify", {
      pin: pin,
    });
    return response.data;
  },
};

export default pinService;