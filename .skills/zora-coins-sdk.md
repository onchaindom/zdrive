# Zora Coins SDK Reference (v0.4.0)

> Fetched from docs.zora.co/coins on 2026-01-30.
> Some query sub-pages may have updated since this snapshot.
> GitHub repo: https://github.com/ourzora/zora-protocol (monorepo, package at /packages/coins-sdk)

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Creating Coins](#creating-coins)
3. [Metadata Builder](#metadata-builder)
4. [Trading Coins (Buy/Sell)](#trading-coins-buysell)
5. [Updating Coins](#updating-coins)
6. [Querying Coins](#querying-coins)
7. [Profile Queries](#profile-queries)
8. [Explore Queries](#explore-queries)
9. [Leaderboard Queries](#leaderboard-queries)
10. [Platform Referrer & Rewards](#platform-referrer--rewards)
11. [Metadata Format (EIP-7572)](#metadata-format-eip-7572)
12. [Public REST API](#public-rest-api)
13. [Types Reference](#types-reference)

---

## Installation & Setup

```bash
npm install @zoralabs/coins-sdk viem
```

`viem` is a peer dependency required for on-chain write operations.

### API Key (recommended for production)

```typescript
import { setApiKey } from "@zoralabs/coins-sdk";
setApiKey("your-api-key-here");
```

Get an API key at https://zora.co -> Developer Settings.
Without a key, requests are rate-limited.

### Client Setup (viem)

```typescript
import { createWalletClient, createPublicClient, http } from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http("<RPC_URL>"),
});

const walletClient = createWalletClient({
  account: "0x<YOUR_ACCOUNT>",
  chain: base,
  transport: http("<RPC_URL>"),
});
```

---

## Creating Coins

### Imports

```typescript
import {
  createCoin,
  createCoinCall,
  CreateConstants,
  ContentCoinCurrency,
  StartingMarketCap,
  validateMetadataURIContent,
  getCoinCreateFromLogs,
} from "@zoralabs/coins-sdk";
import { Address, Hex } from "viem";
```

### CreateCoinArgs

```typescript
type CreateCoinArgs = {
  creator: Address;
  name: string;
  symbol: string;
  metadata: MetadataType;
  currency: ContentCoinCurrency;
  chainId?: number;
  startingMarketCap?: StartingMarketCap;
  platformReferrer?: Address;
  additionalOwners?: Address[];
  payoutRecipientOverride?: Address;
  skipMetadataValidation?: boolean;
};
```

### MetadataType

```typescript
type MetadataType = {
  type: "RAW_URI";
  uri: string; // ipfs:// or https:// URI pointing to metadata JSON
};
```

### ContentCoinCurrency

```typescript
// Available values:
"CREATOR_COIN"
"CREATOR_COIN_OR_ZORA"  // fallback to ZORA if creator coin unavailable
"ZORA"
"ETH"
// Note: ZORA, CREATOR_COIN, CREATOR_COIN_OR_ZORA are NOT available on Base Sepolia
```

### StartingMarketCap

```typescript
"LOW"   // default
"HIGH"  // recommended for established creators
```

### createCoin() -- High-Level (sends tx)

```typescript
const result = await createCoin({
  call: {
    creator: "0xYourAddress" as Address,
    name: "My Coin",
    symbol: "MYCN",
    metadata: {
      type: "RAW_URI",
      uri: "ipfs://bafkrei...",
    },
    currency: "ETH",
    platformReferrer: "0xPlatformAddress" as Address,
  },
  walletClient,
  publicClient,
  options: { skipValidateTransaction: false },
});

// result.hash          -- tx hash
// result.receipt       -- TransactionReceipt
// result.address       -- deployed coin address
// result.deployment    -- { coin, creator, poolAddress }
// result.chain         -- Chain object
```

### createCoinCall() -- Low-Level (returns calldata only)

```typescript
const response = createCoinCall({
  creator: "0xYourAddress" as Address,
  name: "My Coin",
  symbol: "MYCN",
  metadata: { type: "RAW_URI", uri: "ipfs://bafkrei..." },
  currency: "ETH",
});

// response.calls             -- Array<{ to: Address, data: Hex, value: bigint }>
// response.predictedCoinAddress -- Address
```

### Utility: getCoinCreateFromLogs()

Extract deployed coin address from a transaction receipt's logs.

### Utility: validateMetadataURIContent()

Manually validate a metadata URI before creating a coin.

---

## Metadata Builder

Handles IPFS upload and metadata JSON generation.

```typescript
import {
  createMetadataBuilder,
  createZoraUploaderForCreator,
} from "@zoralabs/coins-sdk";

const { createMetadataParameters } = await createMetadataBuilder()
  .withName("My Coin")
  .withSymbol("MYCN")
  .withDescription("A description")
  .withImage(new File([imageBuffer], "image.png", { type: "image/png" }))
  .upload(createZoraUploaderForCreator(creatorAddress));

// createMetadataParameters.metadata -> { type: "RAW_URI", uri: "ipfs://..." }
// Pass directly to createCoin({ call: { ...args, metadata: createMetadataParameters.metadata } })
```

### Builder Methods

- `.withName(string)` -- required
- `.withSymbol(string)` -- required
- `.withDescription(string)` -- optional
- `.withImage(File)` -- required (File object)
- `.upload(uploader)` -- executes upload

### Uploader Interface

```typescript
interface Uploader {
  upload(file: File): Promise<UploadResult>;
}

type UploadResult = {
  url: string;       // required
  size?: number;
  mimeType?: string;
};
```

### Validation Rules

- Name, symbol, and image are mandatory
- URLs and files cannot be submitted simultaneously
- Image MIME types must be compatible with zora.co

---

## Trading Coins (Buy/Sell)

### Imports

```typescript
import { tradeCoin, createTradeCall, TradeParameters } from "@zoralabs/coins-sdk";
import { parseEther } from "viem";
```

### TradeParameters

```typescript
type TradeParameters = {
  sell: TradeCurrency;
  buy: TradeCurrency;
  amountIn: bigint;
  slippage?: number;              // 0 to 0.99, default ~5%
  sender: Address;
  signer?: Address;
  recipient?: Address;
  signatures?: SignatureWithPermit<PermitStringAmounts>[];
  permitActiveSeconds?: number;   // default: 20 minutes
};

type TradeCurrency =
  | { type: "eth" }
  | { type: "erc20"; address: Address };
```

### tradeCoin() -- High-Level

```typescript
async function tradeCoin({
  tradeParameters,
  walletClient,
  account,
  publicClient,
  validateTransaction?: boolean,  // default true
}): Promise<TransactionReceipt>
```

### Buy: ETH -> Coin

```typescript
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount("0x...");

const receipt = await tradeCoin({
  tradeParameters: {
    sell: { type: "eth" },
    buy: { type: "erc20", address: "0xCoinAddress" as Address },
    amountIn: parseEther("0.001"),
    slippage: 0.05,
    sender: account.address,
  },
  walletClient,
  account,
  publicClient,
});
```

### Sell: Coin -> ETH

```typescript
const receipt = await tradeCoin({
  tradeParameters: {
    sell: { type: "erc20", address: "0xCoinAddress" as Address },
    buy: { type: "eth" },
    amountIn: parseEther("100"),
    slippage: 0.15,
    sender: account.address,
  },
  walletClient,
  account,
  publicClient,
});
```

### Swap: ERC20 -> ERC20 (e.g., USDC -> Coin)

```typescript
const receipt = await tradeCoin({
  tradeParameters: {
    sell: { type: "erc20", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address }, // USDC on Base
    buy: { type: "erc20", address: "0xCoinAddress" as Address },
    amountIn: BigInt(4 * 10 ** 6), // 4 USDC (6 decimals)
    slippage: 0.05,
    sender: account.address,
  },
  walletClient,
  account,
  publicClient,
});
```

### createTradeCall() -- Low-Level

```typescript
const quote = await createTradeCall(tradeParameters);

const tx = await walletClient.sendTransaction({
  to: quote.call.target as Address,
  data: quote.call.data as Hex,
  value: BigInt(quote.call.value),
  account,
});
```

### Notes

- Permit signatures are handled automatically for ERC20 trades (EIP-2612)
- Slippage must be < 1 (max 0.99)
- amountIn must be > 0
- Base mainnet only for now; smart wallet support planned

---

## Updating Coins

Owner-only operations. Unauthorized calls revert with `OnlyOwner`.

### Update Metadata URI

```typescript
import { updateCoinURI, updateCoinURICall } from "@zoralabs/coins-sdk";

// High-level (sends tx):
const result = await updateCoinURI(
  { coin: "0xCoinAddress" as Address, newURI: "ipfs://bafkrei..." },
  walletClient,
  publicClient
);
// Returns: { hash, uriUpdated }

// Low-level (for WAGMI / useContractWrite):
const contractCallParams = updateCoinURICall({
  coin: "0xCoinAddress" as Address,
  newURI: "ipfs://bafkrei...",
});
```

### Update Payout Recipient

```typescript
import { updatePayoutRecipient } from "@zoralabs/coins-sdk";

const result = await updatePayoutRecipient(
  {
    coin: "0xCoinAddress" as Address,
    newPayoutRecipient: "0xNewRecipient" as Address,
  },
  walletClient,
  publicClient
);
// Returns: { hash, receipt }
```

---

## Querying Coins

### getCoin -- Single Coin Details

```typescript
import { getCoin } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";

const response = await getCoin({
  address: "0xCoinAddress",
  chain: base.id, // 8453
});

const coin = response.data?.zora20Token;
// coin.name, coin.symbol, coin.totalSupply, coin.totalVolume
// coin.volume24h, coin.marketCap, coin.uniqueHolders
// coin.creatorAddress, coin.createdAt
// coin.tokenPrice, coin.creatorProfile
// coin.mediaContent?.previewImage
// coin.creatorEarnings[]
// coin.uniswapV4PoolKey
// coin.poolCurrencyToken?.{ address, name, decimals }
```

### getCoins -- Batch Query

```typescript
import { getCoins } from "@zoralabs/coins-sdk";

const response = await getCoins({
  coins: [
    { chainId: 8453, collectionAddress: "0xFirst" },
    { chainId: 8453, collectionAddress: "0xSecond" },
  ],
});

response.data?.zora20Tokens?.forEach((coin: any) => {
  console.log(coin.name, coin.symbol);
});
```

### getCoinHolders

```typescript
import { getCoinHolders } from "@zoralabs/coins-sdk";

const response = await getCoinHolders({
  chainId: 8453,
  address: "0xCoinAddress",
  count: 20,
  after: undefined, // pagination cursor
});

const holders = response.data?.zora20Token?.tokenBalances.edges;
holders.forEach(({ node }) => {
  // node.ownerAddress, node.balance, node.ownerProfile?.handle
});
```

### getCoinSwaps

```typescript
import { getCoinSwaps } from "@zoralabs/coins-sdk";

const response = await getCoinSwaps({
  address: "0xCoinAddress",
  chain: 8453,
  first: 10,
  after: undefined,
});

const swaps = response.data?.zora20Token?.swapActivities.edges;
swaps.forEach(({ node }) => {
  // node.activityType ("BUY" | "SELL")
  // node.coinAmount, node.senderAddress, node.blockTimestamp
});
```

### getCoinComments

```typescript
import { getCoinComments } from "@zoralabs/coins-sdk";

const response = await getCoinComments({
  address: "0xCoinAddress",
  chain: 8453,
  count: 20,
  after: undefined,
});

response.data?.zora20Token?.zoraComments?.edges?.forEach((edge) => {
  // edge.node.userAddress, edge.node.comment
  // edge.node.userProfile?.handle, edge.node.timestamp
  // edge.node.replies?.edges[]
});

// Pagination: response.data?.zora20Token?.zoraComments?.pageInfo?.endCursor
```

### Error Handling

```typescript
try {
  const response = await getCoin({ address: "0xAddress" });
} catch (error: any) {
  if (error.status === 404) console.error("Coin not found");
  if (error.status === 401) console.error("Invalid API key");
}
```

---

## Profile Queries

### getProfile

```typescript
import { getProfile } from "@zoralabs/coins-sdk";

const response = await getProfile({
  identifier: "0xWalletAddress", // or zora handle
});

// response.data.handle, .displayName, .bio, .username, .website
// response.data.avatar?.{ small, medium, blurhash }
// response.data.publicWallet (wallet address)
// response.data.socialAccounts (Instagram, TikTok, Twitter/X, Farcaster)
// response.data.linkedWallets[]
// response.data.creatorCoin?.{ address, marketCap, marketCapDelta24h }
```

### getProfileCoins -- Coins Created by User

```typescript
import { getProfileCoins } from "@zoralabs/coins-sdk";

const response = await getProfileCoins({
  identifier: "0xWalletAddress",
  count: 20,
  after: undefined,
  chainIds: [8453],
  platformReferrerAddress: undefined,
});

// response.data.createdCoins.count
// Each coin: id, name, symbol, description, address, chainId,
//   totalSupply, totalVolume, volume24h, marketCap, marketCapDelta24h,
//   uniqueHolders, createdAt, mediaContent, uniswapV4PoolKey, uniswapV3PoolAddress
```

### getProfileBalances -- User Holdings

```typescript
import { getProfileBalances } from "@zoralabs/coins-sdk";

const response = await getProfileBalances({
  address: "0xWalletAddress",
  count: 20,
  after: undefined,
});

// response.data.balances[].token (coin metadata)
// response.data.balances[].amount.{ amountRaw, amountDecimal }
// response.data.balances[].valueUsd
// Pagination: pageInfo.endCursor
```

---

## Explore Queries

All explore functions accept:

```typescript
type ExploreQueryOptions = {
  after?: string;   // pagination cursor
  count?: number;   // default 20
};
```

### Available Functions

| Function                      | Description                                |
|-------------------------------|--------------------------------------------|
| `getCoinsTopGainers`          | Highest market cap increase (24h)          |
| `getCoinsTopVolume24h`        | Highest trading volume (24h)               |
| `getCoinsMostValuable`        | Ranked by market cap                       |
| `getCoinsNew`                 | Most recently created                      |
| `getCoinsLastTraded`          | Most recently traded                       |
| `getCoinsLastTradedUnique`    | Traded by unique traders most recently     |
| `getCreatorCoins`             | Coins by new creators                      |
| `getMostValuableCreatorCoins` | Most valuable creator-launched coins       |

### Usage Pattern

```typescript
import { getCoinsTopGainers } from "@zoralabs/coins-sdk";

const response = await getCoinsTopGainers({ count: 20 });

response.data?.zora20Tokens?.forEach((coin) => {
  // coin.name, coin.symbol, coin.address, coin.chainId
  // coin.marketCap, coin.marketCapDelta24h, coin.volume24h
  // coin.totalSupply, coin.totalVolume, coin.uniqueHolders
  // coin.creatorAddress, coin.createdAt
});

// Pagination: response.data?.pagination?.cursor
```

### ListType Values (low-level /explore endpoint)

```
TOP_GAINERS, TOP_VOLUME_24H, MOST_VALUABLE, NEW, OLD,
LAST_TRADED, LAST_TRADED_UNIQUE, FEATURED, FEATURED_VIDEOS,
NEW_CREATORS, MOST_VALUABLE_CREATORS, FEATURED_CREATORS
```

---

## Leaderboard Queries

### getFeaturedCreators

```typescript
import { getFeaturedCreators } from "@zoralabs/coins-sdk";

const response = await getFeaturedCreators({
  year: undefined,  // defaults to current year
  week: undefined,  // defaults to current ISO week (1-52)
  first: 10,
  after: undefined,
});

const creators = response.data?.traderLeaderboardFeaturedCreators?.edges?.map(
  (e: any) => e.node
);
```

### getTraderLeaderboard

```typescript
import { getTraderLeaderboard } from "@zoralabs/coins-sdk";

const response = await getTraderLeaderboard({
  year: undefined,
  week: undefined,
  first: 10,
  after: undefined,
});

const traders = response.data?.exploreTraderLeaderboard?.edges?.map(
  (e: any) => e.node
);
```

---

## Platform Referrer & Rewards

### Fee Structure (v2.2.0+, Content Coins & Creator Coins)

| Reward Type        | % of Total Fees | % of Market Rewards |
|--------------------|-----------------|---------------------|
| Platform Referral  | 20%             | 25%                 |
| Trade Referral     | 4%              | 5%                  |

### Platform Referral (permanent, set at coin creation)

```typescript
const result = await createCoin({
  call: {
    creator: creatorAddress,
    name: "My Coin",
    symbol: "MYCN",
    metadata: { type: "RAW_URI", uri: "ipfs://..." },
    currency: "ETH",
    platformReferrer: "0xYOUR_PLATFORM_ADDRESS" as Address, // <-- set here
  },
  walletClient,
  publicClient,
});
// platformReferrer earns 20% of fees on ALL future trades of this coin
```

### Trade Referral (per-swap, set via hookData)

At the contract level, encode the recipient address as `hookData`:
```
abi.encode(YOUR_PLATFORM_ADDRESS)
```
Include in swap parameters through the Uniswap V4 router. Earns 4% on that specific trade only.

### Distribution

Rewards are automatic -- amounts convert to backing currency (typically ZORA) and transfer directly per trade. No manual claiming required.

### Creator Vesting

Creators receive tokens with linear vesting over 5 years. Call `claimVesting()` to claim accrued tokens.

---

## Metadata Format (EIP-7572)

Coins use EIP-7572 metadata (extends EIP-721/EIP-1155).

### Required JSON Structure

```json
{
  "name": "Coin Name",
  "description": "Description text",
  "image": "ipfs://bafkrei...",
  "properties": {
    "category": "social"
  }
}
```

### Extended Format (with media)

```json
{
  "name": "Coin Name",
  "description": "Description text",
  "image": "ipfs://bafkrei...",
  "animation_url": "ipfs://bafkrei...",
  "content": {
    "mime": "video/mp4",
    "uri": "ipfs://bafkrei..."
  },
  "properties": {
    "category": "social"
  }
}
```

- `image` -- required, IPFS URI preferred
- `content.mime` + `content.uri` -- for non-image assets; preferred over `animation_url`
- URI schemes: `ipfs://` (preferred) or `https://` (not recommended)

### Validation

```typescript
import { validateMetadataURIContent } from "@zoralabs/coins-sdk";

// Validates URI is accessible and content matches schema
// Supports https:// and ipfs:// -- rejects data: URIs
const isValid = await validateMetadataURIContent("ipfs://bafkrei...");
```

---

## Public REST API

Base URL: `https://api-sdk.zora.engineering/api`

Interactive docs: `https://api-sdk.zora.engineering/docs`

### Authentication

```
Header: api-key: your-api-key-here
```

### Example Endpoints

```
GET /coin?address=0xCoinAddress&chain=8453
GET /profile?identifier=0xUserAddress
```

### Python Example

```python
import requests

headers = {"api-key": "your-api-key-here"}
response = requests.get(
    "https://api-sdk.zora.engineering/api/coin",
    headers=headers,
    params={"address": "0xCoinAddress", "chain": 8453}
)
coin_data = response.json()
```

---

## Types Reference

### Zora20Token (query response)

```typescript
type Zora20Token = {
  id: string;
  platformBlocked: boolean;
  name: string;
  description: string;
  address: string;
  symbol: string;
  totalSupply: string;
  totalVolume: string;
  volume24h: string;
  createdAt?: string;
  creatorAddress?: string;
  chainId?: number;
  marketCap?: string;
  marketCapDelta24h?: string;
  uniqueHolders?: number;
  poolCurrencyToken?: {
    address?: string;
    name?: string;
    decimals?: number;
  };
  tokenPrice?: object;
  creatorProfile?: object;
  mediaContent?: {
    previewImage?: string;
  };
  uniswapV4PoolKey?: object;
  uniswapV3PoolAddress?: string;
  creatorEarnings?: Array<{
    amount: {
      currencyAddress: string;
      amountRaw: string;
      amountDecimal: number;
    };
    amountUsd?: string;
  }>;
};
```

### CreateCoinResult

```typescript
type CreateCoinResult = {
  hash: string;
  receipt: TransactionReceipt;
  address?: string;
  deployment?: {
    coin: string;
    creator: string;
    poolAddress: string;
  };
  chain: Chain;
};
```

### CreateCoinCallResponse

```typescript
type CreateCoinCallResponse = {
  calls: Array<{
    to: Address;
    data: Hex;
    value: bigint;
  }>;
  predictedCoinAddress: Address;
};
```

### UpdateCoinURIArgs

```typescript
type UpdateCoinURIArgs = {
  coin: Address;
  newURI: string;
};
```

### Network

- **Chain**: Base mainnet (chainId: 8453)
- **Testnet**: Base Sepolia (limited currency support)

---

## Exports Summary

```typescript
// Coin creation
export { createCoin, createCoinCall, CreateConstants, getCoinCreateFromLogs };

// Trading
export { tradeCoin, createTradeCall };

// Updates
export { updateCoinURI, updateCoinURICall, updatePayoutRecipient };

// Metadata
export {
  createMetadataBuilder,
  createZoraUploaderForCreator,
  validateMetadataURIContent,
};

// Queries - single coin
export { getCoin, getCoins, getCoinHolders, getCoinSwaps, getCoinComments };

// Queries - profile
export { getProfile, getProfileCoins, getProfileBalances };

// Queries - explore
export {
  getCoinsTopGainers,
  getCoinsTopVolume24h,
  getCoinsMostValuable,
  getCoinsNew,
  getCoinsLastTraded,
  getCoinsLastTradedUnique,
  getCreatorCoins,
  getMostValuableCreatorCoins,
};

// Queries - leaderboard
export { getFeaturedCreators, getTraderLeaderboard };

// Config
export { setApiKey };

// Types
export type {
  CreateCoinArgs,
  MetadataType,
  ContentCoinCurrency,
  StartingMarketCap,
  TradeParameters,
  TradeCurrency,
  UpdateCoinURIArgs,
};
```

---

## Gaps / Not Fetched

- The GitHub README for the coins-sdk package itself (404 at /ourzora/coins-sdk; lives inside the zora-protocol monorepo at /packages/coins-sdk)
- Contract architecture details (hooks, hook registry, liquidity migration) -- available at docs.zora.co/coins/contracts/*
- Some response type fields are typed as `object` in docs -- inspect at runtime or check source for full types
- Smart wallet support for trading is listed as planned but not yet available
