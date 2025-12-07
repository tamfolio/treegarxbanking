import React from 'react';
import { CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';

const Accounts = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Accounts</h1>
            <p className="text-slate-600">Manage your bank accounts and view account details</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Accounts Management</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            This page will display all your bank accounts, balances, and account management features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Accounts;