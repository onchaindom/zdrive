'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MOCK_RELEASES,
  getCreatorByAddress,
  formatDateTime,
  formatHolders,
  releaseName,
  type MockRelease,
} from '../mockdata';
import { Zorb, FILE_TYPE_ICONS, IconFile } from '@/components/ui';

// ─── Upload Arrow Icon ──────────────────────────────────────────────────────

function IconUploadArrow({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="12" x2="8" y2="3" />
      <polyline points="4,6 8,2 12,6" />
      <line x1="3" y1="14" x2="13" y2="14" />
    </svg>
  );
}

// ─── Preview Modal ───────────────────────────────────────────────────────────

function PreviewModal({ release, onClose }: { release: MockRelease; onClose: () => void }) {
  const TypeIcon = FILE_TYPE_ICONS[release.type] || IconFile;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-zd-bg/80" />
      <div
        className="relative bg-zd-bg border border-zd-text w-full max-w-3xl max-h-[85vh] z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zd-text">
          <div className="flex items-center gap-2">
            <TypeIcon />
            <span className="text-sm font-mono">{releaseName(release)}</span>
          </div>
          <button
            onClick={onClose}
            className="text-zd-text text-lg leading-none hover:text-zd-text-secondary transition-colors duration-100"
          >
            &times;
          </button>
        </div>
        <div className="flex items-center justify-center p-12 min-h-[480px]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 border border-dashed border-zd-text flex items-center justify-center">
              <TypeIcon className="w-8 h-8" />
            </div>
            <p className="text-sm text-zd-text-secondary">{release.type} preview</p>
            <p className="text-xs text-zd-text-muted mt-1">{releaseName(release)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Breadcrumb Header ───────────────────────────────────────────────────────

function FeedBreadcrumb({ selected }: { selected: MockRelease | null }) {
  const creator = selected ? getCreatorByAddress(selected.creator) : null;

  return (
    <div className="h-12 border-b border-zd-text bg-zd-bg flex items-center px-6 gap-6 flex-shrink-0 z-10">
      <div className="font-display tracking-tight text-lg flex items-center gap-0">
        <Link href="/demo" className="text-zd-text transition-colors duration-150 hover:text-zd-text-secondary">Z:</Link>
        {selected && creator ? (
          <>
            <span className="text-zd-text mx-2.5">\</span>
            <span className="text-zd-text uppercase">{creator.name}</span>
            {selected.collection && (
              <>
                <span className="text-zd-text mx-2.5">\</span>
                <span className="text-zd-text uppercase">{selected.collection}</span>
              </>
            )}
            <span className="text-zd-text mx-2.5">\</span>
            <span className="font-bold text-zd-text uppercase">{releaseName(selected)}</span>
          </>
        ) : (
          <>
            <span className="text-zd-text mx-2.5">\</span>
            <span className="text-zd-text-muted">*</span>
          </>
        )}
      </div>
      <nav className="flex items-center gap-4 ml-auto">
        <span className="text-xs text-zd-text-muted uppercase tracking-wide">Upload:</span>
        <button className="text-sm font-mono bg-zd-text text-zd-bg px-2 py-0.5 hover:bg-zd-cta transition-colors duration-100 flex items-center gap-1">
          <IconUploadArrow className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-2">
          <Zorb size={20} seed="0xA3f2B7c9" />
          <span className="text-xs text-zd-text uppercase">onchaindom.eth</span>
        </div>
      </nav>
    </div>
  );
}

// ─── Detail Sidebar ──────────────────────────────────────────────────────────

function DetailSidebar({
  release,
  onOpenPreview,
  onClose,
}: {
  release: MockRelease;
  onOpenPreview: () => void;
  onClose: () => void;
}) {
  const creator = getCreatorByAddress(release.creator);
  const TypeIcon = FILE_TYPE_ICONS[release.type] || IconFile;

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar header with close button */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zd-text flex-shrink-0">
        <div className="flex items-center gap-2">
          <TypeIcon />
          <Link href={`/demo/release/${release.contractAddress}`} className="font-display text-base tracking-tight hover:text-zd-text-secondary transition-colors duration-100">
            {releaseName(release)}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="text-xs font-mono bg-zd-text text-zd-bg px-1.5 py-0.5 hover:bg-zd-cta transition-colors duration-100"
          >
            +++
          </button>
          <button
            onClick={onClose}
            className="text-zd-text text-lg leading-none hover:text-zd-text-secondary transition-colors duration-100 ml-1"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Scrollable sidebar content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Creator */}
        {creator && (
          <div className="flex items-center gap-1.5">
            <Zorb size={14} seed={creator.avatarSeed} />
            <span className="text-xs text-zd-text uppercase">{creator.name}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-zd-text-secondary mt-3 leading-relaxed">
          {release.name} is a {release.type.toLowerCase()} about {release.name.toLowerCase()} by {creator?.name || 'unknown'}
        </p>

        {/* Preview frame (matching PreviewShell) */}
        <div className="mt-4 border border-zd-text bg-zd-surface group/preview">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zd-text">
            <TypeIcon />
            <span className="text-xs font-mono text-zd-text-secondary truncate">{releaseName(release)}</span>
          </div>
          <div className="relative">
            <button
              onClick={onOpenPreview}
              className="w-full flex items-center justify-center aspect-[4/3] cursor-pointer hover:bg-zd-surface-hover transition-colors duration-100"
            >
              <div className="text-center">
                <TypeIcon className="w-10 h-10 mx-auto" />
                <p className="text-xs text-zd-text-muted mt-2 group-hover/preview:text-zd-text-secondary transition-colors duration-100">Click to expand</p>
              </div>
            </button>
            <button
              className="absolute top-2 right-2 bg-zd-bg/70 p-1.5 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-150 text-zd-text-secondary hover:text-zd-text"
              aria-label="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v8.5" />
                <path d="M4.5 7.5 8 11l3.5-3.5" />
                <path d="M3 13h10" />
              </svg>
            </button>
          </div>
        </div>

        {/* MARKET details */}
        <div className="border-t border-zd-text mt-5 pt-3">
          <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Market</span>
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Market cap</span>
              <span className="font-mono text-xs">${release.marketCap.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Volume (24h)</span>
              <span className="font-mono text-xs">${(release.volume * 38.2).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Total volume</span>
              <span className="font-mono text-xs">{release.volume} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Unique holders</span>
              <span className="font-mono text-xs">{release.holders.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* COIN details */}
        <div className="border-t border-zd-text mt-5 pt-3">
          <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Coin</span>
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Symbol</span>
              <span className="font-mono text-xs">${creator?.coinSymbol || 'TOKEN'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Address</span>
              <span className="font-mono text-xs text-zd-text-muted">{release.contractAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Total supply</span>
              <span className="font-mono text-xs">1,000,000,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Creator</span>
              <span className="font-mono text-xs text-zd-text-muted">{creator?.address.slice(0, 8)}...{creator?.address.slice(-4)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Created</span>
              <span className="font-mono text-xs">{formatDateTime(release.date)}</span>
            </div>
            <div className="space-y-1 mt-1.5">
              <a href="#" className="block text-sm text-zd-text-secondary underline hover:text-zd-text transition-colors duration-100">View on Zora</a>
              <a href="#" className="block text-sm text-zd-text-secondary underline hover:text-zd-text transition-colors duration-100">View on Basescan</a>
            </div>
          </div>
        </div>

        {/* CONTENT details */}
        <div className="border-t border-zd-text mt-5 pt-3">
          <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Content</span>
          <div className="mt-2 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Type</span>
              <span className="font-mono text-xs">{release.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Filename</span>
              <span className="font-mono text-xs">{releaseName(release)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Collection</span>
              <span className="font-mono text-xs">{release.collection || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">License</span>
              <a href="#" className="font-mono text-xs underline hover:text-zd-text-secondary transition-colors duration-100">CBE-CC0</a>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Download gate</span>
              <span className="font-mono text-xs">Collect 1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zd-text-secondary">Commercial use</span>
              <span className="font-mono text-xs">Own 100 ${creator?.coinSymbol || 'TOKEN'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Release Row ─────────────────────────────────────────────────────────────

const COL_GRID = 'grid-cols-[48px_1fr_180px_140px_140px_80px_64px_80px_64px]';

function ReleaseRow({
  release,
  isSelected,
  onSelect,
}: {
  release: MockRelease;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const creator = getCreatorByAddress(release.creator);
  const TypeIcon = FILE_TYPE_ICONS[release.type] || IconFile;

  return (
    <div
      onClick={onSelect}
      className={`grid ${COL_GRID} items-center h-9 px-4 border-b border-zd-text cursor-pointer transition-colors duration-100 ${
        isSelected ? 'bg-zd-surface' : 'hover:bg-zd-surface-hover'
      }`}
    >
      <div className="flex justify-center text-zd-text">
        <TypeIcon />
      </div>
      <div className="font-display text-sm tracking-tight truncate pr-4">
        {releaseName(release)}
      </div>
      <div className="flex items-center gap-1.5 truncate">
        {creator && <Zorb size={14} seed={creator.avatarSeed} />}
        <span className="text-sm text-zd-text truncate">
          {creator?.name || release.creator}
        </span>
      </div>
      <div className="text-xs font-mono text-zd-text-muted truncate">
        {release.collection || '—'}
      </div>
      <div className="text-xs font-mono text-zd-text-muted">
        {formatDateTime(release.date)}
      </div>
      <div className="text-xs font-mono text-zd-text-muted text-right">
        {formatHolders(release.holders)}
      </div>
      <div className="text-xs font-mono text-zd-text-muted text-right">
        {release.volume}
      </div>
      <div className="text-xs font-mono text-zd-text-muted text-right">
        ${release.marketCap.toLocaleString()}
      </div>
      <div className="flex justify-end">
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-mono bg-zd-text text-zd-bg px-1.5 py-0.5 hover:bg-zd-cta transition-colors duration-100"
        >
          +++
        </button>
      </div>
    </div>
  );
}

// ─── Main Feed Demo ──────────────────────────────────────────────────────────

export default function FeedDemoPage() {
  const [selectedRelease, setSelectedRelease] = useState<MockRelease | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Breadcrumb header — stays at top, not in scroll container */}
      <FeedBreadcrumb selected={selectedRelease} />

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Column headers */}
          <div className={`grid ${COL_GRID} items-center h-8 px-4 border-b border-zd-text flex-shrink-0`}>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider text-center">Type</span>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider">Title</span>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider">Creator</span>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider">Collection</span>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider">Created</span>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider text-right">Holders</span>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider text-right">Vol</span>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider text-right">MCap</span>
            <span className="text-[11px] text-zd-text-muted italic uppercase tracking-wider text-right">Collect</span>
          </div>

          {/* Scrollable rows */}
          <div className="flex-1 overflow-y-auto">
            {MOCK_RELEASES.map((release) => (
              <ReleaseRow
                key={release.contractAddress}
                release={release}
                isSelected={selectedRelease?.contractAddress === release.contractAddress}
                onSelect={() => setSelectedRelease(
                  selectedRelease?.contractAddress === release.contractAddress ? null : release
                )}
              />
            ))}
          </div>
        </div>

        {/* Detail sidebar — independent scroll */}
        {selectedRelease && (
          <aside className="w-[480px] flex-shrink-0 border-l border-zd-text overflow-hidden">
            <DetailSidebar
              release={selectedRelease}
              onOpenPreview={() => setPreviewOpen(true)}
              onClose={() => setSelectedRelease(null)}
            />
          </aside>
        )}
      </div>

      {/* Preview modal */}
      {previewOpen && selectedRelease && (
        <PreviewModal release={selectedRelease} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
