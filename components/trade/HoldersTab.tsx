'use client';

import { truncateAddress } from '@/lib/constants';
import type { CoinHolderRow } from '@/types/coin-trade';

interface HoldersTabProps {
  holders: CoinHolderRow[];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function HoldersTab({
  holders,
  hasMore,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
}: HoldersTabProps) {
  if (isLoading) {
    return <TabSkeleton rows={5} />;
  }

  if (holders.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-zdrive-text-muted">
        No holders yet
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {holders.map((holder, index) => (
        <div
          key={holder.holderAddress + index}
          className="flex items-center justify-between border-b border-zdrive-border px-1 py-2 last:border-b-0"
        >
          <div className="flex items-center gap-2">
            {holder.profile?.avatar ? (
              <img
                src={holder.profile.avatar}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-zdrive-border" />
            )}
            <a
              href={`https://basescan.org/address/${holder.holderAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline"
            >
              {holder.profile?.displayName || truncateAddress(holder.holderAddress)}
            </a>
          </div>
          <span className="text-xs text-zdrive-text-secondary">
            {holder.balanceFormatted}
          </span>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          className="mt-2 w-full py-2 text-center text-xs text-zdrive-text-secondary hover:text-zdrive-text disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}

function TabSkeleton({ rows }: { rows: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-zdrive-border" />
            <div className="h-3 w-24 rounded bg-zdrive-border" />
          </div>
          <div className="h-3 w-16 rounded bg-zdrive-border" />
        </div>
      ))}
    </div>
  );
}
