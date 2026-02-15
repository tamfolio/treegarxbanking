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
  
  return {
    profile: data?.success ? data.data : null,
    isLoading,
    error,
    // Convenience getters
    firstName: data?.success ? data.data?.firstName : null,
    lastName: data?.success ? data.data?.lastName : null,
    businessName: data?.success ? data.data?.businessName : null,
    email: data?.success ? data.data?.email : null,
    code: data?.success ? data.data?.code : null,
    walletBalance: data?.success ? data.data?.walletBalance : 0,
    customerTypeCode: data?.success ? data.data?.customerTypeCode : null,
    customerType: data?.success ? data.data?.customerTypeName : null,
    kycStatus: data?.success ? data.data?.kycStatus : null,
    onboardingStatus: data?.success ? data.data?.onboardingStatus : null,
    verifications: data?.success ? data.data?.verifications || [] : [],
    documents: data?.success ? data.data?.documents || [] : [],
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