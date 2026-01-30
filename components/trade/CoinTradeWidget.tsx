'use client';

import { useCoin } from '@/hooks/useCoin';
import { WidgetHeader } from './WidgetHeader';
import { TradePanel } from './TradePanel';
import { WidgetTabs } from './WidgetTabs';

interface CoinTradeWidgetProps {
  coinAddress: string;
  chainId?: number;
  defaultTab?: 'holders' | 'activity' | 'details';
  mode?: 'full' | 'compact';
}

export function CoinTradeWidget({
  coinAddress,
  defaultTab = 'holders',
  mode = 'full',
}: CoinTradeWidgetProps) {
  const { data: stats, isLoading } = useCoin(coinAddress);

  const isBlocked = stats?.platformBlocked;

  if (mode === 'compact') {
    return (
      <div className="space-y-3">
        <WidgetHeader stats={stats ?? null} isLoading={isLoading} compact />
        {!isBlocked && (
          <TradePanel coinAddress={coinAddress} stats={stats ?? null} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border border-zdrive-border bg-zdrive-surface p-4">
        <WidgetHeader stats={stats ?? null} isLoading={isLoading} />
      </div>

      {!isBlocked && (
        <TradePanel coinAddress={coinAddress} stats={stats ?? null} />
      )}

      {!isBlocked && (
        <WidgetTabs
          coinAddress={coinAddress}
          stats={stats ?? null}
          defaultTab={defaultTab}
        />
      )}
    </div>
  );
}
