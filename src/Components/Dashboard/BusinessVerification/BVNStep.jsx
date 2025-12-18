import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const BVNVerificationStep = ({ 
  customerCode, 
  customerId, 
  onVerificationSuccess, 
  onError 
}) => {
  const [bvn, setBvn] = useState('');
  const [showBVN, setShowBVN] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Clear any autofilled values on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setBvn('');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle input changes with additional cleaning
  const handleBvnChange = (e) => {
    let value = e.target.value;
    
    // Remove any non-numeric characters
    value = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    setBvn(value);
    
    // Clear errors when user types
    if (errors.bvn) {
      setErrors(prev => ({ ...prev, bvn: '' }));
    }
  };

  const validateBVN = () => {
    if (!/^\d{11}$/.test(bvn)) {
      setErrors({ bvn: 'BVN must be exactly 11 digits' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateBVN()) return;

    setSubmitting(true);
    setErrors({});
    
    try {
      const { verificationService } = await import('../../../services/verificationServicee');

      const result = await verificationService.submitBusinessKYC({
        customerId,
        customerCode,
        bvn
      });

      if (result.success) {
        onVerificationSuccess('bvn', result);
        setBvn(''); // Clear form
      } else {
        setErrors({ submit: result.message || 'BVN verification failed' });
        onError(result.message || 'BVN verification failed');
      }
    } catch (error) {
      const errorMsg = error.message || 'BVN verification failed';
      setErrors({ submit: errorMsg });
      onError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFocus = (e) => {
    // Clear the field when focused to prevent autofilled values
    if (e.target.value && !bvn) {
      e.target.value = '';
      setBvn('');
    }
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Bank Verification Number (BVN)
        </h3>
        <p className="text-gray-600 text-sm">
          Enter your business owner's 11-digit BVN to verify the business identity.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Owner's BVN *
        </label>
        <div className="relative">
          {/* Hidden dummy input to fool password managers */}
          <input
            type="password"
            tabIndex={-1}
            style={{
              position: 'absolute',
              left: '-9999px',
              opacity: 0,
              pointerEvents: 'none'
            }}
            aria-hidden="true"
          />
          
          <input
            type={showBVN ? "text" : "password"}
            maxLength={11}
            value={bvn}
            onChange={handleBvnChange}
            onFocus={handleFocus}
            placeholder="Enter 11-digit BVN"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="bvn-verification-field"
            id="bvn-verification-field"
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`w-full border px-3 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
              errors.bvn ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowBVN(!showBVN)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showBVN ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        {errors.bvn && <p className="mt-1 text-xs text-red-600">{errors.bvn}</p>}
        {errors.submit && <p className="mt-1 text-xs text-red-600">{errors.submit}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || bvn.length !== 11}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Verifying...' : 'Verify BVN'}
      </button>
    </div>
  );
};

export default BVNVerificationStep;