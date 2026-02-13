export function IconPDF({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 1h5.5L13 4.5V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z" />
      <path d="M9 1v4h4" />
      <path d="M5 9h6" />
      <path d="M5 11.5h4" />
    </svg>
  );
}

export function Icon3D({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 1 L14 4.5 L14 11.5 L8 15 L2 11.5 L2 4.5 Z" />
      <path d="M8 1 L8 8" />
      <path d="M8 8 L14 4.5" />
      <path d="M8 8 L2 4.5" />
      <path d="M8 8 L8 15" />
    </svg>
  );
}

export function IconImage({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <circle cx="5.5" cy="5.5" r="1" />
      <path d="M14 10.5 L11 7.5 L6 12.5" />
      <path d="M8.5 11 L7 9.5 L2 14" />
    </svg>
  );
}

export function IconVideo({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M6.5 6.5 L10.5 8 L6.5 9.5 Z" />
    </svg>
  );
}

export function IconCode({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5.5 4.5 L2 8 L5.5 11.5" />
      <path d="M10.5 4.5 L14 8 L10.5 11.5" />
      <path d="M9 3 L7 13" />
    </svg>
  );
}

export function IconCloud({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="5" cy="6" r="0.75" />
      <circle cx="8" cy="4" r="0.75" />
      <circle cx="11" cy="5.5" r="0.75" />
      <circle cx="6" cy="9" r="0.75" />
      <circle cx="10" cy="8" r="0.75" />
      <circle cx="4" cy="12" r="0.75" />
      <circle cx="8" cy="11.5" r="0.75" />
      <circle cx="12" cy="11" r="0.75" />
      <circle cx="7" cy="7" r="0.75" />
      <circle cx="11" cy="13" r="0.75" />
      <circle cx="3.5" cy="9.5" r="0.75" />
      <circle cx="13" cy="8.5" r="0.75" />
    </svg>
  );
}

export function IconFile({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 1h5.5L13 4.5V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z" />
      <path d="M9 1v4h4" />
    </svg>
  );
}

export const FILE_TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  PDF: IconPDF,
  '3D': Icon3D,
  IMG: IconImage,
  VID: IconVideo,
  MD: IconCode,
  PLY: IconCloud,
  FILE: IconFile,
};
