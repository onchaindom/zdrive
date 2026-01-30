'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ipfsToHttp, truncateAddress } from '@/lib/constants';
import { getFileType, type ZDriveMetadata } from '@/types/zdrive';
import clsx from 'clsx';

interface ReleaseCardProps {
  address: string;
  metadata: ZDriveMetadata;
  creatorAddress: string;
  creatorName?: string;
}

// File type badge colors
const fileTypeBadges: Record<string, { label: string; className: string }> = {
  pdf: { label: 'PDF', className: 'bg-red-100 text-red-700' },
  glb: { label: '3D', className: 'bg-purple-100 text-purple-700' },
  gltf: { label: '3D', className: 'bg-purple-100 text-purple-700' },
  stl: { label: '3D', className: 'bg-purple-100 text-purple-700' },
  font: { label: 'Font', className: 'bg-blue-100 text-blue-700' },
  github: { label: 'GitHub', className: 'bg-gray-100 text-gray-700' },
  zip: { label: 'ZIP', className: 'bg-amber-100 text-amber-700' },
  other: { label: 'File', className: 'bg-gray-100 text-gray-700' },
};

export function ReleaseCard({
  address,
  metadata,
  creatorAddress,
  creatorName,
}: ReleaseCardProps) {
  const coverUrl = ipfsToHttp(metadata.image);
  const fileType = getFileType(metadata.content?.mime);
  const badge = fileTypeBadges[fileType] || fileTypeBadges.other;

  // Check for GitHub external link
  const hasGitHub = metadata.properties.zdrive.release?.external?.some(
    (e) => e.type === 'github'
  );
  const displayBadge = hasGitHub
    ? fileTypeBadges.github
    : badge;

  return (
    <Link
      href={`/${creatorAddress}/${address}`}
      className="group block"
    >
      {/* Cover Image */}
      <div className="relative aspect-square overflow-hidden bg-zdrive-bg">
        <Image
          src={coverUrl}
          alt={metadata.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* File Type Badge */}
        <span
          className={clsx(
            'absolute left-2 top-2 px-2 py-0.5 text-xs font-medium',
            displayBadge.className
          )}
        >
          {displayBadge.label}
        </span>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-1">
        <h3 className="truncate text-sm font-medium group-hover:underline">
          {metadata.name}
        </h3>
        <p className="text-xs text-zdrive-text-secondary">
          {creatorName || truncateAddress(creatorAddress)}
        </p>
      </div>
    </Link>
  );
}

// Skeleton loader for release cards
export function ReleaseCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-zdrive-border" />
      <div className="mt-2 space-y-1">
        <div className="h-4 w-3/4 bg-zdrive-border" />
        <div className="h-3 w-1/2 bg-zdrive-border" />
      </div>
    </div>
  );
}
