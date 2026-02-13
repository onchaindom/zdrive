'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BreadcrumbHeader, Footer } from '@/components/layout';
import { LoadingPage, ErrorBoundary, CollapsibleSection, Zorb, DisclosureLink } from '@/components/ui';
import { useRelease } from '@/hooks/useRelease';
import { useCoin } from '@/hooks/useCoin';
import { WidgetTabs } from '@/components/trade/WidgetTabs';
import { useLicenseStatus } from '@/hooks/useLicenseStatus';
import { PreviewRenderer, DownloadList } from '@/components/preview';
import { CollectButton } from '@/components/trade/CollectButton';
import { ConnectButton } from '@/components/wallet/ConnectButton';
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

function ReleaseBreadcrumb({ creator, releaseName }: { creator: string; releaseName?: string }) {
  const segments = [
    { label: 'Z:', href: '/' },
    { label: truncateAddress(creator), href: `/${creator}` },
    ...(releaseName ? [{ label: releaseName }] : []),
  ];
  return (
    <BreadcrumbHeader segments={segments}>
      <Link href="/feed" className="text-sm text-zd-text-secondary transition-colors duration-150 hover:text-zd-text">Feed</Link>
      <ConnectButton />
    </BreadcrumbHeader>
  );
}

export default function ReleasePage({ params }: ReleasePageProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col"><ReleaseBreadcrumb creator={params.creator} /><LoadingPage /><Footer /></div>}>
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
        <ReleaseBreadcrumb creator={creator} />
        <LoadingPage />
        <Footer />
      </div>
    );
  }

  // Show indexing state for newly created releases
  if ((isPolling || pollingTimedOut) && !release) {
    return (
      <div className="flex min-h-screen flex-col">
        <ReleaseBreadcrumb creator={creator} />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            {pollingTimedOut ? (
              <>
                <h1 className="text-xl font-light">Taking longer than expected</h1>
                <p className="mt-2 text-sm text-zd-text-secondary">
                  Your release was created but Zora&apos;s indexer is still processing it.
                </p>
                <a
                  href={`https://basescan.org/address/${releaseAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm underline hover:text-zd-text-secondary"
                >
                  View on Basescan &rarr;
                </a>
                <button
                  onClick={() => {
                    setPollingTimedOut(false);
                    setIsPolling(true);
                  }}
                  className="mt-2 block mx-auto text-sm text-zd-text-muted hover:text-zd-text underline"
                >
                  Keep waiting
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-zd-border border-t-zd-text" />
                <h1 className="text-xl font-light">Indexing your release&hellip;</h1>
                <p className="mt-2 text-sm text-zd-text-secondary">
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
        <ReleaseBreadcrumb creator={creator} />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-light">Release not found</h1>
            <p className="mt-2 text-sm text-zd-text-secondary">
              This release may have been removed or the address is invalid.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm underline hover:text-zd-text-secondary"
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
      <ReleaseBreadcrumb creator={creator} releaseName={metadata.name} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main column: Preview + Collapsible sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview area */}
              <ErrorBoundary>
                <PreviewRenderer metadata={metadata} />
              </ErrorBoundary>

              {/* Attachments */}
              {assets.length > 0 && (
                <DownloadList assets={assets} />
              )}

              {/* Coin details collapsible section */}
              <CollapsibleSection title="Coin Details" defaultOpen>
                <dl className="space-y-2 text-sm">
                  {contentType && (
                    <div className="flex justify-between">
                      <dt className="text-zd-text-muted">Content type</dt>
                      <dd className="uppercase">{contentType}</dd>
                    </div>
                  )}
                  {metadata.content?.mime && (
                    <div className="flex justify-between">
                      <dt className="text-zd-text-muted">MIME</dt>
                      <dd className="font-mono text-xs">{metadata.content.mime}</dd>
                    </div>
                  )}
                  {assets.length > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-zd-text-muted">Attachments</dt>
                      <dd>{assets.length} file{assets.length !== 1 ? 's' : ''}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-zd-text-muted">Contract</dt>
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
                      <dt className="text-zd-text-muted">Created</dt>
                      <dd>{new Date(release.createdAt).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
              </CollapsibleSection>

              {/* Holders & Activity collapsible section */}
              <CollapsibleSection title="Holders & Activity">
                <WidgetTabs
                  coinAddress={releaseAddress}
                  stats={coinStats ?? null}
                  defaultTab="holders"
                />
              </CollapsibleSection>
            </div>

            {/* Side panel */}
            <div className="space-y-0">
              {/* Title + Creator + Collection + Description */}
              <div className="pb-4">
                <h1 className="font-display text-xl tracking-tight leading-tight">{metadata.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Zorb size={20} seed={release.creatorAddress} />
                  <Link
                    href={`/${release.creatorAddress}`}
                    className="text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text"
                  >
                    {release.creatorName || truncateAddress(release.creatorAddress)}
                  </Link>
                </div>
                {collection && (
                  <div className="mt-2">
                    <span className="text-sm text-zd-text-secondary">Part of </span>
                    <Link
                      href={`/collection/${encodeURIComponent(collection.id)}`}
                      className="text-sm text-zd-text underline"
                    >
                      {collection.title}
                    </Link>
                  </div>
                )}
                {metadata.description && (
                  <p className="text-sm text-zd-text-secondary mt-3 leading-relaxed">
                    {metadata.description}
                  </p>
                )}
              </div>

              {/* Divider + Collect + Details */}
              <div className="border-t border-zd-border pt-4 pb-4">
                <CollectButton
                  coinAddress={releaseAddress}
                  coinName={metadata.name}
                  coinSymbol={coinStats?.symbol ?? metadata.name.slice(0, 6).toUpperCase()}
                  variant="full"
                />
                <div className="mt-3">
                  <DisclosureLink label="Details">
                    {/* MARKET */}
                    <p className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide mb-2">Market</p>
                    {coinStats?.marketCap && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zd-text-secondary">Market cap</span>
                        <span className="text-zd-text font-mono text-xs">{coinStats.marketCap}</span>
                      </div>
                    )}
                    {coinStats?.volume24h && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zd-text-secondary">Volume (24h)</span>
                        <span className="text-zd-text font-mono text-xs">{coinStats.volume24h}</span>
                      </div>
                    )}
                    {coinStats?.uniqueHolders !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zd-text-secondary">Holders</span>
                        <span className="text-zd-text font-mono text-xs">{coinStats.uniqueHolders.toLocaleString()}</span>
                      </div>
                    )}

                    {/* COIN */}
                    <div className="border-t border-zd-border mt-3 pt-3">
                      <p className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide mb-2">Coin</p>
                      <div className="space-y-2">
                        {coinStats?.symbol && (
                          <div className="flex justify-between text-sm">
                            <span className="text-zd-text-secondary">Symbol</span>
                            <span className="text-zd-text font-mono text-xs">${coinStats.symbol}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-zd-text-secondary">Contract</span>
                          <span className="font-mono text-xs text-zd-text-muted">{truncateAddress(releaseAddress)}</span>
                        </div>
                        {release.createdAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-zd-text-secondary">Created</span>
                            <span className="text-zd-text font-mono text-xs">{new Date(release.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 mt-1.5">
                        <a href={`https://zora.co/coin/base:${releaseAddress}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">View on Zora</a>
                        <a href={`https://basescan.org/address/${releaseAddress}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-zd-text-secondary underline transition-colors duration-150 hover:text-zd-text">View on Basescan</a>
                      </div>
                    </div>

                    {/* LICENSE */}
                    <div className="border-t border-zd-border mt-3 pt-3">
                      <p className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide mb-2">License</p>
                      <div className="space-y-2">
                        {contentType && (
                          <div className="flex justify-between text-sm">
                            <span className="text-zd-text-secondary">Content type</span>
                            <span className="text-zd-text font-mono text-xs uppercase">{contentType}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-zd-text-secondary">License</span>
                          {license?.cbe?.textUrl ? (
                            <a href={ipfsToHttp(license.cbe.textUrl)} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-zd-text underline transition-colors duration-150 hover:text-zd-text-secondary">{licenseStatus.licenseName}</a>
                          ) : (
                            <span className="text-zd-text font-mono text-xs">{licenseStatus.licenseName}</span>
                          )}
                        </div>
                        {licenseStatus.requiresGate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-zd-text-secondary">Access</span>
                            <span className="text-zd-text font-mono text-xs">
                              {licenseStatus.meetsGateRequirement ? 'Unlocked' : 'Collect to unlock'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </DisclosureLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
