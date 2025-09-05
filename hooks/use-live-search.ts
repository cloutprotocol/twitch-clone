import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "usehooks-ts";

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string | null;
  isLive: boolean;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    imageUrl: string;
    bio: string | null;
  };
}

export const useLiveSearch = (query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search query to avoid too many API calls
  const debouncedQuery = useDebounce(query, 300);

  const searchFunction = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?term=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    searchFunction(debouncedQuery);
  }, [debouncedQuery, searchFunction]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    clearResults,
  };
};