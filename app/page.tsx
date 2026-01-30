import Link from 'next/link';
import { Header } from '@/components/layout';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          {/* Logo/Title */}
          <h1 className="text-5xl font-light tracking-tight sm:text-6xl">
            Z:Drive
          </h1>

          {/* Tagline */}
          <p className="mt-6 text-lg text-zdrive-text-secondary">
            An artist-first release platform built on Zora.
            <br />
            Publish PDFs, 3D files, code, and more as content coins.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/feed"
              className="inline-flex h-12 items-center justify-center bg-zdrive-text px-8 text-sm font-medium text-white hover:bg-zdrive-accent-hover"
            >
              Explore Releases
            </Link>
            <Link
              href="/create"
              className="inline-flex h-12 items-center justify-center border border-zdrive-border px-8 text-sm font-medium hover:border-zdrive-border-hover hover:bg-zdrive-bg"
            >
              Create a Release
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid gap-8 text-left sm:grid-cols-3">
            <div>
              <h3 className="font-medium">Publish Anything</h3>
              <p className="mt-2 text-sm text-zdrive-text-secondary">
                PDFs, 3D models, images, videos, source code, archives. Native
                previews for supported formats.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Creator Coin Flywheel</h3>
              <p className="mt-2 text-sm text-zdrive-text-secondary">
                Every release is a tradeable coin. Collectors support your work
                directly.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Flexible Licensing</h3>
              <p className="mt-2 text-sm text-zdrive-text-secondary">
                Use a16z&apos;s &quot;Can&apos;t Be Evil&quot; licenses with
                optional holder gates.
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-20 text-sm text-zdrive-text-muted">
          Built on{' '}
          <a
            href="https://zora.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zdrive-text-secondary"
          >
            Zora
          </a>{' '}
          · Base Network
        </p>
      </main>
    </>
  );
}
