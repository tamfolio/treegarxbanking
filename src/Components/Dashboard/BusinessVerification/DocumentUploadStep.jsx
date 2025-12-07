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

  console.log("documents", documents)
  const handleUpload = async () => {
    if (!selectedDocumentType || !uploadFile) {
      setErrors({ upload: 'Please select both document type and file' });
      onError('Please select both document type and file');
      return;
    }

    setUploading(true);
    setErrors({});

    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('documentKey', selectedDocumentType);
      fd.append('ContentType', uploadFile.type);
      fd.append('ContentDisposition', `form-data; name="file"; filename="${uploadFile.name}"`);
      fd.append('Name', 'file');
      fd.append('FileName', uploadFile.name);

      console.log('Uploading document:', {
        documentKey: selectedDocumentType,
        fileName: uploadFile.name,
        customerId
      });

      const res = await fetch(
        `https://treegar-accounts-api.treegar.com:8443/api/customer/documents/${customerId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem('authToken') ||
              sessionStorage.getItem('authToken')
            }`,
          },
          body: fd,
        }
      );

      const data = await res.json();
      console.log('Upload response:', data);

      if (res.ok || data.success) {
        onDocumentUploadSuccess(selectedDocumentType, data);
        // Reset form
        setSelectedDocumentType('');
        setUploadFile(null);
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        const errorMsg = data.message || 'Upload failed';
        setErrors({ upload: errorMsg });
        onError(errorMsg);
      }
    } catch (error) {
      const errorMsg = error.message || 'Upload failed';
      setErrors({ upload: errorMsg });
      onError(errorMsg);
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
          >
            <option value="">Select document type</option>
            {documents.map((d) => (
              <option key={d.documentKey} value={d.documentKey}>
                {d.documentKey.toUpperCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File *
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setUploadFile(e.target.files[0])}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {uploadFile && (
            <div className="mt-2 flex items-center text-sm text-green-600">
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Selected: {uploadFile.name}
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedDocumentType || !uploadFile || uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>

        {errors.upload && <p className="text-sm text-red-600">{errors.upload}</p>}
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
        {documents.length > 0 ? (
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

      {/* Requirements Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Document Requirements</p>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li>• Documents should be clear and legible</li>
              <li>• Accepted formats: PDF, JPG, PNG</li>
              <li>• Maximum file size: 5MB per document</li>
              <li>• Documents will be reviewed within 24-48 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsStep;