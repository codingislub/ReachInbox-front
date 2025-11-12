'use client';

import { useState, useEffect } from 'react';
import { api, Email, Metadata } from './lib/api';
import EmailList from './components/EmailList';
import EmailViewer from './components/EmailViewer';
import Filters, { FilterState } from './components/Filters';

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    account: '',
    folder: '',
    category: '',
    searchQuery: ''
  });
  const [totalEmails, setTotalEmails] = useState(0);

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await api.healthCheck();
      setBackendStatus(isHealthy ? 'online' : 'offline');
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await api.getMetadata();
        setMetadata(data);
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };
    loadMetadata();
  }, []);

  // Load emails
  const loadEmails = async () => {
    setLoading(true);
    try {
      const query: any = { limit: 50, offset: 0 };
      
      if (currentFilters.searchQuery) {
        query.query = currentFilters.searchQuery;
      }
      if (currentFilters.account) {
        query.account = currentFilters.account;
      }
      if (currentFilters.folder) {
        query.folder = currentFilters.folder;
      }
      if (currentFilters.category) {
        query.category = currentFilters.category;
      }

      const response = await api.getEmails(query);
      setEmails(response.data);
      setTotalEmails(response.total);
    } catch (error) {
      console.error('Error loading emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backendStatus === 'online') {
      loadEmails();
    }
  }, [currentFilters, backendStatus]);

  const handleFilterChange = (filters: FilterState) => {
    setCurrentFilters(filters);
    setSelectedEmail(null);
  };

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleCategoryUpdate = () => {
    loadEmails();
    if (selectedEmail) {
      api.getEmail(selectedEmail.id).then(setSelectedEmail).catch(console.error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">📧 ReachInbox</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              backendStatus === 'online' ? 'bg-green-100 text-green-800' :
              backendStatus === 'offline' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {backendStatus === 'online' ? '● Online' : 
               backendStatus === 'offline' ? '● Offline' : 
               '● Checking...'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {totalEmails > 0 && `${totalEmails} emails`}
          </div>
        </div>
      </header>

      {/* Filters */}
      <Filters metadata={metadata} onFilterChange={handleFilterChange} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Email List */}
        <div className="w-1/3 bg-white border-r overflow-hidden">
          <EmailList
            emails={emails}
            selectedEmail={selectedEmail}
            onSelectEmail={handleEmailSelect}
            loading={loading}
          />
        </div>

        {/* Email Viewer */}
        <div className="flex-1 bg-white overflow-hidden">
          <EmailViewer
            email={selectedEmail}
            onCategoryUpdate={handleCategoryUpdate}
          />
        </div>
      </div>

      {/* Offline Warning */}
      {backendStatus === 'offline' && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
          ⚠️ Backend server is offline. Please start the backend server.
        </div>
      )}
    </div>
  );
}
