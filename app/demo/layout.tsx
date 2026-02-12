import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

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
    <div className={`${inter.variable} min-h-screen bg-zd-bg text-zd-text antialiased`}>
      {children}
    </div>
  );
}
