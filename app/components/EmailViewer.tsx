'use client';

import { useState } from 'react';
import { Email, api, SuggestedReply } from '../lib/api';

interface EmailViewerProps {
  email: Email | null;
  onCategoryUpdate: () => void;
}

const categories = [
  'Interested',
  'Meeting Booked',
  'Not Interested',
  'Spam',
  'Out of Office',
  'Uncategorized'
];

export default function EmailViewer({ email, onCategoryUpdate }: EmailViewerProps) {
  const [suggestedReply, setSuggestedReply] = useState<SuggestedReply | null>(null);
  const [loadingReply, setLoadingReply] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [showRawHtml, setShowRawHtml] = useState(false);

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">Select an email to view</p>
      </div>
    );
  }

  const handleCategoryChange = async (newCategory: string) => {
    setUpdatingCategory(true);
    try {
      await api.updateCategory(email.id, newCategory);
      onCategoryUpdate();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    } finally {
      setUpdatingCategory(false);
    }
  };

  const handleGetSuggestedReply = async () => {
    setLoadingReply(true);
    try {
      const reply = await api.getSuggestedReply(email.id);
      setSuggestedReply(reply);
    } catch (error) {
      console.error('Error getting suggested reply:', error);
      alert('Failed to get suggested reply');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleRecategorize = async () => {
    setUpdatingCategory(true);
    try {
      await api.recategorizeEmail(email.id);
      onCategoryUpdate();
    } catch (error) {
      console.error('Error recategorizing:', error);
      alert('Failed to recategorize email');
    } finally {
      setUpdatingCategory(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2 text-gray-900">{email.subject}</h2>
            <div className="text-sm text-gray-800">
              <p className="mb-1"><strong className="text-gray-900">From:</strong> {email.from}</p>
              <p className="mb-1"><strong className="text-gray-900">To:</strong> {email.to.join(', ')}</p>
              {email.cc && email.cc.length > 0 && (
                <p className="mb-1"><strong className="text-gray-900">CC:</strong> {email.cc.join(', ')}</p>
              )}
              <p className="mb-1"><strong className="text-gray-900">Date:</strong> {new Date(email.date).toLocaleString()}</p>
              <p><strong className="text-gray-900">Account:</strong> {email.accountEmail}</p>
            </div>
          </div>
        </div>

        {/* Category and Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={email.category || 'Uncategorized'}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={updatingCategory}
            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={handleRecategorize}
            disabled={updatingCategory}
            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            {updatingCategory ? 'Processing...' : '🤖 AI Recategorize'}
          </button>

          <button
            onClick={handleGetSuggestedReply}
            disabled={loadingReply}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loadingReply ? 'Generating...' : '💡 Suggest Reply'}
          </button>

          <button
            onClick={() => setShowRawHtml(!showRawHtml)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
          >
            {showRawHtml ? 'Show Plain Text' : 'Show HTML'}
          </button>
        </div>
      </div>

      {/* Suggested Reply */}
      {suggestedReply && (
        <div className="border-b p-4 bg-green-50">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-green-800">💡 Suggested Reply (Confidence: {(suggestedReply.confidence * 100).toFixed(0)}%)</h3>
            <button
              onClick={() => copyToClipboard(suggestedReply.suggestedReply)}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              Copy
            </button>
          </div>
          <div className="bg-white p-3 rounded border border-green-200">
            <p className="whitespace-pre-wrap text-sm text-gray-900">{suggestedReply.suggestedReply}</p>
          </div>
        </div>
      )}

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {showRawHtml && email.html ? (
          <div 
            className="bg-white p-4 rounded shadow-sm"
            dangerouslySetInnerHTML={{ __html: email.html }}
          />
        ) : (
          <div className="bg-white p-4 rounded shadow-sm">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">{email.body}</pre>
          </div>
        )}

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-4 bg-white p-4 rounded shadow-sm">
            <h3 className="font-semibold mb-2 text-gray-900">📎 Attachments ({email.attachments.length})</h3>
            <div className="space-y-2">
              {email.attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-gray-900">{att.filename}</span>
                  <span className="text-xs text-gray-600">({(att.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
