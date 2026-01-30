'use client';

import Link from 'next/link';
import { Header, Footer } from '@/components/layout';
import { useRelease } from '@/hooks/useRelease';
import { useLicenseStatus } from '@/hooks/useLicenseStatus';
import { truncateAddress } from '@/lib/constants';

interface ReleasePageProps {
  params: {
    creator: string;
    releaseAddress: string;
  };
}

export default function ReleasePage({ params }: ReleasePageProps) {
  const { creator, releaseAddress } = params;
  const { data: release, isLoading, error } = useRelease(releaseAddress);

  const licenseStatus = useLicenseStatus(
    releaseAddress,
    release?.metadata.properties.zdrive.license
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
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
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { metadata } = release;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-xl font-medium">{metadata.name}</h1>
          <p className="mt-2">{metadata.description}</p>
          <p className="mt-2">License: {licenseStatus.licenseName}</p>
          <Link
            href={`/${release.creatorAddress}`}
            className="mt-1 inline-block text-sm text-zdrive-text-secondary hover:underline"
          >
            {truncateAddress(release.creatorAddress)}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
