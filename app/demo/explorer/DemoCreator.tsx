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

// Pick a creator for this demo
const CREATOR = 'morph.eth';
const CREATOR_ADDR = '0xA3f2...1B4c';
const CREATOR_BIO = 'Exploring emergence, tension, and form through generative processes.';
const CREATOR_SYMBOL = '$MORPH';

type ViewMode = 'all' | 'by-folder';

function FileIcon({ type }: { type: string }) {
  const Icon = FILE_TYPE_ICONS[type] || IconFile;
  return <Icon className="w-4 h-4" />;
}

export function DemoCreator() {
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const releases = useMemo(
    () => MOCK_FILES.filter((f) => f.creator === CREATOR),
    []
  );

  const folders = useMemo(() => {
    const seen = new Set<string>();
    return releases
      .filter((r) => r.folder && !seen.has(r.folder) && seen.add(r.folder))
      .map((r) => r.folder!);
  }, [releases]);

  const grouped = useMemo(() => {
    const groups = new Map<string, MockFile[]>();
    const unfiled: MockFile[] = [];
    for (const r of releases) {
      if (r.folder) {
        const arr = groups.get(r.folder) || [];
        arr.push(r);
        groups.set(r.folder, arr);
      } else {
        unfiled.push(r);
      }
    }
    const result: { title: string; items: MockFile[] }[] = [];
    for (const [title, items] of groups) {
      result.push({ title, items });
    }
    result.sort((a, b) => a.title.localeCompare(b.title));
    if (unfiled.length > 0) result.push({ title: 'Unfiled', items: unfiled });
    return result;
  }, [releases]);

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
          <span className="cursor-pointer hover:underline" style={{ color: MUTED }}>Z:</span>
          <span style={{ color: MUTED }}>{' \\ '}</span>
          <span className="font-bold">{CREATOR.toUpperCase()}</span>
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Profile Header ──────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-8">
          {/* Avatar */}
          <div
            className="w-12 h-12 shrink-0 rounded-full"
            style={{ background: DOTTED }}
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">{CREATOR}</h1>
            <p className="text-xs mt-1 leading-relaxed font-light" style={{ color: MUTED }}>
              {CREATOR_BIO}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs font-mono" style={{ color: MUTED }}>
              <span>{CREATOR_SYMBOL}</span>
              <span className="underline cursor-pointer font-display font-light">Basescan</span>
              <span>{CREATOR_ADDR}</span>
            </div>
          </div>
        </div>

        {/* ── Folders ─────────────────────────────────────────────────── */}
        {folders.length > 0 && (
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-widest mb-2 font-light" style={{ color: MUTED }}>
              FOLDERS
            </div>
            <div className="flex flex-wrap gap-2">
              {folders.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 text-xs cursor-pointer transition-colors font-light"
                  style={{ border: `0.5px dotted ${DOTTED}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── View Toggle ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex" style={{ border: `0.5px dotted ${DOTTED}` }}>
            <button
              onClick={() => setViewMode('all')}
              className="px-3 py-1.5 text-xs transition-colors font-light"
              style={{
                background: viewMode === 'all' ? SURFACE : 'transparent',
                fontWeight: viewMode === 'all' ? 400 : 300,
              }}
            >
              All
            </button>
            <button
              onClick={() => setViewMode('by-folder')}
              className="px-3 py-1.5 text-xs transition-colors font-light"
              style={{
                background: viewMode === 'by-folder' ? SURFACE : 'transparent',
                borderLeft: `0.5px dotted ${DOTTED}`,
                fontWeight: viewMode === 'by-folder' ? 400 : 300,
              }}
            >
              By Folder
            </button>
          </div>
          <span className="text-xs font-light" style={{ color: MUTED }}>
            {releases.length} releases
          </span>
        </div>

        {/* ── Release List ─────────────────────────────────────────────── */}
        {viewMode === 'all' ? (
          <ReleaseTable files={releases} />
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-bold tracking-tight mb-2">
                  {group.title}
                  <span className="ml-2 font-light" style={{ color: MUTED }}>
                    ({group.items.length})
                  </span>
                </h3>
                <ReleaseTable files={group.items} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Release Table ───────────────────────────────────────────────────── */

function ReleaseTable({ files }: { files: MockFile[] }) {
  return (
    <div style={{ border: `0.5px dotted ${DOTTED}` }}>
      {/* Header */}
      <div
        className="grid items-center h-8 px-3 text-[10px] uppercase tracking-widest font-light"
        style={{
          gridTemplateColumns: '48px 1fr 140px 80px 80px 72px',
          color: MUTED,
          borderBottom: `0.5px dotted ${DOTTED}`,
        }}
      >
        <span>TYPE</span>
        <span>TITLE</span>
        <span>CREATED</span>
        <span className="text-right">HOLDERS</span>
        <span className="text-right">VOL</span>
        <span className="text-right">COLLECT</span>
      </div>

      {/* Rows */}
      {files.map((file) => (
        <div
          key={file.contract}
          className="grid items-center h-11 px-3 cursor-pointer transition-colors"
          style={{
            gridTemplateColumns: '48px 1fr 140px 80px 80px 72px',
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
              className="px-2 py-0.5 text-xs font-mono"
              style={{ border: `0.5px dotted ${DOTTED}`, color: MUTED }}
            >
              +++
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
