/**
 * Search Bar Component
 * Search input for filtering menu items
 */

'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Tìm kiếm món ăn...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

