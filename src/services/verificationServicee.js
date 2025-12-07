import apiClient from '../api/client';

// Verification API service
export const verificationService = {
  // Individual KYC verification
  submitIndividualKYC: async (data) => {
    try {
      const response = await apiClient.post('/onboarding/individual/kyc', data);
      return response.data;
    } catch (error) {
      console.error('Individual KYC submission failed:', error);
      throw error;
    }
  },

  // Business KYC verification
  submitBusinessKYC: async (data) => {
    try {
      const response = await apiClient.post('/onboarding/business/kyc', data);
      return response.data;
    } catch (error) {
      console.error('Business KYC submission failed:', error);
      throw error;
    }
  },

  // Document upload
  uploadDocument: async (customerId, documentData) => {
    try {
      const formData = new FormData();
      
      // Add document fields
      Object.keys(documentData).forEach(key => {
        if (documentData[key] !== undefined && documentData[key] !== null) {
          formData.append(key, documentData[key]);
        }
      });

      const response = await apiClient.post(`/customer/documents/${customerId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  },
};

export default verificationService;