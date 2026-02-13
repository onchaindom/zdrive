'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BreadcrumbHeader, Footer } from '@/components/layout';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { ReleaseList, type ReleaseItem } from '@/components/release';
import { LoadingPage } from '@/components/ui';
import { useCollection } from '@/hooks/useCollection';
import { useCreatorProfile } from '@/hooks/useCreator';
import { truncateAddress, ipfsToHttp } from '@/lib/constants';

interface CollectionPageProps {
  params: {
    collectionId: string;
  };
}

function CollectionBreadcrumb({ creatorAddress, creatorName, title }: { creatorAddress?: string; creatorName?: string; title?: string }) {
  const segments = [
    { label: 'Z:', href: '/' },
    ...(creatorAddress ? [{ label: creatorName || truncateAddress(creatorAddress), href: `/${creatorAddress}` }] : []),
    ...(title ? [{ label: title }] : []),
  ];
  return (
    <BreadcrumbHeader segments={segments}>
      <Link href="/feed" className="text-sm text-zd-text-secondary transition-colors duration-150 hover:text-zd-text">Feed</Link>
      <ConnectButton />
    </BreadcrumbHeader>
  );
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const { collectionId } = params;
  const decodedId = decodeURIComponent(collectionId);

  const { data: collection, isLoading, error } = useCollection(decodedId);
  const { data: creatorProfile } = useCreatorProfile(
    collection?.creatorAddress || ''
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CollectionBreadcrumb />
        <LoadingPage />
        <Footer />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex min-h-screen flex-col">
        <CollectionBreadcrumb />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-light">Collection not found</h1>
            <p className="mt-2 text-zd-text-secondary">
              This collection may not exist or may have no releases.
            </p>
            <Link
              href="/feed"
              className="mt-4 inline-block text-sm underline hover:no-underline"
            >
              Back to Explore
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Convert releases to ReleaseItems
  const releaseItems: ReleaseItem[] = collection.releases.map((release) => ({
    address: release.coinAddress,
    metadata: release.metadata,
    creatorAddress: release.creatorAddress,
    creatorName: creatorProfile?.displayName,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <CollectionBreadcrumb creatorAddress={collection.creatorAddress} creatorName={creatorProfile?.displayName} title={collection.title} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Collection Header */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row">
            {/* Cover Image */}
            {collection.coverImage && (
              <div className="relative h-48 w-48 flex-shrink-0 bg-zd-bg">
                <Image
                  src={ipfsToHttp(collection.coverImage)}
                  alt={collection.title}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            )}

            {/* Info */}
            <div>
              <p className="text-sm text-zd-text-secondary">Collection</p>
              <h1 className="mt-1 text-3xl font-light">{collection.title}</h1>

              <Link
                href={`/${collection.creatorAddress}`}
                className="mt-2 inline-flex items-center gap-2 text-sm text-zd-text-secondary hover:text-zd-text"
              >
                {creatorProfile?.avatar && (
                  <Image
                    src={ipfsToHttp(creatorProfile.avatar)}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                {creatorProfile?.displayName ||
                  truncateAddress(collection.creatorAddress)}
              </Link>

              <p className="mt-4 text-sm text-zd-text-muted">
                {collection.releases.length} release
                {collection.releases.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Releases */}
          <div>
            <h2 className="mb-4 text-sm font-medium text-zd-text-secondary">
              Releases in this collection
            </h2>
            <ReleaseList
              releases={releaseItems}
              emptyMessage="No releases in this collection yet."
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
