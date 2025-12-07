import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account preferences and security settings</p>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cog6ToothIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Account Settings</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            This page will contain your account settings, security preferences, and profile management options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;