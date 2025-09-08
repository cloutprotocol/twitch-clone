"use client";

import Link from "next/link";
import Image from "next/image";
import { Loader2, User, Video } from "lucide-react";
import moment from "moment";
import { UserAvatar } from "@/components/user-avatar";

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
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-[9999] max-h-96 overflow-y-auto">
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-text-secondary">Searching...</span>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm text-status-error">
          {error}
        </div>
      )}

      {!isLoading && !error && results.length === 0 && query.length >= 2 && (
        <div className="p-4 text-sm text-text-secondary">
          No results found for &quot;{query}&quot;
        </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <>
          <div className="p-2 border-b border-border">
            <span className="text-xs text-text-secondary font-medium">
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
                  <UserAvatar
                    username={result.user.username}
                    imageUrl={result.user.imageUrl}
                    isLive={result.isLive}
                  />
                  {result.isLive && (
                    <div className="absolute -bottom-2 right-0.5 bg-status-error text-text-inverse text-xs px-1 rounded">
                      LIVE
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-text-secondary" />
                    <span className="font-medium text-sm truncate">
                      {result.user.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Video className="h-3 w-3 text-text-secondary" />
                    <span className="text-xs text-text-secondary truncate">
                      {result.title}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">
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
              className="block p-3 text-center text-sm text-interactive-primary hover:bg-muted/50 border-t border-border"
            >
              View all results for &quot;{query}&quot;
            </Link>
          )}
        </>
      )}
    </div>
  );
};