import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pinService } from '../services/pinService';
import { toast } from 'react-hot-toast';

// Hook for setting PIN
export const useSetPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pinData) => {
      console.log('📤 Set PIN Request:', { pin: '****', confirmPin: '****' });
      return await pinService.setPin(pinData);
    },
    onSuccess: (data) => {
      console.log('✅ PIN Set Response:', data);
      
      if (data.success) {
        toast.success(data.message || 'PIN set successfully!');
        
        // Invalidate profile query to refresh pinSet status
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else {
        // Handle API success: false case
        const errorMessage = data.message || 'Failed to set PIN';
        toast.error(errorMessage);
        console.error('❌ PIN setup failed:', data.errors || errorMessage);
      }
    },
    onError: (error) => {
      console.error('❌ Set PIN Error:', error);
      
      // Extract error message from different possible structures
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.message ||
        error.message || 
        'Failed to set PIN. Please try again.';
      
      // Show specific error details if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const detailedErrors = error.response.data.errors.map(err => err.message || err).join(', ');
        toast.error(`PIN setup failed: ${detailedErrors}`);
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

// Hook for changing PIN (for future use)
export const useChangePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pinData) => {
      console.log('📤 Change PIN Request:', { 
        currentPin: '****', 
        newPin: '****', 
        confirmPin: '****' 
      });
      return await pinService.changePin(pinData);
    },
    onSuccess: (data) => {
      console.log('✅ PIN Changed Response:', data);
      
      if (data.success) {
        toast.success(data.message || 'PIN changed successfully!');
        
        // Invalidate profile query to refresh PIN status
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else {
        const errorMessage = data.message || 'Failed to change PIN';
        toast.error(errorMessage);
        console.error('❌ PIN change failed:', data.errors || errorMessage);
      }
    },
    onError: (error) => {
      console.error('❌ Change PIN Error:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.message ||
        error.message || 
        'Failed to change PIN. Please try again.';
      
      toast.error(errorMessage);

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

// Hook for verifying PIN (for future use)
export const useVerifyPin = () => {
  return useMutation({
    mutationFn: async (pin) => {
      console.log('📤 Verify PIN Request:', { pin: '****' });
      return await pinService.verifyPin(pin);
    },
    onSuccess: (data) => {
      console.log('✅ PIN Verification Response:', data);
      
      if (data.success) {
        toast.success(data.message || 'PIN verified successfully!');
      } else {
        const errorMessage = data.message || 'PIN verification failed';
        toast.error(errorMessage);
        console.error('❌ PIN verification failed:', data.errors || errorMessage);
      }
    },
    onError: (error) => {
      console.error('❌ Verify PIN Error:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.message ||
        error.message || 
        'PIN verification failed. Please try again.';
      
      toast.error(errorMessage);

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

export default useSetPin;