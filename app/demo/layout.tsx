import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Z:DRIVE Design System',
  description: 'Design system demo and component reference',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zd-bg text-zd-text antialiased">
      {children}
    </div>
  );
}
