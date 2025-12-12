import React, { useRef } from 'react';
import { 
  XMarkIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const TransactionReceipt = ({ transaction, isOpen, onClose, companyInfo }) => {
  const receiptRef = useRef(null);

  if (!isOpen || !transaction) return null;

  // Format currency with better styling
  const formatCurrency = (amount, direction) => {
    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
    
    return direction === 'Credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  // Format date for receipt
  const formatReceiptDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    };
  };

  // Get status styling
  const getStatusStyling = (status) => {
    switch (status) {
      case 'Success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          textColor: 'text-emerald-800',
          label: 'Transaction Successful'
        };
      case 'Failed':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          textColor: 'text-red-800',
          label: 'Transaction Failed'
        };
      case 'Pending':
      case 'Processing':
        return {
          icon: ClockIcon,
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-600',
          textColor: 'text-amber-800',
          label: 'Transaction Pending'
        };
      default:
        return {
          icon: ClockIcon,
          bgColor: 'bg-slate-50',
          iconColor: 'text-slate-600',
          textColor: 'text-slate-800',
          label: status
        };
    }
  };

  const statusInfo = getStatusStyling(transaction.status);
  const StatusIcon = statusInfo.icon;
  const dateTime = formatReceiptDate(transaction.createdAt);

  // Download as PDF function
  const downloadReceipt = async () => {
    try {
      // Create a new window for the receipt
      const printWindow = window.open('', '_blank');
      
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Transaction Receipt - ${transaction.reference}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
              line-height: 1.4; 
              color: #1f2937;
              background: white;
              padding: 10px;
              font-size: 13px;
            }
            .receipt { 
              max-width: 500px; 
              margin: 0 auto; 
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              page-break-inside: avoid;
            }
            .header { 
              background: #3b82f6 !important;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
              color: white !important; 
              padding: 20px; 
              text-align: center;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header h1 {
              color: white !important;
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 4px;
            }
            .header p {
              color: rgba(255,255,255,0.9) !important;
              font-size: 12px;
            }
            .status-success { color: #10b981; }
            .status-failed { color: #ef4444; }
            .status-pending { color: #f59e0b; }
            .amount-positive { color: #3b82f6; font-weight: 700; }
            .amount-negative { color: #3b82f6; font-weight: 700; }
            .section { 
              padding: 16px; 
              border-bottom: 1px solid #f3f4f6;
              page-break-inside: avoid;
            }
            .section:last-child { border-bottom: none; }
            .detail-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 12px; 
              font-size: 12px;
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 6px 0;
              font-size: 12px;
            }
            .label { color: #6b7280; font-size: 11px; }
            .value { font-weight: 600; text-align: right; font-size: 12px; }
            .reference { 
              font-family: 'Courier New', monospace; 
              font-size: 10px; 
              word-break: break-all; 
              line-height: 1.2;
            }
            .status-section {
              text-align: center;
              padding: 16px;
              background: #f8fafc;
              page-break-inside: avoid;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              background: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              font-weight: 600;
              font-size: 12px;
            }
            .amount-section {
              text-align: center;
              padding: 20px 16px;
              page-break-inside: avoid;
            }
            .amount-section .label { 
              font-size: 11px; 
              color: #6b7280; 
              margin-bottom: 4px; 
            }
            .amount-section .amount { 
              font-size: 24px; 
              font-weight: 700; 
              margin-bottom: 4px; 
            }
            .amount-section .direction { 
              color: #6b7280; 
              font-size: 11px; 
            }
            h3 { 
              font-size: 13px; 
              font-weight: 600; 
              margin-bottom: 12px; 
              color: #374151; 
            }
            @media print {
              body { 
                padding: 0; 
                font-size: 12px;
              }
              .receipt { 
                max-width: none; 
                border: none; 
                border-radius: 0;
                page-break-inside: avoid;
              }
              .no-print { display: none !important; }
              .header {
                background: #3b82f6 !important;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            @page {
              margin: 0.5in;
              size: A4;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <!-- Header -->
            <div class="header">
              <!-- Logo Section -->
              <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); margin-right: 12px;">
                  <span style="color: white; font-weight: 700; font-size: 20px;">TX</span>
                </div>
                <div style="font-size: 24px; font-weight: 700; color: white;">Treegar X</div>
              </div>
              <h1>Transaction Receipt</h1>
            </div>

            <!-- Status Section -->
            <div class="status-section">
              <div class="status-badge status-${transaction.status.toLowerCase()}">
                ${statusInfo.label}
              </div>
            </div>

            <!-- Amount Section -->
            <div class="amount-section">
              <div class="label">Transaction Amount</div>
              <div class="amount amount-${transaction.direction === 'Credit' ? 'positive' : 'negative'}">
                ${formatCurrency(transaction.amount, transaction.direction)}
              </div>
              ${transaction.feeAmount > 0 ? `<div class="label">Fee: ${formatCurrency(transaction.feeAmount, 'Debit')}</div>` : ''}
              <div class="direction">${transaction.direction} Transaction</div>
            </div>

            <!-- Transaction Details -->
            <div class="section">
              <h3>Transaction Details</h3>
              <div class="detail-grid">
                <div>
                  <div class="detail-row">
                    <span class="label">Date</span>
                    <span class="value">${dateTime.date}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Time</span>
                    <span class="value">${dateTime.time}</span>
                  </div>
                </div>
                <div>
                  <div class="detail-row">
                    <span class="label">Status</span>
                    <span class="value">${transaction.status}</span>
                  </div>
                </div>
              </div>
            </div>

            ${transaction.bankName ? `
            <!-- Bank Details -->
            <div class="section">
              <h3>Bank Details</h3>
              <div class="detail-row">
                <span class="label">Bank Name</span>
                <span class="value">${transaction.bankName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Account Name</span>
                <span class="value">${transaction.accountName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Account Number</span>
                <span class="value">${transaction.accountNumber}</span>
              </div>
            </div>
            ` : ''}

            <!-- References -->
            <div class="section">
              <h3>References</h3>
              <div class="detail-row">
                <span class="label">Transaction Reference</span>
                <span class="value reference">${transaction.reference}</span>
              </div>
              ${transaction.providerReference ? `
              <div class="detail-row">
                <span class="label">Provider Reference</span>
                <span class="value reference">${transaction.providerReference}</span>
              </div>
              ` : ''}
            </div>

            <!-- Description -->
            ${transaction.narration ? `
            <div class="section">
              <h3>Description</h3>
              <p style="color: #6b7280; line-height: 1.4; font-size: 12px;">${transaction.narration}</p>
            </div>
            ` : ''}

            <!-- Footer -->
            <div class="section" style="text-align: center; background: #f9fafb; border-bottom: none; padding: 12px;">
              <p style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">
                Generated on ${new Date().toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p style="color: #9ca3af; font-size: 10px;">
                Keep this receipt for your records
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Wait a moment for styles to load, then trigger print
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  // Share receipt function - now generates and shares an image
  const shareReceipt = async () => {
    try {
      // Create a temporary div with the receipt content
      const receiptDiv = document.createElement('div');
      receiptDiv.style.position = 'absolute';
      receiptDiv.style.left = '-9999px';
      receiptDiv.style.width = '420px'; // Increased width
      receiptDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
      receiptDiv.style.backgroundColor = 'white';
      receiptDiv.style.border = '1px solid #e5e7eb';
      receiptDiv.style.borderRadius = '12px';
      receiptDiv.style.overflow = 'visible'; // Changed from hidden to visible
      
      receiptDiv.innerHTML = `
        <!-- Header with Logo -->
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 24px 20px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
          <!-- Logo -->
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); margin-right: 12px;">
              <span style="color: white; font-weight: 700; font-size: 20px;">TX</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: white;">Treegar X</div>
          </div>
          <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 6px 0; line-height: 1.2; color: white;">Transaction Receipt</h1>
        </div>

        <!-- Status Section -->
        <div style="text-align: center; padding: 20px 16px; background: ${statusInfo.bgColor.replace('bg-', '')};">
          <div style="display: inline-block; padding: 10px 20px; border-radius: 25px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-weight: 600; font-size: 13px; color: ${statusInfo.iconColor.replace('text-', '')};">
            ${statusInfo.label}
          </div>
        </div>

        <!-- Amount Section -->
        <div style="text-align: center; padding: 24px 20px;">
          <div style="margin-bottom: 8px; color: #6b7280; font-size: 13px; line-height: 1.2;">Transaction Amount</div>
          <div style="font-size: 32px; font-weight: 700; margin-bottom: 8px; color: #3b82f6; line-height: 1.1;">
            ${formatCurrency(transaction.amount, transaction.direction)}
          </div>
          ${transaction.feeAmount > 0 ? `<div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">Fee: ${formatCurrency(transaction.feeAmount, 'Debit')}</div>` : ''}
          <div style="color: #6b7280; font-size: 11px; margin: 0; line-height: 1.2;">${transaction.direction} Transaction</div>
        </div>

        <!-- Transaction Details -->
        <div style="padding: 20px; border-bottom: 1px solid #f3f4f6;">
          <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #374151; line-height: 1.2;">Transaction Details</h3>
          <div style="display: block; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; min-height: 20px;">
              <span style="color: #6b7280; flex-shrink: 0;">Date</span>
              <span style="font-weight: 600; text-align: right; max-width: 60%; word-wrap: break-word;">${dateTime.date}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; min-height: 20px;">
              <span style="color: #6b7280; flex-shrink: 0;">Time</span>
              <span style="font-weight: 600; text-align: right;">${dateTime.time}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; min-height: 20px;">
              <span style="color: #6b7280; flex-shrink: 0;">Status</span>
              <span style="font-weight: 600; text-align: right;">${transaction.status}</span>
            </div>
          </div>
        </div>

        ${transaction.bankName ? `
        <!-- Bank Details -->
        <div style="padding: 20px; border-bottom: 1px solid #f3f4f6;">
          <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #374151; line-height: 1.2;">Bank Details</h3>
          <div style="font-size: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: flex-start; min-height: 20px;">
              <span style="color: #6b7280; flex-shrink: 0; padding-top: 1px;">Bank Name</span>
              <span style="font-weight: 600; text-align: right; max-width: 65%; word-wrap: break-word; line-height: 1.2; hyphens: auto;">${transaction.bankName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: flex-start; min-height: 20px;">
              <span style="color: #6b7280; flex-shrink: 0; padding-top: 1px;">Account Name</span>
              <span style="font-weight: 600; text-align: right; max-width: 65%; word-wrap: break-word; line-height: 1.2; hyphens: auto;">${transaction.accountName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; min-height: 20px;">
              <span style="color: #6b7280; flex-shrink: 0;">Account Number</span>
              <span style="font-weight: 600; font-family: 'Courier New', monospace; text-align: right;">${transaction.accountNumber}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- References -->
        <div style="padding: 20px; border-bottom: 1px solid #f3f4f6;">
          <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #374151; line-height: 1.2;">Reference</h3>
          <div style="font-size: 11px;">
            <div style="margin-bottom: 8px;">
              <div style="color: #6b7280; margin-bottom: 6px; line-height: 1.2;">Transaction Reference</div>
              <div style="font-family: 'Courier New', monospace; background: #f8fafc; padding: 8px; border-radius: 6px; word-break: break-all; line-height: 1.4; overflow-wrap: break-word; border: 1px solid #e2e8f0;">
                ${transaction.reference}
              </div>
            </div>
          </div>
        </div>

        ${transaction.narration ? `
        <!-- Description -->
        <div style="padding: 20px; border-bottom: 1px solid #f3f4f6;">
          <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #374151; line-height: 1.2;">Description</h3>
          <p style="color: #6b7280; line-height: 1.4; font-size: 12px; margin: 0; word-wrap: break-word;">${transaction.narration}</p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="text-align: center; padding: 16px 20px; background: #f9fafb; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          <p style="color: #6b7280; font-size: 10px; margin: 0 0 4px 0; line-height: 1.2;">
            Generated on ${new Date().toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p style="color: #9ca3af; font-size: 9px; margin: 0; line-height: 1.2;">
            Keep this receipt for your records
          </p>
        </div>
      `;

      document.body.appendChild(receiptDiv);

      // Convert to canvas using html2canvas
      if (window.html2canvas) {
        const canvas = await window.html2canvas(receiptDiv, {
          backgroundColor: '#ffffff',
          scale: 2, // Reduced scale for better compatibility
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          width: 420,
          height: null,
          allowTaint: false,
          letterRendering: true,
          windowWidth: 420,
          windowHeight: 800
        });

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          document.body.removeChild(receiptDiv);

          if (navigator.share && navigator.canShare) {
            const file = new File([blob], `receipt-${transaction.reference.slice(-8)}.png`, {
              type: 'image/png',
            });

            try {
              await navigator.share({
                title: 'Transaction Receipt',
                text: `Transaction Receipt - ${formatCurrency(transaction.amount, transaction.direction)}`,
                files: [file],
              });
            } catch (error) {
              // Fallback to download if share fails
              downloadImageBlob(blob);
            }
          } else {
            // Fallback: download the image
            downloadImageBlob(blob);
          }
        }, 'image/png');
      } else {
        // Fallback if html2canvas is not available
        document.body.removeChild(receiptDiv);
        alert('Image sharing not supported. Please install html2canvas library or use text sharing.');
      }
    } catch (error) {
      console.error('Error generating receipt image:', error);
      alert('Failed to generate receipt image. Please try again.');
    }
  };

  // Helper function to download blob as image
  const downloadImageBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.reference.slice(-8)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
            
            <div className="text-center text-white">
              {/* Logo */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg mr-3">
                  <span className="text-white font-bold text-xl">TX</span>
                </div>
                <div className="text-2xl font-bold text-white">Treegar X</div>
              </div>
              <h2 className="text-xl font-bold mb-1">Transaction Receipt</h2>
            </div>
          </div>

          <div ref={receiptRef} className="p-6 space-y-6 max-h-96 overflow-y-auto">
            {/* Status */}
            <div className={`${statusInfo.bgColor} rounded-2xl p-4 text-center`}>
              <div className="inline-flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm">
                <StatusIcon className={`w-5 h-5 ${statusInfo.iconColor}`} />
                <span className={`font-semibold ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center py-4">
              <div className="text-sm text-slate-500 mb-2">Transaction Amount</div>
              <div className="text-3xl font-bold mb-1 text-blue-600">
                {formatCurrency(transaction.amount, transaction.direction)}
              </div>
              {transaction.feeAmount > 0 && (
                <div className="text-sm text-slate-500">
                  Fee: {formatCurrency(transaction.feeAmount, 'Debit')}
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">
                {transaction.direction} Transaction
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Date</span>
                  <span className="font-medium text-slate-900">{dateTime.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time</span>
                  <span className="font-medium text-slate-900">{dateTime.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status</span>
                  <span className="font-medium text-slate-900">{transaction.status}</span>
                </div>
              </div>
            </div>

            {/* Bank Details (if available) */}
            {transaction.bankName && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Bank Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bank Name</span>
                    <span className="font-medium text-slate-900 text-right max-w-40 truncate">{transaction.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Account Name</span>
                    <span className="font-medium text-slate-900 text-right max-w-40 truncate">{transaction.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Account Number</span>
                    <span className="font-medium text-slate-900 font-mono">{transaction.accountNumber}</span>
                  </div>
                </div>
              </div>
            )}

            {/* References */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">References</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-slate-600 mb-1">Transaction Reference</div>
                  <div className="font-mono text-xs text-slate-900 bg-white p-2 rounded border break-all">
                    {transaction.reference}
                  </div>
                </div>
                {transaction.providerReference && (
                  <div>
                    <div className="text-slate-600 mb-1">Provider Reference</div>
                    <div className="font-mono text-xs text-slate-900 bg-white p-2 rounded border break-all">
                      {transaction.providerReference}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {transaction.narration && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Description</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{transaction.narration}</p>
              </div>
            )}

            {/* Footer Note */}
            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Generated on {new Date().toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Keep this receipt for your records
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 p-6 pt-0">
            <button
              onClick={shareReceipt}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              <span className="font-medium text-sm">Share</span>
            </button>
            
            <button
              onClick={downloadReceipt}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="font-medium text-sm">Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;