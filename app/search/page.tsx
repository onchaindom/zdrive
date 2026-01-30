'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header, Footer } from '@/components/layout';
import { ReleaseGrid, type ReleaseItem } from '@/components/release';
import { SearchBar, LoadingPage } from '@/components/ui';
import {
  fetchNewCoins,
  fetchCoinsByCreator,
  adaptCoinToRelease,
  resolveTokenMetadata,
  type ParsedRelease,
} from '@/lib/zora/queries';
import { searchIndex } from '@/lib/search/localIndex';
import { ZDRIVE_SCHEMA_VERSION } from '@/types/zdrive';

function isEthAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim());
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col"><Header /><LoadingPage /><Footer /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<ParsedRelease[]> => {
      if (!query.trim()) return [];

      const lowerQuery = query.toLowerCase().trim();
      const results: ParsedRelease[] = [];
      const seen = new Set<string>();

      // Strategy 1: Search local index (instant, previously visited releases)
      const localResults = searchIndex(lowerQuery);
      for (const entry of localResults) {
        if (seen.has(entry.coinAddress)) continue;
        results.push({
          coinAddress: entry.coinAddress,
          creatorAddress: entry.creatorAddress,
          metadata: {
            name: entry.name,
            description: entry.description,
            image: entry.image,
            properties: { zdrive: { schemaVersion: ZDRIVE_SCHEMA_VERSION } },
          },
          createdAt: entry.createdAt,
        });
        seen.add(entry.coinAddress);
      }

      // Strategy 2: If query looks like an address, search by creator
      if (isEthAddress(lowerQuery)) {
        const coins = await fetchCoinsByCreator(lowerQuery);
        await Promise.all(
          coins.map(async (coin) => {
            if (!coin.metadata && coin.tokenUri) {
              coin.metadata = await resolveTokenMetadata(coin.tokenUri);
            }
          })
        );
        for (const coin of coins) {
          const release = adaptCoinToRelease(coin);
          if (release && !seen.has(release.coinAddress)) {
            results.push(release);
            seen.add(release.coinAddress);
          }
        }
      }

      // Strategy 3: Search global new coins by text match
      const globalResult = await fetchNewCoins(100);
      const globalReleases = globalResult.coins
        .map(adaptCoinToRelease)
        .filter((r): r is ParsedRelease => r !== null);

      for (const release of globalReleases) {
        if (seen.has(release.coinAddress)) continue;
        const name = release.metadata.name.toLowerCase();
        const description = release.metadata.description.toLowerCase();
        const creator = release.creatorAddress.toLowerCase();
        if (
          name.includes(lowerQuery) ||
          description.includes(lowerQuery) ||
          creator.includes(lowerQuery)
        ) {
          results.push(release);
          seen.add(release.coinAddress);
        }
      }

      return results;
    },
    enabled: !!query.trim(),
  });

  const releaseItems: ReleaseItem[] = (data || []).map((release) => ({
    address: release.coinAddress,
    metadata: release.metadata,
    creatorAddress: release.creatorAddress,
    creatorName: release.creatorName,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-light">Search</h1>
            <div className="mt-4 max-w-lg">
              <SearchBar />
            </div>
          </div>

          {/* Results */}
          {query && (
            <div>
              <p className="mb-4 text-sm text-zdrive-text-secondary">
                {isLoading
                  ? 'Searching...'
                  : `${releaseItems.length} result${releaseItems.length !== 1 ? 's' : ''} for "${query}"`}
              </p>

              <ReleaseGrid
                releases={releaseItems}
                isLoading={isLoading}
                emptyMessage={`No releases found for "${query}"`}
              />
            </div>
          )}

          {!query && (
            <p className="text-zdrive-text-secondary">
              Search by release name, description, or creator address.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
