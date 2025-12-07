import { useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingService } from '../api/services/onboardingService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Simplified individual onboarding with basic fields only
export const useSimpleIndividualOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      // Basic payload structure for individual onboarding
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined, // Send undefined if empty
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      // Remove undefined values to clean up the payload
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
      );

      console.log('📤 Individual Onboarding Payload:', cleanPayload);
      
      return await onboardingService.submitIndividualOnboarding(cleanPayload);
    },
    onSuccess: (data) => {
      console.log('✅ Individual Onboarding Response:', data);
      
      if (data.success) {
        toast.success(data.message || 'Individual account created successfully!');
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        
        // Navigate to login with success message
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please sign in.',
            type: 'success'
          }
        });
      } else {
        // Handle API success: false case
        const errorMessage = data.message || 'Failed to create account';
        toast.error(errorMessage);
        console.error('❌ Onboarding failed:', data.errors || errorMessage);
      }
    },
    onError: (error) => {
      console.error('❌ Individual Onboarding Error:', error);
      
      // Extract error message from different possible structures
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.message ||
        error.message || 
        'Failed to create account. Please try again.';
      
      // Show specific error details if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const detailedErrors = error.response.data.errors.map(err => err.message || err).join(', ');
        toast.error(`Registration failed: ${detailedErrors}`);
      } else {
        toast.error(errorMessage);
      }

      // Log detailed error for debugging
      if (error.response) {
        console.error('Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
    },
  });
};

export default useSimpleIndividualOnboarding;