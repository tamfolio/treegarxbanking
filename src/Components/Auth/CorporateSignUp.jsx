import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import useSimpleBusinessOnboarding from "../../hooks/useSimpleBusinessOnboarding";
import { onboardingService } from "../../api/services/onboardingService";

const CorporateSignUp = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // 1 = RC Verification, 2 = Registration Form

  // RC Verification state
  const [rcVerification, setRcVerification] = useState({
    rcNumber: "",
    isVerifying: false,
    isVerified: false,
    verificationResult: null,
    error: null,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    businessName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    rcNumber: "",
  });

  // Business onboarding mutation
  const businessOnboardingMutation = useSimpleBusinessOnboarding();

  // RC Verification API call using existing service
  const verifyRcNumber = async (rcNumber) => {
    try {
      const result = await onboardingService.verifyRCNumber({ rcNumber });
      return result;
    } catch (error) {
      console.error("RC verification error:", error);

      // Extract error message from different possible structures
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        error.message ||
        "Network error occurred. Please try again.";

      throw new Error(errorMessage);
    }
  };

  // Handle RC Number verification
  const handleRcVerification = async () => {
    if (!rcVerification.rcNumber.trim()) {
      setRcVerification((prev) => ({
        ...prev,
        error: "Please enter an RC/BN/IT number",
      }));
      return;
    }

    // Validate format (RC, BN, or IT followed by numbers)
    const rcPattern = /^(RC|BN|IT)\d+$/i;
    if (!rcPattern.test(rcVerification.rcNumber)) {
      setRcVerification((prev) => ({
        ...prev,
        error:
          "Please enter a valid RC/BN/IT number (e.g., RC123456, BN123456, IT123456)",
      }));
      return;
    }

    setRcVerification((prev) => ({
      ...prev,
      isVerifying: true,
      error: null,
    }));

    try {
      const result = await verifyRcNumber(
        rcVerification.rcNumber.toUpperCase()
      );

      if (result.success && result.data.verified) {
        // Successful verification
        setRcVerification((prev) => ({
          ...prev,
          isVerifying: false,
          isVerified: true,
          verificationResult: result.data,
          error: null,
        }));

        // Populate form data
        setFormData((prev) => ({
          ...prev,
          rcNumber: result.data.rcNumber,
          businessName: result.data.name,
        }));
      } else {
        // Verification failed
        setRcVerification((prev) => ({
          ...prev,
          isVerifying: false,
          isVerified: false,
          verificationResult: result.data,
          error:
            "Unable to resolve Registration Number. Please check and try again.",
        }));
      }
    } catch (error) {
      setRcVerification((prev) => ({
        ...prev,
        isVerifying: false,
        isVerified: false,
        verificationResult: null,
        error: error.message,
      }));
    }
  };

  // Handle RC input change
  const handleRcInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setRcVerification((prev) => ({
      ...prev,
      rcNumber: value,
      error: null,
      isVerified: false,
      verificationResult: null,
    }));
  };

  // Proceed to registration form
  const proceedToRegistration = () => {
    if (rcVerification.isVerified) {
      setCurrentStep(2);
    }
  };

  // Go back to RC verification
  const backToRcVerification = () => {
    setCurrentStep(1);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      await businessOnboardingMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Onboarding submission failed:", error);
      // Error is already handled by the mutation hook
    }
  };

  // RC Verification Step
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-100/40 to-green-50/20 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-blue-100/30 to-green-100/20 rounded-full animate-pulse delay-1000"></div>

          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
            }}
          />
        </div>

        {/* Main Container */}
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-green-500/10 p-8">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors group"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-1">
                <div className="flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/dnovlrekd/image/upload/v1766038036/ChatGPT_Image_Dec_17_2025_11_53_49_AM_zyw4jw.png"
                    alt=""
                    className="w-[150px] h-[100px]"
                  />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Corporate Account
              </h1>
              <p className="text-slate-500 text-base">
                First, let's verify your business registration
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Verify Business
                  </span>
                </div>
                <div className="w-8 h-1 bg-slate-200 rounded"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Complete Registration
                  </span>
                </div>
              </div>
            </div>

            {/* RC Verification Form */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="rcNumber"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Registration Number *
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Enter your RC (Registration Certificate), BN (Business Name),
                  or IT (Incorporated Trustees) number
                </p>
                <div className="relative">
                  <input
                    id="rcNumber"
                    name="rcNumber"
                    type="text"
                    required
                    value={rcVerification.rcNumber}
                    onChange={handleRcInputChange}
                    placeholder="e.g., RC123456, BN123456, IT123456"
                    disabled={rcVerification.isVerifying}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                      rcVerification.error
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : rcVerification.isVerified
                        ? "border-green-300 focus:border-green-500 focus:ring-green-500/10"
                        : "border-slate-200 focus:border-green-600 focus:ring-green-600/10"
                    } ${rcVerification.isVerifying ? "opacity-70" : ""}`}
                  />

                  {/* Status icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {rcVerification.isVerifying && (
                      <div className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                    )}
                    {rcVerification.isVerified && (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    )}
                    {rcVerification.error && !rcVerification.isVerifying && (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>

                {rcVerification.error && (
                  <p className="mt-2 text-sm text-red-600">
                    {rcVerification.error}
                  </p>
                )}

                {rcVerification.isVerified &&
                  rcVerification.verificationResult && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Verification Successful
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        <strong>Business Name:</strong>{" "}
                        {rcVerification.verificationResult.name}
                      </p>
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleRcVerification}
                  disabled={
                    rcVerification.isVerifying ||
                    !rcVerification.rcNumber.trim()
                  }
                  className={`flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-green-600/20 transition-all duration-200 ${
                    rcVerification.isVerifying ||
                    !rcVerification.rcNumber.trim()
                      ? "opacity-70 cursor-not-allowed transform-none shadow-none"
                      : ""
                  }`}
                >
                  {rcVerification.isVerifying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify Registration"
                  )}
                </button>

                {rcVerification.isVerified && (
                  <button
                    type="button"
                    onClick={proceedToRegistration}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>Continue</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Already have account */}
            <div className="text-center text-sm text-slate-600 mt-8">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Support Chat Bubble */}
        <div className="fixed bottom-6 right-6 z-20">
          <button className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center">
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
  }

  // Registration Form Step (Step 2)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-100/40 to-green-50/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-blue-100/30 to-green-100/20 rounded-full animate-pulse delay-1000"></div>

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-green-500/10 p-8">
          {/* Back Button */}
          <button
            onClick={backToRcVerification}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Verification</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src="https://res.cloudinary.com/dnovlrekd/image/upload/v1766038036/ChatGPT_Image_Dec_17_2025_11_53_49_AM_zyw4jw.png"
                  alt=""
                  className="w-[100px] h-[80px]"
                />
                <div className="text-2xl font-bold text-slate-800">Nexus</div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Complete Registration
            </h1>
            <p className="text-slate-500 text-base">
              Enter your personal information to create your account
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-green-600">
                  Business Verified
                </span>
              </div>
              <div className="w-8 h-1 bg-green-600 rounded"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="text-sm font-medium text-slate-700">
                  Complete Registration
                </span>
              </div>
            </div>
          </div>

          {/* Verified Business Info */}
          {/* <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Verified Business</span>
            </div>
            <p className="text-sm text-green-700">
              <strong>{formData.businessName}</strong>
            </p>
            <p className="text-xs text-green-600">
              {formData.rcNumber}
            </p>
          </div> */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name (Read-only, populated from verification) */}
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                readOnly
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.firstName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-green-600 focus:ring-green-600/10"
                }`}
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.lastName
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-green-600 focus:ring-green-600/10"
                }`}
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            {/* Middle Name (Optional) */}
            <div>
              <label
                htmlFor="middleName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Middle Name
              </label>
              <input
                id="middleName"
                name="middleName"
                type="text"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Enter your middle name (optional)"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10 transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your business email address"
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-green-600 focus:ring-green-600/10"
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                  errors.phoneNumber
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-green-600 focus:ring-green-600/10"
                }`}
              />
              {errors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-green-600 focus:ring-green-600/10"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-green-600 focus:ring-green-600/10"
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
              disabled={businessOnboardingMutation.isPending}
              className={`w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-green-600/20 transition-all duration-200 ${
                businessOnboardingMutation.isPending
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {businessOnboardingMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Corporate Account"
              )}
            </button>
          </form>

          {/* Already have account */}
          <div className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Support Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-20">
        <button className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center">
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

export default CorporateSignUp;
