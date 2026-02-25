import Link from 'next/link';

const DEMO_PAGES = [
  { href: '/demo/feed', label: 'Feed', description: 'Stripe-inspired release feed with filters' },
  { href: '/demo/creator', label: 'Creator', description: 'Creator studio and profile' },
  { href: '/demo/release', label: 'Release', description: 'Release detail page' },
  { href: '/demo/collection', label: 'Collection', description: 'Collection page' },
  { href: '/demo/search', label: 'Search', description: 'Search results page' },
  { href: '/demo/create', label: 'Create', description: 'Create flow' },
  { href: '/demo/landing', label: 'Landing', description: 'Landing page' },
];

export default function DemoHubPage() {
  return (
    <div className="max-w-[960px] mx-auto px-6 pb-16">
      <div className="pt-12 pb-8">
        <h1 className="font-display text-4xl tracking-tighter mb-2">Z:DRIVE Design System & Page Demos</h1>
        <p className="text-sm text-zd-text-secondary">Component reference, design tokens, and page prototypes</p>
      </div>

      {/* Pages */}
      <section className="py-6">
        <div className="border-b border-zd-border pb-2 mb-4">
          <h2 className="text-xs font-mono text-zd-text-muted uppercase tracking-wide">/ Pages</h2>
        </div>
        <div className="space-y-0">
          {DEMO_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="flex items-baseline justify-between py-3 border-b border-zd-border group transition-colors duration-150 hover:bg-zd-surface-hover px-2 -mx-2"
            >
              <span className="font-display text-lg tracking-tight group-hover:text-zd-text">{page.label}</span>
              <span className="text-sm text-zd-text-muted">{page.description}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* System */}
      <section className="py-6">
        <div className="border-b border-zd-border pb-2 mb-4">
          <h2 className="text-xs font-mono text-zd-text-muted uppercase tracking-wide">/ System</h2>
        </div>
        <Link
          href="/demo/system"
          className="flex items-baseline justify-between py-3 border-b border-zd-border group transition-colors duration-150 hover:bg-zd-surface-hover px-2 -mx-2"
        >
          <span className="font-display text-lg tracking-tight group-hover:text-zd-text">Design Tokens</span>
          <span className="text-sm text-zd-text-muted">Colors, typography, spacing, components</span>
        </Link>
      </section>
    </div>
  );
}
