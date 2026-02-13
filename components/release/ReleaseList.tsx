'use client';

import { ReleaseRow, ReleaseRowSkeleton } from './ReleaseRow';
import type { ReleaseItem } from './ReleaseGrid';

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
        />
      ))}
    </div>
  );
}

function ReleaseListHeader() {
  return (
    <div className="grid grid-cols-[40px_1fr_140px_140px_80px] items-center h-9 px-3 border-b border-zd-border text-xs text-zd-text-secondary font-medium">
      <div className="text-center"></div>
      <div>Name</div>
      <div className="hidden sm:block">Collection</div>
      <div className="hidden sm:block">Contract</div>
      <div className="text-right hidden sm:block">Creator</div>
    </div>
  );
}
