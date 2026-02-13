import { ipfsToHttp } from '@/lib/constants';

interface PreviewShellProps {
  label?: string;
  icon?: React.ReactNode;
  contentUri?: string;
  children: React.ReactNode;
}

export function PreviewShell({ label, icon, contentUri, children }: PreviewShellProps) {
  return (
    <div className="border border-zd-border bg-zd-surface group/preview">
      {label && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-zd-border">
          {icon && <span className="text-zd-text">{icon}</span>}
          <span className="text-xs font-mono text-zd-text-muted">{label}</span>
        </div>
      )}
      <div className="relative">
        {children}
        {contentUri && (
          <a
            href={ipfsToHttp(contentUri)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-zd-bg/70 p-1.5 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-150 text-zd-text-secondary hover:text-zd-text"
            aria-label="Download"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v8.5" />
              <path d="M4.5 7.5 8 11l3.5-3.5" />
              <path d="M3 13h10" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
