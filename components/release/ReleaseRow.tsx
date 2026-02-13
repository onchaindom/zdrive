'use client';

import { useState } from 'react';
import Link from 'next/link';
import { truncateAddress } from '@/lib/constants';
import { getFileType, type ZDriveMetadata } from '@/types/zdrive';
import {
  IconPDF,
  Icon3D,
  IconImage,
  IconVideo,
  IconCode,
  IconCloud,
  IconFile,
} from '@/components/ui/FileTypeIcon';

interface ReleaseRowProps {
  address: string;
  metadata: ZDriveMetadata;
  creatorAddress: string;
  creatorName?: string;
  holders?: number;
  createdAt?: string;
}

const FILE_TYPE_TO_ICON: Record<string, React.FC<{ className?: string }>> = {
  pdf: IconPDF,
  glb: Icon3D,
  gltf: Icon3D,
  image: IconImage,
  video: IconVideo,
  markdown: IconCode,
  ply: IconCloud,
  github: IconCode,
  other: IconFile,
};

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  glb: '3D',
  gltf: '3D',
  image: 'IMG',
  video: 'VIDEO',
  markdown: 'TEXT',
  ply: '3D',
  github: 'CODE',
  other: 'FILE',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}.${m}.${d}`;
}

function formatHolders(n?: number): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

export function ReleaseRow({ address, metadata, creatorAddress, creatorName, holders, createdAt }: ReleaseRowProps) {
  const [expanded, setExpanded] = useState(false);
  const fileType = getFileType(metadata.content?.mime);
  const hasGitHub = metadata.properties.zdrive.release?.external?.some(
    (e) => e.type === 'github'
  );
  const displayType = hasGitHub ? 'github' : fileType;
  const TypeIcon = FILE_TYPE_TO_ICON[displayType] || IconFile;
  const typeLabel = FILE_TYPE_LABELS[displayType] || 'FILE';
  const collection = metadata.properties.zdrive.collection;

  return (
    <div className="border-b border-zd-border last:border-b-0">
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="grid grid-cols-[100px_1fr_60px_32px] sm:grid-cols-[120px_1fr_80px_32px] items-center w-full h-12 px-3 cursor-pointer transition-colors duration-150 hover:bg-zd-surface-hover text-left"
      >
        <span className="text-xs font-mono text-zd-text-muted">
          {formatDate(createdAt)}
        </span>
        <span className="font-display text-lg tracking-tight leading-tight truncate pr-4">
          {metadata.name}
        </span>
        <span className="text-xs font-mono text-zd-text-muted uppercase">
          {typeLabel}
        </span>
        <span className="text-sm font-mono text-zd-text-muted text-right">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-4 pt-1 border-t border-zd-border bg-zd-surface-hover/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 ml-[100px] sm:ml-[120px]">
            {metadata.description && (
              <p className="text-sm text-zd-text-secondary leading-relaxed sm:col-span-2 mb-1">
                {metadata.description}
              </p>
            )}
            <div className="flex items-center gap-2">
              <TypeIcon className="text-zd-text-muted" />
              <Link
                href={`/${creatorAddress}`}
                className="text-sm text-zd-text-secondary underline hover:text-zd-text"
                onClick={(e) => e.stopPropagation()}
              >
                {creatorName || truncateAddress(creatorAddress)}
              </Link>
            </div>
            {collection && (
              <div className="text-sm text-zd-text-muted">
                Collection: {collection.title}
              </div>
            )}
            <div className="text-sm text-zd-text-muted font-mono">
              {truncateAddress(address)}
            </div>
            {holders != null && (
              <div className="text-sm text-zd-text-muted">
                {formatHolders(holders)} holders
              </div>
            )}
          </div>
          <div className="mt-3 ml-[100px] sm:ml-[120px]">
            <Link
              href={`/${creatorAddress}/${address}`}
              className="inline-block text-sm font-medium text-zd-text underline hover:text-zd-text-secondary"
              onClick={(e) => e.stopPropagation()}
            >
              View Release
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReleaseRowSkeleton() {
  return (
    <div className="grid grid-cols-[100px_1fr_60px_32px] sm:grid-cols-[120px_1fr_80px_32px] items-center h-12 px-3 border-b border-zd-border last:border-b-0 animate-pulse">
      <div className="h-3 w-16 bg-zd-surface" />
      <div className="h-4 w-48 bg-zd-surface" />
      <div className="h-3 w-10 bg-zd-surface" />
      <div className="h-3 w-4 bg-zd-surface ml-auto" />
    </div>
  );
}
