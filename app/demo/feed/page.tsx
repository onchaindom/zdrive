'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MOCK_RELEASES,
  getCreatorByAddress,
  formatDateTime,
  formatHolders,
  type MockRelease,
} from '../mockdata';
import { Zorb, FILE_TYPE_ICONS, IconFile, Sparkline, DisclosureLink } from '@/components/ui';

// ─── Breadcrumb Header ───────────────────────────────────────────────────────

function FeedBreadcrumb({ selected }: { selected: MockRelease | null }) {
  const creator = selected ? getCreatorByAddress(selected.creator) : null;

  return (
    <div className="h-12 border-b border-zd-border bg-zd-bg flex items-center px-6 gap-6">
      <div className="font-display tracking-tight text-lg flex items-center gap-0">
        <Link href="/demo" className="text-zd-text transition-colors duration-150 hover:text-zd-text-secondary">Z:</Link>
        {selected && creator && (
          <>
            <span className="text-zd-text-muted mx-1.5">\</span>
            <span className="text-zd-text uppercase">{creator.name}</span>
          </>
        )}
        {selected && selected.collection && (
          <>
            <span className="text-zd-text-muted mx-1.5">\</span>
            <span className="text-zd-text uppercase">{selected.collection}</span>
          </>
        )}
        {selected && (
          <>
            <span className="text-zd-text-muted mx-1.5">\</span>
            <span className="font-bold text-zd-text uppercase">{selected.name}</span>
          </>
        )}
      </div>
      <nav className="flex items-center gap-4 ml-auto">
        <span className="text-xs text-zd-text-muted uppercase tracking-wide">Upload:</span>
        <button className="text-sm font-mono text-zd-text border border-zd-border px-2 py-0.5 hover:bg-zd-surface-hover transition-colors duration-100">
          +++
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

function DetailSidebar({ release }: { release: MockRelease }) {
  const creator = getCreatorByAddress(release.creator);
  const TypeIcon = FILE_TYPE_ICONS[release.type] || IconFile;

  return (
    <div className="w-[320px] flex-shrink-0 p-6">
      {/* Header: icon + name + collect */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <TypeIcon />
          <span className="font-display text-base tracking-tight">{release.name}</span>
        </div>
        <button className="text-sm font-mono text-zd-text border border-zd-border px-2 py-0.5 hover:bg-zd-surface-hover transition-colors duration-100 flex-shrink-0">
          +++
        </button>
      </div>

      {/* Creator */}
      {creator && (
        <div className="flex items-center gap-1.5 mt-2">
          <Zorb size={14} seed={creator.avatarSeed} />
          <span className="text-xs text-zd-text-muted uppercase">{creator.name}</span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-zd-text-secondary mt-4 leading-relaxed">
        {release.name} is a {release.type.toLowerCase()} about {release.name.toLowerCase()} by {creator?.name || 'unknown'}
      </p>

      {/* Divider */}
      <div className="border-t border-zd-border mt-5 pt-4">
        <DisclosureLink label="Details">
          {/* MARKET */}
          <div className="mt-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkline data={[12, 15, 14, 18, 22, 19, 25]} width={14} height={10} />
              <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Market</span>
            </div>
            <div className="border-t border-zd-border pt-2 space-y-1">
              <p className="text-sm text-zd-text-secondary">Market Cap</p>
              <p className="text-sm text-zd-text-secondary">Volume</p>
              <p className="text-sm text-zd-text-secondary">Holders</p>
            </div>
          </div>

          {/* COIN */}
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] text-zd-text-muted">&#9679;</span>
              <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Coin</span>
            </div>
            <div className="border-t border-zd-border pt-2 space-y-1">
              <p className="text-sm text-zd-text-secondary">Market Cap</p>
              <p className="text-sm text-zd-text-secondary">Volume</p>
              <p className="text-sm text-zd-text-secondary">Holders</p>
            </div>
          </div>

          {/* USAGE */}
          <div className="mt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] text-zd-text-muted">&#9632;</span>
              <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Usage</span>
            </div>
            <div className="border-t border-zd-border pt-2 space-y-1">
              <p className="text-sm text-zd-text-secondary">Market Cap</p>
              <p className="text-sm text-zd-text-secondary">Volume</p>
              <p className="text-sm text-zd-text-secondary">Holders</p>
            </div>
          </div>
        </DisclosureLink>
      </div>
    </div>
  );
}

// ─── Release Row ─────────────────────────────────────────────────────────────

const COL_GRID = 'grid-cols-[48px_1fr_160px_140px_80px_64px_64px]';

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
      className={`grid ${COL_GRID} items-center h-12 px-4 border-b border-zd-border cursor-pointer transition-colors duration-100 ${
        isSelected ? 'bg-zd-surface' : 'hover:bg-zd-surface-hover'
      }`}
    >
      <div className="flex justify-center text-zd-text">
        <TypeIcon />
      </div>
      <div className="font-display text-base tracking-tight truncate pr-4">
        {release.name}
      </div>
      <div className="text-sm text-zd-text-secondary truncate">
        {creator?.name || release.creator}
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
      <div className="flex justify-end">
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-mono text-zd-text border border-zd-border px-1.5 py-0.5 hover:bg-zd-surface-hover transition-colors duration-100"
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Breadcrumb header */}
      <FeedBreadcrumb selected={selectedRelease} />

      {/* Content area */}
      <div className="flex flex-1">
        {/* Table area */}
        <div className="flex-1 min-w-0">
          {/* Column headers */}
          <div className={`grid ${COL_GRID} items-center h-9 px-4 border-b border-zd-border`}>
            <span className="text-[11px] text-zd-text-muted uppercase tracking-wider text-center">Type</span>
            <span className="text-[11px] text-zd-text-muted uppercase tracking-wider">Title</span>
            <span className="text-[11px] text-zd-text-muted uppercase tracking-wider">Creator</span>
            <span className="text-[11px] text-zd-text-muted uppercase tracking-wider">Created</span>
            <span className="text-[11px] text-zd-text-muted uppercase tracking-wider text-right">Holders</span>
            <span className="text-[11px] text-zd-text-muted uppercase tracking-wider text-right">Vol</span>
            <span className="text-[11px] text-zd-text-muted uppercase tracking-wider text-right">Collect</span>
          </div>

          {/* Rows */}
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

        {/* Detail sidebar */}
        {selectedRelease && (
          <aside className="border-l border-zd-border">
            <DetailSidebar release={selectedRelease} />
          </aside>
        )}
      </div>
    </div>
  );
}
