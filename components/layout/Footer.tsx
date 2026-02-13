import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zd-border bg-zd-surface">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <p className="text-sm text-zd-text-secondary">
          Built on{' '}
          <a
            href="https://zora.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zd-text"
          >
            Zora
          </a>
        </p>

        <nav className="flex items-center gap-4 text-sm text-zd-text-secondary">
          <Link href="/feed" className="hover:text-zd-text">
            Explore
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zd-text"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
