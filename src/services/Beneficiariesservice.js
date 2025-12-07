import apiClient from '../api/client';

// Beneficiaries API service
export const beneficiariesService = {
  // Get all beneficiaries with optional filtering
  getBeneficiaries: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to params if they exist
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/customer/beneficiaries?${queryString}` : '/customer/beneficiaries';
    
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get beneficiary groups for bulk category
  getBeneficiaryGroups: async (category = 'Bulk') => {
    const response = await apiClient.get(`/customer/beneficiaries?category=${category}`);
    return response.data;
  },

  // Delete beneficiary
  deleteBeneficiary: async (beneficiaryId) => {
    const response = await apiClient.delete(`/customer/beneficiaries/${beneficiaryId}`);
    return response.data;
  },

  // Update beneficiary (if API supports it)
  updateBeneficiary: async (beneficiaryId, beneficiaryData) => {
    const response = await apiClient.put(`/customer/beneficiaries/${beneficiaryId}`, beneficiaryData);
    return response.data;
  },
};

export default beneficiariesService;