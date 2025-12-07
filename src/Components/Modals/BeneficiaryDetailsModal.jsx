import React from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon,
  TrashIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  TagIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const BeneficiaryDetailsModal = ({ isOpen, onClose, beneficiary, onPayout, onDelete }) => {
  if (!isOpen || !beneficiary) return null;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayout = () => {
    onPayout && onPayout(beneficiary);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${beneficiary.name}?`)) {
      onDelete && onDelete(beneficiary);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Beneficiary Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-slate-400 mt-0.5">
                    👤
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="font-medium text-slate-800">{beneficiary.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <TagIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Category</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      beneficiary.category === 'Bulk' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {beneficiary.category}
                    </span>
                  </div>
                </div>

                {beneficiary.groupKey && (
                  <div className="flex items-start space-x-3">
                    <GlobeAltIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Group ID</p>
                      <p className="font-mono text-sm text-slate-600">
                        {beneficiary.groupKey.split('-')[1]?.substring(0, 12)}...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banking Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Banking Information</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CreditCardIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Account Number</p>
                    <p className="font-mono text-lg font-semibold text-slate-800">
                      {beneficiary.accountNumber}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <BuildingLibraryIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Bank Details</p>
                    <p className="font-medium text-slate-800">{beneficiary.bankName}</p>
                    <p className="text-sm text-slate-500">
                      Code: {beneficiary.providerBankCode} | ID: {beneficiary.bankId}
                    </p>
                    <p className="text-sm text-slate-500">
                      Provider: {beneficiary.provider} | Country: {beneficiary.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {(beneficiary.email || beneficiary.phone) && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {beneficiary.email && (
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-slate-400 mt-0.5">
                        ✉️
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="text-slate-800">{beneficiary.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {beneficiary.phone && (
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-slate-400 mt-0.5">
                        📞
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p className="text-slate-800">{beneficiary.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last Transaction */}
            {beneficiary.lastAmount && beneficiary.lastTransferredAt && (
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Last Transaction</h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Amount</p>
                      <p className="text-2xl font-bold text-slate-800">
                        {formatAmount(beneficiary.lastAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-sm text-slate-500">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{formatDate(beneficiary.lastTransferredAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {beneficiary.lastNarration && (
                    <div>
                      <p className="text-sm text-slate-500">Narration</p>
                      <p className="text-slate-800">{beneficiary.lastNarration}</p>
                    </div>
                  )}
                  
                  {beneficiary.lastReference && (
                    <div>
                      <p className="text-sm text-slate-500">Reference</p>
                      <p className="font-mono text-sm text-slate-600">
                        {beneficiary.lastReference}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 p-6 border-t border-slate-200">
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={handlePayout}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Send Money</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDetailsModal;