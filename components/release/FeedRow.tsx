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

interface FeedRowProps {
  address: string;
  metadata: ZDriveMetadata;
  creatorAddress: string;
  creatorName?: string;
  createdAt?: string;
  volume24h?: string;
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}.${m}.${d}`;
}

function formatVolume(vol?: string): string {
  if (!vol) return '—';
  const n = parseFloat(vol);
  if (isNaN(n) || n === 0) return '—';
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (n >= 1) return '$' + n.toFixed(0);
  return '<$1';
}

export function FeedRow({ address, metadata, creatorAddress, creatorName, createdAt, volume24h }: FeedRowProps) {
  const fileType = getFileType(metadata.content?.mime);
  const hasGitHub = metadata.properties.zdrive.release?.external?.some(
    (e) => e.type === 'github'
  );
  const displayType = hasGitHub ? 'github' : fileType;
  const TypeIcon = FILE_TYPE_TO_ICON[displayType] || IconFile;

  return (
    <Link
      href={`/${creatorAddress}/${address}`}
      className="grid grid-cols-[90px_1fr_40px] sm:grid-cols-[90px_1fr_120px_40px_70px_80px] items-center w-full h-10 px-3 border-b border-zd-border last:border-b-0 transition-colors duration-150 hover:bg-zd-surface-hover"
    >
      <span className="text-xs font-mono text-zd-text-muted">
        {formatDate(createdAt)}
      </span>
      <span className="font-display text-base tracking-tight leading-tight truncate pr-4">
        {metadata.name}
      </span>
      <span className="hidden sm:block text-xs text-zd-text-secondary truncate pr-2">
        {creatorName || truncateAddress(creatorAddress)}
      </span>
      <span className="flex justify-center">
        <TypeIcon className="text-zd-text-muted" />
      </span>
      <span className="hidden sm:block text-xs font-mono text-zd-text-muted text-right">
        —
      </span>
      <span className="hidden sm:block text-xs font-mono text-zd-text-muted text-right">
        {formatVolume(volume24h)}
      </span>
    </Link>
  );
}

export function FeedRowSkeleton() {
  return (
    <div className="grid grid-cols-[90px_1fr_40px] sm:grid-cols-[90px_1fr_120px_40px_70px_80px] items-center h-10 px-3 border-b border-zd-border last:border-b-0 animate-pulse">
      <div className="h-3 w-16 bg-zd-surface" />
      <div className="h-4 w-48 bg-zd-surface" />
      <div className="hidden sm:block h-3 w-20 bg-zd-surface" />
      <div className="h-3 w-4 bg-zd-surface mx-auto" />
      <div className="hidden sm:block h-3 w-8 bg-zd-surface ml-auto" />
      <div className="hidden sm:block h-3 w-12 bg-zd-surface ml-auto" />
    </div>
  );
}
