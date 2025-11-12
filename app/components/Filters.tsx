'use client';

import { useState, useEffect } from 'react';
import { Metadata } from '../lib/api';

interface FiltersProps {
  metadata: Metadata | null;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  account: string;
  folder: string;
  category: string;
  searchQuery: string;
}

const categories = [
  'All',
  'Interested',
  'Meeting Booked',
  'Not Interested',
  'Spam',
  'Out of Office',
  'Uncategorized'
];

export default function Filters({ metadata, onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    account: '',
    folder: '',
    category: '',
    searchQuery: ''
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset folder when account changes
    if (key === 'account') {
      newFilters.folder = '';
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      account: '',
      folder: '',
      category: '',
      searchQuery: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = filters.account || filters.folder || filters.category || filters.searchQuery;
  const availableFolders = filters.account && metadata ? metadata.folders[filters.account] || [] : [];

  return (
    <div className="bg-white border-b p-4 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search emails..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Account Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Account
          </label>
          <select
            value={filters.account}
            onChange={(e) => handleFilterChange('account', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">All Accounts</option>
            {metadata?.accounts.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
        </div>

        {/* Folder Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Folder
          </label>
          <select
            value={filters.folder}
            onChange={(e) => handleFilterChange('folder', e.target.value)}
            disabled={!filters.account}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-900"
          >
            <option value="">All Folders</option>
            {availableFolders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value === 'All' ? '' : e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'All' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
