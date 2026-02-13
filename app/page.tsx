import Link from 'next/link';
import { BreadcrumbHeader } from '@/components/layout';
import { ZorbWanderingLight, Typewriter, CYCLING_PHRASES } from '@/components/ui';
import { ConnectButton } from '@/components/wallet/ConnectButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-zd-bg relative overflow-hidden">
      {/* Faint zorb background */}
      <div className="absolute bottom-0 right-0 opacity-[0.06] translate-x-1/4 translate-y-1/4 pointer-events-none">
        <ZorbWanderingLight size={480} />
      </div>

      {/* Breadcrumb header */}
      <BreadcrumbHeader segments={[{ label: 'Z:' }]}>
        <Link href="/feed" className="text-sm text-zd-text-secondary transition-colors duration-150 hover:text-zd-text">
          Feed
        </Link>
        <ConnectButton />
      </BreadcrumbHeader>

      {/* Content */}
      <main className="relative px-6 py-24 max-w-3xl">
        <p className="font-display tracking-tighter leading-tight" style={{ fontSize: '2.5rem', lineHeight: 1.15 }}>
          Let your (<Typewriter texts={CYCLING_PHRASES} initialWord="work" initialDelay={2500} speed={50} deleteSpeed={30} waitTime={2000} />) make markets.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 mt-10">
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
      </main>
    </div>
  );
}
