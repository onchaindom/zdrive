import {
  getCoin,
  getCoinHolders,
  getCoinSwaps,
  getCoinsNew,
  getCoinsTopVolume24h,
  getProfileBalances,
  getProfileCoins,
} from '@zoralabs/coins-sdk';
import type {
  CoinHeaderStats,
  CoinHolderRow,
  CoinSwapRow,
  PaginatedResponse,
} from '@/types/coin-trade';
import { SUPPORTED_CHAIN_ID, ipfsToHttp } from '@/lib/constants';
import { parseZDriveMetadata, type ZDriveMetadata } from '@/types/zdrive';

// Type for coin data from Zora SDK
export interface ZoraCoin {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  totalSupply?: string;
  marketCap?: string;
  volume24h?: string;
  creatorAddress: string;
  createdAt?: string;
  mediaContent?: {
    previewImage?: string;
    originalUri?: string;
  };
  tokenUri?: string;
  metadata?: unknown;
}

// Parsed release data for Z:Drive
export interface ParsedRelease {
  coinAddress: string;
  creatorAddress: string;
  creatorName?: string;
  metadata: ZDriveMetadata;
  marketCap?: string;
  volume24h?: string;
  createdAt?: string;
}

// Helper to extract media content
function extractMediaContent(mediaContent: unknown): { previewImage?: string; originalUri?: string } | undefined {
  if (!mediaContent || typeof mediaContent !== 'object') return undefined;
  const mc = mediaContent as Record<string, unknown>;

  let previewImage: string | undefined;
  if (mc.previewImage) {
    if (typeof mc.previewImage === 'string') {
      previewImage = mc.previewImage;
    } else if (typeof mc.previewImage === 'object' && mc.previewImage !== null) {
      const pi = mc.previewImage as Record<string, unknown>;
      previewImage = (pi.small || pi.medium) as string | undefined;
    }
  }

  return {
    previewImage,
    originalUri: mc.originalUri as string | undefined,
  };
}

// In-memory cache for resolved token metadata (bounded to prevent memory leaks)
const MAX_CACHE_SIZE = 200;
const metadataCache = new Map<string, unknown>();

function boundedCacheSet(key: string, value: unknown) {
  if (metadataCache.size >= MAX_CACHE_SIZE) {
    // Delete oldest entry (first key in insertion order)
    const oldestKey = metadataCache.keys().next().value;
    if (oldestKey !== undefined) {
      metadataCache.delete(oldestKey);
    }
  }
  metadataCache.set(key, value);
}

// Resolve full metadata JSON from a tokenUri (IPFS/HTTPS)
export async function resolveTokenMetadata(tokenUri: string): Promise<unknown> {
  if (metadataCache.has(tokenUri)) {
    return metadataCache.get(tokenUri);
  }
  try {
    const url = ipfsToHttp(tokenUri);
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    boundedCacheSet(tokenUri, json);
    return json;
  } catch {
    return null;
  }
}

// Fetch a single coin by address
export async function fetchCoin(address: string): Promise<ZoraCoin | null> {
  try {
    const response = await getCoin({
      address,
      chain: SUPPORTED_CHAIN_ID,
    });

    const coin = response?.data?.zora20Token;
    if (!coin) return null;

    // The SDK returns tokenUri (a string URL), not parsed metadata JSON.
    // Resolve the full metadata by fetching the tokenUri.
    const tokenUri = (coin as Record<string, unknown>).tokenUri as string | undefined;
    let metadata: unknown = undefined;
    if (tokenUri) {
      metadata = await resolveTokenMetadata(tokenUri);
    }

    return {
      address: coin.address,
      name: coin.name,
      symbol: coin.symbol,
      description: coin.description || undefined,
      totalSupply: coin.totalSupply || undefined,
      marketCap: coin.marketCap || undefined,
      volume24h: coin.volume24h || undefined,
      creatorAddress: coin.creatorAddress || '',
      createdAt: coin.createdAt || undefined,
      mediaContent: extractMediaContent(coin.mediaContent),
      tokenUri,
      metadata,
    };
  } catch (error) {
    console.error('Error fetching coin:', error);
    return null;
  }
}

// Fetch new coins (for Explore feed)
export async function fetchNewCoins(
  count = 20,
  after?: string
): Promise<{ coins: ZoraCoin[]; hasMore: boolean; endCursor?: string }> {
  try {
    const response = await getCoinsNew({
      count,
      after,
    });

    const edges = response?.data?.exploreList?.edges || [];
    const pageInfo = response?.data?.exploreList?.pageInfo;

    const coins: ZoraCoin[] = edges
      .map((edge: { node?: Record<string, unknown> }) => edge.node)
      .filter((node): node is Record<string, unknown> => !!node?.address)
      .map((node) => ({
        address: node.address as string,
        name: (node.name as string) || '',
        symbol: (node.symbol as string) || '',
        description: node.description as string | undefined,
        totalSupply: node.totalSupply as string | undefined,
        marketCap: node.marketCap as string | undefined,
        volume24h: node.volume24h as string | undefined,
        creatorAddress: (node.creatorAddress as string) || '',
        createdAt: node.createdAt as string | undefined,
        mediaContent: extractMediaContent(node.mediaContent),
        tokenUri: node.tokenUri as string | undefined,
        metadata: node.metadata,
      }));

    return {
      coins,
      hasMore: pageInfo?.hasNextPage || false,
      endCursor: pageInfo?.endCursor || undefined,
    };
  } catch (error) {
    console.error('Error fetching new coins:', error);
    return { coins: [], hasMore: false };
  }
}

// Fetch top volume coins (for Markets tab)
export async function fetchTopVolumeCoins(
  count = 20,
  after?: string
): Promise<{ coins: ZoraCoin[]; hasMore: boolean; endCursor?: string }> {
  try {
    const response = await getCoinsTopVolume24h({
      count,
      after,
    });

    const edges = response?.data?.exploreList?.edges || [];
    const pageInfo = response?.data?.exploreList?.pageInfo;

    const coins: ZoraCoin[] = edges
      .map((edge: { node?: Record<string, unknown> }) => edge.node)
      .filter((node): node is Record<string, unknown> => !!node?.address)
      .map((node) => ({
        address: node.address as string,
        name: (node.name as string) || '',
        symbol: (node.symbol as string) || '',
        description: node.description as string | undefined,
        totalSupply: node.totalSupply as string | undefined,
        marketCap: node.marketCap as string | undefined,
        volume24h: node.volume24h as string | undefined,
        creatorAddress: (node.creatorAddress as string) || '',
        createdAt: node.createdAt as string | undefined,
        mediaContent: extractMediaContent(node.mediaContent),
        tokenUri: node.tokenUri as string | undefined,
        metadata: node.metadata,
      }));

    return {
      coins,
      hasMore: pageInfo?.hasNextPage || false,
      endCursor: pageInfo?.endCursor || undefined,
    };
  } catch (error) {
    console.error('Error fetching top volume coins:', error);
    return { coins: [], hasMore: false };
  }
}

// Fetch coins created by a specific address using getProfileCoins
export async function fetchCoinsByCreator(
  creatorAddress: string,
  count = 50
): Promise<ZoraCoin[]> {
  try {
    const response = await getProfileCoins({
      identifier: creatorAddress,
      count,
    });

    const profile = response?.data?.profile;
    const createdCoins = (profile as Record<string, unknown>)?.createdCoins as {
      edges?: Array<{ node?: Record<string, unknown> }>;
    } | undefined;
    const edges = createdCoins?.edges || [];

    const coins: ZoraCoin[] = edges
      .map((edge) => edge.node)
      .filter((node): node is Record<string, unknown> => !!node?.address)
      .map((node) => ({
        address: node.address as string,
        name: (node.name as string) || '',
        symbol: (node.symbol as string) || '',
        description: node.description as string | undefined,
        totalSupply: node.totalSupply as string | undefined,
        marketCap: node.marketCap as string | undefined,
        volume24h: node.volume24h as string | undefined,
        creatorAddress: (node.creatorAddress as string) || creatorAddress,
        createdAt: node.createdAt as string | undefined,
        mediaContent: extractMediaContent(node.mediaContent),
        tokenUri: node.tokenUri as string | undefined,
        metadata: undefined, // Resolved lazily by callers when needed
      }));

    return coins;
  } catch (error) {
    console.error('Error fetching coins by creator:', error);
    return [];
  }
}

// Fetch enhanced coin stats for the widget header
export async function fetchCoinStats(address: string): Promise<CoinHeaderStats | null> {
  try {
    const [coinResponse, holdersResponse] = await Promise.all([
      getCoin({ address, chain: SUPPORTED_CHAIN_ID }),
      getCoinHolders({ chainId: SUPPORTED_CHAIN_ID, address, count: 1 }),
    ]);

    const coin = coinResponse?.data?.zora20Token;
    if (!coin) return null;

    const holdersCount = holdersResponse?.data?.zora20Token?.tokenBalances?.count ?? 0;

    return {
      address: coin.address,
      name: coin.name,
      symbol: coin.symbol,
      description: coin.description || undefined,
      marketCap: coin.marketCap || '0',
      totalVolume: coin.totalVolume || '0',
      volume24h: coin.volume24h || '0',
      totalSupply: coin.totalSupply || '0',
      uniqueHolders: holdersCount,
      creatorAddress: coin.creatorAddress || '',
      previewImage: extractMediaContent(coin.mediaContent)?.previewImage,
      platformBlocked: coin.platformBlocked ?? false,
      createdAt: coin.createdAt || undefined,
    };
  } catch (error) {
    console.error('Error fetching coin stats:', error);
    return null;
  }
}

// Fetch paginated coin holders
export async function fetchCoinHolders(
  address: string,
  count = 20,
  after?: string
): Promise<PaginatedResponse<CoinHolderRow>> {
  try {
    const response = await getCoinHolders({
      chainId: SUPPORTED_CHAIN_ID,
      address,
      count,
      after,
    });

    const tokenBalances = response?.data?.zora20Token?.tokenBalances;
    if (!tokenBalances) return { items: [], hasMore: false };

    const items: CoinHolderRow[] = tokenBalances.edges.map((edge) => {
      const node = edge.node;
      return {
        holderAddress: node.ownerAddress,
        balance: node.balance,
        balanceFormatted: formatTokenBalance(node.balance),
        profile: node.ownerProfile ? {
          displayName: node.ownerProfile.handle,
          avatar: node.ownerProfile.avatar?.previewImage?.small,
        } : undefined,
      };
    });

    return {
      items,
      hasMore: tokenBalances.pageInfo.hasNextPage,
      endCursor: tokenBalances.pageInfo.endCursor || undefined,
    };
  } catch (error) {
    console.error('Error fetching coin holders:', error);
    return { items: [], hasMore: false };
  }
}

// Fetch paginated coin swap activity
export async function fetchCoinSwaps(
  address: string,
  count = 20,
  after?: string
): Promise<PaginatedResponse<CoinSwapRow>> {
  try {
    const response = await getCoinSwaps({
      address,
      chain: SUPPORTED_CHAIN_ID,
      first: count,
      after,
    });

    const swapActivities = response?.data?.zora20Token?.swapActivities;
    if (!swapActivities) return { items: [], hasMore: false };

    const items: CoinSwapRow[] = swapActivities.edges.map((edge) => {
      const node = edge.node;
      return {
        txHash: node.transactionHash,
        timestamp: node.blockTimestamp,
        type: node.activityType || 'BUY',
        amountIn: node.currencyAmountWithPrice.currencyAmount.amountDecimal.toString(),
        amountOut: node.coinAmount,
        tokenIn: node.currencyAmountWithPrice.currencyAmount.currencyAddress,
        tokenOut: '', // Derived from context (coin address for buys, ETH for sells)
        traderAddress: node.senderAddress,
        traderProfile: node.senderProfile ? {
          displayName: node.senderProfile.handle,
          avatar: node.senderProfile.avatar?.previewImage?.small,
        } : undefined,
      };
    });

    return {
      items,
      hasMore: swapActivities.pageInfo.hasNextPage,
      endCursor: swapActivities.pageInfo.endCursor || undefined,
    };
  } catch (error) {
    console.error('Error fetching coin swaps:', error);
    return { items: [], hasMore: false };
  }
}

// Format raw token balance string to human-readable
function formatTokenBalance(balance: string): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  if (num < 0.001 && num > 0) return '<0.001';
  return num.toFixed(3);
}

// Represents a creator the viewer holds coins for, with total balance for weighting
export interface HeldCreator {
  creatorAddress: string;
  totalBalance: number;
}

// Fetch unique creator addresses from viewer's coin holdings, sorted by balance
export async function fetchHeldCreators(
  viewerAddress: string,
  maxCreators = 20
): Promise<HeldCreator[]> {
  try {
    const response = await getProfileBalances({
      identifier: viewerAddress,
      count: 100,
    });

    const profile = response?.data?.profile;
    const coinBalances = (profile as Record<string, unknown>)?.coinBalances as {
      edges?: Array<{ node?: Record<string, unknown> }>;
    } | undefined;
    const edges = coinBalances?.edges || [];

    // Group by creator address, summing balances
    const creatorMap = new Map<string, number>();

    for (const edge of edges) {
      const node = edge.node;
      if (!node) continue;

      const balance = parseFloat((node.balance as string) || '0');
      if (balance <= 0) continue;

      const coin = node.coin as Record<string, unknown> | undefined;
      if (!coin) continue;

      const creatorAddr = (coin.creatorAddress as string) || '';
      if (!creatorAddr) continue;

      const existing = creatorMap.get(creatorAddr.toLowerCase()) || 0;
      creatorMap.set(creatorAddr.toLowerCase(), existing + balance);
    }

    // Sort by total balance descending, take top N
    return Array.from(creatorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCreators)
      .map(([addr, bal]) => ({ creatorAddress: addr, totalBalance: bal }));
  } catch (error) {
    console.error('Error fetching held creators:', error);
    return [];
  }
}

// Filter coins to only Z:Drive releases (have valid zdrive metadata)
export function filterZDriveReleases(coins: ZoraCoin[]): ParsedRelease[] {
  const releases: ParsedRelease[] = [];

  for (const coin of coins) {
    const metadata = parseZDriveMetadata(coin.metadata);
    if (!metadata) continue;

    releases.push({
      coinAddress: coin.address,
      creatorAddress: coin.creatorAddress,
      metadata,
      marketCap: coin.marketCap,
      volume24h: coin.volume24h,
      createdAt: coin.createdAt,
    });
  }

  return releases;
}

// For MVP demo purposes: create mock Z:Drive metadata from any coin
// This allows us to display coins that weren't created through Z:Drive
export function adaptCoinToRelease(coin: ZoraCoin): ParsedRelease | null {
  // Try to parse as Z:Drive metadata first
  const zdriveMetadata = parseZDriveMetadata(coin.metadata);
  if (zdriveMetadata) {
    return {
      coinAddress: coin.address,
      creatorAddress: coin.creatorAddress,
      metadata: zdriveMetadata,
      marketCap: coin.marketCap,
      volume24h: coin.volume24h,
      createdAt: coin.createdAt,
    };
  }

  // Fall back to adapting standard coin metadata
  const coverImage =
    coin.mediaContent?.previewImage ||
    coin.mediaContent?.originalUri ||
    'https://via.placeholder.com/400';

  return {
    coinAddress: coin.address,
    creatorAddress: coin.creatorAddress,
    metadata: {
      name: coin.name,
      description: coin.description || '',
      image: coverImage,
      properties: {
        zdrive: {
          schemaVersion: 1,
        },
      },
    },
    marketCap: coin.marketCap,
    volume24h: coin.volume24h,
    createdAt: coin.createdAt,
  };
}
