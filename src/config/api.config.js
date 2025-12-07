// API Configuration
export const API_CONFIG = {
    // Base URLs
    BASE_URL: 'https://treegar-accounts-api.treegar.com:8443/api',
    WEBSOCKET_URL: 'wss://api.treegarx.com',
    
    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 seconds
    UPLOAD_TIMEOUT: 120000, // 2 minutes for file uploads
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    
    // Cache configuration
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    CACHE_TIME: 10 * 60 * 1000, // 10 minutes
    
    // Headers
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    
    // File upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    
    // Real-time updates
    REFRESH_INTERVALS: {
      MARKET_DATA: 5000,    // 5 seconds
      PORTFOLIO: 30000,     // 30 seconds  
      NOTIFICATIONS: 60000, // 1 minute
    },
  };
  
  export default API_CONFIG;