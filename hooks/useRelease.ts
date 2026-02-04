'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCoin, adaptCoinToRelease, type ParsedRelease } from '@/lib/zora/queries';
import { addToIndex } from '@/lib/search/localIndex';

interface UseReleaseOptions {
  /** Polling interval in ms. Set to poll for newly created releases. */
  refetchInterval?: number | false;
}

export function useRelease(address: string, options?: UseReleaseOptions) {
  return useQuery({
    queryKey: ['release', address],
    queryFn: async (): Promise<ParsedRelease | null> => {
      const coin = await fetchCoin(address);
      if (!coin) return null;
      const release = adaptCoinToRelease(coin);
      if (release) {
        addToIndex({
          coinAddress: release.coinAddress,
          creatorAddress: release.creatorAddress,
          name: release.metadata.name,
          description: release.metadata.description,
          image: release.metadata.image,
          createdAt: release.createdAt,
        });
      }
      return release;
    },
    enabled: !!address,
    retry: 2,
    staleTime: 30_000, // 30 seconds
    refetchInterval: options?.refetchInterval,
  });
}
