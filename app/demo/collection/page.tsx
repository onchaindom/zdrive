import Link from 'next/link';

export default function CollectionDemoPage() {
  return (
    <div className="max-w-[960px] mx-auto px-6 pb-16">
      <div className="pt-12 pb-8">
        <div className="mb-4">
          <Link href="/demo" className="text-sm text-zd-text-muted hover:text-zd-text-secondary transition-colors duration-150">&larr; Back to demos</Link>
        </div>
        <h1 className="font-display text-4xl tracking-tighter mb-2">Collection</h1>
        <p className="text-sm text-zd-text-secondary">Coming soon</p>
      </div>
    </div>
  );
}
