import apiClient from '../api/client';

// Extract the real API error message from Axios errors
const extractErrorMessage = (error, fallback = 'An error occurred') => {
  if (error.response) {
    const data = error.response.data;
    // Try common API error shapes - adjust these to match your backend's response format
    return (
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      data?.errors?.[0] ||
      data?.detail ||
      `${fallback} (${error.response.status})`
    );
  }
  if (error.request) {
    return 'Network error - no response from server';
  }
  return error.message || fallback;
};

export const verificationService = {
  submitIndividualKYC: async (data) => {
    try {
      const response = await apiClient.post('/onboarding/individual/kyc', data);
      // Your API might wrap in a success flag already - return as-is if so
      return { success: true, ...response.data };
    } catch (error) {
      console.error('Individual KYC failed:', {
        status: error.response?.status,
        apiError: error.response?.data,   // <-- log this to see exact shape
        message: error.message,
      });
      // Return structured failure instead of throwing
      return {
        success: false,
        message: extractErrorMessage(error, 'BVN/NIN verification failed'),
      };
    }
  },

  submitBusinessKYC: async (data) => {
    try {
      const response = await apiClient.post('/onboarding/business/kyc', data);
      return { success: true, ...response.data };
    } catch (error) {
      console.error('Business KYC failed:', {
        status: error.response?.status,
        apiError: error.response?.data,   // <-- log this to see exact shape
        message: error.message,
      });
      return {
        success: false,
        message: extractErrorMessage(error, 'BVN/NIN verification failed'),
      };
    }
  },

  uploadDocument: async (customerId, documentData) => {
    try {
      const formData = new FormData();
      Object.keys(documentData).forEach(key => {
        if (documentData[key] !== undefined && documentData[key] !== null) {
          formData.append(key, documentData[key]);
        }
      });

      const response = await apiClient.post(`/customer/documents/${customerId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, ...response.data };
    } catch (error) {
      console.error('Document upload failed:', {
        status: error.response?.status,
        apiError: error.response?.data,
      });
      return {
        success: false,
        message: extractErrorMessage(error, 'Document upload failed'),
      };
    }
  },
};

export default verificationService;