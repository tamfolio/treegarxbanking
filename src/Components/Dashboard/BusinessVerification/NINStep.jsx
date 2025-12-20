import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const NINVerificationStep = ({ 
  customerCode, 
  customerId, 
  onVerificationSuccess, 
  onError 
}) => {
  const [nin, setNin] = useState('');
  const [showNIN, setShowNIN] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // PERMANENT FIX: Clear any autofilled values on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setNin('');
      const input = document.getElementById('nin-verification-field');
      if (input) {
        input.value = '';
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // PERMANENT FIX: Monitor for Chrome's delayed autofill (aggressive monitoring)
  useEffect(() => {
    const monitorAutofill = () => {
      const input = document.getElementById('nin-verification-field');
      if (input && input.value) {
        // If field contains non-numeric characters, clear it
        if (!/^[0-9]*$/.test(input.value)) {
          console.log('Clearing autofilled NIN:', input.value);
          input.value = '';
          setNin('');
        }
      }
    };

    // Check immediately and then every 500ms
    monitorAutofill();
    const interval = setInterval(monitorAutofill, 500);
    
    // Stop monitoring after 15 seconds
    const timeout = setTimeout(() => clearInterval(interval), 15000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Handle input changes with additional cleaning
  const handleNinChange = (e) => {
    let value = e.target.value;
    
    // PERMANENT FIX: If value contains letters/symbols (autofilled), clear entirely
    if (!/^[0-9]*$/.test(value)) {
      setNin('');
      e.target.value = '';
      return;
    }
    
    // Remove any non-numeric characters
    value = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    setNin(value);
    
    // Clear errors when user types
    if (errors.nin) {
      setErrors(prev => ({ ...prev, nin: '' }));
    }
  };

  const validateNIN = () => {
    if (!/^\d{11}$/.test(nin)) {
      setErrors({ nin: 'NIN must be exactly 11 digits' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateNIN()) return;

    setSubmitting(true);
    setErrors({});
    
    try {
      const { verificationService } = await import('../../../services/verificationServicee');

      const result = await verificationService.submitBusinessKYC({
        customerId,
        customerCode,
        nin
      });

      if (result.success) {
        onVerificationSuccess('nin', result);
        setNin(''); // Clear form
      } else {
        setErrors({ submit: result.message || 'NIN verification failed' });
        onError(result.message || 'NIN verification failed');
      }
    } catch (error) {
      const errorMsg = error.message || 'NIN verification failed';
      setErrors({ submit: errorMsg });
      onError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // PERMANENT FIX: Enhanced focus handler
  const handleFocus = (e) => {
    const value = e.target.value;
    
    // Clear if contains non-numeric characters (autofilled password/email)
    if (value && !/^[0-9]*$/.test(value)) {
      e.target.value = '';
      setNin('');
    }
    
    // Also clear if field was autofilled but state is empty
    if (value && !nin) {
      e.target.value = '';
      setNin('');
    }
  };

  // PERMANENT FIX: Input event handler for Chrome
  const handleInput = (e) => {
    const value = e.target.value;
    if (value && !/^[0-9]*$/.test(value)) {
      e.target.value = '';
      setNin('');
      return;
    }
    handleNinChange(e);
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          National Identification Number (NIN)
        </h3>
        <p className="text-gray-600 text-sm">
          Enter your business owner's 11-digit NIN to continue the verification process.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Owner's NIN *
        </label>
        <div className="relative">
          {/* PERMANENT FIX: Multiple hidden dummy inputs */}
          <div style={{ display: 'none' }}>
            <input type="text" name="fake-username" autoComplete="username" tabIndex="-1" />
            <input type="password" name="fake-password" autoComplete="current-password" tabIndex="-1" />
            <input type="email" name="fake-email" autoComplete="email" tabIndex="-1" />
          </div>
          
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
            autoComplete="new-password"
          />
          
          <input
            type={showNIN ? "text" : "password"}
            maxLength={11}
            value={nin}
            onChange={handleNinChange}
            onInput={handleInput}  // PERMANENT FIX: Additional handler for Chrome
            onFocus={handleFocus}
            placeholder="Enter 11-digit NIN"
            
            // PERMANENT FIX: Enhanced autofill prevention
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            name="nin-verification-field"
            id="nin-verification-field"
            
            // PERMANENT FIX: Additional password manager blocking
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"           // Bitwarden
            data-dashlane-ignore="true"    // Dashlane
            data-keeper-ignore="true"      // Keeper
            
            inputMode="numeric"
            pattern="[0-9]*"
            
            // PERMANENT FIX: Additional Chrome-specific attributes
            role="textbox"
            aria-label="National Identification Number"
            
            className={`w-full border px-3 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors ${
              errors.nin ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowNIN(!showNIN)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showNIN ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        {errors.nin && <p className="mt-1 text-xs text-red-600">{errors.nin}</p>}
        {errors.submit && <p className="mt-1 text-xs text-red-600">{errors.submit}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || nin.length !== 11}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Verifying...' : 'Verify NIN'}
      </button>

      {/* PERMANENT FIX: CSS to prevent autofill styling */}
      <style jsx>{`
        input#nin-verification-field {
          background-color: white !important;
          color: #374151 !important;
        }
        
        input#nin-verification-field:-webkit-autofill,
        input#nin-verification-field:-webkit-autofill:hover,
        input#nin-verification-field:-webkit-autofill:focus,
        input#nin-verification-field:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #374151 !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
        
        input#nin-verification-field::-webkit-credentials-auto-fill-button {
          visibility: hidden !important;
          display: none !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
};

export default NINVerificationStep;