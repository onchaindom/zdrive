'use client';

import { truncateAddress } from '@/lib/constants';
import type { CoinHeaderStats } from '@/types/coin-trade';

interface DetailsTabProps {
  stats: CoinHeaderStats | null;
}

export function DetailsTab({ stats }: DetailsTabProps) {
  if (!stats) {
    return (
      <div className="py-6 text-center text-sm text-zdrive-text-muted">
        No details available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <dl className="space-y-2 text-sm">
        <DetailRow
          label="Contract"
          value={truncateAddress(stats.address)}
          href={`https://basescan.org/address/${stats.address}`}
        />
        <DetailRow
          label="Creator"
          value={truncateAddress(stats.creatorAddress)}
          href={`https://basescan.org/address/${stats.creatorAddress}`}
        />
        <DetailRow
          label="Network"
          value="Base"
        />
        {stats.createdAt && (
          <DetailRow
            label="Created"
            value={new Date(stats.createdAt).toLocaleDateString()}
          />
        )}
        <DetailRow
          label="Total Supply"
          value={formatSupply(stats.totalSupply)}
        />
        <DetailRow
          label="Holders"
          value={stats.uniqueHolders.toString()}
        />
      </dl>

      {/* External Links */}
      <div className="flex gap-3 border-t border-zdrive-border pt-3">
        <a
          href={`https://zora.co/coin/base:${stats.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zdrive-text-secondary hover:text-zdrive-text hover:underline"
        >
          View on Zora →
        </a>
        <a
          href={`https://basescan.org/token/${stats.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zdrive-text-secondary hover:text-zdrive-text hover:underline"
        >
          View on Basescan →
        </a>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-zdrive-text-muted">{label}</dt>
      <dd>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function formatSupply(supply: string): string {
  const num = parseFloat(supply);
  if (isNaN(num)) return '—';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  return num.toFixed(2);
}
