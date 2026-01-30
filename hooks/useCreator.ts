'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchCoinsByCreator,
  adaptCoinToRelease,
  resolveTokenMetadata,
  type ParsedRelease,
} from '@/lib/zora/queries';
import { getProfile } from '@zoralabs/coins-sdk';
import { addManyToIndex } from '@/lib/search/localIndex';

export interface CreatorProfile {
  address: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  creatorCoinAddress?: string;
  creatorCoinSymbol?: string;
}

// Helper to extract avatar string from Zora's avatar format
function extractAvatar(avatar: unknown): string | undefined {
  if (!avatar) return undefined;
  if (typeof avatar === 'string') return avatar;
  if (typeof avatar === 'object' && avatar !== null) {
    const av = avatar as Record<string, unknown>;
    return (av.small || av.medium || av.original) as string | undefined;
  }
  return undefined;
}

// Fetch creator profile from Zora
export function useCreatorProfile(address: string) {
  return useQuery({
    queryKey: ['creator', 'profile', address],
    queryFn: async (): Promise<CreatorProfile> => {
      try {
        const response = await getProfile({ identifier: address });
        const profile = response?.data?.profile;

        return {
          address,
          displayName: profile?.displayName || undefined,
          avatar: extractAvatar(profile?.avatar),
          bio: profile?.bio || undefined,
          creatorCoinAddress: profile?.creatorCoin?.address || undefined,
          creatorCoinSymbol: (profile?.creatorCoin as { symbol?: string } | undefined)?.symbol || undefined,
        };
      } catch {
        // Return minimal profile if fetch fails
        return { address };
      }
    },
    enabled: !!address,
  });
}

// Fetch releases created by a creator
export function useCreatorReleases(address: string) {
  return useQuery({
    queryKey: ['creator', 'releases', address],
    queryFn: async (): Promise<ParsedRelease[]> => {
      // getProfileCoins already returns only coins created by this address
      const coins = await fetchCoinsByCreator(address);

      // Resolve metadata from tokenUri for each coin in parallel
      await Promise.all(
        coins.map(async (coin) => {
          if (!coin.metadata && coin.tokenUri) {
            coin.metadata = await resolveTokenMetadata(coin.tokenUri);
          }
        })
      );

      const releases = coins
        .map(adaptCoinToRelease)
        .filter((r): r is ParsedRelease => r !== null);

      // Index for local search
      addManyToIndex(
        releases.map((r) => ({
          coinAddress: r.coinAddress,
          creatorAddress: r.creatorAddress,
          name: r.metadata.name,
          description: r.metadata.description,
          image: r.metadata.image,
          createdAt: r.createdAt,
        }))
      );

      return releases;
    },
    enabled: !!address,
  });
}
