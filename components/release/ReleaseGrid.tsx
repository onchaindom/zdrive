'use client';

import { ReleaseCard, ReleaseCardSkeleton } from './ReleaseCard';
import type { ZDriveMetadata } from '@/types/zdrive';

export interface ReleaseItem {
  address: string;
  metadata: ZDriveMetadata;
  creatorAddress: string;
  creatorName?: string;
}

interface ReleaseGridProps {
  releases: ReleaseItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ReleaseGrid({
  releases,
  isLoading,
  emptyMessage = 'No releases found',
}: ReleaseGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ReleaseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-zdrive-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {releases.map((release) => (
        <ReleaseCard
          key={release.address}
          address={release.address}
          metadata={release.metadata}
          creatorAddress={release.creatorAddress}
          creatorName={release.creatorName}
        />
      ))}
    </div>
  );
}
