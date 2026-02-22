'use client';

import { useState } from 'react';
import { MOCK_FILES, MOCK_FOLDERS, formatDate, formatHolders, type MockFile } from './mockdata';

/**
 * Demo D: Finder
 *
 * Directly inspired by macOS Finder
 * - Miller column view: Folders -> Files -> Preview
 * - Subtle gray toolbar with segmented view controls
 * - macOS-style sidebar with Favorites / Locations sections
 * - Quick Look-style preview panel on the right
 * - Rounded selection highlights (macOS blue -> black for B&W)
 * - Bottom path bar
 * - Clean, precise, lots of negative space
 */

type ViewMode = 'columns' | 'list';

export function DemoFinder() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MockFile | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('columns');
  const [sidebarSection, setSidebarSection] = useState<'favorites' | 'creators'>('favorites');

  const folderFiles = selectedFolder
    ? MOCK_FILES.filter((f) => f.folder === selectedFolder)
    : [];

  const unfiled = MOCK_FILES.filter((f) => !f.folder);

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col bg-white text-black font-mono text-[13px]">
      {/* ── Traffic Lights + Title Bar ─────────────────────────────────── */}
      <div className="h-12 bg-[#f6f6f6] border-b border-[#d1d1d1] flex items-center px-4 shrink-0">
        {/* Traffic lights */}
        <div className="flex items-center gap-2 mr-6">
          <span className="w-3 h-3 rounded-full bg-[#ccc] border border-[#b0b0b0]" />
          <span className="w-3 h-3 rounded-full bg-[#ccc] border border-[#b0b0b0]" />
          <span className="w-3 h-3 rounded-full bg-[#ccc] border border-[#b0b0b0]" />
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1 mr-4">
          <button className="text-gray-400 hover:text-black px-1 text-lg">&lsaquo;</button>
          <button className="text-gray-400 hover:text-black px-1 text-lg">&rsaquo;</button>
        </div>

        {/* Title */}
        <span className="font-bold text-sm">
          {selectedFolder || 'Z:DRIVE'}
        </span>

        {/* Toolbar right */}
        <div className="ml-auto flex items-center gap-3">
          {/* View segmented control */}
          <div className="flex border border-[#c8c8c8] rounded-[4px] overflow-hidden">
            <button
              onClick={() => setViewMode('columns')}
              className={`px-2 py-0.5 text-[11px] ${
                viewMode === 'columns' ? 'bg-[#e0e0e0]' : 'bg-white hover:bg-[#f0f0f0]'
              }`}
            >
              Columns
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-0.5 text-[11px] border-l border-[#c8c8c8] ${
                viewMode === 'list' ? 'bg-[#e0e0e0]' : 'bg-white hover:bg-[#f0f0f0]'
              }`}
            >
              List
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search"
            className="border border-[#c8c8c8] rounded-[4px] bg-white px-2 py-0.5 text-[11px] w-36 outline-none focus:border-[#888]"
          />
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-44 bg-[#f6f6f6] border-r border-[#d1d1d1] overflow-y-auto shrink-0 py-2">
          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Favorites
          </div>
          <button
            onClick={() => { setSelectedFolder(null); setSelectedFile(null); setSidebarSection('favorites'); }}
            className={`block w-full text-left px-3 py-1 text-xs rounded-[4px] mx-1 ${
              !selectedFolder && sidebarSection === 'favorites'
                ? 'bg-black text-white'
                : 'hover:bg-[#e8e8e8]'
            }`}
            style={{ width: 'calc(100% - 8px)' }}
          >
            Z:DRIVE
          </button>
          {MOCK_FOLDERS.map((folder) => (
            <button
              key={folder.name}
              onClick={() => { setSelectedFolder(folder.name); setSelectedFile(null); setSidebarSection('favorites'); }}
              className={`block w-full text-left px-3 py-1 text-xs rounded-[4px] mx-1 ${
                selectedFolder === folder.name
                  ? 'bg-black text-white'
                  : 'hover:bg-[#e8e8e8]'
              }`}
              style={{ width: 'calc(100% - 8px)' }}
            >
              <span className="mr-1.5">&#x1F4C1;</span>
              {folder.name}
            </button>
          ))}

          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-4">
            Creators
          </div>
          {['morph.eth', 'campo.eth', 'wave.eth', 'dev.eth', 'scan.eth', 'color.eth'].map((c) => (
            <div
              key={c}
              className="block w-full text-left px-3 py-1 text-xs rounded-[4px] mx-1 hover:bg-[#e8e8e8] cursor-pointer text-gray-500"
              style={{ width: 'calc(100% - 8px)' }}
            >
              <span className="mr-1.5">&#x1F464;</span>
              {c}
            </div>
          ))}
        </div>

        {viewMode === 'columns' ? (
          <ColumnsView
            selectedFolder={selectedFolder}
            selectedFile={selectedFile}
            folderFiles={folderFiles}
            unfiled={unfiled}
            onSelectFolder={(name) => { setSelectedFolder(name); setSelectedFile(null); }}
            onSelectFile={setSelectedFile}
          />
        ) : (
          <ListView
            selectedFolder={selectedFolder}
            selectedFile={selectedFile}
            folderFiles={selectedFolder ? folderFiles : MOCK_FILES}
            onSelectFile={setSelectedFile}
          />
        )}
      </div>

      {/* ── Path Bar ──────────────────────────────────────────────────── */}
      <div className="h-6 bg-[#f6f6f6] border-t border-[#d1d1d1] flex items-center px-4 text-[10px] text-gray-400 shrink-0">
        <span>Z:DRIVE</span>
        {selectedFolder && <><span className="mx-1">&rsaquo;</span><span>{selectedFolder}</span></>}
        {selectedFile && <><span className="mx-1">&rsaquo;</span><span className="text-gray-600">{selectedFile.name}{selectedFile.ext}</span></>}
        <span className="ml-auto">
          {selectedFolder ? folderFiles.length : MOCK_FILES.length} items
        </span>
      </div>
    </div>
  );
}

/* ── Columns View (Miller Columns) ───────────────────────────────────── */

function ColumnsView({
  selectedFolder,
  selectedFile,
  folderFiles,
  unfiled,
  onSelectFolder,
  onSelectFile,
}: {
  selectedFolder: string | null;
  selectedFile: MockFile | null;
  folderFiles: MockFile[];
  unfiled: MockFile[];
  onSelectFolder: (name: string) => void;
  onSelectFile: (f: MockFile) => void;
}) {
  return (
    <div className="flex-1 flex overflow-x-auto">
      {/* Column 1: Folders */}
      <div className="w-52 border-r border-[#d1d1d1] overflow-y-auto shrink-0 bg-white">
        <div className="py-1">
          {MOCK_FOLDERS.map((folder) => (
            <button
              key={folder.name}
              onClick={() => onSelectFolder(folder.name)}
              className={`flex items-center justify-between w-full text-left px-3 py-1 text-xs ${
                selectedFolder === folder.name
                  ? 'bg-black text-white rounded-[4px] mx-0.5'
                  : 'hover:bg-gray-100'
              }`}
              style={selectedFolder === folder.name ? { width: 'calc(100% - 4px)' } : undefined}
            >
              <span className="flex items-center gap-1.5">
                <span>&#x1F4C1;</span>
                <span className="truncate">{folder.name}</span>
              </span>
              <span className={selectedFolder === folder.name ? 'text-gray-400' : 'text-gray-300'}>
                &rsaquo;
              </span>
            </button>
          ))}
          {/* Unfiled files at root level */}
          {unfiled.map((file) => (
            <button
              key={file.name}
              onClick={() => onSelectFile(file)}
              className={`flex items-center w-full text-left px-3 py-1 text-xs ${
                selectedFile?.name === file.name && !selectedFolder
                  ? 'bg-black text-white rounded-[4px] mx-0.5'
                  : 'hover:bg-gray-100'
              }`}
              style={selectedFile?.name === file.name && !selectedFolder ? { width: 'calc(100% - 4px)' } : undefined}
            >
              <span className="flex items-center gap-1.5">
                <FileEmoji type={file.type} />
                <span className="truncate">{file.name}{file.ext}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Files in folder (only if folder selected) */}
      {selectedFolder && (
        <div className="w-52 border-r border-[#d1d1d1] overflow-y-auto shrink-0 bg-white">
          <div className="py-1">
            {folderFiles.length === 0 && (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">Empty folder</div>
            )}
            {folderFiles.map((file) => (
              <button
                key={file.name}
                onClick={() => onSelectFile(file)}
                className={`flex items-center w-full text-left px-3 py-1 text-xs ${
                  selectedFile?.name === file.name
                    ? 'bg-black text-white rounded-[4px] mx-0.5'
                    : 'hover:bg-gray-100'
                }`}
                style={selectedFile?.name === file.name ? { width: 'calc(100% - 4px)' } : undefined}
              >
                <span className="flex items-center gap-1.5">
                  <FileEmoji type={file.type} />
                  <span className="truncate">{file.name}{file.ext}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Column 3: Preview (if file selected) */}
      {selectedFile ? (
        <PreviewColumn file={selectedFile} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-300 text-xs">
          {selectedFolder ? 'Select a file to preview' : 'Select a folder'}
        </div>
      )}
    </div>
  );
}

/* ── List View ───────────────────────────────────────────────────────── */

function ListView({
  selectedFolder,
  selectedFile,
  folderFiles,
  onSelectFile,
}: {
  selectedFolder: string | null;
  selectedFile: MockFile | null;
  folderFiles: MockFile[];
  onSelectFile: (f: MockFile) => void;
}) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="grid grid-cols-[1fr_60px_80px_100px_70px] items-center h-6 px-4 border-b border-[#d1d1d1] text-[10px] text-gray-400 sticky top-0 bg-white z-10">
          <div>Name</div>
          <div>Kind</div>
          <div className="text-right">Size</div>
          <div>Date Modified</div>
          <div className="text-right">Holders</div>
        </div>

        {/* Folder header row (if in a folder) */}
        {selectedFolder && (
          <div className="grid grid-cols-[1fr_60px_80px_100px_70px] items-center h-6 px-4 text-[11px] font-bold bg-[#f6f6f6] border-b border-[#e8e8e8]">
            <div className="flex items-center gap-1.5">
              <span>&#x25BE;</span>
              <span>&#x1F4C1;</span>
              {selectedFolder}
            </div>
            <div />
            <div className="text-right text-gray-400">--</div>
            <div className="text-gray-400">--</div>
            <div className="text-right text-gray-400">{folderFiles.length}</div>
          </div>
        )}

        {/* File rows */}
        {folderFiles.map((file) => {
          const isSelected = selectedFile?.name === file.name;
          return (
            <button
              key={file.name}
              onClick={() => onSelectFile(file)}
              className={`grid grid-cols-[1fr_60px_80px_100px_70px] items-center h-6 px-4 text-left w-full text-[11px] ${
                isSelected
                  ? 'bg-black text-white'
                  : 'hover:bg-[#f2f2f2]'
              } ${selectedFolder ? 'pl-8' : ''}`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <FileEmoji type={file.type} />
                <span className="truncate">{file.name}{file.ext}</span>
              </div>
              <div className={isSelected ? 'text-gray-400' : 'text-gray-500'}>
                {file.type}
              </div>
              <div className={`text-right ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                {file.size}
              </div>
              <div className={isSelected ? 'text-gray-400' : 'text-gray-500'}>
                {formatDate(file.date)}
              </div>
              <div className={`text-right ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatHolders(file.holders)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Preview sidebar */}
      {selectedFile && <PreviewColumn file={selectedFile} />}
    </div>
  );
}

/* ── Preview Column (Quick Look style) ───────────────────────────────── */

function PreviewColumn({ file }: { file: MockFile }) {
  return (
    <div className="w-72 border-l border-[#d1d1d1] bg-white overflow-y-auto shrink-0">
      {/* Large preview area */}
      <div className="h-48 bg-[#f9f9f9] flex items-center justify-center border-b border-[#e8e8e8]">
        <div className="text-6xl text-gray-200">
          <FileEmoji type={file.type} large />
        </div>
      </div>

      {/* File info */}
      <div className="p-4 space-y-4">
        <div className="text-center">
          <div className="font-bold text-sm">{file.name}{file.ext}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{file.type} &middot; {file.size}</div>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed text-center">{file.description}</p>

        <div className="border-t border-[#e8e8e8] pt-3 space-y-1.5">
          <InfoRow label="Creator" value={file.creator} />
          <InfoRow label="Folder" value={file.folder || '--'} />
          <InfoRow label="Modified" value={formatDate(file.date)} />
          <InfoRow label="Holders" value={formatHolders(file.holders)} />
          <InfoRow label="Market Cap" value={file.marketCap} />
          <InfoRow label="Volume" value={file.volume} />
        </div>

        <div className="border-t border-[#e8e8e8] pt-3">
          <InfoRow label="Contract" value={file.contract} />
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button className="w-full bg-black text-white text-[11px] py-2 rounded-[4px] hover:bg-gray-800 transition-colors">
            Collect
          </button>
          <div className="flex gap-2">
            <button className="flex-1 border border-[#c8c8c8] text-[11px] py-1.5 rounded-[4px] hover:border-black transition-colors">
              Open
            </button>
            <button className="flex-1 border border-[#c8c8c8] text-[11px] py-1.5 rounded-[4px] hover:border-black transition-colors">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-gray-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function FileEmoji({ type, large }: { type: string; large?: boolean }) {
  const emojis: Record<string, string> = {
    PDF: '\u{1F4C4}',
    '3D': '\u{1F4E6}',
    IMG: '\u{1F5BC}',
    VID: '\u{1F3AC}',
    CODE: '\u{1F4DD}',
  };
  if (large) return <span className="text-6xl">{emojis[type] || '\u{1F4C4}'}</span>;
  return <span>{emojis[type] || '\u{1F4C4}'}</span>;
}
