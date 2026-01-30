'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import {
  fetchNewCoins,
  fetchTopVolumeCoins,
  fetchCoinsByCreator,
  fetchHeldCreators,
  adaptCoinToRelease,
  resolveTokenMetadata,
  type ParsedRelease,
} from '@/lib/zora/queries';

export type ExploreTab = 'feed' | 'explore' | 'markets';

// Hook for fetching explore/new releases
export function useExploreReleases() {
  return useInfiniteQuery({
    queryKey: ['explore', 'new'],
    queryFn: async ({ pageParam }) => {
      const result = await fetchNewCoins(20, pageParam);
      const releases = result.coins
        .map(adaptCoinToRelease)
        .filter((r): r is ParsedRelease => r !== null);

      return {
        releases,
        hasMore: result.hasMore,
        endCursor: result.endCursor,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.endCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

// Hook for fetching top volume (Markets tab)
export function useMarketsReleases() {
  return useInfiniteQuery({
    queryKey: ['explore', 'markets'],
    queryFn: async ({ pageParam }) => {
      const result = await fetchTopVolumeCoins(20, pageParam);
      const releases = result.coins
        .map(adaptCoinToRelease)
        .filter((r): r is ParsedRelease => r !== null);

      return {
        releases,
        hasMore: result.hasMore,
        endCursor: result.endCursor,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.endCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

// Hook for fetching personalized feed based on held creator coins
export function useFeedReleases(viewerAddress: string | undefined) {
  return useQuery({
    queryKey: ['feed', viewerAddress],
    queryFn: async (): Promise<ParsedRelease[]> => {
      if (!viewerAddress) return [];

      // Get creators the viewer holds coins for
      const heldCreators = await fetchHeldCreators(viewerAddress);
      if (heldCreators.length === 0) return [];

      // Fetch releases from each held creator in parallel
      const allReleases: ParsedRelease[] = [];
      const seen = new Set<string>();

      const creatorResults = await Promise.all(
        heldCreators.map(async ({ creatorAddress }) => {
          const coins = await fetchCoinsByCreator(creatorAddress, 20);
          // Resolve metadata
          await Promise.all(
            coins.map(async (coin) => {
              if (!coin.metadata && coin.tokenUri) {
                coin.metadata = await resolveTokenMetadata(coin.tokenUri);
              }
            })
          );
          return coins.map(adaptCoinToRelease).filter(
            (r): r is ParsedRelease => r !== null
          );
        })
      );

      // Aggregate and deduplicate
      for (const releases of creatorResults) {
        for (const release of releases) {
          if (!seen.has(release.coinAddress)) {
            seen.add(release.coinAddress);
            allReleases.push(release);
          }
        }
      }

      // Sort by createdAt descending
      allReleases.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      return allReleases;
    },
    enabled: !!viewerAddress,
  });
}

// Combined hook for explore page with tab selection
export function useExplore(tab: ExploreTab) {
  const { user } = usePrivy();
  const viewerAddress = user?.wallet?.address;

  const feedQuery = useFeedReleases(viewerAddress);
  const exploreQuery = useExploreReleases();
  const marketsQuery = useMarketsReleases();

  if (tab === 'feed') {
    return {
      releases: feedQuery.data || [],
      isLoading: feedQuery.isLoading,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: () => Promise.resolve(),
      error: feedQuery.error,
    };
  }

  const activeQuery = tab === 'explore' ? exploreQuery : marketsQuery;

  // Flatten pages into single array of releases
  const releases =
    activeQuery.data?.pages.flatMap((page) => page.releases) || [];

  return {
    releases,
    isLoading: activeQuery.isLoading,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    hasNextPage: activeQuery.hasNextPage,
    fetchNextPage: activeQuery.fetchNextPage,
    error: activeQuery.error,
  };
}
