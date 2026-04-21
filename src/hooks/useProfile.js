import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

// Profile API service
export const profileService = {
  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/customer/auth/profile');
    return response.data;
  },

  // Change PIN
  changePIN: async (pinData) => {
    console.log("🔄 Changing PIN:", {
      oldPin: pinData.oldPin ? "***provided***" : "***missing***",
      newPin: pinData.newPin ? "***provided***" : "***missing***",
      confirmPin: pinData.confirmPin ? "***provided***" : "***missing***"
    });

    try {
      const response = await apiClient.post('/customer/auth/pin/change', {
        oldPin: pinData.oldPin,
        newPin: pinData.newPin,
        confirmPin: pinData.confirmPin
      });

      console.log("✅ PIN changed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ PIN change failed:", error);
      throw error;
    }
  },
};

// Custom hook for user profile with global caching
export const useProfile = (options = {}) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook to change PIN
export const useChangePIN = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileService.changePIN,
    onSuccess: () => {
      // Optionally refresh profile data after PIN change
      // queryClient.invalidateQueries(['profile']);
      console.log("PIN change successful - no profile refresh needed");
    },
  });
};

// Hook to get profile data without triggering a fetch (for components that just need the cached data)
export const useProfileData = () => {
  const { data, isLoading, error } = useProfile();
  const d = data?.success ? data.data : null;

  return {
    profile: d,
    isLoading,
    error,
    firstName: d?.firstName || null,
    lastName: d?.lastName || null,
    businessName: d?.businessName || null,
    email: d?.email || null,
    code: d?.code || null,
    walletBalance: d?.walletBalance || 0,
    customerTypeCode: d?.customerTypeCode || null,
    customerType: d?.customerTypeName || null,
    kycStatus: d?.kycStatus || null,
    onboardingStatus: d?.onboardingStatus || null,
    verifications: d?.verifications || [],
    documents: d?.documents || [],
    accounts: d?.accounts || [],       // 👈 added
    accountNumber: d?.accountNumber || null,  // 👈 added
  };
};

// Hook to refresh profile data
export const useRefreshProfile = () => {
  const { refetch } = useProfile({ enabled: false });
  
  return {
    refreshProfile: refetch,
  };
};

export default useProfile;