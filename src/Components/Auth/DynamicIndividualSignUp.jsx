import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useOnboardingRequirements,useIndividualOnboarding,useVerification } from '../../hooks/useOnboarding';
import DynamicFormField from '../Common/DynamicFormField';
import DynamicVerificationField from '../Common/DynamicVerificationField';

const DynamicIndividualSignUp = ({ onBack }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [verificationStatus, setVerificationStatus] = useState({});
  
  // Fetch dynamic requirements
  const { 
    data: requirementsData, 
    isLoading: requirementsLoading, 
    error: requirementsError 
  } = useOnboardingRequirements('Individual');
  
  // Onboarding mutation
  const individualOnboardingMutation = useIndividualOnboarding();
  
  // Verification hooks
  const bvnVerification = useVerification('bvn');
  const ninVerification = useVerification('nin');
  const livenessVerification = useVerification('liveness');

  // Initialize form data when requirements are loaded
  useEffect(() => {
    if (requirementsData?.success && requirementsData.data) {
      const { basicFields, verifications } = requirementsData.data;
      
      // Initialize formData with empty values for all required fields
      const initialFormData = {};
      basicFields.forEach(field => {
        initialFormData[field.name] = '';
      });
      verifications.forEach(verification => {
        initialFormData[verification.type] = '';
      });
      
      setFormData(initialFormData);
    }
  }, [requirementsData]);

  // Loading state
  if (requirementsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-slate-700">Loading requirements...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (requirementsError || !requirementsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-red-500/10 p-8 text-center">
          <div className="text-red-600 text-lg font-medium mb-4">
            Failed to load onboarding requirements
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { basicFields, verifications } = requirementsData.data;

  const validateStep1 = () => {
    const newErrors = {};
    
    basicFields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} is required`;
      }
      
      // Email validation
      if (field.name === 'email' && formData[field.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])) {
        newErrors[field.name] = 'Please enter a valid email address';
      }
      
      // Phone validation
      if (field.name === 'phoneNumber' && formData[field.name] && !/^\+?[\d\s-()]{10,}$/.test(formData[field.name])) {
        newErrors[field.name] = 'Please enter a valid phone number';
      }
      
      // Password validation
      if (field.name === 'password' && formData[field.name] && formData[field.name].length < 8) {
        newErrors[field.name] = 'Password must be at least 8 characters';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    verifications.forEach(verification => {
      if (verification.required) {
        if (verification.type === 'liveness') {
          if (!verificationStatus[verification.type]) {
            newErrors[verification.type] = 'Liveness verification is required';
          }
        } else if (!formData[verification.type]?.trim()) {
          newErrors[verification.type] = `${verification.name} is required`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVerification = async (type, value) => {
    try {
      let result;
      switch (type) {
        case 'bvn':
          result = await bvnVerification.mutateAsync({ bvn: value });
          break;
        case 'nin':
          result = await ninVerification.mutateAsync({ nin: value });
          break;
        default:
          return;
      }
      
      if (result.success) {
        setVerificationStatus(prev => ({ ...prev, [type]: true }));
      }
    } catch (error) {
      console.error(`${type} verification failed:`, error);
    }
  };

  const handleLivenessVerification = async () => {
    try {
      const result = await livenessVerification.start.mutateAsync({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      if (result.success) {
        // Here you would typically integrate with a liveness SDK
        // For now, we'll simulate success
        setTimeout(() => {
          setVerificationStatus(prev => ({ ...prev, liveness: true }));
        }, 2000);
      }
    } catch (error) {
      console.error('Liveness verification failed:', error);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    try {
      // Prepare payload according to API structure
      const payload = {
        ...formData,
        livenessCompleted: verificationStatus.liveness || false,
      };

      const result = await individualOnboardingMutation.mutateAsync(payload);
      
      if (result.success) {
        navigate('/login', { 
          state: { message: 'Account created successfully! Please sign in.' }
        });
      }
    } catch (error) {
      console.error('Onboarding submission failed:', error);
    }
  };

  // Split fields into step 1 and step 2
  const step1Fields = basicFields.filter(field => 
    ['firstName', 'lastName', 'middleName', 'email', 'phoneNumber', 'password'].includes(field.name)
  );
  const step2Fields = verifications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-blue-50/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-indigo-100/30 to-blue-100/20 rounded-full animate-pulse delay-1000"></div>
        
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='7' cy='7' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`
          }}
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-8">
          
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep > 1 ? <CheckCircleIcon className="w-5 h-5" /> : '1'}
              </div>
              <div className={`w-8 h-1 rounded ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">TX</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">Treegar X</div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Individual Account</h1>
            <p className="text-slate-500 text-base">
              {currentStep === 1 ? 'Enter your personal information' : 'Complete verification requirements'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-6">
            
            {currentStep === 1 ? (
              // Step 1: Basic Information
              <>
                {step1Fields.map((field) => (
                  <DynamicFormField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    error={errors[field.name]}
                    showPassword={field.name === 'password' ? showPassword : undefined}
                    onTogglePassword={field.name === 'password' ? () => setShowPassword(!showPassword) : undefined}
                  />
                ))}

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200"
                >
                  Continue
                </button>
              </>
            ) : (
              // Step 2: Verifications
              <>
                {step2Fields.map((verification) => (
                  <DynamicVerificationField
                    key={verification.type}
                    verification={verification}
                    value={formData[verification.type] || ''}
                    onChange={handleInputChange}
                    error={errors[verification.type]}
                    isVerifying={
                      (verification.type === 'bvn' && bvnVerification.isLoading) ||
                      (verification.type === 'nin' && ninVerification.isLoading) ||
                      (verification.type === 'liveness' && livenessVerification.start.isLoading)
                    }
                    isVerified={verificationStatus[verification.type]}
                    onVerify={verification.type === 'liveness' ? handleLivenessVerification : handleVerification}
                  />
                ))}

                {/* Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={individualOnboardingMutation.isLoading}
                    className={`flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200 ${
                      individualOnboardingMutation.isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {individualOnboardingMutation.isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Already have account */}
          <div className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Support Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-20">
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DynamicIndividualSignUp;