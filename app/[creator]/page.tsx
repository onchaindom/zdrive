'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { Header, Footer } from '@/components/layout';
import { ReleaseGrid, type ReleaseItem } from '@/components/release';
import { ReleaseCard, ReleaseCardSkeleton } from '@/components/release/ReleaseCard';
import { LoadingPage, Button } from '@/components/ui';
import { useCreatorProfile, useCreatorReleases } from '@/hooks/useCreator';
import { useHoldings } from '@/hooks/useHoldings';
import { truncateAddress, ipfsToHttp } from '@/lib/constants';
import { getFileType } from '@/types/zdrive';
import clsx from 'clsx';

type FilterType = 'all' | 'pdf' | '3d' | 'image' | 'video' | 'github' | 'other';
type ViewMode = 'all' | 'by-collection';

interface CreatorPageProps {
  params: {
    creator: string;
  };
}

export default function CreatorPage({ params }: CreatorPageProps) {
  const { creator: creatorAddress } = params;
  const { user } = usePrivy();
  const viewerAddress = user?.wallet?.address;
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const { data: profile, isLoading: profileLoading } =
    useCreatorProfile(creatorAddress);
  const { data: releases, isLoading: releasesLoading, pendingCount, totalCount } =
    useCreatorReleases(creatorAddress);
  const { holdingPercentage, isHolder } = useHoldings(
    profile?.creatorCoinAddress
  );

  const isOwnProfile =
    viewerAddress?.toLowerCase() === creatorAddress.toLowerCase();

  // Filter releases
  const filteredReleases = useMemo(() => {
    if (!releases) return [];
    if (filter === 'all') return releases;

    return releases.filter((release) => {
      const contentType = getFileType(release.metadata.content?.mime);
      const hasGitHub = release.metadata.properties.zdrive.release?.external?.some(
        (e) => e.type === 'github'
      );

      switch (filter) {
        case 'pdf':
          return contentType === 'pdf';
        case '3d':
          return ['glb', 'gltf'].includes(contentType);
        case 'image':
          return contentType === 'image';
        case 'video':
          return contentType === 'video';
        case 'github':
          return hasGitHub;
        case 'other':
          return (
            !['pdf', 'glb', 'gltf', 'image', 'video'].includes(contentType) && !hasGitHub
          );
        default:
          return true;
      }
    });
  }, [releases, filter]);

  // Convert to ReleaseItems
  const releaseItems: ReleaseItem[] = filteredReleases.map((release) => ({
    address: release.coinAddress,
    metadata: release.metadata,
    creatorAddress: release.creatorAddress,
    creatorName: profile?.displayName,
  }));

  // Get unique collections
  const collections = useMemo(() => {
    if (!releases) return [];
    const collectionMap = new Map<string, { id: string; title: string }>();

    releases.forEach((release) => {
      const collection = release.metadata.properties.zdrive.collection;
      if (collection && !collectionMap.has(collection.id)) {
        collectionMap.set(collection.id, {
          id: collection.id,
          title: collection.title,
        });
      }
    });

    return Array.from(collectionMap.values());
  }, [releases]);

  // Group releases by collection for "By Collection" view
  const groupedReleases = useMemo(() => {
    if (!filteredReleases.length) return [];

    const groups = new Map<string, { title: string; items: ReleaseItem[] }>();
    const uncollected: ReleaseItem[] = [];

    for (const release of filteredReleases) {
      const collection = release.metadata.properties.zdrive.collection;
      const item: ReleaseItem = {
        address: release.coinAddress,
        metadata: release.metadata,
        creatorAddress: release.creatorAddress,
        creatorName: profile?.displayName,
      };

      if (collection?.id) {
        const existing = groups.get(collection.id);
        if (existing) {
          existing.items.push(item);
        } else {
          groups.set(collection.id, {
            title: collection.title,
            items: [item],
          });
        }
      } else {
        uncollected.push(item);
      }
    }

    // Sort items within each group by created date (newest first)
    const sortByDate = (a: ReleaseItem, b: ReleaseItem) => {
      const releaseA = filteredReleases.find((r) => r.coinAddress === a.address);
      const releaseB = filteredReleases.find((r) => r.coinAddress === b.address);
      const dateA = releaseA?.createdAt ? new Date(releaseA.createdAt).getTime() : 0;
      const dateB = releaseB?.createdAt ? new Date(releaseB.createdAt).getTime() : 0;
      return dateB - dateA;
    };

    const result: { id: string; title: string; items: ReleaseItem[] }[] = [];
    for (const [id, group] of groups) {
      group.items.sort(sortByDate);
      result.push({ id, title: group.title, items: group.items });
    }

    // Sort groups alphabetically by title
    result.sort((a, b) => a.title.localeCompare(b.title));

    // Add uncollected at the bottom
    if (uncollected.length > 0) {
      uncollected.sort(sortByDate);
      result.push({ id: '__uncollected__', title: 'Uncollected', items: uncollected });
    }

    return result;
  }, [filteredReleases, profile?.displayName]);

  if (profileLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <LoadingPage />
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Profile Header */}
          <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-zdrive-bg">
              {profile?.avatar ? (
                <Image
                  src={ipfsToHttp(profile.avatar)}
                  alt={profile.displayName || 'Creator'}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-light text-zdrive-text-muted">
                  {creatorAddress.slice(2, 4).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-light">
                {profile?.displayName || truncateAddress(creatorAddress)}
              </h1>
              <a
                href={`https://basescan.org/address/${creatorAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zdrive-text-secondary hover:underline"
              >
                {truncateAddress(creatorAddress)}
              </a>

              {profile?.bio && (
                <p className="mt-3 max-w-lg text-sm text-zdrive-text-secondary">
                  {profile.bio}
                </p>
              )}

              {/* Creator Coin Info */}
              {profile?.creatorCoinSymbol && (
                <div className="mt-4 inline-flex items-center gap-3 border border-zdrive-border bg-zdrive-surface px-3 py-2 text-sm">
                  <span className="font-medium">${profile.creatorCoinSymbol}</span>
                  {isHolder && (
                    <span className="text-zdrive-text-muted">
                      You hold {holdingPercentage}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {isOwnProfile && (
              <Link href="/create">
                <Button>New Release</Button>
              </Link>
            )}
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-sm font-medium text-zdrive-text-secondary">
                Collections
              </h2>
              <div className="flex flex-wrap gap-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collection/${encodeURIComponent(collection.id)}`}
                    className="border border-zdrive-border bg-zdrive-surface px-3 py-1.5 text-sm hover:border-zdrive-border-hover hover:bg-zdrive-bg"
                  >
                    {collection.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* View Toggle + Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {/* View mode toggle */}
            <div className="flex border border-zdrive-border">
              <button
                onClick={() => setViewMode('all')}
                className={clsx(
                  'px-3 py-1.5 text-sm transition-colors',
                  viewMode === 'all'
                    ? 'bg-zdrive-text text-white'
                    : 'hover:bg-zdrive-bg'
                )}
              >
                All
              </button>
              <button
                onClick={() => setViewMode('by-collection')}
                className={clsx(
                  'px-3 py-1.5 text-sm transition-colors border-l border-zdrive-border',
                  viewMode === 'by-collection'
                    ? 'bg-zdrive-text text-white'
                    : 'hover:bg-zdrive-bg'
                )}
              >
                By Collection
              </button>
            </div>

            {/* Type filters */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'pdf', label: 'PDF' },
                  { id: '3d', label: '3D' },
                  { id: 'image', label: 'Image' },
                  { id: 'video', label: 'Video' },
                  { id: 'github', label: 'GitHub' },
                  { id: 'other', label: 'Other' },
                ] as { id: FilterType; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={clsx(
                    'px-3 py-1.5 text-sm transition-colors',
                    filter === f.id
                      ? 'bg-zdrive-text text-white'
                      : 'border border-zdrive-border hover:border-zdrive-border-hover'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Releases */}
          {releasesLoading ? (
            <ReleaseGrid
              releases={[]}
              isLoading={true}
            />
          ) : viewMode === 'by-collection' ? (
            // Grouped by collection view
            <div className="space-y-8">
              {groupedReleases.map((group) => (
                <section key={group.id}>
                  <h3 className="mb-4 text-lg font-medium text-zdrive-text">
                    {group.title}
                    <span className="ml-2 text-sm font-normal text-zdrive-text-muted">
                      ({group.items.length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {group.items.map((release) => (
                      <ReleaseCard
                        key={release.address}
                        address={release.address}
                        metadata={release.metadata}
                        creatorAddress={release.creatorAddress}
                        creatorName={release.creatorName}
                      />
                    ))}
                  </div>
                </section>
              ))}
              {/* Skeleton cards for pending metadata */}
              {pendingCount > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: pendingCount }).map((_, i) => (
                    <ReleaseCardSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>
              )}
              {groupedReleases.length === 0 && pendingCount === 0 && (
                <div className="flex min-h-[200px] items-center justify-center text-zdrive-text-secondary">
                  {isOwnProfile
                    ? "You haven't created any releases yet."
                    : "This creator hasn't published any releases yet."}
                </div>
              )}
            </div>
          ) : (
            // Flat grid view (default)
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {releaseItems.map((release) => (
                <ReleaseCard
                  key={release.address}
                  address={release.address}
                  metadata={release.metadata}
                  creatorAddress={release.creatorAddress}
                  creatorName={release.creatorName}
                />
              ))}
              {/* Skeleton cards for coins still loading metadata */}
              {pendingCount > 0 &&
                Array.from({ length: pendingCount }).map((_, i) => (
                  <ReleaseCardSkeleton key={`skeleton-${i}`} />
                ))}
              {releaseItems.length === 0 && pendingCount === 0 && (
                <div className="col-span-full flex min-h-[200px] items-center justify-center text-zdrive-text-secondary">
                  {isOwnProfile
                    ? "You haven't created any releases yet."
                    : "This creator hasn't published any releases yet."}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
