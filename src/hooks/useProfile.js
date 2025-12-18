import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

// Profile API service
export const profileService = {
  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/customer/auth/profile');
    return response.data;
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