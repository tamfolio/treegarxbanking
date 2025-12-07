// services/statementService.js
import apiClient from '../api/client';

export const statementService = {
  sendStatementToEmail: async ({ startDate, endDate, export: exportType = 'pdf' }) => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        export: exportType,
      }).toString();

      const response = await apiClient.get(
        `/customer/transfers/statement?${params}`
      );

      return {
        success: response.status === 200,
        data: response.data,
      };
    } catch (error) {
      console.error('Statement request failed:', error);
      throw error;
    }
  },
};

export default statementService;
