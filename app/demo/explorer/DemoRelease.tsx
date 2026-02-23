'use client';

import { useState } from 'react';
import { MOCK_FILES, formatDateDot, formatHolders } from './mockdata';

/**
 * Release detail page demo
 *
 * - Two-column: preview left, details right
 * - Keep expandable details concept (DisclosureLink style)
 * - Matches the new color scheme: bg #E8E8E8, text #1E1E1E
 */

const BG = '#E8E8E8';
const TEXT = '#1E1E1E';
const MUTED = '#888888';
const BORDER = '#C8C8C8';
const SURFACE = '#DEDEDE';

// Use the first file as our "current release"
const FILE = MOCK_FILES[0];

export function DemoRelease() {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div
      className="min-h-screen font-mono text-sm"
      style={{ background: BG, color: TEXT }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header
        className="h-12 flex items-center px-6 gap-6"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <span className="font-bold text-base tracking-tight">Z:DRIVE</span>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="cursor-pointer hover:underline" style={{ color: MUTED }}>Z:</span>
          <span style={{ color: MUTED }}>/</span>
          <span className="cursor-pointer hover:underline" style={{ color: MUTED }}>{FILE.creator}</span>
          <span style={{ color: MUTED }}>/</span>
          <span>{FILE.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs" style={{ color: MUTED }}>
          <span className="cursor-pointer hover:underline">Feed</span>
          <span className="cursor-pointer hover:underline">Create</span>
          <button
            className="px-3 py-1.5"
            style={{ border: `1px solid ${TEXT}`, color: TEXT }}
          >
            Connect
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main Column: Preview ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview placeholder */}
            <div
              className="w-full aspect-[16/10] flex items-center justify-center"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <span className="text-4xl" style={{ color: BORDER }}>
                {FILE.type}
              </span>
            </div>

            {/* Attachments */}
            <div style={{ border: `1px solid ${BORDER}` }}>
              <div className="h-9 flex items-center px-4 text-[10px] uppercase tracking-widest" style={{ color: MUTED, borderBottom: `1px solid ${BORDER}` }}>
                / Attachments
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs">{FILE.name}{FILE.ext}</span>
                <span className="text-[10px]" style={{ color: MUTED }}>{FILE.size}</span>
                <button className="text-[10px] underline ml-auto" style={{ color: MUTED }}>Download</button>
              </div>
            </div>

            {/* Holders & Activity (collapsed) */}
            <CollapsibleBlock title="Holders & Activity">
              <div className="space-y-2 text-xs" style={{ color: MUTED }}>
                <div className="flex justify-between py-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <span>{FILE.creator}</span>
                  <span>42.1%</span>
                </div>
                <div className="flex justify-between py-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <span>0xB8c4...3E7f</span>
                  <span>12.8%</span>
                </div>
                <div className="flex justify-between py-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <span>0x2Da9...6F1b</span>
                  <span>8.3%</span>
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
            style={{ border: `1px solid ${BORDER}`, background: SURFACE }}
          >
            {/* Title + Creator */}
            <div className="pb-4">
              <h1 className="text-xl font-bold tracking-tight leading-tight">{FILE.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ background: BORDER }}
                />
                <span className="text-xs underline cursor-pointer" style={{ color: MUTED }}>
                  {FILE.creator}
                </span>
              </div>
              {FILE.folder && (
                <div className="mt-2 text-xs">
                  <span style={{ color: MUTED }}>Part of </span>
                  <span className="underline cursor-pointer">{FILE.folder}</span>
                </div>
              )}
              <p className="text-xs mt-3 leading-relaxed" style={{ color: MUTED }}>
                {FILE.description}
              </p>
            </div>

            {/* Collect */}
            <div className="pt-4 pb-4" style={{ borderTop: `1px solid ${BORDER}` }}>
              <button
                className="w-full py-2.5 text-xs font-bold tracking-wider"
                style={{ background: TEXT, color: BG }}
              >
                COLLECT &middot; 0.001 ETH
              </button>

              {/* Expandable details */}
              <div className="mt-3">
                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: MUTED }}
                >
                  <svg
                    width="6"
                    height="8"
                    viewBox="0 0 6 8"
                    fill="currentColor"
                    className={`transition-transform duration-150 ${detailsOpen ? 'rotate-90' : ''}`}
                  >
                    <path d="M0 0L6 4L0 8Z" />
                  </svg>
                  <span className="underline">Details</span>
                </button>

                {detailsOpen && (
                  <div className="mt-3 space-y-0">
                    {/* MARKET */}
                    <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>
                      / MARKET
                    </div>
                    <DetailRow label="Market cap" value={FILE.marketCap} />
                    <DetailRow label="Volume" value={FILE.volume} />
                    <DetailRow label="Holders" value={formatHolders(FILE.holders)} />

                    {/* COIN */}
                    <div className="pt-3 mt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                      <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>
                        / COIN
                      </div>
                      <DetailRow label="Symbol" value={`$${FILE.symbol}`} />
                      <DetailRow label="Contract" value={FILE.contract} />
                      <DetailRow label="Created" value={formatDateDot(FILE.date)} />
                      <div className="mt-2 space-y-1">
                        <span className="block text-xs underline cursor-pointer" style={{ color: MUTED }}>
                          View on Zora
                        </span>
                        <span className="block text-xs underline cursor-pointer" style={{ color: MUTED }}>
                          View on Basescan
                        </span>
                      </div>
                    </div>

                    {/* LICENSE */}
                    <div className="pt-3 mt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                      <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>
                        / LICENSE
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
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-1">
      <span className="text-xs" style={{ color: MUTED }}>{label}</span>
      <span className="text-xs">{value}</span>
    </div>
  );
}

function CollapsibleBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${BORDER}` }}>
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
        <div className="px-4 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          {children}
        </div>
      )}
    </div>
  );
}
