'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import clsx from 'clsx';

const navLinks = [
  { href: '/feed', label: 'Feed' },
  { href: '/create', label: 'Create' },
];

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
      }
    },
    [searchQuery, router]
  );

  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            'text-sm transition-colors duration-150',
            pathname === link.href
              ? 'text-zd-text'
              : 'text-zd-text-secondary hover:text-zd-text'
          )}
        >
          {link.label}
        </Link>
      ))}

      <form
        onSubmit={handleSearch}
        className="relative flex items-center"
        onMouseEnter={() => setSearchOpen(true)}
        onMouseLeave={() => {
          if (inputRef.current && inputRef.current !== document.activeElement) {
            setSearchOpen(false);
          }
        }}
      >
        <span className="text-sm text-zd-text-muted cursor-pointer select-none">Search</span>
        <div
          className="overflow-hidden transition-all duration-200 ease-out"
          style={{ width: searchOpen ? '180px' : '0px', marginLeft: searchOpen ? '8px' : '0px' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search releases..."
            className="w-full bg-transparent border-b border-zd-border text-sm text-zd-text placeholder:text-zd-text-muted outline-none py-0.5"
            onBlur={() => setSearchOpen(false)}
          />
        </div>
      </form>

      <ConnectButton />
    </>
  );
}
