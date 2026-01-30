import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Z:Drive - Artist-First Release Platform',
  description:
    'Publish your creative releases on Zora. PDFs, 3D files, fonts, code, and more.',
  keywords: ['zora', 'nft', 'creator', 'artist', 'release', 'web3'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zdrive-bg text-zdrive-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
