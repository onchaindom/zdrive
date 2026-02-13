'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search releases, creators...',
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            'w-full bg-transparent border-0 border-b border-zd-border py-2 pr-8 text-sm',
            'placeholder:text-zd-text-muted',
            'focus:border-zd-text focus:outline-none transition-colors duration-150'
          )}
        />
        <svg
          className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zd-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </form>
  );
}
