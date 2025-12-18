import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import useLogin from "../../hooks/useLogin";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const location = useLocation();
  const loginMutation = useLogin();

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("treegar_remembered_email");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Get success message from navigation state (from successful signup)
  const successMessage = location.state?.message;

  // Show success message on component mount if available
  useEffect(() => {
    if (successMessage && location.state?.type === "success") {
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [successMessage, location.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);

    // If unchecked, remove from localStorage immediately
    if (!e.target.checked) {
      localStorage.removeItem("treegar_remembered_email");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Save email to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem("treegar_remembered_email", formData.email);
      } else {
        localStorage.removeItem("treegar_remembered_email");
      }

      await loginMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Login submission failed:", error);
      // Error is already handled by the mutation hook
    }
  };

  const handleClearEmail = () => {
    setFormData((prev) => ({ ...prev, email: "" }));
    setRememberMe(false);
    localStorage.removeItem("treegar_remembered_email");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-blue-50/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-indigo-100/30 to-blue-100/20 rounded-full animate-pulse delay-1000"></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        />
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-10">
        <button className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-white hover:shadow-md transition-all duration-200">
          <span>English (US)</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Main Login Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 animate-fade-in-up">
          {/* Logo and Header */}
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
              Welcome back!
            </h1>
            <p className="text-slate-500 text-base">
              Sign in to your Treegar X account
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 text-sm font-medium text-center">
                {successMessage}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
                  } ${formData.email && rememberMe ? "pr-12" : ""}`}
                />

                {/* Clear email button (only show if email is saved) */}
                {formData.email && rememberMe && (
                  <button
                    type="button"
                    onClick={handleClearEmail}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Clear saved email"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.password
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
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-slate-700">Remember Me</span>
              </label>

              {/* Forgot Password Link */}
              <Link
                to="/forgotpassword"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending || loginMutation.isSuccess}
              className={`w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200 ${
                loginMutation.isPending || loginMutation.isSuccess
                  ? "opacity-70 cursor-not-allowed hover:transform-none"
                  : ""
              }`}
            >
              {loginMutation.isPending || loginMutation.isSuccess ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>
                    {loginMutation.isPending
                      ? "Signing in..."
                      : "Redirecting..."}
                  </span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-slate-600">
              Are you a new user?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>
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

export default Login;
