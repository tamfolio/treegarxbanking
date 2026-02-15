import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import approvalsService from "../services/approvalsService";

// Fetch transaction queue
export const useTransactionQueue = (options = {}) => {
  return useQuery({
    queryKey: ["transaction-queue"],
    queryFn: approvalsService.getTransactionQueue,
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for queue
    cacheTime: 2 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    ...options,
  });
};

// Fetch business users
export const useBusinessUsers = (options = {}) => {
  return useQuery({
    queryKey: ["business-users"],
    queryFn: approvalsService.getBusinessUsers,
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Create checker
export const useCreateChecker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approvalsService.createChecker,
    onSuccess: () => {
      // Refresh list after creation
      queryClient.invalidateQueries(["business-users"]);
    },
  });
};

// Approve transaction
export const useApproveTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, otpCode, otpChallengeId }) =>
      approvalsService.approveTransaction(transactionId, otpCode, otpChallengeId),
    onSuccess: () => {
      // Refresh transaction queue after approval
      queryClient.invalidateQueries(["transaction-queue"]);
    },
  });
};

// Reject transaction
export const useRejectTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, reason }) =>
      approvalsService.rejectTransaction(transactionId, reason),
    onSuccess: () => {
      // Refresh transaction queue after rejection
      queryClient.invalidateQueries(["transaction-queue"]);
    },
  });
};

// Request approval OTP
export const useRequestApprovalOtp = () => {
  return useMutation({
    mutationFn: (purpose = "ApproveTransfer") =>
      approvalsService.requestApprovalOtp(purpose),
  });
};