'use client';

import { ReleaseRow, ReleaseRowSkeleton } from './ReleaseRow';
import type { ZDriveMetadata } from '@/types/zdrive';

export interface ReleaseItem {
  address: string;
  metadata: ZDriveMetadata;
  creatorAddress: string;
  creatorName?: string;
  holders?: number;
  createdAt?: string;
}

interface ReleaseListProps {
  releases: ReleaseItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ReleaseList({
  releases,
  isLoading,
  emptyMessage = 'No releases found',
}: ReleaseListProps) {
  if (isLoading) {
    return (
      <div className="border border-zd-border">
        <ReleaseListHeader />
        {Array.from({ length: 6 }).map((_, i) => (
          <ReleaseRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-zd-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border border-zd-border">
      <ReleaseListHeader />
      {releases.map((release) => (
        <ReleaseRow
          key={release.address}
          address={release.address}
          metadata={release.metadata}
          creatorAddress={release.creatorAddress}
          creatorName={release.creatorName}
          holders={release.holders}
          createdAt={release.createdAt}
        />
      ))}
    </div>
  );
}

function ReleaseListHeader() {
  return (
    <div className="grid grid-cols-[100px_1fr_60px_32px] sm:grid-cols-[120px_1fr_80px_32px] items-center h-9 px-3 border-b border-zd-border text-xs font-mono text-zd-text-muted">
      <div>/ DATE</div>
      <div>/ NAME</div>
      <div>/ TYPE</div>
      <div></div>
    </div>
  );
}
