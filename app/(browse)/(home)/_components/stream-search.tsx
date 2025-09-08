"use client";

import qs from "query-string";
import { useState, useRef, useEffect } from "react";
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLiveSearch } from "@/hooks/use-live-search";
import { SearchPreview } from "../../_components/navbar/search-preview";

export const StreamSearch = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, error, clearResults } = useLiveSearch(value);

  // Close preview when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!value) return;

    const url = qs.stringifyUrl(
      {
        url: "/search",
        query: { term: value },
      },
      { skipEmptyString: true }
    );

    setShowPreview(false);
    router.push(url);
  };

  const onClear = () => {
    setValue("");
    clearResults();
    setShowPreview(false);
  };

  const onFocus = () => {
    if (value.length >= 2) {
      setShowPreview(true);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (newValue.length >= 2) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="flex justify-center mb-8">
      <div ref={searchRef} className="relative w-full max-w-md">
        <form onSubmit={onSubmit} className="flex items-center">
          <Input
            value={value}
            onChange={onInputChange}
            onFocus={onFocus}
            placeholder="Search streams and users..."
            className="rounded-r-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 bg-background-secondary border-border-primary"
          />
          {value && (
            <X
              className="absolute top-2.5 right-14 h-5 w-5 text-text-secondary cursor-pointer hover:opacity-75 transition z-10"
              onClick={onClear}
            />
          )}
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            className="rounded-l-none bg-interactive-primary hover:bg-interactive-hover text-text-inverse"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
        </form>

        {showPreview && (
          <SearchPreview
            results={results}
            isLoading={isLoading}
            error={error}
            query={value}
            onClose={closePreview}
          />
        )}
      </div>
    </div>
  );
};