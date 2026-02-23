'use client';

import { useState, useMemo } from 'react';
import { MOCK_FILES, MOCK_FOLDERS, formatDateDot, formatHolders, type MockFile } from './mockdata';

/**
 * Creator page demo
 *
 * - Creator profile header
 * - Their releases listed same style as the feed
 * - Folder grouping toggle
 * - Same color scheme: bg #E8E8E8, text #1E1E1E
 */

const BG = '#E8E8E8';
const TEXT = '#1E1E1E';
const MUTED = '#888888';
const BORDER = '#C8C8C8';
const SURFACE = '#DEDEDE';
const HOVER = '#D4D4D4';

// Pick a creator for this demo
const CREATOR = 'morph.eth';
const CREATOR_ADDR = '0xA3f2...1B4c';
const CREATOR_BIO = 'Exploring emergence, tension, and form through generative processes.';
const CREATOR_SYMBOL = '$MORPH';

type ViewMode = 'all' | 'by-folder';

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
      className="min-h-screen font-mono text-sm"
      style={{ background: BG, color: TEXT }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header
        className="h-12 flex items-center px-6 gap-6"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <span className="font-bold text-base tracking-tight">Z:DRIVE</span>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="cursor-pointer hover:underline" style={{ color: MUTED }}>Z:</span>
          <span style={{ color: MUTED }}>/</span>
          <span>{CREATOR}</span>
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Profile Header ──────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-8">
          {/* Avatar */}
          <div
            className="w-12 h-12 shrink-0 rounded-full"
            style={{ background: BORDER }}
          />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">{CREATOR}</h1>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: MUTED }}>
              {CREATOR_BIO}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: MUTED }}>
              <span>{CREATOR_SYMBOL}</span>
              <span className="underline cursor-pointer">Basescan</span>
              <span>{CREATOR_ADDR}</span>
            </div>
          </div>
        </div>

        {/* ── Folders ─────────────────────────────────────────────────── */}
        {folders.length > 0 && (
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: MUTED }}>
              / Folders
            </div>
            <div className="flex flex-wrap gap-2">
              {folders.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 text-xs cursor-pointer transition-colors"
                  style={{ border: `1px solid ${BORDER}` }}
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
          <div className="flex" style={{ border: `1px solid ${BORDER}` }}>
            <button
              onClick={() => setViewMode('all')}
              className="px-3 py-1.5 text-xs transition-colors"
              style={{
                background: viewMode === 'all' ? SURFACE : 'transparent',
                fontWeight: viewMode === 'all' ? 700 : 400,
              }}
            >
              All
            </button>
            <button
              onClick={() => setViewMode('by-folder')}
              className="px-3 py-1.5 text-xs transition-colors"
              style={{
                background: viewMode === 'by-folder' ? SURFACE : 'transparent',
                borderLeft: `1px solid ${BORDER}`,
                fontWeight: viewMode === 'by-folder' ? 700 : 400,
              }}
            >
              By Folder
            </button>
          </div>
          <span className="text-xs" style={{ color: MUTED }}>
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
                  <span className="ml-2 font-normal" style={{ color: MUTED }}>
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
    <div style={{ border: `1px solid ${BORDER}` }}>
      {/* Header */}
      <div
        className="grid items-center h-8 px-3 text-[10px] uppercase tracking-widest"
        style={{
          gridTemplateColumns: '90px 1fr 56px 72px 64px 72px',
          color: MUTED,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <span>/ Date</span>
        <span>/ Title</span>
        <span>/ Type</span>
        <span className="text-right">/ Mcap</span>
        <span className="text-right">/ Holders</span>
        <span className="text-right">/ Volume</span>
      </div>

      {/* Rows */}
      {files.map((file) => (
        <div
          key={file.contract}
          className="grid items-center h-11 px-3 cursor-pointer transition-colors"
          style={{
            gridTemplateColumns: '90px 1fr 56px 72px 64px 72px',
            borderBottom: `1px solid ${BORDER}`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span className="text-xs" style={{ color: MUTED }}>
            {formatDateDot(file.date)}
          </span>
          <span className="text-[15px] tracking-tight truncate pr-4 font-bold">
            {file.name}
          </span>
          <span
            className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 text-center"
            style={{ border: `1px solid ${BORDER}`, color: MUTED }}
          >
            {file.type}
          </span>
          <span className="text-xs text-right" style={{ color: MUTED }}>
            {file.marketCap}
          </span>
          <span className="text-xs text-right" style={{ color: MUTED }}>
            {formatHolders(file.holders)}
          </span>
          <span className="text-xs text-right" style={{ color: MUTED }}>
            {file.volume}
          </span>
        </div>
      ))}
    </div>
  );
}
