'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { BreadcrumbHeader, HeaderNav, Footer } from '@/components/layout';
import { ReleaseList, type ReleaseItem } from '@/components/release';
import { ReleaseRow, ReleaseRowSkeleton } from '@/components/release/ReleaseRow';
import { LoadingPage, Button, Zorb } from '@/components/ui';
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
    createdAt: release.createdAt,
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
        createdAt: release.createdAt,
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

  const breadcrumbSegments = [
    { label: 'Z:', href: '/' },
    { label: profile?.displayName || truncateAddress(creatorAddress) },
  ];

  const breadcrumbNav = <HeaderNav />;

  if (profileLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <BreadcrumbHeader segments={[{ label: 'Z:', href: '/' }, { label: truncateAddress(creatorAddress) }]}>{breadcrumbNav}</BreadcrumbHeader>
        <LoadingPage />
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BreadcrumbHeader segments={breadcrumbSegments}>{breadcrumbNav}</BreadcrumbHeader>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Profile Header */}
          <div className="mb-8 flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile?.avatar ? (
                <Image
                  src={ipfsToHttp(profile.avatar)}
                  alt={profile.displayName || 'Creator'}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover"
                />
              ) : (
                <Zorb size={48} seed={creatorAddress} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-display text-xl tracking-tight">
                {profile?.displayName || truncateAddress(creatorAddress)}
              </h1>

              {profile?.bio && (
                <p className="text-sm text-zd-text-secondary mt-1 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                {profile?.creatorCoinSymbol && (
                  <span className="text-xs font-mono text-zd-text-muted">${profile.creatorCoinSymbol}</span>
                )}
                <a
                  href={`https://basescan.org/address/${creatorAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zd-text-muted underline transition-colors duration-150 hover:text-zd-text-secondary"
                >
                  Basescan
                </a>
              </div>
            </div>

            {/* Actions */}
            {isOwnProfile && (
              <div className="flex items-center gap-3">
                <a
                  href={`https://zora.co/${creatorAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text"
                >
                  Edit Profile on Zora
                </a>
                <Link href="/create">
                  <Button>New Release</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 text-sm font-medium text-zd-text-secondary">
                Collections
              </h2>
              <div className="flex flex-wrap gap-2">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collection/${encodeURIComponent(collection.id)}`}
                    className="border border-zd-border bg-zd-surface px-3 py-1.5 text-sm hover:border-zd-border-hover hover:bg-zd-bg"
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
            <div className="flex border border-zd-border">
              <button
                onClick={() => setViewMode('all')}
                className={clsx(
                  'px-3 py-1.5 text-sm transition-colors',
                  viewMode === 'all'
                    ? 'bg-zd-button-bg text-zd-text'
                    : 'hover:bg-zd-bg'
                )}
              >
                All
              </button>
              <button
                onClick={() => setViewMode('by-collection')}
                className={clsx(
                  'px-3 py-1.5 text-sm transition-colors border-l border-zd-border',
                  viewMode === 'by-collection'
                    ? 'bg-zd-button-bg text-zd-text'
                    : 'hover:bg-zd-bg'
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
                      ? 'bg-zd-button-bg text-zd-text'
                      : 'border border-zd-border hover:border-zd-border-hover'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Releases */}
          {releasesLoading ? (
            <ReleaseList
              releases={[]}
              isLoading={true}
            />
          ) : viewMode === 'by-collection' ? (
            // Grouped by collection view
            <div className="space-y-8">
              {groupedReleases.map((group) => (
                <section key={group.id}>
                  <h3 className="mb-4 font-display text-lg tracking-tight text-zd-text">
                    {group.title}
                    <span className="ml-2 text-sm font-normal text-zd-text-muted">
                      ({group.items.length})
                    </span>
                  </h3>
                  <div className="border border-zd-border">
                    {group.items.map((release) => (
                      <ReleaseRow
                        key={release.address}
                        address={release.address}
                        metadata={release.metadata}
                        creatorAddress={release.creatorAddress}
                        creatorName={release.creatorName}
                        holders={release.holders}
                        createdAt={release.createdAt}
                      />
                    ))}
                  </div>
                </section>
              ))}
              {/* Skeleton rows for pending metadata */}
              {pendingCount > 0 && (
                <div className="border border-zd-border">
                  {Array.from({ length: pendingCount }).map((_, i) => (
                    <ReleaseRowSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>
              )}
              {groupedReleases.length === 0 && pendingCount === 0 && (
                <div className="flex min-h-[200px] items-center justify-center text-zd-text-secondary">
                  {isOwnProfile
                    ? "You haven't created any releases yet."
                    : "This creator hasn't published any releases yet."}
                </div>
              )}
            </div>
          ) : (
            // Flat list view (default)
            <>
              <ReleaseList
                releases={releaseItems}
                emptyMessage={
                  isOwnProfile
                    ? "You haven't created any releases yet."
                    : "This creator hasn't published any releases yet."
                }
              />
              {/* Skeleton rows for coins still loading metadata */}
              {pendingCount > 0 && (
                <div className="border border-zd-border border-t-0">
                  {Array.from({ length: pendingCount }).map((_, i) => (
                    <ReleaseRowSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
