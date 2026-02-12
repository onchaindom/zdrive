'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Dark Mode Toggle ────────────────────────────────────────────────────────

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('zdrive-demo-theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('zdrive-demo-theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-6 z-50 bg-zd-button-bg text-zd-text-secondary text-sm px-3 py-1.5 transition-colors duration-150 hover:bg-zd-button-bg-hover"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8">
      <div className="border-b border-zd-border pb-2 mb-6">
        <h2 className="font-display text-2xl tracking-tighter">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── File type icons (inline SVGs, 16px, 1.25px stroke) ─────────────────────

function IconPDF({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 1h5.5L13 4.5V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z" />
      <path d="M9 1v4h4" />
      <path d="M5 9h6" />
      <path d="M5 11.5h4" />
    </svg>
  );
}

function Icon3D({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 1 L14 4.5 L14 11.5 L8 15 L2 11.5 L2 4.5 Z" />
      <path d="M8 1 L8 8" />
      <path d="M8 8 L14 4.5" />
      <path d="M8 8 L2 4.5" />
      <path d="M8 8 L8 15" />
    </svg>
  );
}

function IconImage({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <circle cx="5.5" cy="5.5" r="1" />
      <path d="M14 10.5 L11 7.5 L6 12.5" />
      <path d="M8.5 11 L7 9.5 L2 14" />
    </svg>
  );
}

function IconVideo({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M6.5 6.5 L10.5 8 L6.5 9.5 Z" />
    </svg>
  );
}

function IconCode({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5.5 4.5 L2 8 L5.5 11.5" />
      <path d="M10.5 4.5 L14 8 L10.5 11.5" />
      <path d="M9 3 L7 13" />
    </svg>
  );
}

function IconCloud({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="5" cy="6" r="0.75" />
      <circle cx="8" cy="4" r="0.75" />
      <circle cx="11" cy="5.5" r="0.75" />
      <circle cx="6" cy="9" r="0.75" />
      <circle cx="10" cy="8" r="0.75" />
      <circle cx="4" cy="12" r="0.75" />
      <circle cx="8" cy="11.5" r="0.75" />
      <circle cx="12" cy="11" r="0.75" />
      <circle cx="7" cy="7" r="0.75" />
      <circle cx="11" cy="13" r="0.75" />
      <circle cx="3.5" cy="9.5" r="0.75" />
      <circle cx="13" cy="8.5" r="0.75" />
    </svg>
  );
}

function IconFile({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 1h5.5L13 4.5V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z" />
      <path d="M9 1v4h4" />
    </svg>
  );
}

const FILE_TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  PDF: IconPDF,
  '3D': Icon3D,
  IMG: IconImage,
  VID: IconVideo,
  MD: IconCode,
  PLY: IconCloud,
  FILE: IconFile,
};

// ─── Zorb (gradient sphere SVG) ──────────────────────────────────────────────

function Zorb({ size = 32, seed = '0x0000' }: { size?: number; seed?: string }) {
  const hash = seed.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  const h3 = (h1 + 180) % 360;
  const id = `zorb-${seed.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={id} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={`hsl(${h1}, 70%, 72%)`} />
          <stop offset="50%" stopColor={`hsl(${h2}, 60%, 58%)`} />
          <stop offset="100%" stopColor={`hsl(${h3}, 50%, 40%)`} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id})`} />
    </svg>
  );
}

// ─── Zorb Loader Concepts ────────────────────────────────────────────────────

// 1. WANDERING LIGHT — Rotating gradient with focal point near the upper-left
//    edge. The whole orb rotates clockwise with ease-in-out. Colors cycle
//    through the full hue wheel in sync, maintaining a 115° arc:
//    highlight (sat 75%, light 72%) → midtone (-45°, sat 60%, light 55%)
//    → shadow (-115°, sat 50%, light 35%).

function ZorbWanderingLight({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="z-wander" cx="30%" cy="30%" r="65%">
          {/* Highlight: base hue, high sat/light. One 60° shift per 2s rotation, full cycle in 12s */}
          <stop offset="0%" stopColor="hsl(35,75%,72%)">
            <animate attributeName="stop-color"
              values="hsl(35,75%,72%);hsl(95,75%,72%);hsl(155,75%,72%);hsl(215,75%,72%);hsl(275,75%,72%);hsl(335,75%,72%);hsl(35,75%,72%)"
              dur="12s" repeatCount="indefinite" />
          </stop>
          {/* Midtone: base-45°, medium sat/light */}
          <stop offset="55%" stopColor="hsl(350,60%,55%)">
            <animate attributeName="stop-color"
              values="hsl(350,60%,55%);hsl(50,60%,55%);hsl(110,60%,55%);hsl(170,60%,55%);hsl(230,60%,55%);hsl(290,60%,55%);hsl(350,60%,55%)"
              dur="12s" repeatCount="indefinite" />
          </stop>
          {/* Shadow: base-115°, low sat/light */}
          <stop offset="100%" stopColor="hsl(280,50%,35%)">
            <animate attributeName="stop-color"
              values="hsl(280,50%,35%);hsl(340,50%,35%);hsl(40,50%,35%);hsl(100,50%,35%);hsl(160,50%,35%);hsl(220,50%,35%);hsl(280,50%,35%)"
              dur="12s" repeatCount="indefinite" />
          </stop>
        </radialGradient>
      </defs>
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 50 50;360 50 50"
          dur="2s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.42 0 0.58 1"
        />
        <circle cx="50" cy="50" r="48" fill="url(#z-wander)" />
      </g>
    </svg>
  );
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, width = 80, height = 24 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Disclosure Link ─────────────────────────────────────────────────────────

function DisclosureLink({ label, children }: { label: string; children: React.ReactNode }) {
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

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_RELEASES = [
  { name: 'Emergence', type: 'PDF', collection: 'Morphic Studies', contract: '0xA3f2...1B4c', holders: '1.2K', date: '2d ago' },
  { name: 'Lattice Dreams', type: '3D', collection: '—', contract: '0x7Fe1...9D2a', holders: '847', date: '5d ago' },
  { name: 'Field Notes vol. 3', type: 'IMG', collection: 'Field Notes', contract: '0xB8c4...3E7f', holders: '2.1K', date: 'Jan 12' },
  { name: 'Resonance', type: 'VID', collection: '—', contract: '0x2Da9...6F1b', holders: '562', date: 'Jan 8' },
  { name: 'substrate.md', type: 'MD', collection: 'Research', contract: '0xC5e7...4A2d', holders: '189', date: 'Dec 29' },
  { name: 'genesis.ply', type: 'PLY', collection: 'Scans', contract: '0x9Fb3...8C5e', holders: '93', date: 'Dec 15' },
];

const SPARKLINE_DATA = [12, 15, 14, 18, 22, 19, 25, 28, 26, 30, 33, 29, 35, 38, 36, 40];

// ─── Color Swatch ────────────────────────────────────────────────────────────

function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 border border-zd-border flex-shrink-0"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <div>
        <div className="text-sm font-medium text-zd-text">{name}</div>
        <div className="text-xs font-mono text-zd-text-muted">{cssVar}</div>
      </div>
    </div>
  );
}

// ─── Breadcrumb Header ───────────────────────────────────────────────────────

type BreadcrumbSegment = { label: string; href?: string };

function BreadcrumbHeader({ segments }: { segments: BreadcrumbSegment[] }) {
  return (
    <div className="h-12 border-b border-zd-border bg-zd-bg flex items-center px-6 gap-6">
      <div className="font-display tracking-tight text-lg flex items-center">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="text-zd-text mx-0.5">/</span>}
            {i < segments.length - 1 ? (
              <a href={seg.href || '#'} className="text-zd-text transition-colors duration-150 hover:text-zd-text-secondary">{seg.label}</a>
            ) : (
              <span className="text-zd-text">{seg.label}</span>
            )}
          </span>
        ))}
      </div>
      <nav className="flex items-center gap-5 ml-auto">
        <a href="#" className="text-sm text-zd-text-secondary transition-colors duration-150 hover:text-zd-text">Feed</a>
        <button className="bg-zd-button-bg text-zd-text text-sm px-3 py-1 transition-colors duration-150 hover:bg-zd-button-bg-hover">
          Connect
        </button>
      </nav>
    </div>
  );
}

const BREADCRUMB_VARIANTS: { label: string; segments: BreadcrumbSegment[] }[] = [
  {
    label: 'Home',
    segments: [{ label: 'Z:' }],
  },
  {
    label: 'Creator',
    segments: [{ label: 'Z:', href: '#' }, { label: 'morph.eth' }],
  },
  {
    label: 'Collection',
    segments: [{ label: 'Z:', href: '#' }, { label: 'morph.eth', href: '#' }, { label: 'Morphic Studies' }],
  },
  {
    label: 'Release',
    segments: [{ label: 'Z:', href: '#' }, { label: 'morph.eth', href: '#' }, { label: 'Morphic Studies', href: '#' }, { label: 'Emergence.pdf' }],
  },
];

// ─── Demo Header ─────────────────────────────────────────────────────────────

function DemoHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <div className="h-12 border-b border-zd-border bg-zd-bg flex items-center px-6 gap-6">
      <span className="font-display text-lg tracking-tight">Z:DRIVE</span>
      <nav className="flex items-center gap-5 ml-auto">
        <a href="#" className="text-sm text-zd-text transition-colors duration-150">Feed</a>
        <a href="#" className="text-sm text-zd-text-secondary transition-colors duration-150 hover:text-zd-text">Create</a>
        <div
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
              placeholder="Search releases..."
              className="w-full bg-transparent border-b border-zd-border text-sm text-zd-text placeholder:text-zd-text-muted outline-none py-0.5"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>
        <button className="bg-zd-button-bg text-zd-text text-sm px-3 py-1 transition-colors duration-150 hover:bg-zd-button-bg-hover">
          Connect
        </button>
      </nav>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-zd-bg/80" />
      <div
        className="relative bg-zd-surface border border-zd-border p-6 w-full max-w-sm z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-zd-text-muted text-lg leading-none hover:text-zd-text transition-colors duration-150"
        >
          &times;
        </button>
        <h3 className="font-display text-xl tracking-tight mb-3">Collect this release</h3>
        <p className="text-sm text-zd-text-secondary mb-4">
          You are about to collect &ldquo;Emergence&rdquo; by 0xA3f2...1B4c.
        </p>
        <button className="w-full bg-zd-accent text-zd-bg text-sm font-medium py-2.5 transition-colors duration-150 hover:bg-zd-accent-hover">
          + COLLECT
        </button>
      </div>
    </div>
  );
}

// ─── Preview Mockup Container ────────────────────────────────────────────────

function PreviewMockup({ label, icon, children, showDownload = false }: { label: string; icon?: React.ReactNode; children?: React.ReactNode; showDownload?: boolean }) {
  return (
    <div className="border border-zd-border bg-zd-surface group/preview">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zd-border">
        {icon && <span className="text-zd-text">{icon}</span>}
        <span className="text-xs font-mono text-zd-text-muted">{label}</span>
      </div>
      <div className="relative flex items-center justify-center p-6 min-h-[120px] text-zd-text-muted">
        {children}
        {showDownload && (
          <button className="absolute top-2 right-2 bg-zd-bg/70 p-1.5 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-150 text-zd-text-secondary hover:text-zd-text">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8.5" />
              <path d="M4.5 7.5 8 11l3.5-3.5" />
              <path d="M3 13h10" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Demo Page ──────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('Explore');
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  return (
    <div className="max-w-[960px] mx-auto px-6 pb-16">
      <ThemeToggle />

      {/* Title */}
      <div className="pt-12 pb-8">
        <h1 className="font-display text-4xl tracking-tighter mb-2">Z:DRIVE Design System</h1>
        <p className="text-sm text-zd-text-secondary">Component reference and visual demo</p>
      </div>

      {/* ── 1. Color Palette ─────────────────────────────────────────────── */}
      <Section title="Color Palette">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Swatch name="Background" cssVar="--zd-bg" />
          <Swatch name="Surface" cssVar="--zd-surface" />
          <Swatch name="Surface Hover" cssVar="--zd-surface-hover" />
          <Swatch name="Border" cssVar="--zd-border" />
          <Swatch name="Border Hover" cssVar="--zd-border-hover" />
          <Swatch name="Text" cssVar="--zd-text" />
          <Swatch name="Text Secondary" cssVar="--zd-text-secondary" />
          <Swatch name="Text Muted" cssVar="--zd-text-muted" />
          <Swatch name="Accent" cssVar="--zd-accent" />
          <Swatch name="Accent Hover" cssVar="--zd-accent-hover" />
          <Swatch name="Button BG" cssVar="--zd-button-bg" />
          <Swatch name="Button BG Hover" cssVar="--zd-button-bg-hover" />
        </div>
      </Section>

      {/* ── 2. Typography ────────────────────────────────────────────────── */}
      <Section title="Typography">
        <div className="space-y-6">
          <div>
            <p className="text-xs text-zd-text-muted mb-1 font-mono">font-display / 2.75rem (44px) — Inter</p>
            <p className="font-display tracking-tighter" style={{ fontSize: '2.75rem', lineHeight: 1.1 }}>A home for your creative work</p>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-1 font-mono">font-display / 2rem (32px) — Inter</p>
            <p className="font-display tracking-tighter" style={{ fontSize: '2rem', lineHeight: 1.2 }}>Share, collect, and sustain what matters</p>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-1 font-mono">font-display / 1.5rem (24px) — Inter</p>
            <p className="font-display tracking-tight" style={{ fontSize: '1.5rem', lineHeight: 1.3 }}>Emergence</p>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-1 font-mono">font-display / 1.125rem (18px) — Inter</p>
            <p className="font-display tracking-tight" style={{ fontSize: '1.125rem', lineHeight: 1.4 }}>Lattice Dreams — an exploration of form</p>
          </div>
          <div className="border-t border-zd-border pt-4">
            <p className="text-xs text-zd-text-muted mb-1 font-mono">system sans / 0.9375rem (15px) — body</p>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.5 }}>The quick brown fox jumps over the lazy dog. This is body text at the base size, used for descriptions, paragraphs, and general content throughout the interface.</p>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-1 font-mono">system sans / 0.8125rem (13px) — small</p>
            <p className="text-zd-text-secondary" style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>Metadata, secondary labels, table data, form hints</p>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-1 font-mono">system sans / 0.6875rem (11px) — xs</p>
            <p className="text-zd-text-muted" style={{ fontSize: '0.6875rem', lineHeight: 1.4 }}>Timestamps, fine print, tertiary labels</p>
          </div>
          <div className="border-t border-zd-border pt-4">
            <p className="text-xs text-zd-text-muted mb-1 font-mono">monospace — data display</p>
            <p className="font-mono text-sm text-zd-text-secondary">0xA3f2B7c9D1e4F8a6b2C5d7E9f0A1B4c3D6e8F7</p>
            <p className="font-mono text-xs text-zd-text-muted mt-1">$4,280.50 &middot; 1.2K holders &middot; 89.3 ETH vol</p>
          </div>
        </div>
      </Section>

      {/* ── 3. Buttons ───────────────────────────────────────────────────── */}
      <Section title="Buttons">
        <div className="space-y-6">
          <div>
            <p className="text-xs text-zd-text-muted mb-3 font-mono">Primary (flat, Are.na-style)</p>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="bg-zd-button-bg text-zd-text text-sm font-medium px-4 py-2 transition-colors duration-150 hover:bg-zd-button-bg-hover">
                Feed
              </button>
              <button className="bg-zd-button-bg text-zd-text text-sm font-medium px-4 py-2 transition-colors duration-150 hover:bg-zd-button-bg-hover">
                Create
              </button>
              <button className="bg-zd-button-bg text-zd-text text-sm font-medium px-4 py-2 transition-colors duration-150 hover:bg-zd-button-bg-hover">
                Connect
              </button>
              <button
                className="bg-zd-button-bg text-zd-text text-sm font-medium px-4 py-2 transition-colors duration-150 hover:bg-zd-button-bg-hover"
                onClick={() => {
                  setLoadingBtn(true);
                  setTimeout(() => setLoadingBtn(false), 2000);
                }}
              >
                {loadingBtn ? '...' : 'Load More'}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-3 font-mono">Collect CTA (inverted)</p>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="bg-zd-accent text-zd-bg text-sm font-medium px-5 py-2.5 transition-colors duration-150 hover:bg-zd-accent-hover active:opacity-80">
                + COLLECT
              </button>
              <button className="bg-zd-accent text-zd-bg text-sm font-medium px-5 py-2.5 transition-colors duration-150 hover:bg-zd-accent-hover">
                COLLECT $EMRG
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-3 font-mono">Text links / secondary</p>
            <div className="flex items-center gap-4 flex-wrap">
              <a href="#" className="text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">View on Zora</a>
              <a href="#" className="text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">Download</a>
              <a href="#" className="text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">View license (PDF)</a>
            </div>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-3 font-mono">Disabled</p>
            <button className="bg-zd-button-bg text-zd-text-muted text-sm font-medium px-4 py-2 cursor-not-allowed opacity-50">
              Unavailable
            </button>
          </div>
        </div>
      </Section>

      {/* ── 4. Form Elements ─────────────────────────────────────────────── */}
      <Section title="Form Elements">
        <div className="max-w-md space-y-6">
          <div>
            <label className="block text-sm text-zd-text-secondary font-medium mb-1">Release Name</label>
            <input
              type="text"
              placeholder="e.g. Emergence"
              className="w-full bg-transparent border-0 border-b border-zd-border text-zd-text text-base py-1.5 outline-none placeholder:text-zd-text-muted focus:border-zd-text transition-colors duration-150"
            />
          </div>
          <div>
            <label className="block text-sm text-zd-text-secondary font-medium mb-1">Symbol</label>
            <input
              type="text"
              placeholder="e.g. EMRG"
              maxLength={10}
              className="w-full bg-transparent border-0 border-b border-zd-border text-zd-text text-base py-1.5 outline-none placeholder:text-zd-text-muted focus:border-zd-text transition-colors duration-150 uppercase"
            />
            <p className="text-xs text-zd-text-muted mt-1">Max 10 characters, auto-uppercase</p>
          </div>
          <div>
            <label className="block text-sm text-zd-text-secondary font-medium mb-1">Description</label>
            <textarea
              placeholder="Describe your release..."
              rows={3}
              className="w-full bg-transparent border-0 border-b border-zd-border text-zd-text text-base py-1.5 outline-none placeholder:text-zd-text-muted focus:border-zd-text transition-colors duration-150 resize-y"
            />
          </div>
          <div>
            <label className="block text-sm text-zd-text-secondary font-medium mb-1">GitHub Repository</label>
            <input
              type="text"
              placeholder="https://github.com/user/repo"
              className="w-full bg-transparent border-0 border-b border-zd-border text-zd-text text-base py-1.5 outline-none placeholder:text-zd-text-muted focus:border-zd-text transition-colors duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-red-500">Name (error state)</label>
            <input
              type="text"
              defaultValue="$$$invalid"
              className="w-full bg-transparent border-0 border-b border-red-400 text-zd-text text-base py-1.5 outline-none"
            />
            <p className="text-xs text-red-500 mt-1">Name cannot contain special characters</p>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-3 font-mono">File uploader</p>
            <div className="border border-dashed border-zd-border py-8 px-4 text-center">
              <p className="text-sm text-zd-text-muted">Drop a file here, or click to select</p>
              <p className="text-xs text-zd-text-muted mt-1">PNG, JPEG, GIF, WebP, SVG, PDF, GLB, MP4, PLY</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 5. Release List ──────────────────────────────────────────────── */}
      <Section title="Release List">
        <div className="border border-zd-border">
          {/* Column headers */}
          <div className="grid grid-cols-[40px_1fr_140px_140px_80px_80px] items-center h-9 px-3 border-b border-zd-border text-xs text-zd-text-secondary font-medium">
            <div className="text-center"></div>
            <div>Name</div>
            <div>Collection</div>
            <div>Contract</div>
            <div className="text-right">Holders</div>
            <div className="text-right">Created</div>
          </div>
          {/* Rows */}
          {MOCK_RELEASES.map((r) => {
            const TypeIcon = FILE_TYPE_ICONS[r.type] || IconFile;
            return (
              <div
                key={r.name}
                className="grid grid-cols-[40px_1fr_140px_140px_80px_80px] items-center h-12 px-3 border-b border-zd-border last:border-b-0 cursor-pointer transition-colors duration-150 hover:bg-zd-surface-hover group"
              >
                <div className="flex justify-center text-zd-text">
                  <TypeIcon />
                </div>
                <div className="font-display text-lg tracking-tight leading-tight truncate pr-4 group-hover:text-zd-text">{r.name}</div>
                <div className="text-sm text-zd-text-muted truncate">{r.collection}</div>
                <div className="text-xs text-zd-text-muted font-mono truncate">{r.contract}</div>
                <div className="text-xs text-zd-text-muted text-right">{r.holders}</div>
                <div className="text-xs text-zd-text-muted text-right">{r.date}</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── 6. Tabs ──────────────────────────────────────────────────────── */}
      <Section title="Tabs">
        <div className="flex items-center gap-6">
          {['Feed', 'Explore', 'Markets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm pb-1.5 transition-colors duration-150 ${
                activeTab === tab
                  ? 'text-zd-text border-b border-zd-text'
                  : 'text-zd-text-muted hover:text-zd-text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <p className="text-sm text-zd-text-secondary mt-4">Active tab: {activeTab}</p>
      </Section>

      {/* ── 7. Header ────────────────────────────────────────────────────── */}
      <Section title="Header">
        <div className="border border-zd-border">
          <DemoHeader />
        </div>
        <p className="text-xs text-zd-text-muted mt-2">Hover over &ldquo;Search&rdquo; to expand the input</p>
      </Section>

      {/* ── 7b. Breadcrumb Navigation ────────────────────────────────────── */}
      <Section title="Breadcrumb Navigation">
        <p className="text-sm text-zd-text-secondary mb-4">File-path breadcrumb inspired by drive notation. Parent segments are linked; current segment is plain.</p>
        <div className="space-y-2">
          {BREADCRUMB_VARIANTS.map((v) => (
            <div key={v.label}>
              <p className="text-xs text-zd-text-muted font-mono mb-1">{v.label}</p>
              <div className="border border-zd-border">
                <BreadcrumbHeader segments={v.segments} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 8. Detail Page Sidebar ────────────────────────────────────────── */}
      <Section title="Detail Page Sidebar">
        <div className="max-w-xs border border-zd-border bg-zd-surface p-5 space-y-0">
          {/* Title + Creator + Collection + Description + Sparkline */}
          <div className="pb-4">
            <h3 className="font-display text-xl tracking-tight leading-tight">Emergence</h3>
            <div className="flex items-center gap-2 mt-2">
              <Zorb size={20} seed="0xA3f2" />
              <a href="#" className="text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">0xA3f2...1B4c</a>
            </div>
            <div className="mt-2">
              <span className="text-sm text-zd-text-secondary">Part of </span>
              <a href="#" className="text-sm text-zd-text underline">Morphic Studies</a>
            </div>
            <p className="text-sm text-zd-text-secondary mt-3 leading-relaxed">
              An exploration of emergent patterns in generative systems. PDF document with full-color plates.
            </p>
            <div className="mt-3 text-zd-text-muted">
              <Sparkline data={SPARKLINE_DATA} width={280} height={39} />
            </div>
          </div>
          {/* Divider + Collect + Details */}
          <div className="border-t border-zd-border pt-4 pb-4">
            <button className="w-full bg-zd-accent text-zd-bg text-sm font-medium py-2.5 transition-colors duration-150 hover:bg-zd-accent-hover active:opacity-80">
              + COLLECT
            </button>
            <div className="mt-3">
              <DisclosureLink label="Details">
                <div className="flex justify-between text-sm">
                  <span className="text-zd-text-secondary">Market cap</span>
                  <span className="text-zd-text font-mono text-xs">$4,280</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zd-text-secondary">Volume</span>
                  <span className="text-zd-text font-mono text-xs">89.3 ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zd-text-secondary">Holders</span>
                  <span className="text-zd-text font-mono text-xs">1,247</span>
                </div>
                <div className="my-2 border-t border-zd-border" />
                <div className="flex justify-between text-sm">
                  <span className="text-zd-text-secondary">Type</span>
                  <span className="text-zd-text font-mono text-xs">PDF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zd-text-secondary">Contract</span>
                  <span className="font-mono text-xs text-zd-text-muted">0x1234...5678</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zd-text-secondary">Created</span>
                  <span className="text-zd-text font-mono text-xs">Feb 9, 2026</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zd-text-secondary">License</span>
                  <span className="text-zd-text font-mono text-xs">CBE-CC0</span>
                </div>
                <div className="space-y-1.5 mt-2">
                  <a href="#" className="block text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">View on Zora</a>
                  <a href="#" className="block text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">View on Basescan</a>
                  <a href="#" className="block text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">View on GeckoTerminal</a>
                </div>
              </DisclosureLink>
            </div>
          </div>
          {/* Post-collect note */}
          <div className="border-t border-zd-border pt-3">
            <p className="text-xs text-zd-text-muted">Download available after collecting</p>
          </div>
        </div>
      </Section>

      {/* ── 9. Modal ─────────────────────────────────────────────────────── */}
      <Section title="Modal">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-zd-button-bg text-zd-text text-sm font-medium px-4 py-2 transition-colors duration-150 hover:bg-zd-button-bg-hover"
        >
          Open Modal
        </button>
        <DemoModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </Section>

      {/* ── 10. Loading States — Zorb Loader Concepts ────────────────────── */}
      <Section title="Loading States — Zorb Loader Concepts">
        <p className="text-sm text-zd-text-secondary mb-6">Wandering Light was selected as the zorb loader — a key branding element.</p>
        <div className="space-y-8">

          {/* Concept 1: Wandering Light */}
          <div>
            <p className="text-xs text-zd-text-muted font-mono border-b border-zd-border pb-1 mb-4">1. Wandering Light — focal point drifts in orbit, gentle color shift</p>
            <div className="flex items-end gap-6">
              <div className="flex flex-col items-center gap-2">
                <ZorbWanderingLight size={80} />
                <span className="text-xs text-zd-text-muted font-mono">80px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ZorbWanderingLight size={48} />
                <span className="text-xs text-zd-text-muted font-mono">48px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ZorbWanderingLight size={32} />
                <span className="text-xs text-zd-text-muted font-mono">32px</span>
              </div>
            </div>
          </div>

          {/* Skeleton blocks */}
          <div>
            <p className="text-xs text-zd-text-muted mb-3 font-mono">Skeleton blocks (warm pulse)</p>
            <div className="space-y-3 max-w-md">
              <div className="h-5 w-48 bg-zd-surface animate-pulse rounded-sm" />
              <div className="h-4 w-72 bg-zd-surface animate-pulse rounded-sm" />
              <div className="h-4 w-56 bg-zd-surface animate-pulse rounded-sm" />
              <div className="h-12 w-full bg-zd-surface animate-pulse rounded-sm" />
            </div>
          </div>
          <div>
            <p className="text-xs text-zd-text-muted mb-3 font-mono">Button loading state</p>
            <button className="bg-zd-button-bg text-zd-text-muted text-sm font-medium px-4 py-2">
              ...
            </button>
          </div>
        </div>
      </Section>

      {/* ── 11. Icons ────────────────────────────────────────────────────── */}
      <Section title="File Type Icons">
        <div className="flex items-center gap-6 flex-wrap">
          {Object.entries(FILE_TYPE_ICONS).map(([type, Icon]) => (
            <div key={type} className="flex flex-col items-center gap-2">
              <div className="text-zd-text">
                <Icon />
              </div>
              <span className="text-xs text-zd-text-muted font-mono">{type}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          {Object.entries(FILE_TYPE_ICONS).map(([type, Icon]) => (
            <div key={type} className="flex flex-col items-center gap-2">
              <div className="text-zd-text">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-zd-text-muted font-mono">20px</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 12. Zorb Avatars ─────────────────────────────────────────────── */}
      <Section title="Zorb Avatars">
        <div className="flex items-center gap-4 flex-wrap">
          <Zorb size={48} seed="0xA3f2B7c9" />
          <Zorb size={48} seed="0x7Fe1D4a2" />
          <Zorb size={48} seed="0xB8c4E9f3" />
          <Zorb size={48} seed="0x2Da9F6b1" />
          <Zorb size={48} seed="0xC5e7A4d2" />
          <Zorb size={48} seed="0x9Fb3C8e5" />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Zorb size={20} seed="0xA3f2B7c9" />
          <span className="text-sm text-zd-text-secondary">Inline avatar with creator link</span>
        </div>
      </Section>

      {/* ── 13. Landing Page Preview ─────────────────────────────────────── */}
      <Section title="Landing Page Preview">
        <div className="border border-zd-border bg-zd-bg relative overflow-hidden">
          {/* Faint zorb background */}
          <div className="absolute bottom-0 right-0 opacity-[0.06] translate-x-1/4 translate-y-1/4">
            <ZorbWanderingLight size={320} />
          </div>
          {/* Breadcrumb header */}
          <BreadcrumbHeader segments={[{ label: 'Z:' }]} />
          {/* Content */}
          <div className="relative px-6 py-8">
            <p className="font-display tracking-tighter leading-tight" style={{ fontSize: '2rem', lineHeight: 1.2 }}>
              A quiet home for creative work.
              <br />
              Share, collect, sustain.
            </p>
            {/* Mini release list */}
            <div className="mt-6 border border-zd-border">
              {MOCK_RELEASES.slice(0, 3).map((r) => {
                const TypeIcon = FILE_TYPE_ICONS[r.type] || IconFile;
                return (
                  <div
                    key={r.name}
                    className="grid grid-cols-[32px_1fr_140px_80px] items-center h-10 px-3 border-b border-zd-border last:border-b-0 cursor-pointer transition-colors duration-150 hover:bg-zd-surface-hover"
                  >
                    <div className="flex justify-center text-zd-text">
                      <TypeIcon />
                    </div>
                    <div className="font-display text-base tracking-tight leading-tight truncate pr-4">{r.name}</div>
                    <div className="text-sm text-zd-text-muted truncate">{r.collection}</div>
                    <div className="text-xs text-zd-text-muted text-right">{r.date}</div>
                  </div>
                );
              })}
            </div>
            {/* CTAs */}
            <div className="flex items-center gap-4 mt-6">
              <button className="bg-zd-button-bg text-zd-text text-sm font-medium px-5 py-2.5 transition-colors duration-150 hover:bg-zd-button-bg-hover">
                Explore
              </button>
              <button className="bg-zd-button-bg text-zd-text text-sm font-medium px-5 py-2.5 transition-colors duration-150 hover:bg-zd-button-bg-hover">
                Create
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 14. Sparkline ────────────────────────────────────────────────── */}
      <Section title="Sparkline">
        <div className="flex items-center gap-6">
          <div className="text-zd-text-muted">
            <Sparkline data={SPARKLINE_DATA} width={80} height={24} />
          </div>
          <div className="text-zd-text-muted">
            <Sparkline data={[5, 8, 3, 12, 7, 15, 10, 18, 14, 20]} width={80} height={24} />
          </div>
          <div className="text-zd-text-muted">
            <Sparkline data={[20, 18, 15, 12, 10, 8, 6, 5, 3, 2]} width={80} height={24} />
          </div>
        </div>
      </Section>

      {/* ── 15. Creator Profile Preview ──────────────────────────────────── */}
      <Section title="Creator Profile">
        <div className="max-w-lg">
          <div className="flex items-start gap-4 pb-4">
            <Zorb size={48} seed="0xA3f2B7c9" />
            <div>
              <h3 className="font-display text-xl tracking-tight">morph.eth</h3>
              <p className="text-sm text-zd-text-secondary mt-1 leading-relaxed">
                Exploring the boundaries of generative art and computational form. Based in Berlin.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-mono text-zd-text-muted">$MORPH</span>
                <a href="#" className="text-xs text-zd-text-muted underline transition-colors duration-150 hover:text-zd-text-secondary">Basescan</a>
              </div>
            </div>
          </div>
          {/* Filter row */}
          <div className="border-t border-zd-border pt-3 flex items-center gap-2 flex-wrap">
            {['All', 'PDF', '3D', 'IMG', 'VID', 'MD', 'PLY'].map((f, i) => (
              <button
                key={f}
                className={`text-xs px-2.5 py-1 transition-colors duration-150 ${
                  i === 0
                    ? 'bg-zd-button-bg text-zd-text'
                    : 'text-zd-text-muted hover:text-zd-text-secondary'
                }`}
              >
                {f}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button className="text-xs px-2.5 py-1 bg-zd-button-bg text-zd-text">All</button>
              <button className="text-xs px-2.5 py-1 text-zd-text-muted">By Collection</button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 16. File Previewers ───────────────────────────────────────────── */}
      <Section title="File Previewers">
        <p className="text-sm text-zd-text-secondary mb-6">Wireframe mockups of each preview type — containers, control bars, and labels.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Image Viewer */}
          <PreviewMockup label="image.png" icon={<IconImage />} showDownload>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 border border-dashed border-zd-border flex items-center justify-center">
                <IconImage className="w-6 h-6" />
              </div>
              <p className="text-xs text-zd-text-muted">Click to expand</p>
            </div>
          </PreviewMockup>

          {/* PDF Viewer */}
          <div className="border border-zd-border bg-zd-surface">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zd-border">
              <span className="text-zd-text"><IconPDF /></span>
              <span className="text-xs font-mono text-zd-text-muted">document.pdf</span>
            </div>
            <div className="flex items-center justify-center p-6 min-h-[120px] text-zd-text-muted">
              <div className="w-20 h-28 border border-zd-border bg-zd-bg" />
            </div>
            <div className="flex items-center justify-between px-3 py-2 border-t border-zd-border text-xs text-zd-text-muted">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-zd-button-bg">&larr;</span>
                <span>1 / 12</span>
                <span className="px-1.5 py-0.5 bg-zd-button-bg">&rarr;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-zd-button-bg">&minus;</span>
                <span>100%</span>
                <span className="px-1.5 py-0.5 bg-zd-button-bg">+</span>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <PreviewMockup label="clip.mp4" icon={<IconVideo />} showDownload>
            <div className="w-full bg-zd-bg border border-zd-border flex items-center justify-center py-8">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-zd-text-muted">
                <path d="M12 8 L24 16 L12 24 Z" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
          </PreviewMockup>

          {/* 3D Model Viewer */}
          <PreviewMockup label="model.glb" icon={<Icon3D />} showDownload>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 border border-dashed border-zd-border flex items-center justify-center">
                <Icon3D className="w-6 h-6" />
              </div>
              <p className="text-xs text-zd-text-muted">Drag to rotate &middot; Scroll to zoom</p>
            </div>
          </PreviewMockup>

          {/* Point Cloud Viewer */}
          <PreviewMockup label="scan.ply" icon={<IconCloud />} showDownload>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 border border-dashed border-zd-border flex items-center justify-center">
                <IconCloud className="w-6 h-6" />
              </div>
              <p className="text-xs text-zd-text-muted">Drag to rotate &middot; Scroll to zoom</p>
            </div>
          </PreviewMockup>

          {/* Markdown Viewer */}
          <PreviewMockup label="readme.md" icon={<IconCode />}>
            <div className="w-full px-4 space-y-2">
              <div className="h-3 w-32 bg-zd-surface-hover rounded-sm" />
              <div className="h-2 w-full bg-zd-surface-hover rounded-sm" />
              <div className="h-2 w-3/4 bg-zd-surface-hover rounded-sm" />
              <div className="h-2 w-5/6 bg-zd-surface-hover rounded-sm" />
            </div>
          </PreviewMockup>

          {/* GitHub Preview Card */}
          <PreviewMockup label="github.com" icon={<IconCode />}>
            <div className="w-full px-4">
              <div className="border border-zd-border bg-zd-bg p-3 space-y-2">
                <div className="h-3 w-40 bg-zd-surface-hover rounded-sm" />
                <div className="h-2 w-full bg-zd-surface-hover rounded-sm" />
                <div className="flex items-center gap-4 mt-2">
                  <div className="h-2 w-8 bg-zd-surface-hover rounded-sm" />
                  <div className="h-2 w-8 bg-zd-surface-hover rounded-sm" />
                  <div className="h-2 w-8 bg-zd-surface-hover rounded-sm" />
                </div>
              </div>
            </div>
          </PreviewMockup>
        </div>

        {/* Shared states */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Loading state */}
          <div className="border border-zd-border bg-zd-surface">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zd-border">
              <span className="text-xs font-mono text-zd-text-muted">Loading state</span>
            </div>
            <div className="flex items-center justify-center p-8">
              <ZorbWanderingLight size={48} />
            </div>
          </div>

          {/* Error state */}
          <div className="border border-zd-border bg-zd-surface">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zd-border">
              <span className="text-xs font-mono text-zd-text-muted">Error state</span>
            </div>
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-zd-text-muted">Failed to load preview</p>
            </div>
          </div>
        </div>
      </Section>

    </div>
  );
}
