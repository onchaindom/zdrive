import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Z:DRIVE Redesign Demos',
  description: 'File explorer redesign concept demos',
};

export default function ExplorerDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen antialiased">
      {children}
    </div>
  );
}
