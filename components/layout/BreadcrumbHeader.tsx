import Link from 'next/link';

export type BreadcrumbSegment = { label: string; href?: string };

export function BreadcrumbHeader({ segments, children }: { segments: BreadcrumbSegment[]; children?: React.ReactNode }) {
  return (
    <div className="h-12 border-b border-zd-border bg-zd-bg flex items-center px-6 gap-6">
      <div className="font-display tracking-tight text-lg flex items-center">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="text-zd-text-muted font-light mx-2">/</span>}
            {i < segments.length - 1 && seg.href ? (
              <Link href={seg.href} className="text-zd-text-secondary transition-colors duration-150 hover:text-zd-text">{seg.label}</Link>
            ) : (
              <span className="text-zd-text font-semibold">{seg.label}</span>
            )}
          </span>
        ))}
      </div>
      {children ? (
        <nav className="flex items-center gap-5 ml-auto">
          {children}
        </nav>
      ) : null}
    </div>
  );
}
