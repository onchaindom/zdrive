'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchCoinsByCreator,
  adaptCoinToRelease,
  resolveTokenMetadata,
  type ParsedRelease,
} from '@/lib/zora/queries';
import { parseCollectionId } from '@/types/zdrive';

interface CollectionData {
  id: string;
  title: string;
  slug: string;
  creatorAddress: string;
  releases: ParsedRelease[];
  coverImage?: string;
}

export function useCollection(collectionId: string) {
  return useQuery({
    queryKey: ['collection', collectionId],
    queryFn: async (): Promise<CollectionData | null> => {
      // Parse collection ID to get creator address
      const parsed = parseCollectionId(collectionId);
      if (!parsed) return null;

      // Fetch all coins by the creator
      const coins = await fetchCoinsByCreator(parsed.creatorAddress);

      // Resolve metadata from tokenUri for each coin
      await Promise.all(
        coins.map(async (coin) => {
          if (!coin.metadata && coin.tokenUri) {
            coin.metadata = await resolveTokenMetadata(coin.tokenUri);
          }
        })
      );

      // Filter to releases that belong to this collection
      const collectionReleases: ParsedRelease[] = [];
      let collectionTitle = '';
      let collectionSlug = '';

      for (const coin of coins) {
        const release = adaptCoinToRelease(coin);
        if (!release) continue;

        const releaseCollection =
          release.metadata.properties.zdrive.collection;
        if (releaseCollection?.id === collectionId) {
          collectionReleases.push(release);
          // Get collection metadata from first matching release
          if (!collectionTitle) {
            collectionTitle = releaseCollection.title;
            collectionSlug = releaseCollection.slug;
          }
        }
      }

      if (collectionReleases.length === 0) {
        return null;
      }

      // Sort by ordering index if available, otherwise by created date
      collectionReleases.sort((a, b) => {
        const indexA =
          a.metadata.properties.zdrive.collection?.ordering?.index;
        const indexB =
          b.metadata.properties.zdrive.collection?.ordering?.index;

        if (indexA !== undefined && indexB !== undefined) {
          return indexA - indexB;
        }

        // Fall back to created date
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });

      // Use first release cover as collection cover
      const coverImage = collectionReleases[0]?.metadata.image;

      return {
        id: collectionId,
        title: collectionTitle,
        slug: collectionSlug,
        creatorAddress: parsed.creatorAddress,
        releases: collectionReleases,
        coverImage,
      };
    },
    enabled: !!collectionId,
  });
}
