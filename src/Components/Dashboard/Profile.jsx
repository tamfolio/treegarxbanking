import React, { useState } from 'react';
import { useProfileData } from '../../hooks/useProfile';
import { 
  UserCircleIcon, 
  BuildingOfficeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import IndividualVerification from '../IndividualVerification';
import BusinessVerification from '../BusinessVerification';

const ProfileWorking = () => {
  // Use EXACT same pattern as Overview
  const { 
    firstName, 
    lastName, 
    walletBalance, 
    customerType, 
    kycStatus, 
    verifications,
    profile,
    code,
    isLoading,
  } = useProfileData();

  console.log('Profile component data:', { 
    firstName, 
    lastName, 
    customerType, 
    kycStatus, 
    profile: profile?.data,
    isLoading,
    code
  });

  // EXACT same fallback as Overview
  const fallbackUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userFirstName = firstName || fallbackUserData.firstName || 'User';

  // Format currency EXACTLY like Overview
  const formatCurrency = (amount) => {
    if (amount) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(amount);
    }
    return '₦0.00';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }


  // Get profile data - use same approach as Overview
  const profileData = profile?.data || fallbackUserData;
  console.log('profileData',profileData.customer)
  const isBusinessCustomer = customerType === 'Business Customer';

  console.log("profileType", customerType)

  const handleVerificationSuccess = async (verificationType, result) => {
    console.log(`${verificationType} verification successful:`, result);
    // For now, just log. You can add refresh logic later if needed
  };

  const handleDocumentUploadSuccess = async (documentKey, result) => {
    console.log(`Document ${documentKey} uploaded successfully:`, result);
    // For now, just log. You can add refresh logic later if needed
  };

  const getOverallKYCStatus = () => {
    const profileVerifications = profileData?.verifications || verifications || [];
    const documents = profileData?.documents || [];
    
    const requiredVerifications = profileVerifications.filter(v => v.required);
    const completedVerifications = requiredVerifications.filter(v => v.isCompleted);
    
    if (isBusinessCustomer) {
      const requiredDocs = documents.filter(d => d.required);
      const approvedDocs = requiredDocs.filter(d => d.status === 'Approved');
      
      const allVerificationsComplete = completedVerifications.length === requiredVerifications.length;
      const allDocsApproved = approvedDocs.length === requiredDocs.length;
      
      if (allVerificationsComplete && allDocsApproved) {
        return { status: 'completed', message: 'All verifications completed' };
      }
      
      const pendingDocs = requiredDocs.filter(d => d.status === 'Pending').length;
      if (pendingDocs > 0) {
        return { status: 'pending', message: `${pendingDocs} document(s) under review` };
      }
      
      return { status: 'incomplete', message: 'Verification in progress' };
    } else {
      if (completedVerifications.length === requiredVerifications.length) {
        return { status: 'completed', message: 'All verifications completed' };
      }
      return { status: 'incomplete', message: 'Verification in progress' };
    }
  };

  const overallStatus = getOverallKYCStatus();

  // Display values - Use same access pattern as ProfileTest
  const displayName = isBusinessCustomer 
    ? (profileData?.businessName || 'Business Account')
    : `${userFirstName} ${lastName || profileData?.lastName || ''}`.trim();
  const displayEmail = profileData?.email || 'No email';
  const displayBalance = walletBalance || profileData?.walletBalance;
  const displayKycStatus = kycStatus || profileData?.kycStatus || 'Unknown';
  const displayPhone = profileData?.phoneNumber || 'No phone';
  const displayCode = code || profileData?.code || 'No code'; // Use hook code first, then fallback

  console.log('Customer codes debug:', {
    hookCode: code,
    profileDataCode: profileData?.code,
    displayCode: displayCode,
    usingHookCode: !!code
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                {isBusinessCustomer ? (
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h1>
                <p className="text-gray-600">{displayEmail}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isBusinessCustomer 
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {profileData?.customerTypeName || (isBusinessCustomer ? 'Business Customer' : 'Individual Customer')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    profileData?.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profileData?.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall KYC Status */}
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                {overallStatus.status === 'completed' ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : overallStatus.status === 'pending' ? (
                  <ClockIcon className="w-5 h-5 text-yellow-600" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                )}
                <span className={`text-sm font-medium ${
                  overallStatus.status === 'completed' 
                    ? 'text-green-600'
                    : overallStatus.status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-orange-600'
                }`}>
                  {overallStatus.status === 'completed' 
                    ? 'Fully Verified'
                    : overallStatus.status === 'pending'
                    ? 'Under Review'
                    : 'Verification Required'
                  }
                </span>
              </div>
              <p className="text-xs text-gray-500">{overallStatus.message}</p>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Customer Code</p>
              <p className="font-medium text-gray-900">{displayCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-medium text-gray-900">{displayPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">KYC Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                displayKycStatus === 'Verified' 
                  ? 'bg-green-100 text-green-800'
                  : displayKycStatus === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {displayKycStatus}
              </span>
            </div>
          </div>

          {/* Wallet Balance */}
          {displayBalance && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(displayBalance)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Verification Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isBusinessCustomer ? 'Business Verification' : 'Identity Verification'}
            </h2>
            <p className="text-gray-600 mt-1">
              Complete your verification process to unlock all features and increase transaction limits.
            </p>
          </div>

          <div className="p-6">
            {isBusinessCustomer ? (
              <BusinessVerification
                customerId={profileData?.customer?.id}
                customerCode={displayCode}
                verifications={profileData?.verifications || verifications || []}
                documents={profileData?.customer.documents || []}
                onVerificationSuccess={handleVerificationSuccess}
                onDocumentUploadSuccess={handleDocumentUploadSuccess}
              />
            ) : (
              <IndividualVerification
                customerId={profileData?.id}
                customerCode={displayCode}
                verifications={profileData?.verifications || verifications || []}
                onVerificationSuccess={handleVerificationSuccess}
              />
            )}
          </div>
        </div>

        {/* Interest Information (if available) */}
        {profileData?.interest && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Period Start</p>
                <p className="font-medium text-gray-900">
                  {new Date(profileData.interest.periodStart).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Accrued Amount</p>
                <p className="font-medium text-green-600">
                  ₦{profileData.interest.accruedAmount.toLocaleString('en-NG', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Until Payout</p>
                <p className="font-medium text-gray-900">{profileData.interest.daysUntilPayout} days</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileWorking;