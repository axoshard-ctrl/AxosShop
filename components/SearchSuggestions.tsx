import React from 'react';
import './SearchSuggestions.css';

interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <ul className="search-suggestions">
      {suggestions.map((suggestion, index) => (
        <li
          key={index}
          onClick={() => onSelect(suggestion)}
          className="suggestion-item"
        >
          <span className="suggestion-icon">🔍</span>
          {suggestion}
        </li>
      ))}
    </ul>
  );
};
