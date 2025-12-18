import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  useResetPassword,
  useForgotPassword,
} from "../../hooks/usePasswordReset";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email] = useState(() => sessionStorage.getItem("resetEmail") || "");
  const [formData, setFormData] = useState({
    resetToken: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  const resetPasswordMutation = useResetPassword();
  const resendCodeMutation = useForgotPassword();

  // Redirect to forgot password if no email in session
  useEffect(() => {
    if (!email) {
      navigate("/forgotpassword");
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.resetToken || formData.resetToken.length !== 6) {
      newErrors.resetToken = "Please enter a valid 6-digit code";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format resetToken input (only numbers, max 6 digits)
    if (name === "resetToken") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        email,
        resetToken: formData.resetToken,
        newPassword: formData.newPassword,
      });
    } catch (error) {
      console.error("Reset password submission failed:", error);
      // Error is already handled by the mutation hook
    }
  };

  const handleResendCode = async () => {
    try {
      await resendCodeMutation.mutateAsync(email);
      setTimeLeft(300); // Reset countdown
    } catch (error) {
      console.error("Resend code failed:", error);
      // Error is already handled by the mutation hook
    }
  };

  // Don't render if no email
  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-blue-50/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-indigo-100/30 to-blue-100/20 rounded-full animate-pulse delay-1000"></div>

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-8">
          {/* Back Button */}
          <Link
            to="/login"
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to sign in</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-1">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/dnovlrekd/image/upload/v1766038036/ChatGPT_Image_Dec_17_2025_11_53_49_AM_zyw4jw.png"
                    alt=""
                    className="w-[150px] h-[100px]"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Reset password
            </h1>
            <p className="text-slate-500 text-base mb-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-blue-600 font-semibold text-sm">{email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reset Token Field */}
            <div>
              <label
                htmlFor="resetToken"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Verification code
              </label>
              <input
                id="resetToken"
                name="resetToken"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={formData.resetToken}
                onChange={handleInputChange}
                placeholder="Enter 6-digit code"
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-slate-800 text-center text-lg font-mono tracking-widest placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.resetToken
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
                }`}
              />
              {errors.resetToken && (
                <p className="mt-2 text-sm text-red-600">{errors.resetToken}</p>
              )}

              {/* Timer and Resend */}
              <div className="flex justify-between items-center mt-3">
                <div className="text-sm text-slate-500">
                  {timeLeft > 0
                    ? `Code expires in ${formatTime(timeLeft)}`
                    : "Code expired"}
                </div>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={timeLeft > 0 || resendCodeMutation.isPending}
                  className={`text-sm font-medium transition-colors ${
                    timeLeft > 0 || resendCodeMutation.isPending
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-700 hover:underline"
                  }`}
                >
                  {resendCodeMutation.isPending ? "Sending..." : "Resend code"}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.newPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className={`w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200 ${
                resetPasswordMutation.isPending
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {resetPasswordMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Resetting password...</span>
                </div>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Support Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-20">
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
