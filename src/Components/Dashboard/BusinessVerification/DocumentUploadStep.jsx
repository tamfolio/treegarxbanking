import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  DocumentArrowUpIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const DocumentsStep = ({ 
  customerId, 
  documents,
  onDocumentUploadSuccess, 
  onError 
}) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Enhanced error extraction function
  const extractErrorMessage = async (response) => {
    try {
      // Try to get JSON error response first
      const errorData = await response.json();
      
      console.log('Full error response:', errorData);
      
      // Check various possible error message fields
      const possibleErrorFields = [
        'message',
        'error', 
        'errorMessage',
        'error_description',
        'detail',
        'details',
        'msg',
        'description'
      ];
      
      // Look for error message in common fields
      for (const field of possibleErrorFields) {
        if (errorData[field]) {
          return errorData[field];
        }
      }
      
      // Check for validation errors array
      if (errorData.errors && Array.isArray(errorData.errors)) {
        return errorData.errors.map(err => err.message || err).join(', ');
      }
      
      // Check for nested error object
      if (errorData.error && typeof errorData.error === 'object') {
        return errorData.error.message || JSON.stringify(errorData.error);
      }
      
      // If no specific error message, return the whole response as string
      return JSON.stringify(errorData);
      
    } catch (parseError) {
      console.log('Could not parse error as JSON, trying as text...');
      
      try {
        // Try to get text response
        const errorText = await response.text();
        console.log('Error response as text:', errorText);
        
        if (errorText && errorText.trim()) {
          return errorText;
        }
      } catch (textError) {
        console.log('Could not parse error as text either');
      }
      
      // Fallback to HTTP status
      return `HTTP ${response.status}: ${response.statusText}`;
    }
  };

  const handleUpload = async () => {
    if (!selectedDocumentType || !uploadFile) {
      const errorMsg = 'Please select both document type and file';
      setErrors({ upload: errorMsg });
      onError(errorMsg);
      return;
    }

    setUploading(true);
    setErrors({});

    try {
      const authToken = localStorage.getItem('authToken') ||
                       localStorage.getItem('businessToken') || 
                       sessionStorage.getItem('authToken') ||
                       localStorage.getItem('token');

      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Create simple FormData (matching working Postman approach)
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('documentKey', selectedDocumentType);

      console.log('Upload request:', {
        customerId,
        documentKey: selectedDocumentType,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        fileType: uploadFile.type,
        authToken: authToken.substring(0, 20) + '...' // Log partial token for debugging
      });

      const apiUrl = `https://treegar-customer-api.treegar.com:8445/api/customer/documents/${customerId}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          // Don't set Content-Type - let browser handle multipart boundary
        },
        body: formData
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        // Success - try to parse response
        let successData;
        try {
          successData = await response.json();
        } catch (parseError) {
          successData = { message: 'Upload successful' };
        }
        
        console.log('✅ Upload successful:', successData);
        
        // Reset form and notify parent
        onDocumentUploadSuccess(selectedDocumentType, successData);
        setSelectedDocumentType('');
        setUploadFile(null);
        
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
      } else {
        // Error - extract the real error message from API response
        const actualErrorMessage = await extractErrorMessage(response);
        
        console.error('❌ Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          actualError: actualErrorMessage
        });
        
        throw new Error(actualErrorMessage);
      }
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      let errorMessage = 'Upload failed';
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Cannot reach the server. Please check your internet connection.';
      } else if (error.message.includes('ERR_CONNECTION_RESET')) {
        errorMessage = 'Connection lost during upload. Please try again with a smaller file or better connection.';
      } else if (error.message) {
        // Use the actual error message from the API
        errorMessage = error.message;
      }
      
      setErrors({ upload: errorMessage });
      onError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Business Documents</h3>
        <p className="text-gray-600 text-sm">
          Upload the required business documents to complete your verification process.
        </p>
      </div>


      
      {/* Document Upload Form */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-gray-900">Upload New Document</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type *
          </label>
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          >
            <option value="">Select document type</option>
            {documents?.map((d) => (
              <option key={d.documentKey} value={d.documentKey}>
                {d.documentKey.toUpperCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File * (PDF, JPG, PNG - Max 10MB)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setUploadFile(e.target.files[0])}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
          {uploadFile && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-green-600">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Selected: {uploadFile.name}
              </div>
              <div className="text-xs text-gray-500">
                Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB | Type: {uploadFile.type}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedDocumentType || !uploadFile || uploading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : !selectedDocumentType || !uploadFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            'Upload Document'
          )}
        </button>

        {/* Enhanced Error Display */}
        {errors.upload && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900 mb-1">Upload Failed</h4>
                <p className="text-sm text-red-700 whitespace-pre-wrap">
                  {errors.upload}
                </p>
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                    Show technical details
                  </summary>
                  <div className="mt-1 text-xs text-red-600 bg-red-25 p-2 rounded border">
                    <p><strong>File:</strong> {uploadFile?.name}</p>
                    <p><strong>Size:</strong> {uploadFile ? (uploadFile.size / 1024 / 1024).toFixed(2) : 'N/A'} MB</p>
                    <p><strong>Type:</strong> {uploadFile?.type}</p>
                    <p><strong>Document Type:</strong> {selectedDocumentType}</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rest of component stays the same... */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div key={`${doc.documentKey}-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {doc.documentKey.toUpperCase().replace('_', ' ')}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {doc.status || 'Not Uploaded'}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    doc.status === 'Approved' 
                      ? 'bg-green-100 text-green-800' 
                      : doc.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {doc.status || 'Not Uploaded'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DocumentArrowUpIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsStep;