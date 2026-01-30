'use client';

import { useState } from 'react';
import { formatNumber, truncateAddress } from '@/lib/constants';
import type { CoinHeaderStats } from '@/types/coin-trade';

interface WidgetHeaderProps {
  stats: CoinHeaderStats | null;
  isLoading: boolean;
  compact?: boolean;
}

export function WidgetHeader({ stats, isLoading, compact }: WidgetHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!stats) return;
    await navigator.clipboard.writeText(stats.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <HeaderSkeleton compact={compact} />;
  }

  if (!stats) {
    return (
      <div className="p-4 text-center text-sm text-zdrive-text-muted">
        Failed to load coin data
      </div>
    );
  }

  if (stats.platformBlocked) {
    return (
      <div className="border border-zdrive-border bg-zdrive-surface p-4 text-center">
        <p className="text-sm text-zdrive-text-secondary">
          This coin is not available on this platform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">
            {stats.name}
            <span className="ml-1 text-zdrive-text-muted">${stats.symbol}</span>
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={copyAddress}
            className="text-xs text-zdrive-text-muted hover:text-zdrive-text"
            title="Copy address"
          >
            {copied ? 'Copied' : truncateAddress(stats.address)}
          </button>
          <span className="rounded bg-zdrive-bg px-1.5 py-0.5 text-[10px] font-medium text-zdrive-text-secondary">
            Base
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <StatItem label="Market Cap" value={formatUsdValue(stats.marketCap)} />
        <StatItem label="24h Volume" value={formatUsdValue(stats.volume24h)} />
        {!compact && (
          <>
            <StatItem label="Total Vol" value={formatUsdValue(stats.totalVolume)} />
            <StatItem label="Holders" value={formatNumber(stats.uniqueHolders)} />
          </>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-zdrive-text-muted">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function HeaderSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-zdrive-border" />
        <div className="h-4 w-20 rounded bg-zdrive-border" />
      </div>
      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {Array.from({ length: compact ? 2 : 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-12 rounded bg-zdrive-border" />
            <div className="h-4 w-16 rounded bg-zdrive-border" />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatUsdValue(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  if (num === 0) return '$0';
  if (num < 0.01) return '<$0.01';
  if (num < 1) return '$' + num.toFixed(2);
  return '$' + formatNumber(num);
}
