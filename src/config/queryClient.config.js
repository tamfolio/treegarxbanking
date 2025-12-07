import { QueryClient } from '@tanstack/react-query';
import API_CONFIG from './api.config';

// Default options for all queries
const defaultQueryOptions = {
  staleTime: API_CONFIG.STALE_TIME,
  cacheTime: API_CONFIG.CACHE_TIME,
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors (client errors)
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }
    // Retry up to 3 times for other errors
    return failureCount < API_CONFIG.MAX_RETRIES;
  },
  retryDelay: (attemptIndex) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * 2 ** attemptIndex, 30000);
  },
};

// Default options for all mutations
const defaultMutationOptions = {
  retry: (failureCount, error) => {
    // Don't retry mutations on 4xx errors
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }
    // Only retry once for mutations
    return failureCount < 1;
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
});

// Query invalidation patterns
export const QUERY_PATTERNS = {
  // Invalidate all user-related queries
  invalidateUser: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  
  // Invalidate all auth-related queries
  invalidateAuth: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
  
  // Invalidate all trading-related queries
  invalidateTrading: () => queryClient.invalidateQueries({ queryKey: ['trading'] }),
  
  // Invalidate all market data
  invalidateMarketData: () => queryClient.invalidateQueries({ queryKey: ['market'] }),
  
  // Clear all cached data (use on logout)
  clearAll: () => queryClient.clear(),
  
  // Remove specific queries
  removeQueries: (queryKey) => queryClient.removeQueries({ queryKey }),
};

// Background sync configuration
export const BACKGROUND_SYNC = {
  // Refetch market data every 5 seconds when window is focused
  MARKET_DATA: {
    refetchInterval: API_CONFIG.REFRESH_INTERVALS.MARKET_DATA,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  },
  
  // Refetch portfolio every 30 seconds
  PORTFOLIO: {
    refetchInterval: API_CONFIG.REFRESH_INTERVALS.PORTFOLIO,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  },
  
  // Refetch notifications every minute
  NOTIFICATIONS: {
    refetchInterval: API_CONFIG.REFRESH_INTERVALS.NOTIFICATIONS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  },
  
  // User data - only refetch on focus
  USER_DATA: {
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  },
};

export default queryClient;