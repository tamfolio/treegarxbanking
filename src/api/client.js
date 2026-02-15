import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

const redirectToLogin = () => {
  console.log('🔄 Redirecting to login due to authentication failure');
  
  // Clear all auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('userData');
  
  // Only redirect if not already on login page
  if (window.location.pathname !== '/login') {
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
  }
};

// Function to check if 401 is from payout validation vs token expiry
const isPayoutValidationError = (error) => {
  const requestUrl = error.config?.url || '';
  const requestData = error.config?.data;
  const errorData = error.response?.data;
  
  console.log('🔍 Analyzing 401 error:', {
    url: requestUrl,
    hasOtpInRequest: requestData?.includes('otpCode') || requestData?.includes('pin'),
    errorData: errorData
  });
  
  // Check if request URL indicates payout/transfer operations
  const payoutEndpoints = [
    '/customer/transfers/payout',
    '/customer/transfers/payout/bulk', 
    '/customer/transfers/p2p',
    '/customer/transfers/queue/',  // for approvals
  ];
  
  const isPayoutRequest = payoutEndpoints.some(endpoint => 
    requestUrl.includes(endpoint)
  );
  
  // Check if request contains OTP/PIN data (indicates validation attempt)
  const hasOtpPinData = requestData && (
    requestData.includes('otpCode') || 
    requestData.includes('otpChallengeId') ||
    requestData.includes('"pin"')
  );
  
  // Check error response for validation-specific messages
  const errorMessage = JSON.stringify(errorData || {}).toLowerCase();
  const validationKeywords = [
    'pin', 'otp', 'invalid', 'incorrect', 'expired', 
    'challenge', 'verification', 'code'
  ];
  
  const hasValidationKeywords = validationKeywords.some(keyword => 
    errorMessage.includes(keyword)
  );
  
  const isValidationError = isPayoutRequest && (hasOtpPinData || hasValidationKeywords);
  
  console.log('📊 Validation error analysis:', {
    isPayoutRequest,
    hasOtpPinData, 
    hasValidationKeywords,
    isValidationError
  });
  
  return isValidationError;
};

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env?.MODE === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        hasOtpPin: config.data && (
          JSON.stringify(config.data).includes('otpCode') || 
          JSON.stringify(config.data).includes('pin')
        )
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env?.MODE === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log errors in development
    if (import.meta.env?.MODE === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Check if this is a payout validation error vs token expiry
      if (isPayoutValidationError(error)) {
        console.log('❌ Detected payout validation error - NOT attempting token refresh');
        return Promise.reject(error);
      }
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      // If no refresh token, immediately redirect
      if (!refreshToken) {
        console.log('❌ No refresh token available - redirecting to login');
        redirectToLogin();
        return Promise.reject(error);
      }
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log('🔄 Token refresh in progress, queueing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      // Mark as retried to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('🔄 Attempting token refresh for expired token');
        const response = await axios.post(`${API_CONFIG.BASE_URL}/customer/auth/refresh`, {
          refreshToken,
        });
        
        if (response.data.success) {
          const { token, expiresAt } = response.data.data;
          
          // Update stored tokens
          localStorage.setItem('authToken', token);
          if (expiresAt) {
            localStorage.setItem('tokenExpiresAt', expiresAt);
          }
          
          console.log('✅ Token refreshed successfully');
          
          // Process queued requests
          processQueue(null, token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
          
        } else {
          throw new Error('Token refresh failed - invalid response');
        }
        
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        
        // Redirect to login
        redirectToLogin();
        
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('❌ Access forbidden - insufficient permissions');
    }
    
    // Handle 500+ Server Errors
    if (error.response?.status >= 500) {
      console.error('❌ Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;