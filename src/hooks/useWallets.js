// src/hooks/useWallets.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import walletsService from "../services/walletsService";

export const useWallets = (options = {}) => {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: walletsService.getWallets,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCreateSubWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletsService.createSubWallet,
    onSuccess: () => {
      queryClient.invalidateQueries(["wallets"]);
    },
  });
};

export const useWalletTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: walletsService.walletTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries(["wallets"]);
    },
  });
};