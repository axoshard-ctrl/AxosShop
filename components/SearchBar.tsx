import React, { useState, useEffect } from 'react';
import { SearchSuggestions } from './SearchSuggestions';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions?: string[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  suggestions = [],
}) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      // Filter suggestions and history
      const filtered = [
        ...new Set([
          ...suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())),
          ...history.filter(h => h.toLowerCase().includes(value.toLowerCase())),
        ]),
      ].slice(0, 8);
      
      setFilteredSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setFilteredSuggestions(history.slice(0, 5));
      setShowDropdown(history.length > 0);
    }
  };

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Update history
    const updated = [trimmed, ...history.filter(h => h !== trimmed)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));

    setQuery('');
    setShowDropdown(false);
    onSearch(trimmed);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
        placeholder="Search products..."
        className="search-input"
      />
      
      {showDropdown && (
        <SearchSuggestions
          suggestions={filteredSuggestions}
          onSelect={handleSearch}
        />
      )}
    </div>
  );
};
