import React, { createContext, useContext, useState, useCallback } from "react";

interface SearchContextType {
  searchHistory: string[];
  addSearchToHistory: (query: string) => void;
  clearSearchHistory: () => void;
  removeSearchFromHistory: (query: string) => void;
  getSuggestions: (query: string) => string[];
  getTypoCorrectedQuery: (query: string) => string;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Simple typo correction using Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  const matrix: number[][] = [];

  for (let i = 0; i <= bLower.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= aLower.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLower.length; i++) {
    for (let j = 1; j <= aLower.length; j++) {
      if (bLower[i - 1] === aLower[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bLower.length][aLower.length];
}

export function SearchContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const addSearchToHistory = useCallback((query: string) => {
    if (query.trim().length === 0) return;

    setSearchHistory((prev) => {
      // Remove duplicate if it exists
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== query.toLowerCase()
      );
      // Add to beginning and keep only last 20 searches
      return [query, ...filtered].slice(0, 20);
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const removeSearchFromHistory = useCallback((query: string) => {
    setSearchHistory((prev) =>
      prev.filter((item) => item.toLowerCase() !== query.toLowerCase())
    );
  }, []);

  const getSuggestions = useCallback(
    (query: string): string[] => {
      if (query.trim().length === 0) {
        return searchHistory.slice(0, 5);
      }

      const lowerQuery = query.toLowerCase();
      const matches = searchHistory.filter((item) =>
        item.toLowerCase().includes(lowerQuery)
      );

      return matches.slice(0, 5);
    },
    [searchHistory]
  );

  const getTypoCorrectedQuery = useCallback(
    (query: string): string => {
      if (query.trim().length < 2) return query;

      let bestMatch = query;
      let bestDistance = 2; // Threshold for "typo"

      searchHistory.forEach((item) => {
        const distance = levenshteinDistance(query, item);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = item;
        }
      });

      return bestMatch;
    },
    [searchHistory]
  );

  const value: SearchContextType = {
    searchHistory,
    addSearchToHistory,
    clearSearchHistory,
    removeSearchFromHistory,
    getSuggestions,
    getTypoCorrectedQuery,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchContextProvider");
  }
  return context;
}
