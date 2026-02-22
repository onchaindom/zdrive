'use client';

import { useState } from 'react';
import { MOCK_FILES, MOCK_FOLDERS, formatDate, formatHolders, type MockFile } from './mockdata';

/**
 * Demo E: Index
 *
 * Inspiration: Library card catalog / newspaper index / brutalist typography
 * - All about type hierarchy and density
 * - No chrome, no borders, no sidebar — just content
 * - Monospace throughout, black and white
 * - Entries read like an index: Name — Creator — Type — Date
 * - Folder groupings as section headers
 * - Click a file to expand its "card" inline
 * - The whole thing is essentially a long scrollable document
 * - Feels archival, reference-like, serious
 */

export function DemoIndex() {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [showBy, setShowBy] = useState<'folder' | 'date' | 'creator' | 'type'>('folder');

  const grouped = groupFiles(MOCK_FILES, showBy);

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col bg-white text-black font-mono">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-8 pt-8 pb-6 border-b border-black">
        <div className="flex items-baseline justify-between">
          <h1 className="text-4xl font-bold tracking-tighter">Z:DRIVE</h1>
          <nav className="flex items-center gap-4 text-xs">
            <a href="#" className="hover:underline">browse</a>
            <a href="#" className="hover:underline">create</a>
            <a href="#" className="text-gray-400 hover:underline">search</a>
            <button className="border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
              connect
            </button>
          </nav>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {MOCK_FILES.length} files &middot; {MOCK_FOLDERS.length} folders &middot; {new Set(MOCK_FILES.map(f => f.creator)).size} creators
        </p>

        {/* Sort/group control */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <span className="text-gray-400">INDEX BY:</span>
          {(['folder', 'date', 'creator', 'type'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setShowBy(mode)}
              className={`uppercase ${
                showBy === mode ? 'font-bold underline underline-offset-4' : 'text-gray-400 hover:text-black'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ── Index Content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          {grouped.map(({ label, files }) => (
            <div key={label} className="mb-8">
              {/* Section header */}
              <div className="flex items-baseline gap-3 mb-3 border-b-2 border-black pb-1">
                <h2 className="text-lg font-bold tracking-tight">{label}</h2>
                <span className="text-xs text-gray-400">{files.length}</span>
              </div>

              {/* Entries */}
              <div className="space-y-0">
                {files.map((file) => {
                  const isExpanded = expandedFile === file.contract;
                  return (
                    <div key={file.contract}>
                      {/* Index entry line */}
                      <button
                        onClick={() => setExpandedFile(isExpanded ? null : file.contract)}
                        className={`w-full text-left group ${
                          isExpanded ? 'bg-black text-white -mx-3 px-3 py-1.5' : 'py-1 hover:bg-gray-50 -mx-3 px-3'
                        }`}
                      >
                        <div className="flex items-baseline gap-2 text-sm">
                          <span className="font-bold">{file.name}{file.ext}</span>
                          <span className={`flex-1 border-b border-dotted ${
                            isExpanded ? 'border-gray-600' : 'border-gray-300'
                          }`} />
                          <span className={`text-xs ${isExpanded ? 'text-gray-400' : 'text-gray-500'}`}>
                            {file.creator}
                          </span>
                          <span className={`text-xs w-10 text-right ${isExpanded ? 'text-gray-400' : 'text-gray-400'}`}>
                            {file.type}
                          </span>
                          <span className={`text-xs w-24 text-right ${isExpanded ? 'text-gray-400' : 'text-gray-400'}`}>
                            {formatDate(file.date)}
                          </span>
                        </div>
                      </button>

                      {/* Expanded card */}
                      {isExpanded && (
                        <div className="bg-black text-white -mx-3 px-3 pb-4 pt-2">
                          <div className="ml-4 border-l border-gray-700 pl-4 space-y-3">
                            <p className="text-xs text-gray-400 leading-relaxed max-w-lg">
                              {file.description}
                            </p>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs max-w-lg">
                              <CardRow label="folder" value={file.folder || '--'} />
                              <CardRow label="size" value={file.size} />
                              <CardRow label="holders" value={formatHolders(file.holders)} />
                              <CardRow label="mkt cap" value={file.marketCap} />
                              <CardRow label="volume" value={file.volume} />
                              <CardRow label="contract" value={file.contract} />
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                              <button className="border border-white text-white text-xs px-4 py-1 hover:bg-white hover:text-black transition-colors">
                                collect
                              </button>
                              <button className="border border-gray-600 text-gray-400 text-xs px-4 py-1 hover:border-white hover:text-white transition-colors">
                                open
                              </button>
                              <button className="border border-gray-600 text-gray-400 text-xs px-4 py-1 hover:border-white hover:text-white transition-colors">
                                download
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-black px-8 py-2 flex items-center justify-between text-[10px] text-gray-400">
        <span>{MOCK_FILES.length} files indexed</span>
        <span>zdrive &middot; built on zora</span>
      </div>
    </div>
  );
}

/* ── Grouping Logic ──────────────────────────────────────────────────── */

interface FileGroup {
  label: string;
  files: MockFile[];
}

function groupFiles(files: MockFile[], by: 'folder' | 'date' | 'creator' | 'type'): FileGroup[] {
  const map = new Map<string, MockFile[]>();

  for (const file of files) {
    let key: string;
    switch (by) {
      case 'folder':
        key = file.folder || 'Unfiled';
        break;
      case 'date':
        key = file.date.slice(0, 7); // YYYY-MM
        break;
      case 'creator':
        key = file.creator;
        break;
      case 'type':
        key = file.type;
        break;
    }
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(file);
  }

  const groups: FileGroup[] = [];
  for (const [label, groupFiles] of map) {
    groups.push({ label, files: groupFiles });
  }

  // Sort groups
  if (by === 'date') {
    groups.sort((a, b) => b.label.localeCompare(a.label)); // newest first
  } else {
    groups.sort((a, b) => a.label.localeCompare(b.label));
  }

  return groups;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function CardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-400">{value}</span>
    </div>
  );
}
