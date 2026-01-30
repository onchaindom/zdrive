'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Header, Footer } from '@/components/layout';
import { ReleaseGrid, type ReleaseItem } from '@/components/release';
import { Button, LoadingSpinner } from '@/components/ui';
import { useExplore, type ExploreTab } from '@/hooks/useExplore';
import clsx from 'clsx';

const tabs: { id: ExploreTab; label: string; requiresAuth?: boolean }[] = [
  { id: 'feed', label: 'Feed', requiresAuth: true },
  { id: 'explore', label: 'Explore' },
  { id: 'markets', label: 'Markets' },
];

export default function FeedPage() {
  const { authenticated } = usePrivy();
  const [activeTab, setActiveTab] = useState<ExploreTab>(
    authenticated ? 'feed' : 'explore'
  );
  const {
    releases,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useExplore(activeTab);

  // Convert ParsedRelease to ReleaseItem for the grid
  const releaseItems: ReleaseItem[] = releases.map((release) => ({
    address: release.coinAddress,
    metadata: release.metadata,
    creatorAddress: release.creatorAddress,
    creatorName: release.creatorName,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-light">Releases</h1>
            <p className="mt-1 text-sm text-zdrive-text-secondary">
              Discover creative releases from independent artists
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 border-b border-zdrive-border">
            {tabs.map((tab) => {
              // Skip auth-required tabs for non-connected users
              if (tab.requiresAuth && !authenticated) return null;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'px-4 py-2 text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-b-2 border-zdrive-text text-zdrive-text'
                      : 'text-zdrive-text-secondary hover:text-zdrive-text'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Failed to load releases. Please try again.
            </div>
          )}

          {/* Release Grid */}
          <ReleaseGrid
            releases={releaseItems}
            isLoading={isLoading}
            emptyMessage={
              activeTab === 'feed'
                ? 'Follow creators by collecting their coins.'
                : activeTab === 'explore'
                  ? 'No releases yet. Be the first to create one!'
                  : 'No market data available.'
            }
          />

          {/* Load More */}
          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
