import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import beneficiariesService from '../services/Beneficiariesservice';

// Hook for fetching beneficiaries with filters
export const useBeneficiaries = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['beneficiaries', filters],
    queryFn: () => beneficiariesService.getBeneficiaries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for fetching beneficiary groups
export const useBeneficiaryGroups = (category = 'Bulk', options = {}) => {
  return useQuery({
    queryKey: ['beneficiaryGroups', category],
    queryFn: () => beneficiariesService.getBeneficiaryGroups(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: category === 'Bulk', // Only fetch for Bulk category
    ...options,
  });
};

// Hook for deleting beneficiary
export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: beneficiariesService.deleteBeneficiary,
    onSuccess: () => {
      // Invalidate beneficiaries queries to refresh the list
      queryClient.invalidateQueries(['beneficiaries']);
      queryClient.invalidateQueries(['beneficiaryGroups']);
    },
  });
};

// Hook for updating beneficiary
export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ beneficiaryId, data }) =>
      beneficiariesService.updateBeneficiary(beneficiaryId, data),
    onSuccess: () => {
      // Invalidate beneficiaries queries to refresh the list
      queryClient.invalidateQueries(['beneficiaries']);
    },
  });
};

export default useBeneficiaries;