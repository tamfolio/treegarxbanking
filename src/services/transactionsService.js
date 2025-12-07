import apiClient from '../api/client';

// Transactions API service
export const transactionsService = {
  // Get transactions with filters
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to params if they exist
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await apiClient.get(`/customer/transfers/transactions?${params.toString()}`);
    return response.data;
  },

  // Get banks list
  getBanks: async () => {
    const response = await apiClient.get('/customer/transfers/banks');
    return response.data;
  },

  // Get products list
  getProducts: async () => {
    const response = await apiClient.get('/customer/transfers/products');
    return response.data;
  },

  // Resolve account details
  resolveAccount: async (bankId, accountNumber) => {
    const response = await apiClient.post('/customer/transfers/resolve-account', {
      bankId: parseInt(bankId),
      accountNumber: accountNumber
    });
    return response.data;
  },

  // Make payout
  payout: async (payoutData) => {
    const response = await apiClient.post('/customer/transfers/payout', {
      bankId: parseInt(payoutData.bankId),
      amount: parseFloat(payoutData.amount),
      narration: payoutData.narration,
      accountNumber: payoutData.accountNumber,
      beneficiaryName: payoutData.beneficiaryName,
      saveBeneficiary: payoutData.saveBeneficiary || false
    });
    return response.data;
  },

  // Make bulk payout
  bulkPayout: async (bulkPayoutData) => {
    const response = await apiClient.post('/customer/transfers/payout/bulk', {
      groupKey: bulkPayoutData.groupKey,
      items: bulkPayoutData.items.map(item => ({
        bankId: parseInt(item.bankId),
        amount: parseFloat(item.amount),
        narration: item.narration,
        accountNumber: item.accountNumber,
        beneficiaryName: item.beneficiaryName,
        saveBeneficiary: item.saveBeneficiary || true
      }))
    });
    return response.data;
  },
};

export default transactionsService;