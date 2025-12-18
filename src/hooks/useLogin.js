import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Token management utilities
const tokenManager = {
  setTokens: (tokens) => {
    if (tokens.token) {
      localStorage.setItem('authToken', tokens.token);
    }
    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    if (tokens.expiresAt) {
      localStorage.setItem('tokenExpiresAt', tokens.expiresAt);
    }
  },
  clearTokens: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('userData');
  }
};

// Login hook for authentication
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      // Login payload structure
      const payload = {
        email: credentials.email,
        password: credentials.password,
      };

      console.log('📤 Login Payload:', payload);
      
      const response = await apiClient.post('customer/auth/login', payload);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ Login Response:', data);
      
      if (data.success) {
        const userData = data.data;
        
        // Check if email verification is required
        if (data.message && data.message.includes('Email verification required')) {
          // Store just the email for verification page
          const emailVerificationData = {
            email: userData.email,
            expiresAt: userData.expiresAt,
            nextSendAt: userData.nextSendAt
          };
          localStorage.setItem('tempEmailVerificationData', JSON.stringify(emailVerificationData));
          
          navigate('/email-verification', { 
            state: emailVerificationData
          });
          
          toast.success('OTP sent to your email for verification');
          return;
        }
        
        // Check if 2FA is required
        if (userData.requiresTwoFactor) {
          // Store temporary data for OTP verification
          sessionStorage.setItem('tempUserData', JSON.stringify(userData));
          sessionStorage.setItem('twoFactorChallengeId', userData.twoFactorChallengeId);
          
          navigate('/verify-otp', { 
            state: { 
              email: userData.emailAddress,
              challengeId: userData.twoFactorChallengeId,
              deliveryChannel: userData.twoFactorDeliveryChannel 
            }
          });
          
          toast.success(`OTP sent to your ${userData.twoFactorDeliveryChannel.toLowerCase()}`);
        } else {
          // Normal login success - store tokens and user data
          tokenManager.setTokens({
            token: userData.token,
            refreshToken: userData.refreshToken,
            expiresAt: userData.expiresAt,
          });
          
          // Store user data
          localStorage.setItem('userData', JSON.stringify(userData));
          
          // Invalidate and refetch user data
          queryClient.invalidateQueries({ queryKey: ['auth'] });
          
          navigate('/dashboard');
          toast.success('Login successful');
        }
      } else {
        // Handle API success: false case
        const errorMessage = data.message || 'Login failed';
        toast.error(errorMessage);
        console.error('❌ Login failed:', data.errors || errorMessage);
      }
    },
    onError: (error) => {
      console.error('❌ Login Error:', error);
      
      // Extract error message from different possible structures
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.message ||
        error.message || 
        'Login failed. Please try again.';
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      } else if (error.response?.status === 423) {
        toast.error('Account is locked. Please contact support.');
      } else if (error.response?.status === 429) {
        toast.error('Too many login attempts. Please try again later.');
      } else {
        // Show specific error details if available
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const detailedErrors = error.response.data.errors.map(err => err.message || err).join(', ');
          toast.error(`Login failed: ${detailedErrors}`);
        } else {
          toast.error(errorMessage);
        }
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

export default useLogin;