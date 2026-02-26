import Link from 'next/link';
import {
  MOCK_RELEASES,
  getCreatorByAddress,
  formatDateTime,
  releaseName,
} from '../../mockdata';
import { Zorb, FILE_TYPE_ICONS, IconFile } from '@/components/ui';

// ─── Upload Arrow Icon ──────────────────────────────────────────────────────

function IconUploadArrow({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="12" x2="8" y2="3" />
      <polyline points="4,6 8,2 12,6" />
      <line x1="3" y1="14" x2="13" y2="14" />
    </svg>
  );
}

interface ReleaseDetailPageProps {
  params: Promise<{ address: string }>;
}

export default async function ReleaseDetailPage({ params }: ReleaseDetailPageProps) {
  const { address } = await params;
  const release = MOCK_RELEASES.find((r) => r.contractAddress === address);

  if (!release) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-xl font-light">Release not found</h1>
        <p className="mt-2 text-sm text-zd-text-secondary">
          This release may have been removed or the address is invalid.
        </p>
        <Link
          href="/demo/feed"
          className="mt-4 inline-block text-sm underline hover:text-zd-text-secondary"
        >
          Back to feed
        </Link>
      </div>
    );
  }

  const creator = getCreatorByAddress(release.creator);
  const TypeIcon = FILE_TYPE_ICONS[release.type] || IconFile;
  const filename = releaseName(release);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Breadcrumb header */}
      <div className="h-12 border-b border-zd-text bg-zd-bg flex items-center px-6 gap-6 flex-shrink-0 z-10">
        <div className="font-display tracking-tight text-lg flex items-center gap-0">
          <Link href="/demo" className="text-zd-text transition-colors duration-150 hover:text-zd-text-secondary">Z:</Link>
          <span className="text-zd-text mx-2.5">\</span>
          <Link href="/demo/feed" className="text-zd-text uppercase transition-colors duration-150 hover:text-zd-text-secondary">
            {creator?.name || release.creator}
          </Link>
          {release.collection && (
            <>
              <span className="text-zd-text mx-2.5">\</span>
              <span className="text-zd-text uppercase">{release.collection}</span>
            </>
          )}
          <span className="text-zd-text mx-2.5">\</span>
          <span className="font-bold text-zd-text uppercase">{filename}</span>
        </div>
        <nav className="flex items-center gap-4 ml-auto">
          <span className="text-xs text-zd-text-muted uppercase tracking-wide">Upload:</span>
          <button className="text-sm font-mono bg-zd-text text-zd-bg px-2 py-0.5 hover:bg-zd-cta transition-colors duration-100 flex items-center gap-1">
            <IconUploadArrow className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <Zorb size={20} seed="0xA3f2B7c9" />
            <span className="text-xs text-zd-text uppercase">onchaindom.eth</span>
          </div>
        </nav>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main preview area */}
        <div className="flex-1 min-w-0 flex items-center justify-center bg-zd-surface">
          <div className="text-center">
            <TypeIcon className="w-16 h-16 mx-auto" />
            <p className="text-sm text-zd-text-secondary mt-3">{release.type} preview</p>
            <p className="text-xs text-zd-text-muted mt-1">{filename}</p>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-[480px] flex-shrink-0 border-l border-zd-text overflow-y-auto">
          <div className="p-6">
            {/* Title */}
            <h1 className="font-display text-xl tracking-tight leading-tight">{release.name}</h1>

            {/* Creator */}
            {creator && (
              <div className="flex items-center gap-2 mt-2">
                <Zorb size={14} seed={creator.avatarSeed} />
                <span className="text-xs text-zd-text uppercase">{creator.name}</span>
              </div>
            )}

            {/* Collection */}
            {release.collection && (
              <div className="mt-2">
                <span className="text-sm text-zd-text-secondary">Part of </span>
                <span className="text-sm text-zd-text underline">{release.collection}</span>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-zd-text-secondary mt-3 leading-relaxed">
              {release.name} is a {release.type.toLowerCase()} about {release.name.toLowerCase()} by {creator?.name || 'unknown'}
            </p>

            {/* Collect button */}
            <button className="w-full border border-dotted border-zd-text bg-transparent text-zd-text hover:bg-zd-surface-hover transition-colors duration-100 font-display text-sm tracking-tight py-2.5 px-4 mt-4">
              Collect
            </button>
          </div>

          {/* Details title */}
          <div className="border-t border-zd-text px-6 pt-3">
            <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Details</span>
          </div>

          {/* CONTENT */}
          <div className="border-t border-zd-text px-6 pt-3">
            <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Content</span>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Type</span>
                <span className="font-mono text-xs">{release.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Filename</span>
                <span className="font-mono text-xs">{filename}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Collection</span>
                <span className="font-mono text-xs">{release.collection || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">License</span>
                <a href="#" className="font-mono text-xs underline hover:text-zd-text-secondary transition-colors duration-100">CBE-CC0</a>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Download gate</span>
                <span className="font-mono text-xs">Collect 1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Commercial use</span>
                <span className="font-mono text-xs">Own 100 ${creator?.coinSymbol || 'TOKEN'}</span>
              </div>
            </div>
          </div>

          {/* COIN */}
          <div className="border-t border-zd-text px-6 pt-3">
            <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Coin</span>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Symbol</span>
                <span className="font-mono text-xs">${creator?.coinSymbol || 'TOKEN'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Address</span>
                <span className="font-mono text-xs text-zd-text-muted">{release.contractAddress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Total supply</span>
                <span className="font-mono text-xs">1,000,000,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Creator</span>
                <span className="font-mono text-xs text-zd-text-muted">{creator?.address.slice(0, 8)}...{creator?.address.slice(-4)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Created</span>
                <span className="font-mono text-xs">{formatDateTime(release.date)}</span>
              </div>
              <div className="space-y-1 mt-1.5">
                <a href="#" className="block text-sm text-zd-text-secondary underline hover:text-zd-text transition-colors duration-100">View on Zora</a>
                <a href="#" className="block text-sm text-zd-text-secondary underline hover:text-zd-text transition-colors duration-100">View on Basescan</a>
              </div>
            </div>
          </div>

          {/* MARKET */}
          <div className="border-t border-zd-text px-6 pt-3 pb-6">
            <span className="text-[11px] font-medium text-zd-text-muted uppercase tracking-wide">Market</span>
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Market cap</span>
                <span className="font-mono text-xs">${release.marketCap.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Volume (24h)</span>
                <span className="font-mono text-xs">${(release.volume * 38.2).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Total volume</span>
                <span className="font-mono text-xs">{release.volume} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zd-text-secondary">Unique holders</span>
                <span className="font-mono text-xs">{release.holders.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
