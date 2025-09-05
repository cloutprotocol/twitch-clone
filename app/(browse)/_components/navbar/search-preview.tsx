"use client";

import Link from "next/link";
import { Loader2, User, Video } from "lucide-react";
import moment from "moment";

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

interface SearchPreviewProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  query: string;
  onClose: () => void;
}

export const SearchPreview = ({
  results,
  isLoading,
  error,
  query,
  onClose,
}: SearchPreviewProps) => {
  if (!query || query.length < 2) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Searching...</span>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {!isLoading && !error && results.length === 0 && query.length >= 2 && (
        <div className="p-4 text-sm text-muted-foreground">
          No results found for "{query}"
        </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <>
          <div className="p-2 border-b border-border">
            <span className="text-xs text-muted-foreground font-medium">
              Search Results
            </span>
          </div>
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/${result.user.username}`}
              onClick={onClose}
              className="block hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="relative">
                  <img
                    src={result.user.imageUrl}
                    alt={result.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {result.isLive && (
                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                      LIVE
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-sm truncate">
                      {result.user.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Video className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {result.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {moment(result.updatedAt).fromNow()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {results.length === 5 && (
            <Link
              href={`/search?term=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="block p-3 text-center text-sm text-blue-500 hover:bg-muted/50 border-t border-border"
            >
              View all results for "{query}"
            </Link>
          )}
        </>
      )}
    </div>
  );
};