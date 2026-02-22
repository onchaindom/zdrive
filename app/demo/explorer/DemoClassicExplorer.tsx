'use client';

import { useState } from 'react';
import { MOCK_FILES, MOCK_COLLECTIONS, formatDate, formatHolders, type MockFile } from './mockdata';

/**
 * Demo A: Classic Explorer
 *
 * Inspiration: Windows Explorer / macOS Finder
 * - Pure white background, black text
 * - Sidebar with folder/collection tree
 * - Toolbar with view + sort controls
 * - Columnar file list with sortable headers
 * - Status bar at bottom
 * - All monospace for data, system font for names
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

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-gray-300 ml-1">{'  '}</span>;
  return <span className="ml-1">{dir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
}

export function DemoClassicExplorer() {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarCollection, setSidebarCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('details');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredFiles = sidebarCollection
    ? MOCK_FILES.filter((f) => f.collection === sidebarCollection)
    : MOCK_FILES;

  const sorted = sortFiles(filteredFiles, sortKey, sortDir);
  const selected = sorted.find((f) => f.name === selectedFile);

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col bg-white text-black font-mono text-sm">
      {/* ── Title Bar ──────────────────────────────────────────────────── */}
      <div className="h-8 bg-white border-b border-black flex items-center px-3 gap-3 shrink-0">
        <span className="font-bold tracking-tight">Z:\DRIVE</span>
        <div className="flex items-center gap-4 ml-6 text-xs">
          <span className="hover:underline cursor-pointer">File</span>
          <span className="hover:underline cursor-pointer">Edit</span>
          <span className="hover:underline cursor-pointer">View</span>
          <span className="hover:underline cursor-pointer">Help</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="w-4 h-4 border border-black text-[10px] leading-none flex items-center justify-center hover:bg-black hover:text-white">_</button>
          <button className="w-4 h-4 border border-black text-[10px] leading-none flex items-center justify-center hover:bg-black hover:text-white">&#x25A1;</button>
          <button className="w-4 h-4 border border-black text-[10px] leading-none flex items-center justify-center hover:bg-black hover:text-white">X</button>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="h-9 bg-gray-50 border-b border-black flex items-center px-3 gap-4 shrink-0">
        {/* Back / Forward */}
        <div className="flex items-center gap-1">
          <button className="px-2 py-0.5 border border-gray-300 text-xs hover:border-black">&larr;</button>
          <button className="px-2 py-0.5 border border-gray-300 text-xs hover:border-black">&rarr;</button>
          <button className="px-2 py-0.5 border border-gray-300 text-xs hover:border-black">&uarr;</button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center border border-gray-300 bg-white px-2 h-6">
          <span className="text-xs text-gray-500">Z:\</span>
          <span className="text-xs">
            {sidebarCollection ? `${sidebarCollection.replace(/ /g, '_')}\\` : ''}
          </span>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-0.5 border text-xs ${viewMode === 'list' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('details')}
            className={`px-2 py-0.5 border text-xs ${viewMode === 'details' ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'}`}
          >
            Details
          </button>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 border-r border-black bg-gray-50 overflow-y-auto shrink-0">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
            COLLECTIONS
          </div>
          <button
            onClick={() => setSidebarCollection(null)}
            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2 ${
              !sidebarCollection ? 'bg-black text-white hover:bg-gray-800' : ''
            }`}
          >
            <span>{'>'}</span>
            <span>All Files</span>
            <span className="ml-auto text-gray-400">{MOCK_FILES.length}</span>
          </button>
          {MOCK_COLLECTIONS.map((col) => (
            <button
              key={col.name}
              onClick={() => setSidebarCollection(col.name)}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2 ${
                sidebarCollection === col.name ? 'bg-black text-white hover:bg-gray-800' : ''
              }`}
            >
              <span>[+]</span>
              <span className="truncate">{col.name}</span>
              <span className={`ml-auto ${sidebarCollection === col.name ? 'text-gray-300' : 'text-gray-400'}`}>
                {col.count}
              </span>
            </button>
          ))}
          <div className="px-3 py-2 text-xs text-gray-500 border-t border-b border-gray-200 mt-4">
            CREATORS
          </div>
          {['morph.eth', 'campo.eth', 'wave.eth', 'dev.eth', 'scan.eth', 'color.eth'].map((c) => (
            <div
              key={c}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
            >
              <span className="w-2 h-2 bg-black" />
              <span>{c}</span>
            </div>
          ))}
        </div>

        {/* File List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'details' ? (
            <>
              {/* Column Headers */}
              <div className="grid grid-cols-[24px_1fr_60px_80px_100px_80px_80px] items-center h-7 px-3 border-b border-black bg-gray-100 text-[11px] font-bold uppercase tracking-wider shrink-0">
                <div />
                <button onClick={() => handleSort('name')} className="text-left flex items-center hover:underline">
                  Name <SortArrow active={sortKey === 'name'} dir={sortDir} />
                </button>
                <button onClick={() => handleSort('type')} className="text-left flex items-center hover:underline">
                  Type <SortArrow active={sortKey === 'type'} dir={sortDir} />
                </button>
                <div className="text-right">Size</div>
                <button onClick={() => handleSort('date')} className="text-left flex items-center hover:underline">
                  Modified <SortArrow active={sortKey === 'date'} dir={sortDir} />
                </button>
                <div className="text-left">Creator</div>
                <button onClick={() => handleSort('holders')} className="text-right flex items-center justify-end hover:underline">
                  Holders <SortArrow active={sortKey === 'holders'} dir={sortDir} />
                </button>
              </div>

              {/* File Rows */}
              <div className="flex-1 overflow-y-auto">
                {sorted.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(selectedFile === file.name ? null : file.name)}
                    className={`grid grid-cols-[24px_1fr_60px_80px_100px_80px_80px] items-center h-7 px-3 text-left w-full border-b border-gray-100 ${
                      selectedFile === file.name
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <FileIcon type={file.type} inverted={selectedFile === file.name} />
                    <span className="truncate pr-2">
                      {file.name}{file.ext}
                    </span>
                    <span className={`text-xs ${selectedFile === file.name ? 'text-gray-300' : 'text-gray-500'}`}>
                      {file.type}
                    </span>
                    <span className={`text-xs text-right ${selectedFile === file.name ? 'text-gray-300' : 'text-gray-500'}`}>
                      {file.size}
                    </span>
                    <span className={`text-xs ${selectedFile === file.name ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatDate(file.date)}
                    </span>
                    <span className={`text-xs truncate ${selectedFile === file.name ? 'text-gray-300' : 'text-gray-500'}`}>
                      {file.creator}
                    </span>
                    <span className={`text-xs text-right ${selectedFile === file.name ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatHolders(file.holders)}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* List View */
            <div className="flex-1 overflow-y-auto p-3">
              {sorted.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(selectedFile === file.name ? null : file.name)}
                  className={`flex items-center gap-2 w-full text-left px-2 py-1 ${
                    selectedFile === file.name
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <FileIcon type={file.type} inverted={selectedFile === file.name} />
                  <span>{file.name}{file.ext}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Properties Panel (when file selected) */}
        {selected && (
          <div className="w-64 border-l border-black bg-gray-50 overflow-y-auto shrink-0">
            <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200 flex items-center justify-between">
              <span>PROPERTIES</span>
              <button onClick={() => setSelectedFile(null)} className="hover:text-black">X</button>
            </div>
            <div className="p-3 space-y-3">
              {/* File icon + name */}
              <div className="text-center py-4 border-b border-gray-200">
                <div className="text-4xl mb-2">
                  {selected.type === 'PDF' && '\u{1F4C4}'}
                  {selected.type === '3D' && '\u{1F4E6}'}
                  {selected.type === 'IMG' && '\u{1F5BC}'}
                  {selected.type === 'VID' && '\u{1F3AC}'}
                  {selected.type === 'CODE' && '\u{1F4DD}'}
                </div>
                <div className="font-bold text-sm">{selected.name}{selected.ext}</div>
                <div className="text-xs text-gray-500">{selected.type} File</div>
              </div>

              {/* Properties grid */}
              <div className="space-y-2 text-xs">
                <PropRow label="Creator" value={selected.creator} />
                <PropRow label="Collection" value={selected.collection || '(none)'} />
                <PropRow label="Date" value={formatDate(selected.date)} />
                <PropRow label="Size" value={selected.size} />
                <PropRow label="Holders" value={formatHolders(selected.holders)} />
                <PropRow label="Market Cap" value={selected.marketCap} />
                <PropRow label="Volume" value={selected.volume} />
                <PropRow label="Contract" value={selected.contract} />
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-gray-200">
                <div className="text-[10px] text-gray-500 uppercase mb-1">Description</div>
                <p className="text-xs text-gray-700 leading-relaxed">{selected.description}</p>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <button className="w-full border border-black bg-black text-white text-xs py-1.5 hover:bg-gray-800">
                  COLLECT
                </button>
                <button className="w-full border border-black text-xs py-1.5 hover:bg-gray-100">
                  VIEW ON ZORA
                </button>
                <button className="w-full border border-gray-300 text-xs py-1.5 text-gray-500 hover:border-black hover:text-black">
                  DOWNLOAD
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      <div className="h-6 bg-gray-100 border-t border-black flex items-center px-3 text-[11px] text-gray-500 shrink-0 gap-4">
        <span>{sorted.length} items</span>
        {selectedFile && <span>Selected: {selectedFile}</span>}
        <span className="ml-auto">Z:\DRIVE v1.0</span>
      </div>
    </div>
  );
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className="text-right font-mono">{value}</span>
    </div>
  );
}

function FileIcon({ type, inverted = false }: { type: string; inverted?: boolean }) {
  const base = inverted ? 'text-white' : 'text-black';
  const chars: Record<string, string> = {
    PDF: '\u25A0',
    '3D': '\u25C6',
    IMG: '\u25CF',
    VID: '\u25B6',
    CODE: '\u2261',
  };
  return <span className={`text-xs ${base}`}>{chars[type] || '\u25A1'}</span>;
}
