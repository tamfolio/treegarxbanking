import React, { useState } from 'react';
import { 
  FunnelIcon, 
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
  EyeIcon,
  PaperAirplaneIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useBeneficiaries, useBeneficiaryGroups, useDeleteBeneficiary } from '../../hooks/useBeneficiaries';
import BeneficiaryDetailsModal from '../Modals/BeneficiaryDetailsModal';
import BulkGroupDetailsModal from '../Modals/BulkGroupDetailsModal';
import PayoutModal from '../Modals/PayoutModal';

const Beneficiaries = () => {
  const [activeTab, setActiveTab] = useState('Single');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Prepare filters based on active tab
  const filters = {
    category: activeTab,
    grouped: activeTab === 'Bulk',
    ...(selectedGroup && activeTab === 'Bulk' ? { groupKey: selectedGroup } : {}),
  };

  const beneficiariesData = useBeneficiaries(filters);
  const { 
    data: groupsData, 
    isLoading: groupsLoading 
  } = useBeneficiaryGroups('Bulk');

  const deleteBeneficiaryMutation = useDeleteBeneficiary();

  // Extract loading and error states
  const beneficiariesLoading = beneficiariesData.isLoading;
  const beneficiariesError = beneficiariesData.error;
  const refetchBeneficiaries = beneficiariesData.refetch;

  // Process beneficiaries data based on structure
  let beneficiaries = [];
  let bulkGroups = [];
  
  if (beneficiariesData?.data?.success) {
    const rawData = beneficiariesData.data.data;
    
    if (activeTab === 'Bulk') {
      // For bulk, keep the grouped structure
      bulkGroups = rawData || [];
      // Also create a flattened version for search/filtering
      beneficiaries = rawData.flatMap(group => 
        (group.items || []).map(item => ({ ...item, groupData: group }))
      );
    } else {
      // For single, use data directly (assuming it's a flat array)
      beneficiaries = Array.isArray(rawData) ? rawData : [];
    }
  }

  const groups = groupsData?.success ? groupsData.data : [];

  // Filter beneficiaries by search term and selected group
  let filteredData = [];
  
  if (activeTab === 'Bulk') {
    // Filter bulk groups
    filteredData = bulkGroups.filter(group => {
      // Apply group filter
      if (selectedGroup && group.groupKey !== selectedGroup) return false;
      
      // Apply search filter - search within group items
      if (searchTerm) {
        return (group.items || []).some(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.accountNumber.includes(searchTerm)
        );
      }
      
      return true;
    });
  } else {
    // Filter individual beneficiaries for single
    filteredData = beneficiaries.filter(beneficiary =>
      beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.accountNumber.includes(searchTerm)
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedGroup(''); // Clear group filter when switching tabs
    setSearchTerm(''); // Clear search when switching tabs
  };

  const handleGroupFilter = (groupKey) => {
    setSelectedGroup(groupKey);
  };

  const handlePayoutBeneficiary = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowPayoutModal(true);
  };

  const handleViewDetails = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowDetailsModal(true);
  };

  const handleDeleteBeneficiary = async (beneficiary) => {
    try {
      await deleteBeneficiaryMutation.mutateAsync(beneficiary.id);
      // Success handled by mutation onSuccess
    } catch (error) {
      console.error('Failed to delete beneficiary:', error);
      // You can add toast notification here
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Beneficiaries</h1>
            <p className="text-slate-600">Manage your saved payment recipients</p>
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
              onClick={() => refetchBeneficiaries()}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => setShowPayoutModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Transfer</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
          <button
            onClick={() => handleTabChange('Single')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'Single'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Single</span>
          </button>
          <button
            onClick={() => handleTabChange('Bulk')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'Bulk'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            <span>Bulk</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Filter Beneficiaries</h3>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGroup('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, bank, or account..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
              
              {/* Group Filter (only for Bulk) */}
              {activeTab === 'Bulk' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Group</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => handleGroupFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    disabled={groupsLoading}
                  >
                    <option value="">All Groups</option>
                    {groups.map(group => (
                      <option key={group.groupKey} value={group.groupKey}>
                        {group.groupKey.split('-')[1]?.substring(0, 8)}... ({group.count} recipients)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Single Beneficiaries</p>
                <p className="text-lg font-semibold text-slate-800">
                  {activeTab === 'Single' ? filteredData.length : beneficiaries.filter(b => b.category === 'Single').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Bulk Groups</p>
                <p className="text-lg font-semibold text-slate-800">
                  {activeTab === 'Bulk' ? filteredData.length : bulkGroups.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FunnelIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Recipients</p>
                <p className="text-lg font-semibold text-slate-800">
                  {activeTab === 'Bulk' 
                    ? filteredData.reduce((acc, group) => acc + (group.items?.length || 0), 0)
                    : filteredData.length
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MagnifyingGlassIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Filtered Results</p>
                <p className="text-lg font-semibold text-slate-800">
                  {filteredData.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficiaries Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                {activeTab} {activeTab === 'Bulk' ? 'Groups' : 'Beneficiaries'}
                {filteredData.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({filteredData.length} {filteredData.length === 1 ? (activeTab === 'Bulk' ? 'group' : 'recipient') : (activeTab === 'Bulk' ? 'groups' : 'recipients')})
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Loading State */}
          {beneficiariesLoading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-slate-600">Loading beneficiaries...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {beneficiariesError && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">
                Failed to load beneficiaries
              </div>
              <button
                onClick={() => refetchBeneficiaries()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!beneficiariesLoading && !beneficiariesError && filteredData.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                No {activeTab.toLowerCase()} {activeTab === 'Bulk' ? 'groups' : 'beneficiaries'} found
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms to find beneficiaries.'
                  : `You haven't added any ${activeTab.toLowerCase()} ${activeTab === 'Bulk' ? 'groups' : 'beneficiaries'} yet.`
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Beneficiaries/Groups List */}
          {!beneficiariesLoading && filteredData.length > 0 && (
            <div className="overflow-x-auto">
              {activeTab === 'Single' ? (
                // Single Beneficiaries Table
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Beneficiary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Bank Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Last Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredData.map((beneficiary) => (
                      <tr key={beneficiary.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {beneficiary.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 truncate max-w-48">
                                {beneficiary.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {beneficiary.accountNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-slate-900 truncate max-w-48">
                              {beneficiary.bankName}
                            </div>
                            <div className="text-sm text-slate-500">
                              Code: {beneficiary.providerBankCode}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {beneficiary.lastAmount && beneficiary.lastTransferredAt ? (
                            <div>
                              <div className="font-medium text-slate-900">
                                ₦{parseFloat(beneficiary.lastAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-sm text-slate-500">
                                {formatDate(beneficiary.lastTransferredAt)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">No transactions</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Single
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(beneficiary)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePayoutBeneficiary(beneficiary)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                              title="Send Money"
                            >
                              <PaperAirplaneIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBeneficiary(beneficiary)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                // Bulk Groups Table
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Banks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredData.map((group) => {
                      const items = group.items || [];
                      const uniqueBanks = [...new Set(items.map(item => item.bankName))];
                      const totalAmount = items.reduce((sum, item) => sum + (item.lastAmount || 0), 0);
                      const groupId = group.groupKey.split('-')[1]?.substring(0, 8);
                      
                      return (
                        <tr key={group.groupKey} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                <UserGroupIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  Bulk Group
                                </div>
                                <div className="text-sm text-slate-500 font-mono">
                                  {groupId}...
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-slate-900">
                                {items.length} Recipients
                              </div>
                              <div className="text-sm text-slate-500">
                                {items.slice(0, 2).map(item => item.name.split(' ')[0]).join(', ')}
                                {items.length > 2 && ` +${items.length - 2} more`}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-slate-900">
                                {uniqueBanks.length} Banks
                              </div>
                              <div className="text-sm text-slate-500 truncate max-w-32">
                                {uniqueBanks.slice(0, 2).join(', ')}
                                {uniqueBanks.length > 2 && ` +${uniqueBanks.length - 2} more`}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            {totalAmount > 0 ? (
                              <div>
                                <div className="font-medium text-slate-900">
                                  ₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-sm text-slate-500">
                                  Last transfers
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">No transactions</span>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewDetails({ ...group, category: 'Bulk', isGroup: true })}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                title="View Group"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  // For bulk groups, could open a bulk transfer modal
                                  console.log('Bulk transfer for group:', group.groupKey);
                                }}
                                className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
                                title="Bulk Transfer"
                              >
                                <UserGroupIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Beneficiary Details Modal */}
      <BeneficiaryDetailsModal
        isOpen={showDetailsModal && selectedBeneficiary && !selectedBeneficiary.isGroup}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBeneficiary(null);
        }}
        beneficiary={selectedBeneficiary}
        onPayout={handlePayoutBeneficiary}
        onDelete={handleDeleteBeneficiary}
      />

      {/* Bulk Group Details Modal */}
      <BulkGroupDetailsModal
        isOpen={showDetailsModal && selectedBeneficiary && selectedBeneficiary.isGroup}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBeneficiary(null);
        }}
        group={selectedBeneficiary}
      />

      {/* Payout Modal */}
      <PayoutModal
        isOpen={showPayoutModal}
        onClose={() => {
          setShowPayoutModal(false);
          setSelectedBeneficiary(null);
        }}
        onSuccess={() => {
          refetchBeneficiaries();
          // You can add a toast notification here
        }}
        prefilledData={selectedBeneficiary && !selectedBeneficiary.isGroup ? {
          bankId: selectedBeneficiary.bankId,
          accountNumber: selectedBeneficiary.accountNumber,
          beneficiaryName: selectedBeneficiary.name,
        } : {}}
      />
    </div>
  );
};

export default Beneficiaries;