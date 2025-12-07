import React from 'react';
import { 
  XMarkIcon, 
  UserGroupIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  TagIcon,
  CalendarDaysIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const BulkGroupDetailsModal = ({ isOpen, onClose, group, onBulkPayout }) => {
  if (!isOpen || !group || !group.isGroup) return null;

  const items = group.items || [];
  const uniqueBanks = [...new Set(items.map(item => item.bankName))];
  const totalAmount = items.reduce((sum, item) => sum + (item.lastAmount || 0), 0);
  const groupId = group.groupKey.split('-')[1]?.substring(0, 8);

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

  const getLatestTransactionDate = () => {
    const dates = items
      .filter(item => item.lastTransferredAt)
      .map(item => new Date(item.lastTransferredAt))
      .sort((a, b) => b - a);
    
    return dates.length > 0 ? dates[0] : null;
  };

  const handleBulkTransfer = () => {
    onBulkPayout && onBulkPayout(group);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Bulk Group Details</h2>
                <p className="text-sm text-slate-500 font-mono">{groupId}...</p>
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
          <div className="p-6 space-y-6">
            
            {/* Group Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">Recipients</p>
                    <p className="text-2xl font-bold text-purple-800">{items.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <BuildingLibraryIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Banks</p>
                    <p className="text-2xl font-bold text-blue-800">{uniqueBanks.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 text-green-600">💰</div>
                  <div>
                    <p className="text-sm text-green-600">Total Amount</p>
                    <p className="text-lg font-bold text-green-800">{formatAmount(totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Group Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Group Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <TagIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Group Key</p>
                    <p className="font-mono text-sm text-slate-800 break-all">
                      {group.groupKey}
                    </p>
                  </div>
                </div>
                
                {getLatestTransactionDate() && (
                  <div className="flex items-start space-x-3">
                    <CalendarDaysIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Last Activity</p>
                      <p className="text-sm text-slate-800">
                        {formatDate(getLatestTransactionDate())}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banks Summary */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Banks in Group</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {uniqueBanks.map((bankName, index) => {
                  const bankRecipients = items.filter(item => item.bankName === bankName);
                  return (
                    <div key={index} className="bg-slate-50 rounded-lg p-3">
                      <div className="font-medium text-slate-800 truncate">{bankName}</div>
                      <div className="text-sm text-slate-500">
                        {bankRecipients.length} recipient{bankRecipients.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recipients List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Recipients ({items.length})
              </h3>
              <div className="bg-slate-50 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Recipient
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Bank
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Last Transfer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-100/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {item.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-slate-800 text-sm truncate max-w-32">
                                  {item.name}
                                </div>
                                <div className="text-xs text-slate-500 font-mono">
                                  {item.accountNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-800 truncate max-w-32">
                              {item.bankName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {item.providerBankCode}
                            </div>
                          </td>
                          
                          <td className="px-4 py-3">
                            {item.lastTransferredAt ? (
                              <div className="text-sm text-slate-800">
                                {formatDate(item.lastTransferredAt)}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">No transfers</span>
                            )}
                          </td>
                          
                          <td className="px-4 py-3">
                            {item.lastAmount ? (
                              <div className="text-sm font-medium text-slate-800">
                                {formatAmount(item.lastAmount)}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleBulkTransfer}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Bulk Transfer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkGroupDetailsModal;