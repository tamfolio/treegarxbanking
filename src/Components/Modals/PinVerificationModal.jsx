import React, { useState, useRef } from 'react';
import { XMarkIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const PinVerificationModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  transactionData = null,
  transactionType = "transfer" // "transfer", "tagpay", "bulk"
}) => {
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs for input focus management
  const pinRefs = useRef([]);

  // Initialize refs
  if (pinRefs.current.length !== 4) {
    pinRefs.current = Array(4).fill().map((_, i) => pinRefs.current[i] || React.createRef());
  }

  // Handle PIN digit input
  const handlePinDigitChange = (index, value) => {
    // Only allow single digit
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...pinDigits];
    newDigits[index] = value;
    setPinDigits(newDigits);

    // Clear errors when user types
    if (errors.pin) {
      setErrors(prev => ({ ...prev, pin: '' }));
    }

    // Auto-focus next input
    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handlePinKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      // Focus previous input and clear it
      pinRefs.current[index - 1]?.focus();
      const newDigits = [...pinDigits];
      newDigits[index - 1] = '';
      setPinDigits(newDigits);
    }
  };

  // Handle paste
  const handlePinPaste = (e, startIndex) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    
    // Only allow 4 digits
    if (!/^\d{1,4}$/.test(paste)) return;

    const newDigits = [...pinDigits];
    const pasteDigits = paste.split('');
    
    for (let i = 0; i < Math.min(pasteDigits.length, 4 - startIndex); i++) {
      newDigits[startIndex + i] = pasteDigits[i];
    }
    
    setPinDigits(newDigits);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(startIndex + pasteDigits.length, 3);
    pinRefs.current[nextIndex]?.focus();
  };

  // Validate PIN
  const validatePin = () => {
    const pin = pinDigits.join('');
    const newErrors = {};

    if (pin.length !== 4) {
      newErrors.pin = 'Please enter your 4-digit PIN';
    } else if (!/^\d{4}$/.test(pin)) {
      newErrors.pin = 'PIN must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle PIN submission - directly proceed with transaction
  const handleSubmitPin = async () => {
    if (!validatePin()) return;

    const pin = pinDigits.join('');
    setIsProcessing(true);

    try {
      // Directly proceed with transaction including PIN
      await onSuccess({ pin, transactionData, transactionType });
      
      // Reset form on success
      setPinDigits(['', '', '', '']);
      setErrors({});
      
    } catch (error) {
      console.error('Transaction failed:', error);
      
      setErrors({ 
        pin: error.message || 'Transaction failed. Please try again.',
      });
      
      // Clear PIN digits for retry
      setPinDigits(['', '', '', '']);
      pinRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isProcessing) {
      setPinDigits(['', '', '', '']);
      setErrors({});
      onClose();
    }
  };

  // Format transaction summary
  const getTransactionSummary = () => {
    if (!transactionData) return null;

    switch (transactionType) {
      case 'tagpay':
        return {
          title: 'Tag Pay Transfer',
          recipient: transactionData.destinationTagOrCode,
          amount: transactionData.amount
        };
      case 'bulk':
        return {
          title: 'Bulk Transfer',
          recipient: `${transactionData.items?.length || 0} recipients`,
          amount: transactionData.items?.reduce((total, item) => total + item.amount, 0) || 0
        };
      default:
        return {
          title: 'Bank Transfer',
          recipient: transactionData.beneficiaryName || transactionData.accountNumber,
          amount: transactionData.amount
        };
    }
  };

  const transactionSummary = getTransactionSummary();

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
                <h2 className="text-xl font-bold text-slate-800">Authorize Transaction</h2>
                <p className="text-sm text-slate-500">Enter your 4-digit PIN to proceed</p>
              </div>
            </div>
            {!isProcessing && (
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
            {/* Transaction Summary */}
            {transactionSummary && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  {transactionSummary.title}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">To:</span>
                    <span className="font-medium text-slate-800">
                      {transactionSummary.recipient}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-bold text-slate-800">
                      ₦{transactionSummary.amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PIN Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Enter Your PIN
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
                    disabled={isProcessing}
                    className={`w-14 h-14 text-center text-xl font-bold border-2 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.pin
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
                    } ${isProcessing ? 'opacity-50' : ''}`}
                    placeholder="•"
                  />
                ))}
              </div>
              
              {errors.pin && (
                <p className="text-sm text-red-600 text-center">{errors.pin}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSubmitPin}
                disabled={isProcessing || pinDigits.some(d => !d)}
                className={`flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200 ${
                  isProcessing || pinDigits.some(d => !d)
                    ? 'opacity-70 cursor-not-allowed transform-none shadow-none' 
                    : ''
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Send'
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Your PIN authorizes this transaction and ensures security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinVerificationModal;