'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchCoinsByCreator,
  adaptCoinToRelease,
  resolveTokenMetadata,
} from '@/lib/zora/queries';

export interface ExistingCollection {
  id: string;
  title: string;
  slug: string;
  releaseCount: number;
  maxOrderingIndex: number;
}

/**
 * Fetches the creator's existing collections by scanning their releases.
 * Returns deduplicated collections with release counts and max ordering index.
 */
export function useCreatorCollections(creatorAddress: string | undefined) {
  return useQuery({
    queryKey: ['creator', 'collections', creatorAddress],
    queryFn: async (): Promise<ExistingCollection[]> => {
      if (!creatorAddress) return [];

      const coins = await fetchCoinsByCreator(creatorAddress);

      // Resolve metadata for coins that don't have it
      await Promise.all(
        coins.map(async (coin) => {
          if (!coin.metadata && coin.tokenUri) {
            coin.metadata = await resolveTokenMetadata(coin.tokenUri);
          }
        }),
      );

      // Extract unique collections
      const collectionMap = new Map<string, ExistingCollection>();

      for (const coin of coins) {
        const release = adaptCoinToRelease(coin);
        if (!release) continue;

        const collection = release.metadata.properties.zdrive.collection;
        if (!collection) continue;

        const existing = collectionMap.get(collection.id);
        const orderingIndex = collection.ordering?.index ?? 0;

        if (existing) {
          existing.releaseCount++;
          existing.maxOrderingIndex = Math.max(
            existing.maxOrderingIndex,
            orderingIndex,
          );
        } else {
          collectionMap.set(collection.id, {
            id: collection.id,
            title: collection.title,
            slug: collection.slug,
            releaseCount: 1,
            maxOrderingIndex: orderingIndex,
          });
        }
      }

      return Array.from(collectionMap.values()).sort((a, b) =>
        a.title.localeCompare(b.title),
      );
    },
    enabled: !!creatorAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
