'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import clsx from 'clsx';

const navLinks = [
  { href: '/feed', label: 'Feed' },
  { href: '/create', label: 'Create' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  return (
    <header className="sticky top-0 z-30 border-b border-zdrive-border bg-zdrive-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 text-lg font-medium tracking-tight hover:opacity-70"
        >
          Z:Drive
        </Link>

        {/* Search - Hidden on mobile */}
        <form onSubmit={handleSearch} className="hidden flex-1 sm:block sm:max-w-xs">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full border border-zdrive-border bg-zdrive-bg py-1.5 pl-8 pr-3 text-sm placeholder:text-zdrive-text-muted focus:border-zdrive-border-hover focus:outline-none"
            />
            <svg
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zdrive-text-muted"
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

        {/* Navigation */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'text-sm transition-colors',
                pathname === link.href
                  ? 'text-zdrive-text'
                  : 'text-zdrive-text-secondary hover:text-zdrive-text'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <ConnectButton />
      </div>
    </header>
  );
}
