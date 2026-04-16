import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import accountsService from "../services/accountsService";

// Hook for fetching all accounts
export const useAccounts = (options = {}) => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: accountsService.getAccounts,
    staleTime: 5 * 60 * 1000,   // 5 minutes
    cacheTime: 15 * 60 * 1000,  // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for fetching available providers
export const useAccountProviders = (options = {}) => {
  return useQuery({
    queryKey: ["account-providers"],
    queryFn: accountsService.getProviders,
    staleTime: 10 * 60 * 1000,  // 10 minutes
    cacheTime: 30 * 60 * 1000,  // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for provisioning a new account
export const useProvisionAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId) => accountsService.provisionAccount(providerId),
    onSuccess: () => {
      // Refresh both accounts and providers after provisioning
      queryClient.invalidateQueries(["accounts"]);
      queryClient.invalidateQueries(["account-providers"]);
    },
  });
};

export default useAccounts;