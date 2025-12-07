// Authentication endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  };
  
  // User management endpoints
  export const USER_ENDPOINTS = {
    GET_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    GET_PREFERENCES: '/user/preferences',
    UPDATE_PREFERENCES: '/user/preferences',
    GET_SECURITY_SETTINGS: '/user/security',
    UPDATE_SECURITY_SETTINGS: '/user/security',
    DELETE_ACCOUNT: '/user/delete',
  };
  
  // Trading endpoints
  export const TRADING_ENDPOINTS = {
    GET_PORTFOLIO: '/trading/portfolio',
    GET_POSITIONS: '/trading/positions',
    GET_ORDERS: '/trading/orders',
    CREATE_ORDER: '/trading/orders',
    CANCEL_ORDER: (orderId) => `/trading/orders/${orderId}/cancel`,
    GET_ORDER_HISTORY: '/trading/orders/history',
    GET_TRADE_HISTORY: '/trading/trades/history',
    GET_BALANCE: '/trading/balance',
    GET_WATCHLIST: '/trading/watchlist',
    ADD_TO_WATCHLIST: '/trading/watchlist',
    REMOVE_FROM_WATCHLIST: (symbol) => `/trading/watchlist/${symbol}`,
  };
  
  // Market data endpoints
  export const MARKET_ENDPOINTS = {
    GET_MARKET_DATA: '/market/data',
    GET_STOCK_QUOTE: (symbol) => `/market/quote/${symbol}`,
    GET_STOCK_CHART: (symbol) => `/market/chart/${symbol}`,
    GET_MARKET_NEWS: '/market/news',
    GET_TRENDING_STOCKS: '/market/trending',
    GET_GAINERS_LOSERS: '/market/movers',
    SEARCH_STOCKS: '/market/search',
    GET_MARKET_STATUS: '/market/status',
    GET_HISTORICAL_DATA: (symbol) => `/market/historical/${symbol}`,
  };
  
  // Analytics endpoints
  export const ANALYTICS_ENDPOINTS = {
    GET_PERFORMANCE: '/analytics/performance',
    GET_RISK_METRICS: '/analytics/risk',
    GET_REPORTS: '/analytics/reports',
    GENERATE_REPORT: '/analytics/reports/generate',
    GET_INSIGHTS: '/analytics/insights',
  };
  
  // Notification endpoints
  export const NOTIFICATION_ENDPOINTS = {
    GET_NOTIFICATIONS: '/notifications',
    MARK_READ: (notificationId) => `/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    GET_SETTINGS: '/notifications/settings',
    UPDATE_SETTINGS: '/notifications/settings',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe',
  };
  
  // Payment endpoints
  export const PAYMENT_ENDPOINTS = {
    GET_PAYMENT_METHODS: '/payments/methods',
    ADD_PAYMENT_METHOD: '/payments/methods',
    DELETE_PAYMENT_METHOD: (methodId) => `/payments/methods/${methodId}`,
    DEPOSIT_FUNDS: '/payments/deposit',
    WITHDRAW_FUNDS: '/payments/withdraw',
    GET_TRANSACTION_HISTORY: '/payments/transactions',
    GET_FEES: '/payments/fees',
  };
  
  // Admin endpoints (if applicable)
  export const ADMIN_ENDPOINTS = {
    GET_USERS: '/admin/users',
    GET_USER: (userId) => `/admin/users/${userId}`,
    UPDATE_USER: (userId) => `/admin/users/${userId}`,
    DELETE_USER: (userId) => `/admin/users/${userId}`,
    GET_SYSTEM_STATS: '/admin/stats',
    GET_AUDIT_LOGS: '/admin/audit',
  };
  
  // File upload endpoints
  export const UPLOAD_ENDPOINTS = {
    UPLOAD_DOCUMENT: '/upload/document',
    UPLOAD_IMAGE: '/upload/image',
    UPLOAD_AVATAR: '/upload/avatar',
  };