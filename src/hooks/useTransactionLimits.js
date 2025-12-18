import { useQuery } from '@tanstack/react-query';
import { transactionLimitsService } from '../services/transactionLimitsService';

// Hook for fetching daily transaction limits
export const useTransactionLimits = (options = {}) => {
  return useQuery({
    queryKey: ['transaction-limits', 'daily'],
    queryFn: transactionLimitsService.getDailyLimits,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useTransactionLimits;