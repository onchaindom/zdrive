'use client';

import { truncateAddress } from '@/lib/constants';
import type { CoinSwapRow } from '@/types/coin-trade';

interface ActivityTabProps {
  swaps: CoinSwapRow[];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export function ActivityTab({
  swaps,
  hasMore,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
}: ActivityTabProps) {
  if (isLoading) {
    return <TabSkeleton rows={5} />;
  }

  if (swaps.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-zdrive-text-muted">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {swaps.map((swap, index) => (
        <div
          key={swap.txHash + index}
          className="flex items-center justify-between border-b border-zdrive-border px-1 py-2 last:border-b-0"
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-medium uppercase ${
                swap.type === 'BUY' ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {swap.type}
            </span>
            <div className="min-w-0">
              <a
                href={`https://basescan.org/address/${swap.traderAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline"
              >
                {swap.traderProfile?.displayName || truncateAddress(swap.traderAddress)}
              </a>
              <p className="text-[10px] text-zdrive-text-muted">
                {formatRelativeTime(swap.timestamp)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs">
              {formatSwapAmount(swap.amountIn)} → {formatSwapAmount(swap.amountOut)}
            </p>
            <a
              href={`https://basescan.org/tx/${swap.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-zdrive-text-muted hover:underline"
            >
              tx
            </a>
          </div>
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
            <div className="h-3 w-8 rounded bg-zdrive-border" />
            <div className="space-y-1">
              <div className="h-3 w-20 rounded bg-zdrive-border" />
              <div className="h-2 w-12 rounded bg-zdrive-border" />
            </div>
          </div>
          <div className="h-3 w-24 rounded bg-zdrive-border" />
        </div>
      ))}
    </div>
  );
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

function formatSwapAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  if (num < 0.001 && num > 0) return '<0.001';
  if (num < 1) return num.toFixed(4);
  if (num < 1000) return num.toFixed(2);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}
