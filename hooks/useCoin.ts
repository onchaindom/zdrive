'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchCoinStats, fetchCoinHolders, fetchCoinSwaps } from '@/lib/zora/queries';
import type { CoinHeaderStats, CoinHolderRow, CoinSwapRow, PaginatedResponse } from '@/types/coin-trade';

export function useCoin(address?: string) {
  return useQuery<CoinHeaderStats | null>({
    queryKey: ['coin-stats', address],
    queryFn: () => fetchCoinStats(address!),
    enabled: !!address,
    staleTime: 20 * 1000, // 20 seconds for fresh market data
  });
}

export function useCoinHolders(address?: string, pageSize = 20, enabled = false) {
  return useInfiniteQuery<PaginatedResponse<CoinHolderRow>>({
    queryKey: ['coin-holders', address],
    queryFn: ({ pageParam }) =>
      fetchCoinHolders(address!, pageSize, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.endCursor : undefined,
    enabled: !!address && enabled,
  });
}

export function useCoinSwaps(address?: string, pageSize = 20, enabled = false) {
  return useInfiniteQuery<PaginatedResponse<CoinSwapRow>>({
    queryKey: ['coin-swaps', address],
    queryFn: ({ pageParam }) =>
      fetchCoinSwaps(address!, pageSize, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.endCursor : undefined,
    enabled: !!address && enabled,
  });
}
