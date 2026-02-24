'use client';

import { useState, useMemo } from 'react';
import { MOCK_FILES, formatDateDot, formatHolders, type MockFile } from './mockdata';
import { FILE_TYPE_ICONS, IconFile } from '@/components/ui/FileTypeIcon';

const BG = '#E8E8E8';
const TEXT = '#1E1E1E';
const MUTED = '#888888';
const DOTTED = '#ABABAB';
const SURFACE = '#DEDEDE';
const HOVER = '#D4D4D4';

type SortKey = 'date' | 'type' | 'mcap' | 'volume';
type SortDir = 'asc' | 'desc';
const TYPE_OPTIONS = ['ALL', 'PDF', '3D', 'IMG', 'VID', 'CODE'] as const;

function sortFiles(files: MockFile[], key: SortKey, dir: SortDir): MockFile[] {
  const sorted = [...files].sort((a, b) => {
    switch (key) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'type':
        return a.type.localeCompare(b.type);
      case 'mcap':
        return a.mcapNum - b.mcapNum;
      case 'volume':
        return a.volNum - b.volNum;
      default:
        return 0;
    }
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
}

function FileIcon({ type }: { type: string }) {
  const Icon = FILE_TYPE_ICONS[type] || IconFile;
  return <Icon className="w-4 h-4" />;
}

export function DemoFeed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [tradeOpen, setTradeOpen] = useState<string | null>(null);

  const creators = useMemo(
    () => Array.from(new Set(MOCK_FILES.map((f) => f.creator))),
    []
  );

  const filtered = useMemo(() => {
    let files = MOCK_FILES;

    if (typeFilter !== 'ALL') {
      files = files.filter((f) => f.type === typeFilter);
    }
    if (creatorFilter) {
      files = files.filter((f) => f.creator === creatorFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      files = files.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.creator.toLowerCase().includes(q) ||
          f.contract.toLowerCase().includes(q)
      );
    }

    return sortFiles(files, sortKey, sortDir);
  }, [typeFilter, creatorFilter, searchQuery, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const breadcrumb = useMemo(() => {
    const parts: string[] = ['Z:'];
    if (creatorFilter) parts.push(creatorFilter.toUpperCase());
    if (typeFilter !== 'ALL') parts.push(typeFilter);
    if (parts.length === 1) parts.push('*');
    return parts;
  }, [typeFilter, creatorFilter]);

  return (
    <div
      className="min-h-screen font-display text-sm"
      style={{ background: BG, color: TEXT }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header
        className="h-12 flex items-center px-6 gap-4 sticky top-0 z-20"
        style={{ background: BG, borderBottom: `0.5px dotted ${DOTTED}` }}
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

      <div className="flex">
        {/* ── Left Panel: Filters ──────────────────────────────────────── */}
        <aside
          className="w-64 shrink-0 p-6 sticky top-12 self-start"
          style={{ borderRight: `0.5px dotted ${DOTTED}`, minHeight: 'calc(100vh - 48px)' }}
        >
          {/* Search */}
          <div className="mb-8">
            <label className="text-[10px] uppercase tracking-widest block mb-2 font-light" style={{ color: MUTED }}>
              SEARCH
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="name, creator, or contract..."
              className="w-full px-2 py-1.5 text-xs outline-none placeholder:opacity-50 font-light"
              style={{ background: SURFACE, border: `0.5px dotted ${DOTTED}`, color: TEXT }}
            />
          </div>

          {/* Type filter */}
          <div className="mb-8">
            <label className="text-[10px] uppercase tracking-widest block mb-2 font-light" style={{ color: MUTED }}>
              TYPE
            </label>
            <div className="space-y-1">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className="flex items-center gap-2 w-full text-left text-xs py-1 px-1 transition-colors font-light"
                  style={{
                    color: typeFilter === t ? TEXT : MUTED,
                    fontWeight: typeFilter === t ? 400 : 300,
                  }}
                >
                  <span
                    className="w-3 h-3 flex items-center justify-center text-[8px]"
                    style={{
                      border: `0.5px dotted ${typeFilter === t ? TEXT : DOTTED}`,
                      background: typeFilter === t ? TEXT : 'transparent',
                      color: typeFilter === t ? BG : 'transparent',
                    }}
                  >
                    {typeFilter === t ? '\u2713' : ''}
                  </span>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Creator filter */}
          <div className="mb-8">
            <label className="text-[10px] uppercase tracking-widest block mb-2 font-light" style={{ color: MUTED }}>
              CREATOR
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setCreatorFilter('')}
                className="text-xs py-1 px-1 w-full text-left transition-colors font-light"
                style={{ color: !creatorFilter ? TEXT : MUTED, fontWeight: !creatorFilter ? 400 : 300 }}
              >
                All
              </button>
              {creators.map((c) => (
                <button
                  key={c}
                  onClick={() => setCreatorFilter(creatorFilter === c ? '' : c)}
                  className="text-xs py-1 px-1 w-full text-left transition-colors font-light"
                  style={{ color: creatorFilter === c ? TEXT : MUTED, fontWeight: creatorFilter === c ? 400 : 300 }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-[10px] uppercase tracking-widest block mb-2 font-light" style={{ color: MUTED }}>
              SORT BY
            </label>
            <div className="space-y-1">
              {([
                { key: 'date', label: 'Date' },
                { key: 'type', label: 'Type' },
                { key: 'mcap', label: 'Market Cap' },
                { key: 'volume', label: 'Volume' },
              ] as { key: SortKey; label: string }[]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSort(opt.key)}
                  className="text-xs py-1 px-1 w-full text-left flex items-center justify-between transition-colors font-light"
                  style={{ color: sortKey === opt.key ? TEXT : MUTED, fontWeight: sortKey === opt.key ? 400 : 300 }}
                >
                  <span>{opt.label}</span>
                  {sortKey === opt.key && (
                    <span className="text-[9px]">{sortDir === 'desc' ? '\u25BC' : '\u25B2'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {(typeFilter !== 'ALL' || creatorFilter || searchQuery) && (
            <button
              onClick={() => { setTypeFilter('ALL'); setCreatorFilter(''); setSearchQuery(''); }}
              className="mt-6 text-[10px] uppercase tracking-widest underline font-light"
              style={{ color: MUTED }}
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* ── Right Panel: Results ─────────────────────────────────────── */}
        <main className="flex-1 p-6">
          {/* Result count */}
          <div className="mb-4">
            <span className="text-xs font-light" style={{ color: MUTED }}>
              {filtered.length} results
            </span>
          </div>

          {/* Column headers */}
          <div
            className="grid items-center h-8 px-3 text-[10px] uppercase tracking-widest font-light"
            style={{
              gridTemplateColumns: '48px 1fr 140px 140px 80px 80px 72px',
              color: MUTED,
              borderBottom: `0.5px dotted ${DOTTED}`,
            }}
          >
            <span>TYPE</span>
            <span>TITLE</span>
            <span>CREATOR</span>
            <span>CREATED</span>
            <span className="text-right">HOLDERS</span>
            <span className="text-right">VOL</span>
            <span className="text-right">COLLECT</span>
          </div>

          {/* Rows */}
          <div>
            {filtered.map((file) => (
              <div key={file.contract}>
                <div
                  className="grid items-center h-11 px-3 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: '48px 1fr 140px 140px 80px 80px 72px',
                    borderBottom: `0.5px dotted ${DOTTED}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: MUTED }}>
                    <FileIcon type={file.type} />
                  </span>
                  <span className="text-sm tracking-tight truncate pr-4 font-bold">
                    {file.name}
                  </span>
                  <span className="text-xs truncate font-light">
                    {file.creator}
                  </span>
                  <span className="text-xs font-mono" style={{ color: MUTED }}>
                    {formatDateDot(file.date)}
                  </span>
                  <span className="text-xs text-right font-mono" style={{ color: MUTED }}>
                    {formatHolders(file.holders)}
                  </span>
                  <span className="text-xs text-right font-mono" style={{ color: MUTED }}>
                    {file.volNum}
                  </span>
                  <span className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTradeOpen(tradeOpen === file.contract ? null : file.contract);
                      }}
                      className="px-2 py-0.5 text-xs font-mono transition-colors"
                      style={{
                        border: `0.5px dotted ${tradeOpen === file.contract ? TEXT : DOTTED}`,
                        background: tradeOpen === file.contract ? TEXT : 'transparent',
                        color: tradeOpen === file.contract ? BG : MUTED,
                      }}
                    >
                      +++
                    </button>
                  </span>
                </div>

                {/* Inline trade widget */}
                {tradeOpen === file.contract && (
                  <TradeWidget file={file} onClose={() => setTradeOpen(null)} />
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-xs font-light" style={{ color: MUTED }}>
              No results match your filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Inline Trade Widget ─────────────────────────────────────────────── */

function TradeWidget({ file, onClose }: { file: MockFile; onClose: () => void }) {
  const [amount, setAmount] = useState('0.001');

  return (
    <div
      className="px-3 py-4"
      style={{
        background: SURFACE,
        borderBottom: `0.5px dotted ${DOTTED}`,
      }}
    >
      <div className="flex items-start gap-6 ml-[48px]">
        {/* Buy form */}
        <div className="flex-1 max-w-xs">
          <div className="text-[10px] uppercase tracking-widest mb-2 font-light" style={{ color: MUTED }}>
            COLLECT
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24 px-2 py-1.5 text-xs outline-none font-mono"
              style={{ background: BG, border: `0.5px dotted ${DOTTED}`, color: TEXT }}
            />
            <span className="text-xs font-mono" style={{ color: MUTED }}>ETH</span>
            <button
              className="px-3 py-1.5 text-xs font-bold"
              style={{ background: TEXT, color: BG }}
            >
              Buy
            </button>
          </div>
          <div className="mt-1 text-[10px] font-light" style={{ color: MUTED }}>
            ${file.symbol} &middot; {file.marketCap} mcap &middot; {formatHolders(file.holders)} holders
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-1 text-xs font-mono" style={{ color: MUTED }}>
          <div className="flex gap-4">
            <span>Volume: {file.volume}</span>
            <span>Holders: {formatHolders(file.holders)}</span>
          </div>
          <div>Contract: {file.contract}</div>
        </div>

        <button
          onClick={onClose}
          className="text-xs ml-auto font-light"
          style={{ color: MUTED }}
        >
          close
        </button>
      </div>
    </div>
  );
}
