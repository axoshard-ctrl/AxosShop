import { useState, useMemo } from "react";
import { useSearch } from "@/lib/searchContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Trash2, Lightbulb, AlertCircle } from "lucide-react";

interface AdvancedSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestedQuery?: string;
  showTypoSuggestion?: boolean;
}

export function AdvancedSearch({
  placeholder = "Search products...",
  value,
  onChange,
  onSearch,
  suggestedQuery,
  showTypoSuggestion = true,
}: AdvancedSearchProps) {
  const {
    searchHistory,
    addSearchToHistory,
    removeSearchFromHistory,
    getSuggestions,
    getTypoCorrectedQuery,
  } = useSearch();

  const [isOpen, setIsOpen] = useState(false);

  const suggestions = useMemo(() => getSuggestions(value), [value, getSuggestions]);

  const correctedQuery = useMemo(() => {
    if (!showTypoSuggestion || value.length < 3) return null;
    const corrected = getTypoCorrectedQuery(value);
    return corrected !== value ? corrected : null;
  }, [value, showTypoSuggestion, getTypoCorrectedQuery]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addSearchToHistory(query);
      onSearch(query);
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(value);
    }
  };

  return (
    <div className="relative w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setIsOpen(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsOpen(true)}
              className="pr-10"
            />
          </div>
        </PopoverTrigger>

        {isOpen && (value || suggestions.length > 0) && (
          <PopoverContent className="w-full p-0 border-0 shadow-lg" align="start">
            <div className="bg-white rounded-lg border border-primary/20 overflow-hidden">
              {/* Typo Suggestion */}
              {correctedQuery && (
                <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Did you mean?</p>
                    <button
                      onClick={() => {
                        handleSearch(correctedQuery);
                      }}
                      className="text-sm font-medium text-blue-600 hover:underline text-left"
                    >
                      {correctedQuery}
                    </button>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="border-b border-primary/10">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Recent Searches
                  </div>
                  <div className="divide-y">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSearch(suggestion)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="flex-1">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search History */}
              {!value && searchHistory.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600">Search History</p>
                    <button
                      onClick={() => removeSearchFromHistory("")}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 10).map((item) => (
                      <div
                        key={item}
                        className="group flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <button
                          onClick={() => handleSearch(item)}
                          className="text-xs text-gray-700 hover:text-primary"
                        >
                          {item}
                        </button>
                        <button
                          onClick={() => removeSearchFromHistory(item)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-2.5 h-2.5 text-gray-500 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No suggestions */}
              {!value && suggestions.length === 0 && searchHistory.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm">Start typing to search</p>
                </div>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>

      {/* Suggested Query Badge */}
      {suggestedQuery && value.length > 0 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Badge variant="outline" className="text-xs gap-1">
            <AlertCircle className="w-3 h-3" />
            {suggestedQuery}
          </Badge>
        </div>
      )}
    </div>
  );
}
