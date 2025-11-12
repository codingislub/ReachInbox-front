'use client';

import { useState, useEffect } from 'react';
import { Email } from '../lib/api';

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
  loading: boolean;
}

export default function EmailList({ emails, selectedEmail, onSelectEmail, loading }: EmailListProps) {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Interested':
        return 'bg-green-100 text-green-800';
      case 'Meeting Booked':
        return 'bg-blue-100 text-blue-800';
      case 'Not Interested':
        return 'bg-red-100 text-red-800';
      case 'Spam':
        return 'bg-gray-100 text-gray-800';
      case 'Out of Office':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">No emails found</p>
        <p className="text-sm">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-gray-900">{email.from}</p>
              <p className="text-xs text-gray-700 truncate">{email.accountEmail}</p>
            </div>
            <div className="flex flex-col items-end ml-2">
              <span className="text-xs text-gray-700 whitespace-nowrap">
                {formatDate(email.date)}
              </span>
              {email.category && (
                <span className={`text-xs px-2 py-1 rounded-full mt-1 ${getCategoryColor(email.category)}`}>
                  {email.category}
                </span>
              )}
            </div>
          </div>
          <p className="font-medium text-sm mb-1 truncate text-gray-900">{email.subject}</p>
          <p className="text-xs text-gray-800 line-clamp-2">{email.body}</p>
        </div>
      ))}
    </div>
  );
}
