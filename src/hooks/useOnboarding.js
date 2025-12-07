import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService } from '../api/services/onboardingService';
import { toast } from 'react-hot-toast';

// Query Keys
export const ONBOARDING_QUERY_KEYS = {
  REQUIREMENTS: (customerType) => ['onboarding', 'requirements', customerType],
  VERIFICATION: (type) => ['onboarding', 'verification', type],
};

// Get dynamic onboarding requirements
export const useOnboardingRequirements = (customerType, options = {}) => {
  return useQuery({
    queryKey: ONBOARDING_QUERY_KEYS.REQUIREMENTS(customerType),
    queryFn: () => onboardingService.getRequirements(customerType),
    enabled: !!customerType, // Only run when customerType is provided
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};

// Submit individual onboarding
export const useIndividualOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onboardingService.submitIndividualOnboarding,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Individual account created successfully!');
        // Invalidate any relevant queries
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else {
        toast.error(data.message || 'Failed to create account');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Submit business onboarding
export const useBusinessOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onboardingService.submitBusinessOnboarding,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Business account created successfully!');
        // Invalidate any relevant queries
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else {
        toast.error(data.message || 'Failed to create account');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Upload document
export const useDocumentUpload = () => {
  return useMutation({
    mutationFn: onboardingService.uploadDocument,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Document uploaded successfully!');
      } else {
        toast.error(data.message || 'Failed to upload document');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to upload document. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// BVN Verification
export const useBVNVerification = () => {
  return useMutation({
    mutationFn: onboardingService.verifyBVN,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('BVN verified successfully!');
      } else {
        toast.error(data.message || 'BVN verification failed');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'BVN verification failed. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// NIN Verification
export const useNINVerification = () => {
  return useMutation({
    mutationFn: onboardingService.verifyNIN,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('NIN verified successfully!');
      } else {
        toast.error(data.message || 'NIN verification failed');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'NIN verification failed. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// RC Number Verification
export const useRCVerification = () => {
  return useMutation({
    mutationFn: onboardingService.verifyRCNumber,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('RC Number verified successfully!');
      } else {
        toast.error(data.message || 'RC Number verification failed');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'RC Number verification failed. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Liveness Check Start
export const useLivenessStart = () => {
  return useMutation({
    mutationFn: onboardingService.startLivenessCheck,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Liveness check started');
      } else {
        toast.error(data.message || 'Failed to start liveness check');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to start liveness check. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Liveness Check Complete
export const useLivenessComplete = () => {
  return useMutation({
    mutationFn: onboardingService.completeLivenessCheck,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Liveness check completed successfully!');
      } else {
        toast.error(data.message || 'Liveness check failed');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Liveness check failed. Please try again.';
      toast.error(errorMessage);
    },
  });
};

// Combined hook for all verification types
export const useVerification = (verificationType) => {
  switch (verificationType) {
    case 'bvn':
      return useBVNVerification();
    case 'nin':
      return useNINVerification();
    case 'rc_number':
      return useRCVerification();
    case 'liveness':
      return {
        start: useLivenessStart(),
        complete: useLivenessComplete(),
      };
    default:
      throw new Error(`Unknown verification type: ${verificationType}`);
  }
};