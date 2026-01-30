'use client';

import { useState, useCallback } from 'react';
import { useCoinHolders, useCoinSwaps } from '@/hooks/useCoin';
import { HoldersTab } from './HoldersTab';
import { ActivityTab } from './ActivityTab';
import { DetailsTab } from './DetailsTab';
import type { CoinHeaderStats } from '@/types/coin-trade';

type TabId = 'holders' | 'activity' | 'details';

interface WidgetTabsProps {
  coinAddress: string;
  stats: CoinHeaderStats | null;
  defaultTab?: TabId;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'holders', label: 'Holders' },
  { id: 'activity', label: 'Activity' },
  { id: 'details', label: 'Details' },
];

export function WidgetTabs({ coinAddress, stats, defaultTab = 'holders' }: WidgetTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [openedTabs, setOpenedTabs] = useState<Set<TabId>>(new Set([defaultTab]));

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setOpenedTabs((prev) => new Set([...prev, tab]));
  }, []);

  // Lazy-load: only enable queries when tab has been opened
  const holdersEnabled = openedTabs.has('holders');
  const activityEnabled = openedTabs.has('activity');

  const {
    data: holdersData,
    isLoading: holdersLoading,
    isFetchingNextPage: holdersFetchingNext,
    hasNextPage: holdersHasNext,
    fetchNextPage: holdersFetchNext,
  } = useCoinHolders(coinAddress, 20, holdersEnabled);

  const {
    data: swapsData,
    isLoading: swapsLoading,
    isFetchingNextPage: swapsFetchingNext,
    hasNextPage: swapsHasNext,
    fetchNextPage: swapsFetchNext,
  } = useCoinSwaps(coinAddress, 20, activityEnabled);

  const holders = holdersData?.pages.flatMap((p) => p.items) ?? [];
  const swaps = swapsData?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="border border-zdrive-border bg-zdrive-surface">
      {/* Tab Navigation */}
      <div className="flex border-b border-zdrive-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-zdrive-accent text-zdrive-text'
                : 'text-zdrive-text-muted hover:text-zdrive-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-64 overflow-y-auto p-3">
        {activeTab === 'holders' && (
          <HoldersTab
            holders={holders}
            hasMore={!!holdersHasNext}
            isLoading={holdersLoading}
            isFetchingNextPage={holdersFetchingNext}
            onLoadMore={() => holdersFetchNext()}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab
            swaps={swaps}
            hasMore={!!swapsHasNext}
            isLoading={swapsLoading}
            isFetchingNextPage={swapsFetchingNext}
            onLoadMore={() => swapsFetchNext()}
          />
        )}

        {activeTab === 'details' && (
          <DetailsTab stats={stats} />
        )}
      </div>
    </div>
  );
}
