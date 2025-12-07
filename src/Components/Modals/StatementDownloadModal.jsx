import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ArrowDownTrayIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';


const StatementDownloadModal = ({ isOpen, onClose, onDownloadStart, onDownloadComplete }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    productId: '',
    type: '',
    direction: '',
    status: '',
    pageNumber: 1,
    pageSize: 100,
    export: 'pdf', // Default to PDF
    email: ''
  });
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        startDate: '',
        endDate: '',
        productId: '',
        type: '',
        direction: '',
        status: '',
        pageNumber: 1,
        pageSize: 100,
        export: 'pdf',
        email: ''
      });
      setErrors({});
      setIsDownloading(false);
    }
  }, [isOpen]);

  // Set default date range (last 3 months)
  useEffect(() => {
    if (isOpen && !formData.startDate) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      setFormData(prev => ({
        ...prev,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }

      // Check if date range is too large (e.g., max 1 year)
      const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (monthsDiff > 12) {
        newErrors.endDate = 'Date range cannot exceed 12 months';
      }
    }

    if (formData.export === 'email' && !formData.email) {
      newErrors.email = 'Email is required when sending via email';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownload = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setIsDownloading(true);
    onDownloadStart && onDownloadStart();
  
    try {
      const { statementService } = await import('../../services/statementService');
  
      const result = await statementService.sendStatementToEmail({
        startDate: formData.startDate,
        endDate: formData.endDate,
        export: formData.export || 'pdf',
      });
  
      if (result.success) {
        toast.success(
          '✅ Your statement has been sent to your email successfully.'
        );
  
        onDownloadComplete && onDownloadComplete(true);
        onClose();
      } else {
        toast.error('❌ Failed to send statement. Please try again.');
        onDownloadComplete && onDownloadComplete(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to generate statement.';
  
      toast.error(errorMessage);
      onDownloadComplete && onDownloadComplete(false, errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };
  
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentArrowDownIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Download Statement</h2>
                <p className="text-sm text-slate-500">Generate your account statement</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleDownload} className="p-6 space-y-6">
            
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
                      errors.startDate ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
                      errors.endDate ? 'border-red-300' : 'border-slate-200'
                    }`}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transaction Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="">All Types</option>
                  <option value="Payout">Payout</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Direction
                </label>
                <select
                  name="direction"
                  value={formData.direction}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="">All Directions</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="">All Statuses</option>
                  <option value="Successful">Successful</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Processing">Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Export Format
                </label>
                <select
                  name="export"
                  value={formData.export}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="email">Email to me</option>
                </select>
              </div>
            </div>

            {/* Email field - only show when export is email */}
            {formData.export === 'email' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all ${
                    errors.email ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={isDownloading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>
                      {formData.export === 'email' ? 'Send Email' : 'Download'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StatementDownloadModal;