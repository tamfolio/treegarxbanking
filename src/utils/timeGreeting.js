// utils/timeGreeting.js

/**
 * Get greeting based on current time
 * @returns {string} - "Good morning", "Good afternoon", or "Good evening"
 */
export const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };
  
  /**
   * Get greeting with custom time thresholds
   * @param {Object} thresholds - Custom time boundaries
   * @returns {string} - Appropriate greeting
   */
  export const getCustomGreeting = (thresholds = {}) => {
    const {
      morningEnd = 12,    // Morning ends at 12 PM
      afternoonEnd = 17,  // Afternoon ends at 5 PM
      eveningEnd = 22     // Evening ends at 10 PM (after which it's night)
    } = thresholds;
    
    const hour = new Date().getHours();
    
    if (hour < morningEnd) {
      return "Good morning";
    } else if (hour < afternoonEnd) {
      return "Good afternoon";
    } else if (hour < eveningEnd) {
      return "Good evening";
    } else {
      return "Good night";
    }
  };
  
  /**
   * Get greeting for specific timezone
   * @param {string} timeZone - IANA timezone string (e.g., 'Africa/Lagos')
   * @returns {string} - Appropriate greeting for that timezone
   */
  export const getTimezoneGreeting = (timeZone = 'Africa/Lagos') => {
    const now = new Date();
    const hour = parseInt(now.toLocaleString('en-US', { 
      timeZone, 
      hour12: false,
      hour: '2-digit' 
    }));
    
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };
  
  /**
   * React hook for dynamic greeting with auto-refresh
   * @param {number} refreshInterval - How often to update (in minutes)
   * @returns {string} - Current greeting
   */
  import { useState, useEffect } from 'react';
  
  export const useTimeGreeting = (refreshInterval = 30) => {
    const [greeting, setGreeting] = useState(getTimeBasedGreeting());
    
    useEffect(() => {
      // Update greeting immediately
      setGreeting(getTimeBasedGreeting());
      
      // Set up interval to update greeting
      const interval = setInterval(() => {
        setGreeting(getTimeBasedGreeting());
      }, refreshInterval * 60 * 1000); // Convert minutes to milliseconds
      
      return () => clearInterval(interval);
    }, [refreshInterval]);
    
    return greeting;
  };