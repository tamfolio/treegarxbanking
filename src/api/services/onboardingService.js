import apiClient from '../client';

// Onboarding Service
export const onboardingService = {
  // Get dynamic requirements based on customer type
  getRequirements: async (customerType) => {
    const response = await apiClient.get(`/onboarding/requirements?customerType=${customerType}`);
    return response.data;
  },

  // Submit individual onboarding
  submitIndividualOnboarding: async (onboardingData) => {
    const response = await apiClient.post('/onboarding/individual', onboardingData);
    return response.data;
  },

  // Submit business onboarding
  submitBusinessOnboarding: async (onboardingData) => {
    const response = await apiClient.post('/onboarding/business', onboardingData);
    return response.data;
  },

  // Upload document for onboarding
  uploadDocument: async (documentData) => {
    const formData = new FormData();
    formData.append('file', documentData.file);
    formData.append('documentKey', documentData.documentKey);
    formData.append('customerType', documentData.customerType);
    
    const response = await apiClient.post('/onboarding/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Verify BVN
  verifyBVN: async (bvnData) => {
    const response = await apiClient.post('/onboarding/verify-bvn', bvnData);
    return response.data;
  },

  // Verify NIN
  verifyNIN: async (ninData) => {
    const response = await apiClient.post('/onboarding/verify-nin', ninData);
    return response.data;
  },

  // Verify RC Number
  verifyRCNumber: async (rcData) => {
    const response = await apiClient.post('/onboarding/verify-rc', rcData);
    return response.data;
  },

  // Start liveness check
  startLivenessCheck: async (customerData) => {
    const response = await apiClient.post('/onboarding/start-liveness', customerData);
    return response.data;
  },

  // Complete liveness check
  completeLivenessCheck: async (livenessData) => {
    const response = await apiClient.post('/onboarding/complete-liveness', livenessData);
    return response.data;
  },
};