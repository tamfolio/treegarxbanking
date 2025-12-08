import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  UsersIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const BeneficiariesSelection = ({
  beneficiaries,
  isLoading,
  onSelect,
  onBackToForm,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter beneficiaries based on search
  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.accountNumber?.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search beneficiaries by name, bank, or account..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-slate-600">Loading beneficiaries...</span>
          </div>
        </div>
      ) : beneficiaries.length > 0 ? (
        filteredBeneficiaries.length > 0 ? (
          /* Beneficiaries List */
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredBeneficiaries.map((beneficiary) => (
              <button
                key={beneficiary.id}
                onClick={() => onSelect(beneficiary)}
                className="w-full p-4 text-left border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {beneficiary.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {beneficiary.name || 'Unknown Name'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {beneficiary.bankName || 'Unknown Bank'} • {beneficiary.accountNumber || 'No Account'}
                      </div>
                      {beneficiary.lastAmount && beneficiary.lastTransferredAt && (
                        <div className="text-xs text-slate-400 mt-1">
                          Last: ₦{parseFloat(beneficiary.lastAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })} • {formatDate(beneficiary.lastTransferredAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* No Search Results */
          <div className="text-center py-8">
            <UsersIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              No beneficiaries found
            </h3>
            <p className="text-slate-600 mb-4">
              No beneficiaries match your search terms.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-8">
          <UsersIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            No saved beneficiaries
          </h3>
          <p className="text-slate-600 mb-4">
            You haven't saved any beneficiaries yet. Send money to someone and save them as a beneficiary.
          </p>
          <button
            onClick={onBackToForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send to New Recipient
          </button>
        </div>
      )}
    </div>
  );
};

export default BeneficiariesSelection;