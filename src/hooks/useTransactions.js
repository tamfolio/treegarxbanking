import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transactionsService from '../services/transactionsService';

// Hook for fetching transactions with filters
export const useTransactions = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsService.getTransactions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for fetching banks
export const useBanks = (options = {}) => {
  return useQuery({
    queryKey: ['banks'],
    queryFn: transactionsService.getBanks,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for fetching products
export const useProducts = (options = {}) => {
  return useQuery({
    queryKey: ['products'],
    queryFn: transactionsService.getProducts,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for resolving account details
export const useResolveAccount = () => {
  return useMutation({
    mutationFn: ({ bankId, accountNumber }) =>
      transactionsService.resolveAccount(bankId, accountNumber),
  });
};

// Hook for resolving customer by tag/code
export const useResolveCustomer = () => {
  return useMutation({
    mutationFn: ({ identifier }) =>
      transactionsService.resolveCustomer(identifier),
  });
};

// Hook for P2P transfer (Tag Pay)
export const useTagPay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsService.tagPay,
    onSuccess: () => {
      // Invalidate transactions query to refresh the list
      queryClient.invalidateQueries(['transactions']);
      // Invalidate profile to refresh balance
      queryClient.invalidateQueries(['profile']);
    },
  });
};

// Hook for payout
export const usePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsService.payout,
    onSuccess: () => {
      // Invalidate transactions query to refresh the list
      queryClient.invalidateQueries(['transactions']);
      // Invalidate profile to refresh balance
      queryClient.invalidateQueries(['profile']);
    },
  });
};

// Hook for bulk payout
export const useBulkPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsService.bulkPayout,
    onSuccess: () => {
      // Invalidate transactions query to refresh the list
      queryClient.invalidateQueries(['transactions']);
      // Invalidate profile to refresh balance
      queryClient.invalidateQueries(['profile']);
    },
  });
};

export default useTransactions;