import React from 'react';
import { CheckCircleIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

const VerificationStepIndicator = ({ 
  activeStep, 
  isBVNVerified, 
  isNINVerified 
}) => {
  const steps = [
    { key: 'bvn', title: 'BVN', index: 1, verified: isBVNVerified },
    { key: 'nin', title: 'NIN', index: 2, verified: isNINVerified },
    { key: 'documents', title: 'Documents', icon: true }
  ];

  return (
    <div className="flex justify-between items-center">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full border
            ${
              activeStep === step.key
                ? "bg-blue-600 text-white border-blue-600"
                : step.verified
                ? "bg-green-100 text-green-600 border-green-500"
                : "bg-gray-100 text-gray-400 border-gray-300"
            }`}
          >
            {step.icon ? (
              <DocumentArrowUpIcon className="w-4 h-4" />
            ) : step.verified ? (
              <CheckCircleIcon className="w-4 h-4" />
            ) : (
              step.index
            )}
          </div>
          <span className={`ml-2 capitalize text-sm ${
            activeStep === step.key 
              ? "text-blue-600 font-medium" 
              : "text-gray-500"
          }`}>
            {step.title}
          </span>
          {i !== steps.length - 1 && (
            <div className="w-16 h-px bg-gray-300 mx-3" />
          )}
        </div>
      ))}
    </div>
  );
};

export default VerificationStepIndicator;