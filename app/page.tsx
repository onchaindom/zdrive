import Link from 'next/link';
import { BreadcrumbHeader, HeaderNav } from '@/components/layout';
import { Typewriter, CYCLING_PHRASES } from '@/components/ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-zd-bg flex flex-col">
      <BreadcrumbHeader segments={[{ label: 'Z:' }]}>
        <HeaderNav />
      </BreadcrumbHeader>

      <main className="flex-1 flex items-end px-6 pb-16">
        <div className="max-w-5xl">
          {/* Massive headline */}
          <h1
            className="font-display tracking-tighter leading-[0.95]"
            style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}
          >
            Let your<br />
            (<Typewriter texts={CYCLING_PHRASES} initialWord="work" initialDelay={2500} speed={50} deleteSpeed={30} waitTime={2000} />) make<br />
            markets.
          </h1>

          {/* Descriptor */}
          <p className="mt-8 text-xl text-zd-text-secondary max-w-xl leading-relaxed">
            A file system for creative work on the blockchain.
            Upload, collect, and trade any file type.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 mt-8">
            <Link
              href="/feed"
              className="bg-zd-button-bg text-zd-text text-sm font-medium px-5 py-2.5 transition-colors duration-150 hover:bg-zd-button-bg-hover"
            >
              Explore
            </Link>
            <Link
              href="/create"
              className="bg-zd-button-bg text-zd-text text-sm font-medium px-5 py-2.5 transition-colors duration-150 hover:bg-zd-button-bg-hover"
            >
              Create
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
