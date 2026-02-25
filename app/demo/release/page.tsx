import Link from 'next/link';
import {
  MOCK_RELEASES,
  getCreatorByAddress,
  formatDateTime,
  releaseName,
} from '../mockdata';
import { FILE_TYPE_ICONS, IconFile, Zorb } from '@/components/ui';

export default function ReleaseDemoPage() {
  return (
    <div className="max-w-[960px] mx-auto px-6 pb-16">
      <div className="pt-12 pb-8">
        <div className="mb-4">
          <Link href="/demo" className="text-sm text-zd-text-muted hover:text-zd-text-secondary transition-colors duration-150">&larr; Back to demos</Link>
        </div>
        <h1 className="font-display text-4xl tracking-tighter mb-2">Releases</h1>
        <p className="text-sm text-zd-text-secondary mb-8">
          {MOCK_RELEASES.length} files — click any to view its detail page.
        </p>

        <div className="border border-zd-text divide-y divide-zd-text">
          {MOCK_RELEASES.map((release) => {
            const creator = getCreatorByAddress(release.creator);
            const TypeIcon = FILE_TYPE_ICONS[release.type] || IconFile;
            const name = releaseName(release);

            return (
              <Link
                key={release.contractAddress}
                href={`/demo/release/${release.contractAddress}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-zd-surface-hover transition-colors duration-100"
              >
                <TypeIcon />
                <div className="flex-1 min-w-0">
                  <span className="font-display text-sm tracking-tight truncate block">{name}</span>
                  <span className="text-xs text-zd-text-muted">{release.collection || 'Uncollected'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {creator && <Zorb size={14} seed={creator.avatarSeed} />}
                  <span className="text-xs text-zd-text-secondary">{creator?.name || release.creator}</span>
                </div>
                <span className="text-xs font-mono text-zd-text-muted w-28 text-right">{formatDateTime(release.date)}</span>
                <span className="text-xs font-mono text-zd-text-muted w-20 text-right">${release.marketCap.toLocaleString()}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
