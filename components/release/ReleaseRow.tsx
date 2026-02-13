'use client';

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

function formatHolders(n?: number): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ReleaseRow({ address, metadata, creatorAddress, creatorName, holders, createdAt }: ReleaseRowProps) {
  const fileType = getFileType(metadata.content?.mime);
  const hasGitHub = metadata.properties.zdrive.release?.external?.some(
    (e) => e.type === 'github'
  );
  const displayType = hasGitHub ? 'github' : fileType;
  const TypeIcon = FILE_TYPE_TO_ICON[displayType] || IconFile;
  const collection = metadata.properties.zdrive.collection;

  return (
    <Link
      href={`/${creatorAddress}/${address}`}
      className="grid grid-cols-[40px_1fr_140px_140px_80px_80px] items-center h-12 px-3 border-b border-zd-border last:border-b-0 cursor-pointer transition-colors duration-150 hover:bg-zd-surface-hover group"
    >
      <div className="flex justify-center text-zd-text">
        <TypeIcon />
      </div>
      <div className="font-display text-lg tracking-tight leading-tight truncate pr-4 group-hover:text-zd-text">
        {metadata.name}
      </div>
      <div className="text-sm text-zd-text-muted truncate hidden sm:block">
        {collection?.title || '—'}
      </div>
      <div className="text-xs text-zd-text-muted font-mono truncate hidden sm:block">
        {truncateAddress(address)}
      </div>
      <div className="text-xs text-zd-text-muted text-right hidden sm:block">
        {formatHolders(holders)}
      </div>
      <div className="text-xs text-zd-text-muted text-right hidden sm:block">
        {formatRelativeDate(createdAt)}
      </div>
    </Link>
  );
}

export function ReleaseRowSkeleton() {
  return (
    <div className="grid grid-cols-[40px_1fr_140px_140px_80px_80px] items-center h-12 px-3 border-b border-zd-border last:border-b-0 animate-pulse">
      <div className="flex justify-center">
        <div className="h-4 w-4 bg-zd-surface rounded-sm" />
      </div>
      <div className="h-4 w-48 bg-zd-surface rounded-sm" />
      <div className="h-3 w-20 bg-zd-surface rounded-sm hidden sm:block" />
      <div className="h-3 w-24 bg-zd-surface rounded-sm hidden sm:block" />
      <div className="h-3 w-12 bg-zd-surface rounded-sm ml-auto hidden sm:block" />
      <div className="h-3 w-12 bg-zd-surface rounded-sm ml-auto hidden sm:block" />
    </div>
  );
}
