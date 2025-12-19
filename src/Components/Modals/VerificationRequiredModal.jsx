import React from 'react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const VerificationRequiredModal = ({ 
  isOpen, 
  onClose, 
  verifications = [],
  customerType = "Individual"
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Check BVN and NIN status
  const bvnVerification = verifications.find(v => v.type === 'bvn');
  const ninVerification = verifications.find(v => v.type === 'nin');
  
  const bvnCompleted = bvnVerification?.isCompleted || false;
  const ninCompleted = ninVerification?.isCompleted || false;

  const isBusinessCustomer = customerType === "Business Customer" || customerType === "Business";

  const handleGoToProfile = () => {
    navigate('/dashboard/profile');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Verification Required</h2>
                <p className="text-sm text-slate-500">Complete your verification to send money</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-slate-600 mb-4">
                To ensure secure transactions, you need to complete the following verifications:
              </p>

              {/* Verification Checklist */}
              <div className="space-y-3">
                {/* BVN Verification */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    bvnCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {bvnCompleted ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      BVN Verification
                    </p>
                    <p className="text-sm text-slate-500">
                      {isBusinessCustomer ? 'Business owner\'s BVN' : 'Your Bank Verification Number'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bvnCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {bvnCompleted ? 'Completed' : 'Required'}
                  </div>
                </div>

                {/* NIN Verification */}
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ninCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {ninCompleted ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <ShieldCheckIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      NIN Verification
                    </p>
                    <p className="text-sm text-slate-500">
                      {isBusinessCustomer ? 'Business owner\'s NIN' : 'Your National Identification Number'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ninCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {ninCompleted ? 'Completed' : 'Required'}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Why do we need this?</p>
                  <p>
                    These verifications help us comply with banking regulations and ensure 
                    secure transactions for all our users.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleGoToProfile}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>Complete Verification</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequiredModal;