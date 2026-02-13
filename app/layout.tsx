import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Z:Drive - Artist-First Release Platform',
  description:
    'Publish your creative releases on Zora. PDFs, 3D files, images, videos, code, and more.',
  keywords: ['zora', 'nft', 'creator', 'artist', 'release', 'web3'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-zd-bg text-zd-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
