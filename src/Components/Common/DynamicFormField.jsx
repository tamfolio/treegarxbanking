import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const DynamicFormField = ({ 
  field, 
  value, 
  onChange, 
  error, 
  showPassword, 
  onTogglePassword,
  className = ''
}) => {
  const { name, required } = field;
  
  // Generate label from field name
  const generateLabel = (fieldName) => {
    const labelMap = {
      firstName: 'First Name',
      lastName: 'Last Name',
      middleName: 'Middle Name',
      email: 'Email Address',
      phoneNumber: 'Phone Number',
      password: 'Password',
      businessName: 'Business Name',
    };
    return labelMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  };

  // Generate placeholder
  const generatePlaceholder = (fieldName) => {
    const placeholderMap = {
      firstName: 'Enter your first name',
      lastName: 'Enter your last name',
      middleName: 'Enter your middle name (optional)',
      email: 'Enter your email address',
      phoneNumber: 'Enter your phone number',
      password: 'Create a strong password',
      businessName: 'Enter your business name',
    };
    return placeholderMap[fieldName] || `Enter your ${fieldName}`;
  };

  // Get input type
  const getInputType = (fieldName) => {
    if (fieldName === 'email') return 'email';
    if (fieldName === 'phoneNumber') return 'tel';
    if (fieldName === 'password') return showPassword ? 'text' : 'password';
    return 'text';
  };

  const label = generateLabel(name);
  const placeholder = generatePlaceholder(name);
  const inputType = getInputType(name);

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 ${name === 'password' ? 'pr-12' : ''} border-2 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
              : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
          }`}
        />
        {name === 'password' && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DynamicFormField;