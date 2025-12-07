import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Forgot Password Hook
export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (email) => {
      const payload = { email };
      
      console.log('📤 Forgot Password Payload:', payload);
      
      const response = await apiClient.post('/customer/auth/forgot-password', payload);
      return response.data;
    },
    onSuccess: (data, email) => {
      console.log('✅ Forgot Password Response:', data);
      
      if (data.success) {
        // Store email for reset password flow
        sessionStorage.setItem('resetEmail', email);
        
        toast.success(data.message || 'Reset instructions sent to your email');
        
        // Navigate to reset password page
        navigate('/resetpassword');
      } else {
        toast.error(data.message || 'Failed to send reset instructions');
      }
    },
    onError: (error) => {
      console.error('❌ Forgot Password Error:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.message ||
        error.message || 
        'Failed to send reset instructions. Please try again.';
      
      toast.error(errorMessage);
      
      // Log detailed error for debugging
      if (error.response) {
        console.error('Error Response:', {
          status: error.response.status,
          data: error.response.data,
        });
      }
    },
  });
};

// Reset Password Hook
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, resetToken, newPassword }) => {
      const payload = {
        email,
        resetToken,
        newPassword,
      };
      
      console.log('📤 Reset Password Payload:', payload);
      
      const response = await apiClient.post('/customer/auth/reset-password', payload);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ Reset Password Response:', data);
      
      if (data.success) {
        // Clear stored email
        sessionStorage.removeItem('resetEmail');
        
        toast.success(data.message || 'Password reset successfully!');
        
        // Navigate to login with success message
        navigate('/login', {
          state: {
            message: 'Password reset successful! Please sign in with your new password.',
            type: 'success'
          }
        });
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    },
    onError: (error) => {
      console.error('❌ Reset Password Error:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.message ||
        error.message || 
        'Failed to reset password. Please try again.';
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        toast.error('Invalid or expired reset code. Please try again.');
      } else if (error.response?.status === 404) {
        toast.error('Reset code not found. Please request a new one.');
      } else {
        toast.error(errorMessage);
      }
      
      // Log detailed error for debugging
      if (error.response) {
        console.error('Error Response:', {
          status: error.response.status,
          data: error.response.data,
        });
      }
    },
  });
};

export { useForgotPassword as default };