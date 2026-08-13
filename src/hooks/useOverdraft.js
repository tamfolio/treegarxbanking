import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import overdraftService from "../services/overdraftService";

export const useOverdraftSummary = (options = {}) => {
  return useQuery({
    queryKey: ["overdraft-summary"],
    queryFn: overdraftService.getOverdraftSummary,
    staleTime: 1 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useApplicationStatus = (options = {}) => {
  return useQuery({
    queryKey: ["overdraft-application"],
    queryFn: overdraftService.getApplicationStatus,
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useInterestHistory = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ["overdraft-interest-history", filters],
    queryFn: () => overdraftService.getInterestHistory(filters),
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useBanner = (options = {}) => {
  return useQuery({
    queryKey: ["customer-banner"],
    queryFn: overdraftService.getBanner,
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useApplyOverdraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: overdraftService.applyForOverdraft,
    onSuccess: () => {
      queryClient.invalidateQueries(["overdraft-application"]);
    },
  });
};

export const useDrawOverdraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: overdraftService.drawOverdraft,
    onSuccess: () => {
      queryClient.invalidateQueries(["overdraft-summary"]);
      queryClient.invalidateQueries(["overdraft-interest-history"]);
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["profile"]);
    },
  });
};

export const useRepayOverdraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: overdraftService.repayOverdraft,
    onSuccess: () => {
      queryClient.invalidateQueries(["overdraft-summary"]);
      queryClient.invalidateQueries(["overdraft-interest-history"]);
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["profile"]);
    },
  });
};