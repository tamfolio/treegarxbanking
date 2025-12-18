import React, { useState, useRef } from 'react';
import { XMarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useSetPin } from '../../hooks/usePin';

const SetPinModal = ({ isOpen, onClose, onSuccess }) => {
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [confirmPinDigits, setConfirmPinDigits] = useState(['', '', '', '']);
  const [errors, setErrors] = useState({});
  
  // Refs for input focus management
  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  // Set PIN mutation
  const setPinMutation = useSetPin();

  // Initialize refs
  if (pinRefs.current.length !== 4) {
    pinRefs.current = Array(4).fill().map((_, i) => pinRefs.current[i] || React.createRef());
  }
  if (confirmPinRefs.current.length !== 4) {
    confirmPinRefs.current = Array(4).fill().map((_, i) => confirmPinRefs.current[i] || React.createRef());
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const pin = pinDigits.join('');
    const confirmPin = confirmPinDigits.join('');

    if (pin.length !== 4) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    } else if (!/^\d{4}$/.test(pin)) {
      newErrors.pin = 'PIN must contain only numbers';
    }

    if (confirmPin.length !== 4) {
      newErrors.confirmPin = 'Please complete the confirmation PIN';
    } else if (pin !== confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle PIN digit input
  const handlePinDigitChange = (index, value, isConfirm = false) => {
    // Only allow single digit
    if (value && !/^\d$/.test(value)) return;

    const targetDigits = isConfirm ? confirmPinDigits : pinDigits;
    const setTargetDigits = isConfirm ? setConfirmPinDigits : setPinDigits;
    const targetRefs = isConfirm ? confirmPinRefs : pinRefs;

    const newDigits = [...targetDigits];
    newDigits[index] = value;
    setTargetDigits(newDigits);

    // Clear errors when user types
    const errorKey = isConfirm ? 'confirmPin' : 'pin';
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }

    // Auto-focus next input
    if (value && index < 3) {
      targetRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handlePinKeyDown = (e, index, isConfirm = false) => {
    const targetDigits = isConfirm ? confirmPinDigits : pinDigits;
    const setTargetDigits = isConfirm ? setConfirmPinDigits : setPinDigits;
    const targetRefs = isConfirm ? confirmPinRefs : pinRefs;

    if (e.key === 'Backspace' && !targetDigits[index] && index > 0) {
      // Focus previous input and clear it
      targetRefs.current[index - 1]?.focus();
      const newDigits = [...targetDigits];
      newDigits[index - 1] = '';
      setTargetDigits(newDigits);
    }
  };

  // Handle paste
  const handlePinPaste = (e, startIndex, isConfirm = false) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    
    // Only allow 4 digits
    if (!/^\d{1,4}$/.test(paste)) return;

    const targetDigits = isConfirm ? confirmPinDigits : pinDigits;
    const setTargetDigits = isConfirm ? setConfirmPinDigits : setPinDigits;
    const targetRefs = isConfirm ? confirmPinRefs : pinRefs;

    const newDigits = [...targetDigits];
    const pasteDigits = paste.split('');
    
    for (let i = 0; i < Math.min(pasteDigits.length, 4 - startIndex); i++) {
      newDigits[startIndex + i] = pasteDigits[i];
    }
    
    setTargetDigits(newDigits);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(startIndex + pasteDigits.length, 3);
    targetRefs.current[nextIndex]?.focus();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const pin = pinDigits.join('');
    const confirmPin = confirmPinDigits.join('');

    try {
      await setPinMutation.mutateAsync({
        pin: pin,
        confirmPin: confirmPin,
      });
      
      // Reset form
      setPinDigits(['', '', '', '']);
      setConfirmPinDigits(['', '', '', '']);
      setErrors({});
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('PIN setup failed:', error);
      // Error handling is done in the mutation hook
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!setPinMutation.isPending) {
      setPinDigits(['', '', '', '']);
      setConfirmPinDigits(['', '', '', '']);
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <LockClosedIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Set Your PIN</h2>
                <p className="text-sm text-slate-500">Create a 4-digit PIN to secure your account</p>
              </div>
            </div>
            {!setPinMutation.isPending && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Security Notice */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Security Information</p>
                  <p className="text-xs text-blue-700">
                    Your PIN will be used to authorize transactions and secure access to your account. 
                    Keep it confidential and don't share it with anyone.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PIN Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Create PIN *
                </label>
                <div className="flex justify-center space-x-3 mb-2">
                  {pinDigits.map((digit, index) => (
                    <input
                      key={`pin-${index}`}
                      ref={el => pinRefs.current[index] = el}
                      type="password"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePinDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(e, index)}
                      onPaste={(e) => handlePinPaste(e, index)}
                      className={`w-14 h-14 text-center text-xl font-bold border-2 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.pin
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                          : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
                      }`}
                      placeholder="•"
                    />
                  ))}
                </div>
                {errors.pin && <p className="mt-2 text-sm text-red-600 text-center">{errors.pin}</p>}
              </div>

              {/* Confirm PIN Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Confirm PIN *
                </label>
                <div className="flex justify-center space-x-3 mb-2">
                  {confirmPinDigits.map((digit, index) => (
                    <input
                      key={`confirm-pin-${index}`}
                      ref={el => confirmPinRefs.current[index] = el}
                      type="password"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePinDigitChange(index, e.target.value, true)}
                      onKeyDown={(e) => handlePinKeyDown(e, index, true)}
                      onPaste={(e) => handlePinPaste(e, index, true)}
                      className={`w-14 h-14 text-center text-xl font-bold border-2 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.confirmPin
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                          : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
                      }`}
                      placeholder="•"
                    />
                  ))}
                </div>
                {errors.confirmPin && <p className="mt-2 text-sm text-red-600 text-center">{errors.confirmPin}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={setPinMutation.isPending || pinDigits.some(d => !d) || confirmPinDigits.some(d => !d)}
                className={`w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200 ${
                  setPinMutation.isPending || pinDigits.some(d => !d) || confirmPinDigits.some(d => !d)
                    ? 'opacity-70 cursor-not-allowed transform-none shadow-none' 
                    : ''
                }`}
              >
                {setPinMutation.isPending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Setting PIN...</span>
                  </div>
                ) : (
                  'Set PIN'
                )}
              </button>
            </form>

            {/* PIN Requirements */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-2">PIN Requirements:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <span>Must be exactly 4 digits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <span>Numbers only (0-9)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <span>Both PIN and confirmation must match</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPinModal;