'use client';

import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import {
  fetchCoinsByCreator,
  adaptCoinToRelease,
  resolveTokenMetadata,
  type ZoraCoin,
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

// Fetch the coin list (without metadata) for a creator
export function useCreatorCoins(address: string) {
  return useQuery({
    queryKey: ['creator', 'coins', address],
    queryFn: () => fetchCoinsByCreator(address),
    enabled: !!address,
  });
}

// Fetch metadata for each coin individually with useQueries for progressive loading
export function useCreatorReleases(address: string) {
  const { data: coins, isLoading: coinsLoading } = useCreatorCoins(address);

  // Use useQueries to resolve metadata individually per coin
  const metadataQueries = useQueries({
    queries: (coins ?? []).map((coin) => ({
      queryKey: ['coin', 'metadata', coin.address],
      queryFn: async (): Promise<ParsedRelease | null> => {
        // Resolve metadata if not already present
        let coinWithMetadata: ZoraCoin = coin;
        if (!coin.metadata && coin.tokenUri) {
          coinWithMetadata = {
            ...coin,
            metadata: await resolveTokenMetadata(coin.tokenUri),
          };
        }
        return adaptCoinToRelease(coinWithMetadata);
      },
      staleTime: 300_000, // 5 minutes
      enabled: !!coin.address,
    })),
  });

  // Collect resolved releases progressively
  const releases = useMemo(() => {
    const resolved = metadataQueries
      .map((q) => q.data)
      .filter((r): r is ParsedRelease => r !== null && r !== undefined);

    // Index for local search whenever we have results
    if (resolved.length > 0) {
      addManyToIndex(
        resolved.map((r) => ({
          coinAddress: r.coinAddress,
          creatorAddress: r.creatorAddress,
          name: r.metadata.name,
          description: r.metadata.description,
          image: r.metadata.image,
          createdAt: r.createdAt,
        }))
      );
    }

    return resolved;
  }, [metadataQueries]);

  // Overall loading: coins list is loading
  const isLoading = coinsLoading;

  // Number of coins still resolving metadata
  const pendingCount = metadataQueries.filter((q) => q.isLoading).length;
  const totalCount = coins?.length ?? 0;

  return {
    data: releases,
    isLoading,
    pendingCount,
    totalCount,
  };
}
