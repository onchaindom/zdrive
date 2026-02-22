'use client';

import { useState } from 'react';
import { MOCK_FILES, MOCK_FOLDERS, formatDate, formatHolders, type MockFile } from './mockdata';

/**
 * Demo E: Explorer Refined
 *
 * Takes the structure of Demo A (sidebar + table + toolbar + properties)
 * and applies stripe.dev's design polish in B&W:
 * - White background with subtle gray surface layering
 * - Sans-serif for labels, monospace for data values
 * - Generous spacing, taller rows, more breathing room
 * - Thin, low-contrast borders
 * - Smooth hover states with subtle bg shifts
 * - Refined selection highlight (not harsh inversion)
 * - Clean status bar, rounded controls, proper type hierarchy
 */

type SortKey = 'name' | 'type' | 'date' | 'holders' | 'size';
type SortDir = 'asc' | 'desc';

function sortFiles(files: MockFile[], key: SortKey, dir: SortDir): MockFile[] {
  const sorted = [...files].sort((a, b) => {
    switch (key) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'holders':
        return a.holders - b.holders;
      case 'size':
        return a.size.localeCompare(b.size);
      default:
        return 0;
    }
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
}

// -- Color constants (strict B&W palette) --
const C = {
  bg: '#ffffff',
  surface: '#fafafa',
  surfaceHover: '#f5f5f5',
  sidebar: '#f7f7f7',
  border: '#e5e5e5',
  borderSubtle: '#efefef',
  text: '#111111',
  textSecondary: '#6b6b6b',
  textMuted: '#a0a0a0',
  accent: '#111111',
  accentBg: 'rgba(0,0,0,0.04)',
  selected: 'rgba(0,0,0,0.04)',
  selectedBorder: '#111111',
  hoverRow: 'rgba(0,0,0,0.02)',
} as const;

export function DemoExplorerRefined() {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredFiles = currentFolder
    ? MOCK_FILES.filter((f) => f.folder === currentFolder)
    : MOCK_FILES;

  const sorted = sortFiles(filteredFiles, sortKey, sortDir);
  const selected = sorted.find((f) => f.name === selectedFile);

  return (
    <div
      className="h-[calc(100vh-40px)] flex flex-col text-sm"
      style={{ background: C.bg, color: C.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div
        className="h-11 flex items-center px-5 gap-5 shrink-0"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <span className="font-mono font-bold text-[15px] tracking-tight" style={{ color: C.text }}>
          Z:\DRIVE
        </span>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => { setCurrentFolder(null); setSelectedFile(null); }}
            className="transition-colors"
            style={{ color: currentFolder ? C.textMuted : C.text }}
          >
            root
          </button>
          {currentFolder && (
            <>
              <span style={{ color: C.textMuted }}>/</span>
              <span style={{ color: C.text }}>{currentFolder}</span>
            </>
          )}
          {selectedFile && (
            <>
              <span style={{ color: C.textMuted }}>/</span>
              <span style={{ color: C.textSecondary }}>{selectedFile}</span>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Search files..."
            className="text-xs px-3 py-1.5 rounded outline-none w-44 placeholder:text-gray-500"
            style={{
              background: C.surface,
              border: `1px solid ${C.borderSubtle}`,
              color: C.text,
            }}
          />
          <button
            className="text-xs px-3 py-1.5 rounded font-medium transition-colors hover:opacity-80"
            style={{ background: C.accent, color: '#fff' }}
          >
            Connect
          </button>
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div
          className="w-52 overflow-y-auto shrink-0 py-4"
          style={{ background: C.sidebar, borderRight: `1px solid ${C.borderSubtle}` }}
        >
          {/* Folders */}
          <div className="px-4 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
              Folders
            </span>
          </div>

          <SidebarItem
            label="All Files"
            count={MOCK_FILES.length}
            active={!currentFolder}
            onClick={() => { setCurrentFolder(null); setSelectedFile(null); }}
          />
          {MOCK_FOLDERS.map((folder) => (
            <SidebarItem
              key={folder.name}
              label={folder.name}
              count={folder.count}
              active={currentFolder === folder.name}
              onClick={() => { setCurrentFolder(folder.name); setSelectedFile(null); }}
              indent
            />
          ))}

          <div className="px-4 mt-6 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
              Creators
            </span>
          </div>
          {['morph.eth', 'campo.eth', 'wave.eth', 'dev.eth', 'scan.eth', 'color.eth'].map((c) => (
            <div
              key={c}
              className="flex items-center gap-2.5 px-4 py-1.5 cursor-pointer text-xs transition-colors"
              style={{ color: C.textSecondary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textSecondary)}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: C.textMuted }}
              />
              <span className="font-mono">{c}</span>
            </div>
          ))}
        </div>

        {/* ── Table Area ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Column headers */}
          <div
            className="grid grid-cols-[28px_1fr_56px_72px_96px_80px_72px] items-center h-9 px-4 shrink-0 text-[11px] font-semibold uppercase tracking-wider select-none"
            style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}
          >
            <div />
            <SortHeader label="Name" sortKey="name" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
            <SortHeader label="Type" sortKey="type" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
            <div className="text-right">Size</div>
            <SortHeader label="Date" sortKey="date" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
            <div>Creator</div>
            <SortHeader label="Holders" sortKey="holders" currentKey={sortKey} dir={sortDir} onSort={handleSort} right />
          </div>

          {/* File rows */}
          <div className="flex-1 overflow-y-auto">
            {sorted.map((file) => {
              const isSelected = selectedFile === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(isSelected ? null : file.name)}
                  className="grid grid-cols-[28px_1fr_56px_72px_96px_80px_72px] items-center h-9 px-4 text-left w-full transition-colors"
                  style={{
                    background: isSelected ? C.selected : 'transparent',
                    borderBottom: `1px solid ${C.borderSubtle}`,
                    borderLeft: isSelected ? `2px solid ${C.accent}` : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = C.hoverRow;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <TypeDot type={file.type} />
                  <span className="truncate pr-2 font-mono text-[13px]" style={{ color: C.text }}>
                    {file.name}<span style={{ color: C.textMuted }}>{file.ext}</span>
                  </span>
                  <span className="font-mono text-xs" style={{ color: C.textMuted }}>{file.type}</span>
                  <span className="font-mono text-xs text-right" style={{ color: C.textMuted }}>{file.size}</span>
                  <span className="font-mono text-xs" style={{ color: C.textSecondary }}>{formatDate(file.date)}</span>
                  <span className="font-mono text-xs truncate" style={{ color: C.textSecondary }}>{file.creator}</span>
                  <span className="font-mono text-xs text-right" style={{ color: C.textSecondary }}>{formatHolders(file.holders)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Detail Panel ─────────────────────────────────────────────── */}
        {selected && (
          <div
            className="w-72 overflow-y-auto shrink-0"
            style={{ background: C.surface, borderLeft: `1px solid ${C.border}` }}
          >
            {/* Preview placeholder */}
            <div
              className="h-44 flex items-center justify-center"
              style={{ background: C.sidebar, borderBottom: `1px solid ${C.borderSubtle}` }}
            >
              <TypeDot type={selected.type} size="lg" />
            </div>

            <div className="p-5 space-y-5">
              {/* Title */}
              <div>
                <div className="font-mono font-bold text-[15px]" style={{ color: C.text }}>
                  {selected.name}<span style={{ color: C.textMuted }}>{selected.ext}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: C.textMuted }}>
                  {selected.type} &middot; {selected.size}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                {selected.description}
              </p>

              {/* Metadata */}
              <div
                className="space-y-2.5 pt-4"
                style={{ borderTop: `1px solid ${C.borderSubtle}` }}
              >
                <MetaRow label="Creator" value={selected.creator} />
                <MetaRow label="Folder" value={selected.folder || '--'} />
                <MetaRow label="Date" value={formatDate(selected.date)} />
                <MetaRow label="Holders" value={formatHolders(selected.holders)} />
                <MetaRow label="Market Cap" value={selected.marketCap} />
                <MetaRow label="Volume" value={selected.volume} />
              </div>

              {/* Contract */}
              <div
                className="pt-4"
                style={{ borderTop: `1px solid ${C.borderSubtle}` }}
              >
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textMuted }}>
                  Contract
                </div>
                <div
                  className="font-mono text-xs px-2.5 py-1.5 rounded"
                  style={{ background: C.sidebar, color: C.textSecondary }}
                >
                  {selected.contract}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4" style={{ borderTop: `1px solid ${C.borderSubtle}` }}>
                <button
                  className="w-full text-xs font-medium py-2 rounded transition-opacity hover:opacity-90"
                  style={{ background: C.accent, color: '#fff' }}
                >
                  Collect
                </button>
                <div className="flex gap-2">
                  <button
                    className="flex-1 text-xs py-1.5 rounded transition-colors"
                    style={{ border: `1px solid ${C.border}`, color: C.textSecondary }}
                  >
                    Open
                  </button>
                  <button
                    className="flex-1 text-xs py-1.5 rounded transition-colors"
                    style={{ border: `1px solid ${C.border}`, color: C.textSecondary }}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      <div
        className="h-7 flex items-center px-5 text-[11px] font-mono shrink-0 gap-5"
        style={{ background: C.sidebar, borderTop: `1px solid ${C.borderSubtle}`, color: C.textMuted }}
      >
        <span>{sorted.length} items</span>
        {selectedFile && <span style={{ color: C.textSecondary }}>{selectedFile}</span>}
        <span className="ml-auto">base:8453</span>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function SidebarItem({
  label,
  count,
  active,
  onClick,
  indent,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full text-left text-xs py-1.5 transition-colors"
      style={{
        paddingLeft: indent ? '2rem' : '1rem',
        paddingRight: '1rem',
        background: active ? C.accentBg : 'transparent',
        color: active ? C.text : C.textSecondary,
        borderRight: active ? `2px solid ${C.accent}` : '2px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span className="flex items-center gap-2">
        {indent && <span style={{ color: C.textMuted }}>&#x25B8;</span>}
        <span>{label}</span>
      </span>
      <span className="font-mono" style={{ color: C.textMuted }}>{count}</span>
    </button>
  );
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
  right,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  right?: boolean;
}) {
  const active = currentKey === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 transition-colors ${right ? 'justify-end' : ''}`}
      style={{ color: active ? C.text : C.textMuted }}
    >
      {label}
      {active && <span className="text-[9px]">{dir === 'asc' ? '\u25B2' : '\u25BC'}</span>}
    </button>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline text-xs">
      <span style={{ color: C.textMuted }}>{label}</span>
      <span className="font-mono" style={{ color: C.textSecondary }}>{value}</span>
    </div>
  );
}

function TypeDot({ type, size }: { type: string; size?: 'lg' }) {
  const dim = size === 'lg' ? 'w-10 h-10 text-lg' : 'w-4 h-4 text-[9px]';
  return (
    <span
      className={`${dim} rounded-sm flex items-center justify-center font-mono font-bold`}
      style={{ background: 'rgba(0,0,0,0.06)', color: '#555' }}
    >
      {size === 'lg' ? type : type.charAt(0)}
    </span>
  );
}
