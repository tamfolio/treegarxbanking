import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  // Simple token expiration check
  const isAuthenticated = token && userData;
  
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;