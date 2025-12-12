import React, { useState } from 'react';
import { ReceiptRefundIcon } from '@heroicons/react/24/outline';
import TransactionReceipt from './TransactionReceipt';

const ReceiptButton = ({ transaction, className = "" }) => {
  const [showReceipt, setShowReceipt] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowReceipt(true)}
        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors ${className}`}
        title="View Receipt"
      >
        <ReceiptRefundIcon className="w-3 h-3" />
        <span>Receipt</span>
      </button>

      <TransactionReceipt
        transaction={transaction}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </>
  );
};

export default ReceiptButton;