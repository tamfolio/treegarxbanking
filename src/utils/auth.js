// utils/auth.js
export const logout = () => {
    // Remove auth tokens but preserve email if user had "remember me" checked
    const savedEmail = localStorage.getItem('treegar_remembered_email');
    
    // Clear all auth-related storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();
    
    // Restore saved email if it existed
    if (savedEmail) {
      localStorage.setItem('treegar_remembered_email', savedEmail);
    }
  };