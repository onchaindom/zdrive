'use client';

import Link from 'next/link';
import { HeaderNav } from './HeaderNav';

export function Header() {
  return (
    <header className="sticky top-0 z-30 h-12 border-b border-zd-border bg-zd-bg flex items-center px-6 gap-6">
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-lg tracking-tight hover:opacity-70 transition-opacity"
      >
        Z:DRIVE
      </Link>

      {/* Navigation + Search + Wallet */}
      <nav className="flex items-center gap-5 ml-auto">
        <HeaderNav />
      </nav>
    </header>
  );
}
