'use client';

import { useState } from 'react';
import { MOCK_FILES, MOCK_COLLECTIONS, formatDate, formatDateShort, formatHolders, type MockFile } from './mockdata';

/**
 * Demo C: Modern File Manager
 *
 * Inspiration: VS Code file explorer meets clean macOS Finder
 * - Black and white, high contrast
 * - Monospace everywhere
 * - Path breadcrumb bar
 * - Clean table layout with hover states
 * - Detail drawer slides in from right
 * - Minimal, no decoration
 * - Feels like a tool, not a gallery
 */

type ViewMode = 'table' | 'grid';

export function DemoModernFM() {
  const [currentCollection, setCurrentCollection] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MockFile | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredByCollection = currentCollection
    ? MOCK_FILES.filter((f) => f.collection === currentCollection)
    : MOCK_FILES;

  const filteredFiles = typeFilter === 'ALL'
    ? filteredByCollection
    : filteredByCollection.filter((f) => f.type === typeFilter);

  const types = ['ALL', ...Array.from(new Set(MOCK_FILES.map((f) => f.type)))];

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col bg-white text-black font-mono text-[13px]">
      {/* ── Header Bar ────────────────────────────────────────────────── */}
      <div className="h-10 border-b-2 border-black flex items-center px-4 gap-4 shrink-0">
        <span className="font-bold text-sm tracking-tight">Z:/</span>
        <nav className="flex items-center gap-3 text-xs">
          <a href="#" className="hover:underline">browse</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:underline">create</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-gray-400 hover:underline">search</a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="search..."
            className="border border-gray-300 bg-white px-2 py-1 text-xs w-40 outline-none focus:border-black"
          />
          <button className="border border-black px-3 py-1 text-xs hover:bg-black hover:text-white transition-colors">
            connect
          </button>
        </div>
      </div>

      {/* ── Path Bar ──────────────────────────────────────────────────── */}
      <div className="h-8 border-b border-gray-200 flex items-center px-4 text-xs bg-gray-50 shrink-0">
        <button
          onClick={() => { setCurrentCollection(null); setSelectedFile(null); }}
          className={`hover:underline ${!currentCollection ? 'font-bold' : 'text-gray-500'}`}
        >
          Z:
        </button>
        {currentCollection && (
          <>
            <span className="mx-1 text-gray-400">/</span>
            <span className="font-bold">{currentCollection}</span>
          </>
        )}
        <span className="mx-1 text-gray-400">/</span>
        {selectedFile && (
          <span className="text-gray-500">{selectedFile.name}{selectedFile.ext}</span>
        )}

        {/* Item count */}
        <span className="ml-auto text-gray-400">{filteredFiles.length} items</span>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="h-8 border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
        {/* Type filters */}
        <div className="flex items-center gap-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2 py-0.5 text-[11px] ${
                typeFilter === t
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* View toggle */}
          <button
            onClick={() => setViewMode('table')}
            className={`px-1.5 py-0.5 text-[11px] ${viewMode === 'table' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
            title="Table view"
          >
            {'\u2261'}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-1.5 py-0.5 text-[11px] ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
            title="Grid view"
          >
            {'\u25A6'}
          </button>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 border-r border-gray-200 overflow-y-auto shrink-0">
          <div className="py-2">
            <div className="px-3 py-1 text-[10px] text-gray-400 uppercase tracking-wider">Collections</div>
            <button
              onClick={() => { setCurrentCollection(null); setSelectedFile(null); }}
              className={`block w-full text-left px-3 py-1.5 text-xs ${
                !currentCollection ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              All files
            </button>
            {MOCK_COLLECTIONS.map((col) => (
              <button
                key={col.name}
                onClick={() => { setCurrentCollection(col.name); setSelectedFile(null); }}
                className={`block w-full text-left px-3 py-1.5 text-xs ${
                  currentCollection === col.name ? 'bg-black text-white' : 'hover:bg-gray-100'
                }`}
              >
                {col.name} <span className={currentCollection === col.name ? 'text-gray-400' : 'text-gray-300'}>{col.count}</span>
              </button>
            ))}
          </div>

          <div className="py-2 border-t border-gray-200">
            <div className="px-3 py-1 text-[10px] text-gray-400 uppercase tracking-wider">Creators</div>
            {['morph.eth', 'campo.eth', 'wave.eth', 'dev.eth', 'scan.eth', 'color.eth'].map((c) => (
              <div
                key={c}
                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 cursor-pointer text-gray-600"
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* File Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'table' ? (
            <TableView
              files={filteredFiles}
              selectedFile={selectedFile}
              onSelect={setSelectedFile}
            />
          ) : (
            <GridView
              files={filteredFiles}
              selectedFile={selectedFile}
              onSelect={setSelectedFile}
            />
          )}
        </div>

        {/* Detail Panel */}
        {selectedFile && (
          <DetailPanel file={selectedFile} onClose={() => setSelectedFile(null)} />
        )}
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      <div className="h-6 border-t border-gray-200 flex items-center px-4 text-[10px] text-gray-400 shrink-0 gap-6">
        <span>{filteredFiles.length} items</span>
        {selectedFile && (
          <>
            <span>{selectedFile.name}{selectedFile.ext}</span>
            <span>{selectedFile.size}</span>
            <span>{selectedFile.type}</span>
          </>
        )}
        <span className="ml-auto">zdrive</span>
      </div>
    </div>
  );
}

/* ── Table View ──────────────────────────────────────────────────────── */

function TableView({
  files,
  selectedFile,
  onSelect,
}: {
  files: MockFile[];
  selectedFile: MockFile | null;
  onSelect: (f: MockFile) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="grid grid-cols-[1fr_60px_80px_100px_70px_80px] items-center h-7 px-4 border-b border-gray-200 text-[10px] text-gray-400 uppercase tracking-wider sticky top-0 bg-white z-10">
        <div>Name</div>
        <div>Type</div>
        <div className="text-right">Size</div>
        <div>Date</div>
        <div className="text-right">Holders</div>
        <div>Creator</div>
      </div>

      {/* Rows */}
      {files.map((file) => {
        const isSelected = selectedFile?.name === file.name;
        return (
          <button
            key={file.name}
            onClick={() => onSelect(file)}
            className={`grid grid-cols-[1fr_60px_80px_100px_70px_80px] items-center h-8 px-4 text-left w-full border-b border-gray-100 transition-colors ${
              isSelected
                ? 'bg-black text-white'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <TypeBadge type={file.type} inverted={isSelected} />
              <span className="truncate">{file.name}{file.ext}</span>
            </div>
            <div className={`text-[11px] ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
              {file.type}
            </div>
            <div className={`text-[11px] text-right ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
              {file.size}
            </div>
            <div className={`text-[11px] ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
              {formatDate(file.date)}
            </div>
            <div className={`text-[11px] text-right ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
              {formatHolders(file.holders)}
            </div>
            <div className={`text-[11px] truncate ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
              {file.creator}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Grid View ───────────────────────────────────────────────────────── */

function GridView({
  files,
  selectedFile,
  onSelect,
}: {
  files: MockFile[];
  selectedFile: MockFile | null;
  onSelect: (f: MockFile) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {files.map((file) => {
          const isSelected = selectedFile?.name === file.name;
          return (
            <button
              key={file.name}
              onClick={() => onSelect(file)}
              className={`border text-left p-3 transition-colors ${
                isSelected
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-black'
              }`}
            >
              {/* File icon area */}
              <div className={`h-20 flex items-center justify-center mb-2 ${
                isSelected ? 'text-white' : 'text-gray-300'
              }`}>
                <LargeTypeIcon type={file.type} />
              </div>
              {/* File name */}
              <div className="text-xs font-bold truncate">{file.name}{file.ext}</div>
              <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                {file.type} &middot; {file.size}
              </div>
              <div className={`text-[10px] ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                {file.creator}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Detail Panel ────────────────────────────────────────────────────── */

function DetailPanel({ file, onClose }: { file: MockFile; onClose: () => void }) {
  return (
    <div className="w-72 border-l border-gray-200 overflow-y-auto shrink-0 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Details</span>
        <button onClick={onClose} className="text-gray-400 hover:text-black text-xs">x</button>
      </div>

      {/* Preview placeholder */}
      <div className="h-40 bg-gray-50 border-b border-gray-200 flex items-center justify-center">
        <div className="text-gray-300">
          <LargeTypeIcon type={file.type} />
        </div>
      </div>

      {/* File info */}
      <div className="p-4 space-y-4">
        <div>
          <div className="font-bold text-sm">{file.name}{file.ext}</div>
          <div className="text-xs text-gray-400 mt-0.5">{file.type} &middot; {file.size}</div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">{file.description}</p>

        {/* Metadata */}
        <div className="space-y-2 text-xs">
          <MetaRow label="creator" value={file.creator} />
          <MetaRow label="collection" value={file.collection || '--'} />
          <MetaRow label="date" value={formatDate(file.date)} />
          <MetaRow label="holders" value={formatHolders(file.holders)} />
          <MetaRow label="mkt cap" value={file.marketCap} />
          <MetaRow label="volume" value={file.volume} />
          <MetaRow label="contract" value={file.contract} mono />
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <button className="w-full bg-black text-white text-xs py-2 hover:bg-gray-800 transition-colors">
            collect
          </button>
          <div className="flex gap-2">
            <button className="flex-1 border border-gray-300 text-xs py-1.5 hover:border-black transition-colors">
              view
            </button>
            <button className="flex-1 border border-gray-300 text-xs py-1.5 hover:border-black transition-colors">
              download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-gray-400">{label}</span>
      <span className={`text-right ${mono ? 'text-[11px]' : ''}`}>{value}</span>
    </div>
  );
}

function TypeBadge({ type, inverted }: { type: string; inverted: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold border ${
      inverted
        ? 'border-gray-600 text-gray-300'
        : 'border-gray-300 text-gray-500'
    }`}>
      {type.charAt(0)}
    </span>
  );
}

function LargeTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    PDF: '\u25A0',
    '3D': '\u25C6',
    IMG: '\u25CF',
    VID: '\u25B6',
    CODE: '\u2261',
  };
  return <span className="text-4xl">{icons[type] || '\u25A1'}</span>;
}
