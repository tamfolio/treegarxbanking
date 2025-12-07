import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const DynamicVerificationField = ({ 
  verification, 
  value, 
  onChange, 
  error,
  isVerifying = false,
  isVerified = false,
  onVerify,
  className = ''
}) => {
  const { type, name, required } = verification;
  
  // Generate placeholder based on verification type
  const generatePlaceholder = (verificationType) => {
    const placeholderMap = {
      bvn: 'Enter your 11-digit BVN',
      nin: 'Enter your 11-digit NIN',
      rc_number: 'Enter your RC number (e.g., RC123456)',
      liveness: 'Liveness verification required',
    };
    return placeholderMap[verificationType] || `Enter your ${verificationType}`;
  };

  // Handle input formatting
  const handleInputChange = (e) => {
    const { value: inputValue } = e.target;
    
    if (type === 'bvn' || type === 'nin') {
      // Only allow numbers and limit to 11 digits
      const numericValue = inputValue.replace(/\D/g, '').slice(0, 11);
      onChange({ target: { name: type, value: numericValue } });
    } else if (type === 'rc_number') {
      // Format RC number to uppercase
      onChange({ target: { name: type, value: inputValue.toUpperCase() } });
    } else {
      onChange({ target: { name: type, value: inputValue } });
    }
  };

  const placeholder = generatePlaceholder(type);

  // For liveness, we don't show an input field
  if (type === 'liveness') {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {name} {required && '*'}
        </label>
        <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isVerified ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {isVerified ? (
                <CheckCircleIcon className="w-5 h-5 text-white" />
              ) : (
                <div className="w-3 h-3 bg-white rounded-full"></div>
              )}
            </div>
            <div>
              <p className="font-medium text-slate-800">Liveness Verification</p>
              <p className="text-sm text-slate-600">
                {isVerified ? 'Completed' : 'Required for account verification'}
              </p>
            </div>
          </div>
          {!isVerified && (
            <button
              type="button"
              onClick={onVerify}
              disabled={isVerifying}
              className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors ${
                isVerifying ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isVerifying ? 'Starting...' : 'Start Verification'}
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={type} className="block text-sm font-medium text-slate-700 mb-2">
        {name} {required && '*'}
      </label>
      <div className="flex space-x-2">
        <div className="flex-1">
          <input
            id={type}
            name={type}
            type="text"
            inputMode={type === 'bvn' || type === 'nin' ? 'numeric' : 'text'}
            pattern={type === 'bvn' || type === 'nin' ? '[0-9]*' : undefined}
            maxLength={type === 'bvn' || type === 'nin' ? 11 : undefined}
            required={required}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={isVerified}
            className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                : isVerified 
                  ? 'border-green-300 bg-green-50 text-green-800'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
            }`}
          />
        </div>
        
        {/* Verify Button */}
        {value && !isVerified && (
          <button
            type="button"
            onClick={() => onVerify && onVerify(type, value)}
            disabled={isVerifying}
            className={`px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap ${
              isVerifying ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isVerifying ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying</span>
              </div>
            ) : (
              'Verify'
            )}
          </button>
        )}

        {/* Verification Status */}
        {isVerified && (
          <div className="flex items-center px-4 py-3 bg-green-100 text-green-600 rounded-xl">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DynamicVerificationField;