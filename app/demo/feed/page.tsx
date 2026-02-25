'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MOCK_RELEASES,
  PLATFORM_STATS,
  getCreatorByAddress,
  getTypeCounts,
  getCollectionCounts,
  getCreatorCounts,
  formatDate,
  type ReleaseType,
  type MockRelease,
} from '../mockdata';

// ─── Type badge labels ───────────────────────────────────────────────────────

const TYPE_LABELS: Record<ReleaseType, string> = {
  PDF: 'PDF',
  '3D': '3D',
  IMG: 'IMG',
  VID: 'VID',
  CODE: 'CODE',
  PLY: 'PLY',
  BLOG: 'BLOG',
};

// ─── Stats Ticker ────────────────────────────────────────────────────────────

function StatsTicker() {
  const stats = [
    `TOTAL RELEASES: ${PLATFORM_STATS.totalReleases}`,
    `CREATORS: ${PLATFORM_STATS.creators}`,
    `TOTAL VOLUME: ${PLATFORM_STATS.totalVolume} ETH`,
    `UNIQUE HOLDERS: ${PLATFORM_STATS.uniqueHolders.toLocaleString()}+`,
  ];

  return (
    <div className="border-b border-zd-border overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...stats, ...stats].map((stat, i) => (
          <span key={i} className="text-xs font-mono text-zd-text-muted mx-6">
            {stat}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Filter Disclosure ───────────────────────────────────────────────────────

function FilterGroup({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: { key: string; count: number }[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-zd-border pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-xs font-mono text-zd-text-secondary uppercase tracking-wide">/ {label}</span>
        <span className="text-xs text-zd-text-muted transition-transform duration-150" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          &#9662;
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-1.5">
          {items.map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 cursor-pointer group/item"
            >
              <input
                type="checkbox"
                checked={selected.has(item.key)}
                onChange={() => onToggle(item.key)}
                className="sr-only"
              />
              <span
                className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center transition-colors duration-100 ${
                  selected.has(item.key)
                    ? 'border-zd-text bg-zd-text'
                    : 'border-zd-border group-hover/item:border-zd-border-hover'
                }`}
              >
                {selected.has(item.key) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="var(--zd-bg)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-zd-text-secondary group-hover/item:text-zd-text transition-colors duration-100 flex-1">{item.key}</span>
              <span className="text-xs font-mono text-zd-text-muted">{item.count}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Release Row ─────────────────────────────────────────────────────────────

function ReleaseRow({ release }: { release: MockRelease }) {
  const creator = getCreatorByAddress(release.creator);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_60px_36px] items-center border-b border-zd-border py-3 px-2 -mx-2 group transition-colors duration-100 hover:bg-zd-surface-hover cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[8px] text-zd-text-muted leading-none flex-shrink-0">&#9632;</span>
        <span className="text-xs font-mono text-zd-text-muted flex-shrink-0 w-[72px]">{formatDate(release.date)}</span>
        <span className="text-sm text-zd-text truncate">{release.name}</span>
        {creator && (
          <span className="text-xs text-zd-text-muted truncate hidden sm:inline">{creator.name}</span>
        )}
      </div>
      <span className="text-[10px] font-mono text-zd-text-secondary uppercase tracking-wider text-right">
        {TYPE_LABELS[release.type]}
      </span>
      <button className="text-sm text-zd-text-muted hover:text-zd-text transition-colors duration-100 text-right opacity-0 group-hover:opacity-100">
        +
      </button>
    </div>
  );
}

// ─── Main Feed Demo ──────────────────────────────────────────────────────────

export default function FeedDemoPage() {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());

  const toggleInSet = (set: Set<string>, key: string): Set<string> => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  const hasFilters = selectedTypes.size > 0 || selectedCollections.size > 0 || selectedCreators.size > 0;

  const filteredReleases = useMemo(() => {
    return MOCK_RELEASES.filter((r) => {
      if (selectedTypes.size > 0 && !selectedTypes.has(r.type)) return false;
      if (selectedCollections.size > 0) {
        const col = r.collection || 'Uncollected';
        if (!selectedCollections.has(col)) return false;
      }
      if (selectedCreators.size > 0) {
        const creator = getCreatorByAddress(r.creator);
        const name = creator?.name || r.creator;
        if (!selectedCreators.has(name)) return false;
      }
      return true;
    });
  }, [selectedTypes, selectedCollections, selectedCreators]);

  const typeCounts = useMemo(() => getTypeCounts(MOCK_RELEASES), []);
  const collectionCounts = useMemo(() => getCollectionCounts(MOCK_RELEASES), []);
  const creatorCounts = useMemo(() => getCreatorCounts(MOCK_RELEASES), []);

  const typeItems = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }));

  const collectionItems = Object.entries(collectionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }));

  const creatorItems = Object.entries(creatorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count }));

  const clearFilters = () => {
    setSelectedTypes(new Set());
    setSelectedCollections(new Set());
    setSelectedCreators(new Set());
  };

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Back link */}
      <div className="px-6 pt-6">
        <Link href="/demo" className="text-sm text-zd-text-muted hover:text-zd-text-secondary transition-colors duration-150">&larr; Back to demos</Link>
      </div>

      {/* Stats ticker */}
      <div className="mt-6">
        <StatsTicker />
      </div>

      {/* Page title */}
      <div className="px-6 pt-10 pb-8">
        <h1 className="font-display tracking-tighter" style={{ fontSize: '3.5rem', lineHeight: 1.05 }}>
          Feed <span className="text-zd-text-muted">({filteredReleases.length})</span>
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-0 border-t border-zd-border">
        {/* Filter sidebar */}
        <aside className="w-[240px] flex-shrink-0 border-r border-zd-border px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-mono text-zd-text-secondary uppercase tracking-wide">/ Filter</span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-zd-text-muted hover:text-zd-text-secondary transition-colors duration-100"
              >
                Clear filters
              </button>
            )}
          </div>
          <FilterGroup
            label="Type"
            items={typeItems}
            selected={selectedTypes}
            onToggle={(key) => setSelectedTypes(toggleInSet(selectedTypes, key))}
          />
          <FilterGroup
            label="Collection"
            items={collectionItems}
            selected={selectedCollections}
            onToggle={(key) => setSelectedCollections(toggleInSet(selectedCollections, key))}
          />
          <FilterGroup
            label="Creator"
            items={creatorItems}
            selected={selectedCreators}
            onToggle={(key) => setSelectedCreators(toggleInSet(selectedCreators, key))}
          />
        </aside>

        {/* Release table */}
        <main className="flex-1 min-w-0 px-6 py-6">
          {/* Column headers */}
          <div className="grid grid-cols-[minmax(0,1fr)_60px_36px] items-center border-b border-zd-border pb-2 mb-1 px-2 -mx-2">
            <div className="flex items-center gap-3">
              <span className="w-[8px]" />
              <span className="text-xs font-mono text-zd-text-muted uppercase tracking-wide w-[72px]">/ Date</span>
              <span className="text-xs font-mono text-zd-text-muted uppercase tracking-wide">/ Name</span>
            </div>
            <span className="text-xs font-mono text-zd-text-muted uppercase tracking-wide text-right">/ Type</span>
            <span className="w-[36px]" />
          </div>

          {/* Rows */}
          {filteredReleases.length > 0 ? (
            filteredReleases.map((release) => (
              <ReleaseRow key={release.contractAddress} release={release} />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-zd-text-muted">No releases match the current filters.</p>
              <button
                onClick={clearFilters}
                className="text-sm text-zd-text-secondary underline mt-2 hover:text-zd-text transition-colors duration-100"
              >
                Clear filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
