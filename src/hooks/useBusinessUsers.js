import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import approvalsService from "../services/approvalsService";

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
