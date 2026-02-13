'use client';

import { useState } from 'react';

export function DisclosureLink({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-zd-text-secondary hover:text-zd-text transition-colors duration-150 group"
      >
        <svg
          width="6"
          height="8"
          viewBox="0 0 6 8"
          fill="currentColor"
          className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        >
          <path d="M0 0L6 4L0 8Z" />
        </svg>
        <span className="underline">{label}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
