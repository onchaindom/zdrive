'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { Header, Footer } from '@/components/layout';
import { ReleaseGrid, type ReleaseItem } from '@/components/release';
import { LoadingPage, Button } from '@/components/ui';
import { useCreatorProfile, useCreatorReleases } from '@/hooks/useCreator';
import { useHoldings } from '@/hooks/useHoldings';
import { truncateAddress, ipfsToHttp } from '@/lib/constants';
import { getFileType } from '@/types/zdrive';
import clsx from 'clsx';

type FilterType = 'all' | 'pdf' | '3d' | 'image' | 'video' | 'github' | 'other';

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

  const { data: profile, isLoading: profileLoading } =
    useCreatorProfile(creatorAddress);
  const { data: releases, isLoading: releasesLoading } =
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
          return ['glb', 'gltf', 'stl'].includes(contentType);
        case 'image':
          return contentType === 'image';
        case 'video':
          return contentType === 'video';
        case 'github':
          return hasGitHub;
        case 'other':
          return (
            !['pdf', 'glb', 'gltf', 'stl', 'image', 'video'].includes(contentType) && !hasGitHub
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

          {/* Filters */}
          <div className="mb-6 flex gap-2">
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

          {/* Releases */}
          <ReleaseGrid
            releases={releaseItems}
            isLoading={releasesLoading}
            emptyMessage={
              isOwnProfile
                ? 'You haven\'t created any releases yet.'
                : 'This creator hasn\'t published any releases yet.'
            }
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
