import React from 'react';
import { 
  ArrowDownIcon, 
  ArrowsRightLeftIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useTransactionLimits } from '../../hooks/useTransactionLimits';

const TransactionLimits = ({ className = "" }) => {
  const { 
    data: limitsData, 
    isLoading, 
    error,
    refetch 
  } = useTransactionLimits();

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₦0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // Calculate percentage used
  const calculatePercentage = (used, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  // Get progress bar color based on usage
  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  // Get usage status
  const getUsageStatus = (percentage) => {
    if (percentage >= 90) return { color: 'text-red-600', bg: 'bg-red-50', text: 'High Usage' };
    if (percentage >= 70) return { color: 'text-amber-600', bg: 'bg-amber-50', text: 'Medium Usage' };
    return { color: 'text-green-600', bg: 'bg-green-50', text: 'Low Usage' };
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mt-2"></div>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Limits</h3>
          <p className="text-slate-600 mb-4">Unable to retrieve transaction limits</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!limitsData?.success || !limitsData?.data) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="text-center py-8 text-slate-500">
          <BanknotesIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm">No transaction limits data available</p>
        </div>
      </div>
    );
  }

  const { limits, usage } = limitsData.data;
  const effectiveLimits = limits.effective;

  // Calculate daily usage percentages
  const payoutDailyPercentage = calculatePercentage(usage.payout.dailyAmount, effectiveLimits.dailyOutflowLimit);
  const p2pDailyPercentage = calculatePercentage(usage.p2p.dailyAmount, effectiveLimits.p2pDailyLimit);
  
  // Calculate single transaction percentages
  const payoutSinglePercentage = calculatePercentage(usage.payout.dailyAmount, effectiveLimits.singleOutflowLimit);
  const p2pSinglePercentage = calculatePercentage(usage.p2p.dailyAmount, effectiveLimits.p2pSingleLimit);

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BanknotesIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Transaction Limits</h2>
            <p className="text-sm text-slate-600">Daily transaction limits and usage</p>
          </div>
        </div>
      </div>

      {/* Bank Transfer Limits */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <ArrowDownIcon className="w-4 h-4 text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900">Bank Transfer</h3>
        </div>
        
        {/* Daily Limit */}
        <div className="bg-slate-50 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Daily Limit</span>
          </div>
          
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">
              {formatCurrency(usage.payout.dailyAmount)} of {formatCurrency(effectiveLimits.dailyOutflowLimit)}
            </span>
            <span className="text-slate-500">
              {payoutDailyPercentage.toFixed(1)}% used
            </span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(payoutDailyPercentage)}`}
              style={{ width: `${payoutDailyPercentage}%` }}
            ></div>
          </div>
          
          <div className="mt-2 text-xs text-slate-500">
            Transactions today: {usage.payout.dailyCount} • Monthly: {usage.payout.monthlyCount}
          </div>
        </div>

        {/* Single Transaction Limit */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Single Transaction Limit</span>
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(effectiveLimits.singleOutflowLimit)}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Maximum amount per transaction
          </div>
        </div>
      </div>

      {/* P2P Transfer Limits */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <ArrowsRightLeftIcon className="w-4 h-4 text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900">Tag Pay (P2P)</h3>
        </div>
        
        {/* Daily Limit */}
        <div className="bg-slate-50 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Daily Limit</span>
          </div>
          
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">
              {formatCurrency(usage.p2p.dailyAmount)} of {formatCurrency(effectiveLimits.p2pDailyLimit)}
            </span>
            <span className="text-slate-500">
              {p2pDailyPercentage.toFixed(1)}% used
            </span>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(p2pDailyPercentage)}`}
              style={{ width: `${p2pDailyPercentage}%` }}
            ></div>
          </div>
          
          <div className="mt-2 text-xs text-slate-500">
            Transactions today: {usage.p2p.dailyCount} • Monthly: {usage.p2p.monthlyCount}
          </div>
        </div>

        {/* Single Transaction Limit */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Single Transaction Limit</span>
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(effectiveLimits.p2pSingleLimit)}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Maximum amount per P2P transaction
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Monthly Usage Summary</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">
              {formatCurrency(usage.payout.monthlyAmount + usage.p2p.monthlyAmount)}
            </div>
            <div className="text-xs text-slate-600">Total Spent</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">
              {usage.payout.monthlyCount + usage.p2p.monthlyCount}
            </div>
            <div className="text-xs text-slate-600">Total Transactions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionLimits;