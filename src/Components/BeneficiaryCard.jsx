import React, { useState } from 'react';
import { 
  EllipsisVerticalIcon, 
  PencilIcon, 
  TrashIcon, 
  PaperAirplaneIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

const BeneficiaryCard = ({ beneficiary, onEdit, onDelete, onPayout, category = 'Single' }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMenuAction = (action) => {
    setShowMenu(false);
    switch (action) {
      case 'edit':
        onEdit && onEdit(beneficiary);
        break;
      case 'delete':
        onDelete && onDelete(beneficiary);
        break;
      case 'payout':
        onPayout && onPayout(beneficiary);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-800 truncate">
              {beneficiary.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-slate-600">{beneficiary.bankName}</span>
              {category === 'Bulk' && beneficiary.groupKey && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Bulk
                </span>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-slate-400" />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                  <button
                    onClick={() => handleMenuAction('payout')}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>Send Money</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('edit')}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction('delete')}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-mono text-slate-600">{beneficiary.accountNumber}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <BuildingLibraryIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              {beneficiary.bankName} ({beneficiary.providerBankCode})
            </span>
          </div>
        </div>

        {/* Last Transaction Info */}
        {beneficiary.lastAmount && beneficiary.lastTransferredAt && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Last Transfer</p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatAmount(beneficiary.lastAmount)}
                </p>
                {beneficiary.lastNarration && (
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {beneficiary.lastNarration}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <CalendarDaysIcon className="w-3 h-3" />
                  <span>{formatDate(beneficiary.lastTransferredAt)}</span>
                </div>
                {beneficiary.lastReference && (
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    {beneficiary.lastReference.slice(-8)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex space-x-2">
            <button
              onClick={() => handleMenuAction('payout')}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Send Money
            </button>
            <button
              onClick={() => handleMenuAction('edit')}
              className="px-3 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryCard;