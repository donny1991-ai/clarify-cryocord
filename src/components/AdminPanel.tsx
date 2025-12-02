import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AdminPanelProps {
  onSwitchToApp: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSwitchToApp }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // File upload functionality would be implemented here
    console.log('Files dropped:', e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen flex flex-col fade-in relative z-30 bg-gray-50/90">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              Clarify <span className="text-[#B01E2D] text-sm ml-2">Admin</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onSwitchToApp}
              className="text-sm text-gray-500 hover:text-[#B01E2D] transition-colors"
            >
              Back to App
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-[#B01E2D] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Base Management</h2>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer bg-gray-50 group ${
              isDragging
                ? 'border-[#B01E2D] bg-red-50'
                : 'border-gray-300 hover:border-[#B01E2D]'
            }`}
          >
            <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="h-8 w-8 text-[#B01E2D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
            <p className="mt-2 text-sm text-gray-500">
              Drag and drop PDF, DOCX, or TXT files here
            </p>
            <button className="mt-6 px-6 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B01E2D] transition-colors">
              Select Files
            </button>
          </div>

          {/* Recent Files List */}
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Recent Uploads
            </h4>
            <ul className="divide-y divide-gray-200">
              <li className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    CryoCord_SOP_v2.pdf
                  </span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Processed
                </span>
              </li>
              <li className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    Sales_Script_2025.docx
                  </span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Processed
                </span>
              </li>
            </ul>
          </div>

          {/* Info Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">Document Upload Feature</p>
                <p className="mt-1">
                  This interface is ready for backend integration. Connect it to your Vertex AI
                  Search data store to enable document uploads and knowledge base management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
