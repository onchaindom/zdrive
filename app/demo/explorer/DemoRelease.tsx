'use client';

import { useState } from 'react';
import { MOCK_FILES, formatDateDot, formatHolders } from './mockdata';
import { FILE_TYPE_ICONS, IconFile } from '@/components/ui/FileTypeIcon';

const BG = '#E8E8E8';
const TEXT = '#1E1E1E';
const MUTED = '#888888';
const DOTTED = '#ABABAB';
const SURFACE = '#DEDEDE';

// Use the first file as our "current release"
const FILE = MOCK_FILES[0];

function FileIcon({ type }: { type: string }) {
  const Icon = FILE_TYPE_ICONS[type] || IconFile;
  return <Icon className="w-4 h-4" />;
}

export function DemoRelease() {
  const [detailsOpen, setDetailsOpen] = useState(true);

  const breadcrumb = [
    'Z:',
    FILE.creator.toUpperCase(),
    ...(FILE.folder ? [FILE.folder.toUpperCase()] : []),
    `${FILE.name.toUpperCase()}${FILE.ext.toUpperCase()}`,
  ];

  return (
    <div
      className="min-h-screen font-display text-sm"
      style={{ background: BG, color: TEXT }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header
        className="h-12 flex items-center px-6 gap-4"
        style={{ borderBottom: `0.5px dotted ${DOTTED}` }}
      >
        <nav className="flex items-center gap-1 text-xs font-light">
          {breadcrumb.map((seg, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span style={{ color: MUTED }}>{' \\ '}</span>}
              <span
                className={i < breadcrumb.length - 1 ? 'cursor-pointer hover:underline' : 'font-bold'}
                style={{ color: i < breadcrumb.length - 1 ? MUTED : TEXT }}
              >
                {seg}
              </span>
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs font-light tracking-wide" style={{ color: MUTED }}>
            UPLOAD&#8599;
          </span>
          <button
            className="px-2.5 py-1 text-xs font-mono"
            style={{ border: `0.5px dotted ${DOTTED}`, color: TEXT }}
          >
            +++
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full"
              style={{ background: DOTTED }}
            />
            <span className="text-xs font-light">USER.ETH</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Column: Preview ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview placeholder */}
            <div
              className="w-full aspect-[16/10] flex items-center justify-center"
              style={{ background: SURFACE, border: `0.5px dotted ${DOTTED}` }}
            >
              <span className="text-4xl" style={{ color: DOTTED }}>
                {FILE.type}
              </span>
            </div>

            {/* Attachments */}
            <div style={{ border: `0.5px dotted ${DOTTED}` }}>
              <div className="h-9 flex items-center px-4 text-[10px] uppercase tracking-widest font-light" style={{ color: MUTED, borderBottom: `0.5px dotted ${DOTTED}` }}>
                ATTACHMENTS
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs font-light">{FILE.name}{FILE.ext}</span>
                <span className="text-[10px] font-mono" style={{ color: MUTED }}>{FILE.size}</span>
                <button className="text-[10px] underline ml-auto font-light" style={{ color: MUTED }}>Download</button>
              </div>
            </div>

            {/* Holders & Activity */}
            <CollapsibleBlock title="Holders & Activity">
              <div className="space-y-2 text-xs font-light" style={{ color: MUTED }}>
                <div className="flex justify-between py-1" style={{ borderBottom: `0.5px dotted ${DOTTED}` }}>
                  <span>{FILE.creator}</span>
                  <span className="font-mono">42.1%</span>
                </div>
                <div className="flex justify-between py-1" style={{ borderBottom: `0.5px dotted ${DOTTED}` }}>
                  <span className="font-mono">0xB8c4...3E7f</span>
                  <span className="font-mono">12.8%</span>
                </div>
                <div className="flex justify-between py-1" style={{ borderBottom: `0.5px dotted ${DOTTED}` }}>
                  <span className="font-mono">0x2Da9...6F1b</span>
                  <span className="font-mono">8.3%</span>
                </div>
                <div className="text-center py-2">
                  <span className="text-[10px] underline cursor-pointer">View all {formatHolders(FILE.holders)} holders</span>
                </div>
              </div>
            </CollapsibleBlock>
          </div>

          {/* ── Side Panel ─────────────────────────────────────────────── */}
          <div
            className="p-5 space-y-0"
            style={{ border: `0.5px dotted ${DOTTED}`, background: SURFACE }}
          >
            {/* Title + Creator */}
            <div className="pb-4">
              {/* Title row: icon + filename + +++ */}
              <div className="flex items-center gap-2">
                <FileIcon type={FILE.type} />
                <h1 className="text-lg font-bold tracking-tight leading-tight flex-1">
                  {FILE.name}{FILE.ext}
                </h1>
                <button
                  className="px-2.5 py-1 text-xs font-mono shrink-0"
                  style={{ border: `0.5px dotted ${DOTTED}`, color: TEXT }}
                >
                  +++
                </button>
              </div>

              {/* Creator */}
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="w-5 h-5 rounded-full shrink-0"
                  style={{ background: DOTTED }}
                />
                <span className="text-xs font-light uppercase" style={{ color: MUTED }}>
                  {FILE.creator.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs mt-3 leading-relaxed font-light" style={{ color: MUTED }}>
                {FILE.description}
              </p>
            </div>

            {/* Thin solid separator */}
            <div style={{ borderTop: `1px solid ${DOTTED}` }} />

            {/* Details disclosure */}
            <div className="pt-4">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="flex items-center gap-1.5 text-xs font-light uppercase tracking-widest transition-colors"
                style={{ color: MUTED }}
              >
                <span>{detailsOpen ? '\u25BE' : '\u25B8'}</span>
                <span>DETAILS</span>
              </button>

              {detailsOpen && (
                <div className="mt-4 space-y-0">
                  {/* MARKET */}
                  <div className="pb-4">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest mb-2 font-light" style={{ color: MUTED }}>
                      <span className="text-xs">&#x1F4C8;</span>
                      <span>MARKET</span>
                    </div>
                    <DetailRow label="Market Cap" value={FILE.marketCap} />
                    <DetailRow label="Volume" value={FILE.volume} />
                    <DetailRow label="Holders" value={formatHolders(FILE.holders)} />
                  </div>

                  <div style={{ borderTop: `0.5px dotted ${DOTTED}` }} />

                  {/* COIN */}
                  <div className="py-4">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest mb-2 font-light" style={{ color: MUTED }}>
                      <span className="text-xs">&#x25CF;</span>
                      <span>COIN</span>
                    </div>
                    <DetailRow label="Symbol" value={`$${FILE.symbol}`} />
                    <DetailRow label="Contract" value={FILE.contract} />
                    <DetailRow label="Created" value={formatDateDot(FILE.date)} />
                    <div className="mt-2 space-y-1">
                      <span className="block text-xs underline cursor-pointer font-light" style={{ color: MUTED }}>
                        View on Zora
                      </span>
                      <span className="block text-xs underline cursor-pointer font-light" style={{ color: MUTED }}>
                        View on Basescan
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: `0.5px dotted ${DOTTED}` }} />

                  {/* USAGE */}
                  <div className="pt-4">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest mb-2 font-light" style={{ color: MUTED }}>
                      <span className="text-xs">&#x25A0;</span>
                      <span>USAGE</span>
                    </div>
                    <DetailRow label="Content type" value={FILE.type} />
                    <DetailRow label="License" value="CBE-CC0" />
                    <DetailRow label="Download" value="Open" />
                    <DetailRow label="Commercial use" value="Open" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-1">
      <span className="text-xs font-light" style={{ color: MUTED }}>{label}</span>
      <span className="text-xs font-mono">{value}</span>
    </div>
  );
}

function CollapsibleBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `0.5px dotted ${DOTTED}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold transition-colors"
        style={{ background: open ? SURFACE : 'transparent' }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = SURFACE; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <span>{title}</span>
        <span style={{ color: MUTED }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        <div className="px-4 py-3" style={{ borderTop: `0.5px dotted ${DOTTED}` }}>
          {children}
        </div>
      )}
    </div>
  );
}
