import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/client';

const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  // Get email from location state or localStorage
  const email = location.state?.email || 
               JSON.parse(localStorage.getItem('tempEmailVerificationData') || '{}')?.email;
  
  const expiresAt = location.state?.expiresAt || 
                   JSON.parse(localStorage.getItem('tempEmailVerificationData') || '{}')?.expiresAt;

  // Redirect if no email data
  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    // Store data in localStorage for page refresh persistence
    const verificationData = {
      email,
      expiresAt: location.state?.expiresAt,
      nextSendAt: location.state?.nextSendAt
    };
    localStorage.setItem('tempEmailVerificationData', JSON.stringify(verificationData));
  }, [email, navigate, location.state]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const timeLeft = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setCountdown(timeLeft);
      
      if (timeLeft === 0) {
        clearInterval(interval);
        toast.error('OTP has expired. Please request a new one.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;
    
    setOtp(value);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await apiClient.post('customer/auth/email/verify', {
        email: email,
        code: otp
      });

      if (response.data.success) {
        // Clear temporary data
        localStorage.removeItem('tempEmailVerificationData');
        
        toast.success('Email verified successfully! Please login to continue.');
        navigate('/login', {
          state: {
            message: 'Email verified successfully! Please login to continue.',
            type: 'success'
          }
        });
      } else {
        setErrors({ otp: response.data.message || 'Invalid OTP. Please try again.' });
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.message ||
                          'Verification failed. Please try again.';
      
      setErrors({ otp: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    
    try {
      // Since the API doesn't need auth for resend, we'll need to call login again
      // or use a different approach. For now, let's try the resend endpoint
      const response = await apiClient.post('customer/auth/email/send-otp', {
        email: email
      });

      if (response.data.success) {
        const newData = response.data.data;
        
        // Update stored data with new expiration times
        const tempData = JSON.parse(localStorage.getItem('tempEmailVerificationData') || '{}');
        const updatedData = {
          ...tempData,
          expiresAt: newData.expiresAt,
          nextSendAt: newData.nextSendAt
        };
        localStorage.setItem('tempEmailVerificationData', JSON.stringify(updatedData));
        
        toast.success('New OTP sent to your email');
        setOtp(''); // Clear current OTP
        setErrors({});
      } else {
        toast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Failed to resend OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-blue-50/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-indigo-100/30 to-blue-100/20 rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 animate-fade-in-up">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Verify Your Email
            </h1>
            <p className="text-slate-600 text-sm">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-600 font-medium text-sm mt-1">
              {email}
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit code"
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-center text-lg font-mono tracking-wider text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.otp
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
                }`}
                autoComplete="one-time-code"
              />
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600">{errors.otp}</p>
              )}
            </div>

            {/* Countdown Timer */}
            {countdown > 0 && (
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Code expires in <span className="font-medium text-blue-600">{formatTime(countdown)}</span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className={`w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200 ${
                isSubmitting || otp.length !== 6
                  ? "opacity-70 cursor-not-allowed hover:transform-none"
                  : ""
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResendOtp}
              disabled={isResending || countdown > 0}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {isResending && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
              <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                localStorage.removeItem('tempEmailVerificationData');
                navigate('/login');
              }}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;