'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { LoadingPage, ErrorBoundary } from '@/components/ui';
import { useRelease } from '@/hooks/useRelease';
import { useCoin } from '@/hooks/useCoin';
import { useLicenseStatus } from '@/hooks/useLicenseStatus';
import { PreviewRenderer, DownloadList } from '@/components/preview';
import { CollectButton } from '@/components/trade/CollectButton';
import { truncateAddress, ipfsToHttp } from '@/lib/constants';
import { getFileType } from '@/types/zdrive';

interface ReleasePageProps {
  params: {
    creator: string;
    releaseAddress: string;
  };
}

const POLLING_INTERVAL = 3000; // 3 seconds
const POLLING_TIMEOUT = 60_000; // 60 seconds

export default function ReleasePage({ params }: ReleasePageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col"><Header /><LoadingPage /><Footer /></div>}>
      <ReleasePageInner params={params} />
    </Suspense>
  );
}

function ReleasePageInner({ params }: ReleasePageProps) {
  const { creator, releaseAddress } = params;
  const searchParams = useSearchParams();
  const isNewRelease = searchParams.get('new') === '1';

  // Track whether we're still waiting for indexing
  const [isPolling, setIsPolling] = useState(isNewRelease);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);

  const { data: release, isLoading, error } = useRelease(releaseAddress, {
    refetchInterval: isPolling ? POLLING_INTERVAL : false,
  });
  const { data: coinStats } = useCoin(releaseAddress);

  const licenseStatus = useLicenseStatus(
    releaseAddress,
    release?.metadata.properties.zdrive.license,
  );

  // Stop polling once the release is found
  useEffect(() => {
    if (release && isPolling) {
      setIsPolling(false);
    }
  }, [release, isPolling]);

  // Timeout after 60 seconds of polling
  useEffect(() => {
    if (!isPolling) return;
    const timer = setTimeout(() => {
      setIsPolling(false);
      setPollingTimedOut(true);
    }, POLLING_TIMEOUT);
    return () => clearTimeout(timer);
  }, [isPolling]);

  if (isLoading && !isPolling) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <LoadingPage />
        <Footer />
      </div>
    );
  }

  // Show indexing state for newly created releases
  if ((isPolling || pollingTimedOut) && !release) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            {pollingTimedOut ? (
              <>
                <h1 className="text-xl font-light">Taking longer than expected</h1>
                <p className="mt-2 text-sm text-zdrive-text-secondary">
                  Your release was created but Zora&apos;s indexer is still processing it.
                </p>
                <a
                  href={`https://basescan.org/address/${releaseAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm underline hover:text-zdrive-text-secondary"
                >
                  View on Basescan &rarr;
                </a>
                <button
                  onClick={() => {
                    setPollingTimedOut(false);
                    setIsPolling(true);
                  }}
                  className="mt-2 block mx-auto text-sm text-zdrive-text-muted hover:text-zdrive-text underline"
                >
                  Keep waiting
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-zdrive-border border-t-zdrive-text" />
                <h1 className="text-xl font-light">Indexing your release&hellip;</h1>
                <p className="mt-2 text-sm text-zdrive-text-secondary">
                  Your release was created successfully. Waiting for Zora to index it.
                </p>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-light">Release not found</h1>
            <p className="mt-2 text-sm text-zdrive-text-secondary">
              This release may have been removed or the address is invalid.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm underline hover:text-zdrive-text-secondary"
            >
              Go home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { metadata } = release;
  const zdrive = metadata.properties.zdrive;
  const assets = zdrive.release?.assets ?? [];
  const externalLinks = zdrive.release?.external ?? [];
  const collection = zdrive.collection;
  const license = zdrive.license;

  // Determine content type for display
  const contentType = metadata.content?.mime
    ? getFileType(metadata.content.mime)
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main column: Preview + Attachments */}
            <div className="lg:col-span-2">
              {/* Preview area */}
              <ErrorBoundary>
                <PreviewRenderer metadata={metadata} />
              </ErrorBoundary>

              {/* Attachments */}
              {assets.length > 0 && (
                <div className="mt-8">
                  <DownloadList assets={assets} />
                </div>
              )}
            </div>

            {/* Side panel */}
            <div className="space-y-6">
              {/* Title + Description */}
              <div>
                <h1 className="text-2xl font-medium">{metadata.name}</h1>
                {metadata.description && (
                  <p className="mt-2 text-sm text-zdrive-text-secondary">
                    {metadata.description}
                  </p>
                )}
              </div>

              {/* Creator */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/${release.creatorAddress}`}
                  className="flex items-center gap-3 hover:opacity-80"
                >
                  <div className="flex h-8 w-8 items-center justify-center bg-zdrive-bg text-xs font-light text-zdrive-text-muted">
                    {release.creatorAddress.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {release.creatorName || truncateAddress(release.creatorAddress)}
                    </p>
                    <p className="text-xs text-zdrive-text-muted">Creator</p>
                  </div>
                </Link>
              </div>

              {/* Collect CTA */}
              <CollectButton
                coinAddress={releaseAddress}
                coinName={metadata.name}
                coinSymbol={coinStats?.symbol ?? metadata.name.slice(0, 6).toUpperCase()}
                variant="full"
              />

              {/* License panel */}
              <div className="border border-zdrive-border bg-zdrive-surface p-4">
                <h3 className="text-sm font-medium">License</h3>
                <p className="mt-1 text-sm">{licenseStatus.licenseName}</p>

                {licenseStatus.requiresGate && (
                  <div className="mt-3 border-t border-zdrive-border pt-3">
                    {licenseStatus.meetsGateRequirement ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>License unlocked</span>
                      </div>
                    ) : (
                      <div className="text-sm text-zdrive-text-muted">
                        <p>Token-gated license</p>
                        <p className="mt-1">
                          Collect this release to unlock {licenseStatus.licenseName.toLowerCase()} rights.
                        </p>
                      </div>
                    )}

                    {licenseStatus.holdingPercentage !== '0%' && (
                      <p className="mt-2 text-xs text-zdrive-text-muted">
                        You hold {licenseStatus.holdingPercentage} of supply
                      </p>
                    )}
                  </div>
                )}

                {license?.cbe?.textUrl && (
                  <a
                    href={ipfsToHttp(license.cbe.textUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-zdrive-text-muted hover:text-zdrive-text-secondary hover:underline"
                  >
                    Read full license text &rarr;
                  </a>
                )}
              </div>

              {/* Collection context */}
              {collection && (
                <div className="border border-zdrive-border bg-zdrive-surface p-4">
                  <h3 className="text-sm font-medium">Collection</h3>
                  <Link
                    href={`/collection/${encodeURIComponent(collection.id)}`}
                    className="mt-1 block text-sm hover:underline"
                  >
                    {collection.title}
                  </Link>
                  {collection.ordering && (
                    <p className="mt-1 text-xs text-zdrive-text-muted">
                      #{collection.ordering.index} in series
                    </p>
                  )}
                </div>
              )}

              {/* External links */}
              {externalLinks.length > 0 && (
                <div className="border border-zdrive-border bg-zdrive-surface p-4">
                  <h3 className="text-sm font-medium">Links</h3>
                  <div className="mt-2 space-y-2">
                    {externalLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-zdrive-text-secondary hover:text-zdrive-text hover:underline"
                      >
                        {link.type === 'github' && (
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        )}
                        <span>{link.url.replace('https://github.com/', '')}</span>
                        {link.ref && (
                          <span className="text-xs text-zdrive-text-muted">
                            @ {link.ref}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Release metadata */}
              <div className="border border-zdrive-border bg-zdrive-surface p-4">
                <h3 className="text-sm font-medium">Details</h3>
                <dl className="mt-2 space-y-2 text-sm">
                  {contentType && (
                    <div className="flex justify-between">
                      <dt className="text-zdrive-text-muted">Content type</dt>
                      <dd className="uppercase">{contentType}</dd>
                    </div>
                  )}
                  {metadata.content?.mime && (
                    <div className="flex justify-between">
                      <dt className="text-zdrive-text-muted">MIME</dt>
                      <dd className="font-mono text-xs">{metadata.content.mime}</dd>
                    </div>
                  )}
                  {assets.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-zdrive-text-muted">Attachments</dt>
                      <dd>{assets.length} file{assets.length !== 1 ? 's' : ''}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-zdrive-text-muted">Contract</dt>
                    <dd>
                      <a
                        href={`https://basescan.org/address/${releaseAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs hover:underline"
                      >
                        {truncateAddress(releaseAddress)}
                      </a>
                    </dd>
                  </div>
                  {release.createdAt && (
                    <div className="flex justify-between">
                      <dt className="text-zdrive-text-muted">Created</dt>
                      <dd>{new Date(release.createdAt).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
