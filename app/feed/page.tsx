'use client';

import { useState, useMemo } from 'react';
import { Header, Footer } from '@/components/layout';
import { ReleaseList, type ReleaseItem } from '@/components/release';
import { Button, LoadingSpinner } from '@/components/ui';
import { useReleases, type SortOption } from '@/hooks/useExplore';
import { getFileType } from '@/types/zdrive';
import clsx from 'clsx';

type FilterType = 'all' | 'pdf' | '3d' | 'image' | 'video' | 'other';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'created', label: 'Created' },
  { id: 'volume', label: 'Volume' },
  { id: 'marketCap', label: 'Market Cap' },
];

const TYPE_FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDF' },
  { id: '3d', label: '3D' },
  { id: 'image', label: 'IMG' },
  { id: 'video', label: 'VID' },
  { id: 'other', label: 'Other' },
];

export default function FeedPage() {
  const [sort, setSort] = useState<SortOption>('created');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const {
    releases,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useReleases(sort);

  // Convert ParsedRelease to ReleaseItem
  const allReleaseItems: ReleaseItem[] = releases.map((release) => ({
    address: release.coinAddress,
    metadata: release.metadata,
    creatorAddress: release.creatorAddress,
    creatorName: release.creatorName,
    createdAt: release.createdAt,
  }));

  // Client-side type filtering
  const filteredItems = useMemo(() => {
    if (typeFilter === 'all') return allReleaseItems;

    return allReleaseItems.filter((item) => {
      const contentType = getFileType(item.metadata.content?.mime);
      switch (typeFilter) {
        case 'pdf':
          return contentType === 'pdf';
        case '3d':
          return ['glb', 'gltf', 'ply'].includes(contentType);
        case 'image':
          return contentType === 'image';
        case 'video':
          return contentType === 'video';
        case 'other':
          return !['pdf', 'glb', 'gltf', 'ply', 'image', 'video'].includes(contentType);
        default:
          return true;
      }
    });
  }, [allReleaseItems, typeFilter]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display tracking-tighter" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>
              Releases
              {!isLoading && (
                <sup className="text-lg font-mono text-zd-text-muted ml-1">
                  ({filteredItems.length})
                </sup>
              )}
            </h1>
          </div>

          {/* Sort + Filter Controls */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            {/* Sort controls */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-zd-text-muted">/ SORT BY:</span>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSort(option.id)}
                  className={clsx(
                    'text-sm pb-0.5 transition-colors',
                    sort === option.id
                      ? 'text-zd-text border-b border-zd-text'
                      : 'text-zd-text-muted hover:text-zd-text-secondary'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-2">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={clsx(
                    'px-2 py-1 text-xs font-mono uppercase transition-colors',
                    typeFilter === f.id
                      ? 'text-zd-text border-b border-zd-text'
                      : 'text-zd-text-muted hover:text-zd-text-secondary'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 border border-red-300 p-4 text-sm text-red-600">
              Failed to load releases. Please try again.
            </div>
          )}

          {/* Release List */}
          <ReleaseList
            releases={filteredItems}
            isLoading={isLoading}
            emptyMessage="No releases yet. Be the first to create one!"
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
