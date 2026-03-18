import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import scheduledPaymentsService from "../services/scheduledPaymentsService";

export const useScheduledPayments = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ["scheduled-payments", filters],
    queryFn: () => scheduledPaymentsService.getScheduledPayments(filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useScheduledPayment = (id, options = {}) => {
  return useQuery({
    queryKey: ["scheduled-payment", id],
    queryFn: () => scheduledPaymentsService.getScheduledPayment(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCreateScheduledPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduledPaymentsService.createScheduledPayment,
    onSuccess: () => {
      queryClient.invalidateQueries(["scheduled-payments"]);
    },
  });
};

export const useCreateBulkScheduledPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduledPaymentsService.createBulkScheduledPayment,
    onSuccess: () => {
      queryClient.invalidateQueries(["scheduled-payments"]);
    },
  });
};

export const useCreateBulkP2PScheduledPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduledPaymentsService.createBulkP2PScheduledPayment,
    onSuccess: () => {
      queryClient.invalidateQueries(["scheduled-payments"]);
    },
  });
};

export const useCancelScheduledPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => scheduledPaymentsService.cancelScheduledPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["scheduled-payments"]);
    },
  });
};