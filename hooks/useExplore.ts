'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchNewCoins,
  fetchTopVolumeCoins,
  fetchMostValuableCoins,
  adaptCoinToRelease,
  type ParsedRelease,
} from '@/lib/zora/queries';

export type SortOption = 'created' | 'volume' | 'marketCap';

export function useReleases(sort: SortOption = 'created') {
  const query = useInfiniteQuery({
    queryKey: ['releases', sort],
    queryFn: async ({ pageParam }) => {
      let result;
      switch (sort) {
        case 'volume':
          result = await fetchTopVolumeCoins(20, pageParam);
          break;
        case 'marketCap':
          result = await fetchMostValuableCoins(20, pageParam);
          break;
        case 'created':
        default:
          result = await fetchNewCoins(20, pageParam);
          break;
      }

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

  const releases =
    query.data?.pages.flatMap((page) => page.releases) || [];

  return {
    releases,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
  };
}
