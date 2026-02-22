'use client';

import { useState, useEffect, useRef } from 'react';
import { MOCK_FILES, MOCK_FOLDERS, formatDate, formatHolders, type MockFile } from './mockdata';

/**
 * Demo B: Terminal
 *
 * Inspiration: CLI / Terminal / DOS
 * - Black background, white monospace text
 * - Directory listing format
 * - ASCII table borders
 * - Green accents for interactive elements
 * - Command prompt aesthetic
 * - Status line at bottom (like vim/tmux)
 */

function padRight(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : ' '.repeat(len - str.length) + str;
}

export function DemoTerminal() {
  const [currentDir, setCurrentDir] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [showDetail, setShowDetail] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([
    'Z:\\> zdrive --connect',
    'Connected to Base (chain 8453)',
    'Z:\\> ls',
  ]);
  const [cmdInput, setCmdInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredFiles = currentDir
    ? MOCK_FILES.filter((f) => f.folder === currentDir)
    : MOCK_FILES;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cmdHistory]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory = [...cmdHistory, `Z:\\${currentDir ? currentDir.replace(/ /g, '_') + '\\' : ''}> ${cmd}`];

    if (trimmed === 'ls' || trimmed === 'dir') {
      // already showing file list
      newHistory.push('(listing displayed below)');
    } else if (trimmed === 'cd ..') {
      setCurrentDir(null);
      newHistory.push('Z:\\>');
    } else if (trimmed.startsWith('cd ')) {
      const dir = trimmed.slice(3).trim();
      const match = MOCK_FOLDERS.find(
        (c) => c.name.toLowerCase().replace(/ /g, '_') === dir || c.name.toLowerCase() === dir
      );
      if (match) {
        setCurrentDir(match.name);
        newHistory.push(`Changed directory to ${match.name}`);
      } else {
        newHistory.push(`Error: Directory "${dir}" not found`);
      }
    } else if (trimmed === 'help') {
      newHistory.push('Available commands:');
      newHistory.push('  ls, dir     List files');
      newHistory.push('  cd <dir>    Change directory');
      newHistory.push('  cd ..       Go up one level');
      newHistory.push('  cat <file>  View file details');
      newHistory.push('  clear       Clear terminal');
      newHistory.push('  help        Show this message');
    } else if (trimmed === 'clear') {
      setCmdHistory([]);
      setCmdInput('');
      return;
    } else if (trimmed.startsWith('cat ')) {
      const fname = trimmed.slice(4).trim();
      const file = MOCK_FILES.find(
        (f) => f.name.toLowerCase() === fname || `${f.name.toLowerCase()}${f.ext}` === fname
      );
      if (file) {
        newHistory.push('');
        newHistory.push(`  Name:       ${file.name}${file.ext}`);
        newHistory.push(`  Type:       ${file.type}`);
        newHistory.push(`  Creator:    ${file.creator} (${file.creatorAddr})`);
        newHistory.push(`  Folder:     ${file.folder || '(none)'}`);
        newHistory.push(`  Date:       ${formatDate(file.date)}`);
        newHistory.push(`  Size:       ${file.size}`);
        newHistory.push(`  Holders:    ${formatHolders(file.holders)}`);
        newHistory.push(`  Market Cap: ${file.marketCap}`);
        newHistory.push(`  Volume:     ${file.volume}`);
        newHistory.push(`  Contract:   ${file.contract}`);
        newHistory.push('');
        newHistory.push(`  ${file.description}`);
        newHistory.push('');
      } else {
        newHistory.push(`Error: File "${fname}" not found`);
      }
    } else if (trimmed) {
      newHistory.push(`Unknown command: ${trimmed}. Type "help" for available commands.`);
    }

    setCmdHistory(newHistory);
    setCmdInput('');
  };

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col bg-black text-green-400 font-mono text-sm">
      {/* ── Top Bar ────────────────────────────────────────────────────── */}
      <div className="h-7 bg-green-400 text-black flex items-center px-3 text-xs font-bold shrink-0 justify-between">
        <span>Z:\DRIVE TERMINAL v1.0</span>
        <span>BASE:8453 | CONNECTED</span>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Directory tree */}
        <div className="w-56 border-r border-green-900 overflow-y-auto p-3 shrink-0">
          <div className="text-green-600 text-xs mb-2">{'// DIRECTORIES'}</div>
          <button
            onClick={() => { setCurrentDir(null); setSelectedIdx(-1); }}
            className={`block w-full text-left px-1 ${!currentDir ? 'text-green-400 bg-green-400/10' : 'text-green-700 hover:text-green-400'}`}
          >
            {'>'} Z:\
          </button>
          {MOCK_FOLDERS.map((col) => (
            <button
              key={col.name}
              onClick={() => { setCurrentDir(col.name); setSelectedIdx(-1); }}
              className={`block w-full text-left px-1 pl-4 ${
                currentDir === col.name ? 'text-green-400 bg-green-400/10' : 'text-green-700 hover:text-green-400'
              }`}
            >
              [+] {col.name.replace(/ /g, '_')}/
            </button>
          ))}
        </div>

        {/* Right panel: File listing + terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File listing */}
          <div className="flex-1 overflow-y-auto p-3" ref={scrollRef}>
            {/* Command history */}
            {cmdHistory.map((line, i) => (
              <div key={i} className={line.startsWith('Error') ? 'text-red-400' : 'text-green-600'}>
                {line}
              </div>
            ))}

            {/* Current directory listing */}
            <div className="mt-2 text-green-400">
              <div className="text-green-600 mb-1">
                {'// '}{currentDir ? `Z:\\${currentDir.replace(/ /g, '_')}` : 'Z:\\'}{' — '}{filteredFiles.length} files
              </div>

              {/* ASCII table header */}
              <div className="text-green-600">
                {'\u250C'}{'\u2500'.repeat(5)}{'\u252C'}{'\u2500'.repeat(26)}{'\u252C'}{'\u2500'.repeat(8)}{'\u252C'}{'\u2500'.repeat(12)}{'\u252C'}{'\u2500'.repeat(10)}{'\u252C'}{'\u2500'.repeat(8)}{'\u2510'}
              </div>
              <div className="text-green-600">
                {'\u2502'} {padRight('TYPE', 4)}{'\u2502'} {padRight('NAME', 25)}{'\u2502'} {padRight('SIZE', 7)}{'\u2502'} {padRight('DATE', 11)}{'\u2502'} {padRight('CREATOR', 9)}{'\u2502'} {padLeft('HOLD', 7)}{'\u2502'}
              </div>
              <div className="text-green-600">
                {'\u251C'}{'\u2500'.repeat(5)}{'\u253C'}{'\u2500'.repeat(26)}{'\u253C'}{'\u2500'.repeat(8)}{'\u253C'}{'\u2500'.repeat(12)}{'\u253C'}{'\u2500'.repeat(10)}{'\u253C'}{'\u2500'.repeat(8)}{'\u2524'}
              </div>

              {/* File rows */}
              {filteredFiles.map((file, i) => (
                <button
                  key={file.name}
                  onClick={() => { setSelectedIdx(i); setShowDetail(!showDetail || selectedIdx !== i); }}
                  className={`block w-full text-left ${
                    selectedIdx === i ? 'bg-green-400/20 text-white' : 'hover:bg-green-400/5'
                  }`}
                >
                  <span className="text-green-600">{'\u2502'}</span>
                  {' '}{padRight(file.type, 4)}
                  <span className="text-green-600">{'\u2502'}</span>
                  {' '}<span className={selectedIdx === i ? 'text-white' : 'text-green-400'}>{padRight(`${file.name}${file.ext}`, 25)}</span>
                  <span className="text-green-600">{'\u2502'}</span>
                  {' '}<span className="text-green-700">{padRight(file.size, 7)}</span>
                  <span className="text-green-600">{'\u2502'}</span>
                  {' '}<span className="text-green-700">{padRight(formatDate(file.date), 11)}</span>
                  <span className="text-green-600">{'\u2502'}</span>
                  {' '}<span className="text-green-700">{padRight(file.creator, 9)}</span>
                  <span className="text-green-600">{'\u2502'}</span>
                  {' '}<span className="text-green-700">{padLeft(formatHolders(file.holders), 7)}</span>
                  <span className="text-green-600">{'\u2502'}</span>
                </button>
              ))}

              {/* ASCII table footer */}
              <div className="text-green-600">
                {'\u2514'}{'\u2500'.repeat(5)}{'\u2534'}{'\u2500'.repeat(26)}{'\u2534'}{'\u2500'.repeat(8)}{'\u2534'}{'\u2500'.repeat(12)}{'\u2534'}{'\u2500'.repeat(10)}{'\u2534'}{'\u2500'.repeat(8)}{'\u2518'}
              </div>

              {/* Selected file detail */}
              {showDetail && selectedIdx >= 0 && selectedIdx < filteredFiles.length && (
                <div className="mt-3 border border-green-900 p-3">
                  <div className="text-green-600 mb-2">{'// FILE DETAILS'}</div>
                  <TermDetail file={filteredFiles[selectedIdx]} />
                  <div className="mt-3 flex items-center gap-4">
                    <button className="border border-green-400 text-green-400 px-3 py-1 text-xs hover:bg-green-400 hover:text-black">
                      [COLLECT]
                    </button>
                    <button className="border border-green-700 text-green-700 px-3 py-1 text-xs hover:border-green-400 hover:text-green-400">
                      [VIEW ON ZORA]
                    </button>
                    <button className="border border-green-700 text-green-700 px-3 py-1 text-xs hover:border-green-400 hover:text-green-400">
                      [DOWNLOAD]
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Command input */}
          <div className="border-t border-green-900 px-3 py-2 flex items-center gap-2 shrink-0">
            <span className="text-green-600 text-xs">
              Z:\{currentDir ? `${currentDir.replace(/ /g, '_')}\\` : ''}&gt;
            </span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommand(cmdInput);
              }}
              className="flex-1 bg-transparent text-green-400 outline-none text-sm caret-green-400"
              placeholder="type 'help' for commands..."
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      <div className="h-5 bg-green-900 text-green-300 flex items-center px-3 text-[10px] shrink-0 justify-between">
        <span>{filteredFiles.length} files | {currentDir || 'root'}</span>
        <span>
          {selectedIdx >= 0 && selectedIdx < filteredFiles.length
            ? `${filteredFiles[selectedIdx].name}${filteredFiles[selectedIdx].ext}`
            : 'no selection'}
        </span>
        <span>zdrive v1.0 | base:8453</span>
      </div>
    </div>
  );
}

function TermDetail({ file }: { file: MockFile }) {
  return (
    <div className="space-y-0.5 text-xs">
      <div><span className="text-green-700">name:       </span>{file.name}{file.ext}</div>
      <div><span className="text-green-700">type:       </span>{file.type}</div>
      <div><span className="text-green-700">size:       </span>{file.size}</div>
      <div><span className="text-green-700">creator:    </span>{file.creator} ({file.creatorAddr})</div>
      <div><span className="text-green-700">folder:     </span>{file.folder || '(none)'}</div>
      <div><span className="text-green-700">date:       </span>{formatDate(file.date)}</div>
      <div><span className="text-green-700">holders:    </span>{formatHolders(file.holders)}</div>
      <div><span className="text-green-700">market_cap: </span>{file.marketCap}</div>
      <div><span className="text-green-700">volume:     </span>{file.volume}</div>
      <div><span className="text-green-700">contract:   </span>{file.contract}</div>
      <div className="mt-1"><span className="text-green-700">desc:       </span><span className="text-green-600">{file.description}</span></div>
    </div>
  );
}
