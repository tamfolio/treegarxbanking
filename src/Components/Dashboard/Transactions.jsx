import React, { useState } from 'react';
import { 
  FunnelIcon, 
  ArrowPathIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import { useTransactions, useProducts } from '../../hooks/useTransactions';
import PayoutModal from '../../Components/Modals/PayoutModal';
import TransactionReceipt from './TransactionReceipt';

const Transactions = () => {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    productId: '',
    type: '',
    direction: '',
    status: '',
    pageNumber: 1,
    pageSize: 20
  });

  const { 
    data: transactionsData, 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions 
  } = useTransactions(filters);

  const { data: productsData } = useProducts();
  
  const transactions = transactionsData?.success ? transactionsData.data : { total: 0, items: [] };
  const products = productsData?.success ? productsData.data : [];

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      pageNumber: 1 // Reset to first page when filtering
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      productId: '',
      type: '',
      direction: '',
      status: '',
      pageNumber: 1,
      pageSize: 20
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, pageNumber: newPage }));
  };

  const handleViewReceipt = (transaction) => {
    setSelectedTransaction(transaction);
    setShowReceipt(true);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Success': 'bg-green-100 text-green-800 border-green-200',
      'Failed': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Processing': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        statusStyles[status] || 'bg-slate-100 text-slate-800 border-slate-200'
      }`}>
        {status}
      </span>
    );
  };

  const getDirectionIcon = (direction) => {
    return direction === 'Credit' ? (
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-8-8-8 8" />
        </svg>
      </div>
    ) : (
      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m-8 8l8 8 8-8" />
        </svg>
      </div>
    );
  };

  const formatAmount = (amount, direction) => {
    const formattedAmount = `₦${parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    return direction === 'Credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
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

  const totalPages = Math.ceil((transactions.total || 0) / filters.pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Transactions</h1>
            <p className="text-slate-600">View and manage your transaction history</p>
          </div>
          
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            <button
              onClick={() => refetchTransactions()}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => setShowPayoutModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Send Money</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Filter Transactions</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              
              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product</label>
                <select
                  value={filters.productId}
                  onChange={(e) => handleFilterChange('productId', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="">All Types</option>
                  <option value="Payout">Payout</option>
                  <option value="P2PSent">P2P Sent</option>
                  <option value="P2PReceived">P2P Received</option>
                  <option value="BalanceFunding">Balance Funding</option>
                </select>
              </div>
              
              {/* Direction */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Direction</label>
                <select
                  value={filters.direction}
                  onChange={(e) => handleFilterChange('direction', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="">All Directions</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                </select>
              </div>
              
              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Per Page</label>
                <select
                  value={filters.pageSize}
                  onChange={(e) => handleFilterChange('pageSize', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Transaction History
                {transactions.total > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({transactions.total} total)
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Loading State */}
          {transactionsLoading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-slate-600">Loading transactions...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {transactionsError && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">
                Failed to load transactions
              </div>
              <button
                onClick={() => refetchTransactions()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!transactionsLoading && !transactionsError && transactions.items.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No transactions found</h3>
              <p className="text-slate-600 mb-4">
                {Object.values(filters).some(v => v && v !== 1 && v !== 20) 
                  ? 'Try adjusting your filters to see more results.'
                  : 'You haven\'t made any transactions yet.'
                }
              </p>
              {Object.values(filters).some(v => v && v !== 1 && v !== 20) && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Transactions List */}
          {!transactionsLoading && transactions.items.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactions.items.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {getDirectionIcon(transaction.direction)}
                            <div>
                              <div className="font-medium text-slate-900">
                                {transaction.accountName || transaction.productName}
                              </div>
                              <div className="text-sm text-slate-500">
                                {transaction.narration}
                              </div>
                              {transaction.bankName && (
                                <div className="text-xs text-slate-400">
                                  {transaction.bankName} • {transaction.accountNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-semibold ${
                            transaction.direction === 'Credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatAmount(transaction.amount, transaction.direction)}
                          </div>
                          {transaction.feeAmount > 0 && (
                            <div className="text-xs text-slate-500">
                              Fee: ₦{parseFloat(transaction.feeAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-mono text-slate-600">
                            {transaction.reference}
                          </div>
                          {transaction.providerReference && (
                            <div className="text-xs font-mono text-slate-400">
                              {transaction.providerReference}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewReceipt(transaction)}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <ReceiptRefundIcon className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-slate-200">
                {transactions.items.map((transaction) => (
                  <div key={transaction.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      {getDirectionIcon(transaction.direction)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-slate-900 truncate">
                            {transaction.accountName || transaction.productName}
                          </div>
                          <div className={`font-semibold ${
                            transaction.direction === 'Credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatAmount(transaction.amount, transaction.direction)}
                          </div>
                        </div>
                        
                        <div className="mt-1 text-sm text-slate-500">
                          {transaction.narration}
                        </div>
                        
                        {transaction.bankName && (
                          <div className="mt-1 text-xs text-slate-400">
                            {transaction.bankName} • {transaction.accountNumber}
                          </div>
                        )}
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            {formatDate(transaction.createdAt)}
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(transaction.status)}
                            <button
                              onClick={() => handleViewReceipt(transaction)}
                              className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <ReceiptRefundIcon className="w-3 h-3" />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs font-mono text-slate-400">
                          {transaction.reference}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing page {filters.pageNumber} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(filters.pageNumber - 1)}
                        disabled={filters.pageNumber <= 1}
                        className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(filters.pageNumber + 1)}
                        disabled={filters.pageNumber >= totalPages}
                        className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payout Modal */}
      <PayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSuccess={() => {
          refetchTransactions();
          // You can add a toast notification here
        }}
      />

      {/* Transaction Receipt Modal */}
      <TransactionReceipt
        transaction={selectedTransaction}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
};

export default Transactions;