'use client';

import { useState, useCallback } from 'react';
import { unzipSync } from 'fflate';
import { ipfsToHttp } from '@/lib/constants';
import type { ZDriveAsset } from '@/types/zdrive';

interface DownloadCardProps {
  asset: ZDriveAsset;
  className?: string;
}

// Max file size to attempt ZIP inspection (50MB)
const MAX_ZIP_SIZE = 50 * 1024 * 1024;

interface ZipEntry {
  name: string;
  size: number;
}

// Get icon based on file type
function getFileIcon(mime: string) {
  if (mime.includes('zip') || mime.includes('compressed')) {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    );
  }

  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// Format file size for display
function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${bytes} B`;
}

// Check if asset is a ZIP file
function isZipAsset(asset: ZDriveAsset): boolean {
  return (
    asset.mime.includes('zip') ||
    asset.mime.includes('compressed') ||
    asset.name.toLowerCase().endsWith('.zip')
  );
}

export function DownloadCard({ asset, className }: DownloadCardProps) {
  const [showFiles, setShowFiles] = useState(false);
  const [zipEntries, setZipEntries] = useState<ZipEntry[] | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const downloadUrl = ipfsToHttp(asset.uri);
  const sizeDisplay = asset.size ? formatSize(asset.size) : null;
  const isZip = isZipAsset(asset);
  const isTooLarge = asset.size ? asset.size > MAX_ZIP_SIZE : false;

  const handleToggleFiles = useCallback(async () => {
    if (showFiles) {
      setShowFiles(false);
      return;
    }

    setShowFiles(true);

    // If already loaded, just show
    if (zipEntries) return;

    // Check size limit
    if (isTooLarge) {
      setZipError('File too large to inspect');
      return;
    }

    setIsLoading(true);
    setZipError(null);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Unzip and extract file info
      const unzipped = unzipSync(data);
      const entries: ZipEntry[] = Object.entries(unzipped).map(
        ([name, content]) => ({
          name,
          size: content.length,
        })
      );

      // Sort by name
      entries.sort((a, b) => a.name.localeCompare(b.name));
      setZipEntries(entries);
    } catch (err) {
      setZipError(
        err instanceof Error ? err.message : 'Failed to read ZIP file'
      );
    } finally {
      setIsLoading(false);
    }
  }, [showFiles, zipEntries, isTooLarge, downloadUrl]);

  return (
    <div className={`border border-zdrive-border bg-zdrive-surface ${className}`}>
      {/* Main download row */}
      <a
        href={downloadUrl}
        download={asset.name}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 transition-colors hover:bg-zdrive-bg"
      >
        <div className="text-zdrive-text-secondary">{getFileIcon(asset.mime)}</div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{asset.name}</p>
          <p className="text-sm text-zdrive-text-muted">
            {asset.mime}
            {sizeDisplay && ` · ${sizeDisplay}`}
          </p>
          {asset.sha256 && (
            <p className="mt-1 font-mono text-xs text-zdrive-text-muted">
              SHA-256: {asset.sha256.slice(0, 16)}...
            </p>
          )}
        </div>

        <svg
          className="h-5 w-5 flex-shrink-0 text-zdrive-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </a>

      {/* ZIP file list toggle */}
      {isZip && (
        <div className="border-t border-zdrive-border">
          <button
            onClick={handleToggleFiles}
            className="flex w-full items-center justify-between px-4 py-2 text-sm text-zdrive-text-secondary transition-colors hover:bg-zdrive-bg hover:text-zdrive-text"
          >
            <span>{showFiles ? 'Hide files' : 'Show files'}</span>
            <svg
              className={`h-4 w-4 transition-transform ${showFiles ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Expanded file list */}
          {showFiles && (
            <div className="border-t border-zdrive-border bg-zdrive-bg p-4">
              {isLoading && (
                <p className="text-sm text-zdrive-text-muted">Loading...</p>
              )}

              {zipError && (
                <p className="text-sm text-red-500">{zipError}</p>
              )}

              {zipEntries && zipEntries.length > 0 && (
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {zipEntries.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-zdrive-text-secondary">
                        {entry.name}
                      </span>
                      <span className="ml-4 flex-shrink-0 text-zdrive-text-muted">
                        {formatSize(entry.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {zipEntries && zipEntries.length === 0 && (
                <p className="text-sm text-zdrive-text-muted">
                  ZIP file is empty
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// List of downloadable assets
interface DownloadListProps {
  assets: ZDriveAsset[];
  className?: string;
}

export function DownloadList({ assets, className }: DownloadListProps) {
  if (assets.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-zdrive-text-secondary">
        Attachments
      </h3>
      {assets.map((asset, index) => (
        <DownloadCard key={`${asset.uri}-${index}`} asset={asset} />
      ))}
    </div>
  );
}
