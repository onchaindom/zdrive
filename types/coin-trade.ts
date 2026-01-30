// Widget-facing UI types for the Coin Trade Widget
// These types isolate UI components from Zora SDK response shape changes

export interface CoinHeaderStats {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  marketCap: string;
  totalVolume: string;
  volume24h: string;
  totalSupply: string;
  uniqueHolders: number;
  creatorAddress: string;
  creatorEarnings?: CreatorEarning[];
  previewImage?: string;
  platformBlocked: boolean;
  createdAt?: string;
}

export interface CreatorEarning {
  amount: string;
  currency: string;
}

export interface CoinHolderRow {
  holderAddress: string;
  balance: string;
  balanceFormatted: string;
  profile?: {
    displayName?: string;
    avatar?: string;
  };
}

export interface CoinSwapRow {
  txHash: string;
  timestamp: string;
  type: 'BUY' | 'SELL';
  amountIn: string;
  amountOut: string;
  tokenIn: string;
  tokenOut: string;
  traderAddress: string;
  traderProfile?: {
    displayName?: string;
    avatar?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  endCursor?: string;
}
