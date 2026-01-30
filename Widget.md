# Z:Drive Feature One-Pager — Coin Trade Widget (No Comments)

## Feature

A reusable **Coin Trade Widget** component that can be embedded on any Z:Drive Release page (and Creator/Studio pages) to provide a Zora.co-style experience: **Buy/Sell + market stats + holders + activity + details**—implemented **SDK-first** using Zora Coins SDK + official APIs. ([docs.zora.co](https://docs.zora.co/coins/sdk))

## Goals

* Let users **trade a coin without leaving Z:Drive** (buy/sell).
* Show **market context**: market cap, volume, supply, unique holders, creator earnings (when available).
* Show **network context**: holders list + swap/activity history.

## Hard Constraints

* **No comments UI** in MVP (posting isn’t documented in the SDK; remove entirely).
* **No embedded Zora.co iframe/widget**; recreate UI using SDK queries + SDK write calls.
* **No custom trading contracts / routing** beyond Zora’s supported swap path (SDK + protocol).
* **Base mainnet default** (chain id 8453 in SDK examples). ([docs.zora.co](https://docs.zora.co/coins/sdk/queries/coin))

---

## Component API

`<CoinTradeWidget coinAddress chainId=8453 defaultTab="trade" mode="full" />`

### Modes

* `full`: stats + trade + tabs
* `compact`: stats + quick buy/sell (no tabs)

### Placement

* Release page: right-side panel (Are.na style), collapsible on mobile.
* Studio page: compact mode per release; expands to full on click.

---

## Data Requirements (Reads)

### Primary coin info (header stats)

Use `getCoin({ address, chain })` to power:

* Name, symbol, description
* Market cap, total volume, 24h volume
* Total supply, createdAt, unique holders
* Creator address + creator earnings (if present)
* Preview image/media if available
* Respect `platformBlocked` / filtering flags if returned ([docs.zora.co](https://docs.zora.co/coins/sdk/queries/coin))

### Tabs

**Holders**

* `getCoinHolders({ address, chain, first, after })` with pagination cursor. ([docs.zora.co](https://docs.zora.co/coins/sdk/queries/coin))

**Activity**

* `getCoinSwaps({ address, chain, first, after })` swap history feed. ([docs.zora.co](https://docs.zora.co/coins/sdk/queries/coin))

**Details**

* Combine `getCoin` fields (addresses, supply, createdAt, currency info) + link out to Zora + explorer.

### REST fallback (optional)

If the app prefers server-side fetching, use Zora’s **Public REST API**, which mirrors SDK query functionality. ([docs.zora.co](https://docs.zora.co/coins/sdk/public-rest-api))

---

## Trading (Writes)

### Core actions

* **Buy** coin using selected currency (ETH or coin-supported currency)
* **Sell** coin to receive selected currency

Implementation uses **Coins SDK write flow** (viem-based) and/or official SDK-supported swap path. ([docs.zora.co](https://docs.zora.co/coins/sdk))

### Slippage + safety

* Slippage setting (default 1%).
* Show estimated receive + minimum receive.
* Surface errors clearly:

  * insufficient funds
  * user rejected signature
  * network mismatch
  * gas estimation failure
  * approval/permit needed (if applicable)

### Trade referral rewards (Z:Drive revenue)

* Include Z:Drive address in **hookData** for each swap to earn **Trade Referral Rewards** (per swap). ([docs.zora.co](https://docs.zora.co/coins/contracts/earning-referral-rewards))

---

## UX Spec (Zora-like, minus comments)

### Header strip

* Market cap
* Total volume + 24h volume
* Unique holders
* Creator earnings (if present)
* “Copy address” + chain badge

### Trade panel

* Buy / Sell toggle
* Amount input
* Currency selector
* Preset chips (0.001 / 0.01 / 0.1 / Max)
* Primary CTA button (Buy/Sell)
* Slippage control

### Tabs (3 tabs)

* **Holders**
* **Activity**
* **Details**

---

## Performance & Caching

* Cache `getCoin` response for short TTL (15–30s).
* Lazy-load tab content on first open.
* Cursor-based pagination; avoid refetching loaded pages.

---

## Acceptance Criteria

* Given a `coinAddress`, widget renders:

  * Header stats (from `getCoin`)
  * Trade panel with Buy/Sell and executes swaps successfully on Base
  * Tabs: Holders (read), Activity (read), Details
* Trades include trade-referral hookData (Z:Drive address). ([docs.zora.co](https://docs.zora.co/coins/contracts/earning-referral-rewards))
* No comments UI, no comment reads/writes.
* No custom contracts, no non-SDK trading routes.

---

## Out of Scope (MVP)

* Comments (read or write)
* Charts
* Advanced routing (multi-hop coin-to-coin UX), limit orders, etc.
* Smart-wallet-only flows (if SDK limitations apply)

If you want, I can also rewrite the dev ticket bundle to remove all comment-related tasks and tighten acceptance tests around the 3 remaining tabs.



## Dev ticket bundle — Z:Drive Coin Trade Widget (No Comments)

SDK-first build plan for a reusable widget that provides **stats + buy/sell + holders + activity + details** (no comments anywhere).

---

# Epic A — Data layer + types

### A1 — Add Zora Coins SDK + API key support

**Goal:** Reliable reads in production.

**Tasks**

* Install `@zoralabs/coins-sdk`.
* Initialize SDK with chain (Base) + `setApiKey(...)` from env where appropriate (server-side preferred).
* Add a feature flag fallback: if no key, still query in dev.

**Acceptance**

* `getCoin` works in dev without key.
* With key enabled, app uses it for production builds.

---

### A2 — Define widget-facing UI types (thin wrappers)

**Goal:** Keep UI stable if SDK response shape changes.

**Types**

* `CoinHeaderStats`

  * `name`, `symbol`, `address`
  * `marketCap`, `totalVolume`, `volume24h`
  * `totalSupply`, `uniqueHolders`
  * `creatorAddress`
  * `creatorEarnings[]?`
  * `media.previewImage?`
  * `platformBlocked?`
* `CoinHolderRow`

  * `holderAddress`
  * `balance`
  * `profile?`
* `CoinSwapRow`

  * `txHash`
  * `timestamp`
  * `side` (buy/sell)
  * `amountIn`, `amountOut`
  * `traderAddress`

**Acceptance**

* A pure mapper converts SDK responses → these UI types.
* Widget renders solely from UI types (no direct SDK shape assumptions in components).

---

### A3 — Build query hooks with caching + pagination

**Goal:** Tab content loads lazily and stays fast.

**Hooks**

* `useCoin(address, chainId=8453)` → `getCoin`
* `useCoinHolders(address, pageSize, cursor)` → `getCoinHolders` (cursor pagination)
* `useCoinSwaps(address, pageSize, cursor)` → `getCoinSwaps` (cursor pagination)

**Caching**

* Cache `getCoin` for 15–30s.
* Cache holders/swaps pages keyed by cursor.
* Lazy-load holders/swaps on first tab open.

**Blocked coins**

* If `platformBlocked=true`, widget should render a disabled/hidden state and prevent trades.

**Acceptance**

* Switching tabs doesn’t refetch previously loaded pages.
* Refresh button refetches latest for active tab.

---

# Epic B — Trade execution (Buy/Sell)

### B1 — Wallet connect + chain gating

**Goal:** Trading works with minimum friction.

**Tasks**

* Add wallet connect requirement only when user initiates a trade.
* Detect wrong network; present “Switch to Base” action.
* Persist trade inputs across connect/switch.

**Acceptance**

* User can connect wallet, switch chain, and continue trade without losing amount.

---

### B2 — Trade form UI + slippage

**Goal:** Clear buy/sell experience.

**UI**

* Buy/Sell toggle
* Amount input
* Currency selector (ETH default; extend if SDK exposes alternatives for that coin)
* Preset chips (0.001 / 0.01 / 0.1 / Max)
* Slippage control (default 1%)

**Acceptance**

* Slippage setting persists per user session (local storage ok).
* “Max” uses wallet balance (for sell: coin balance; for buy: ETH balance minus gas buffer).

---

### B3 — Quote + minimum receive display

**Goal:** Show estimated receive and slippage-protected minimum.

**Tasks**

* Add quote request function (SDK-supported quoting path, or compute from available SDK data if exposed).
* Display:

  * Estimated receive
  * Minimum receive (post-slippage)
* Disable CTA while quote is stale/loading.

**Acceptance**

* Quote updates on amount/slippage change.
* Errors show “Unable to quote” with retry.

---

### B4 — Execute swap + referral hookData

**Goal:** Trades execute and earn trade referral rewards.

**Tasks**

* Implement swap execution via Coins SDK write flow.
* Encode Z:Drive trade referral address into `hookData` per swap.
* Display tx status:

  * submitted (tx hash link)
  * confirmed
  * failed

**Error handling**

* insufficient funds
* user rejected signature
* gas estimation failure
* allowance/permit required (if applicable)
* network mismatch

**Acceptance**

* Successful trade updates:

  * header stats on refresh
  * Activity tab shows new swap after refetch
* Trades include referral hookData every time.

---

# Epic C — Widget UI (Zora-like, no comments)

### C1 — Widget shell + header stats

**Goal:** Zora-like market panel top section.

**UI**

* Title (name/symbol)
* Copy address button
* Chain badge (Base)
* Stats row:

  * Market cap
  * Total volume + 24h volume
  * Unique holders
  * Creator earnings (if present)

**Acceptance**

* Handles missing optional fields gracefully.
* Shows skeleton loading state.

---

### C2 — Trade panel component

**Goal:** A consistent buy/sell module.

**Tasks**

* Build `<TradePanel />` with:

  * toggle, amount input, presets, slippage
  * CTA (Buy/Sell)
  * quote + min receive area
* Add clear states:

  * disconnected → “Connect wallet”
  * wrong chain → “Switch to Base”
  * blocked coin → disabled + message
  * insufficient funds → disabled + message

**Acceptance**

* Works on mobile (collapsible / bottom sheet layout).
* Keyboard friendly.

---

### C3 — Tabs (Holders / Activity / Details)

**Goal:** Provide non-comment context.

**Tabs**

1. **Holders**

   * paginated table/list: address, balance, optional profile
2. **Activity**

   * paginated list of swaps: buy/sell, amounts, time, trader
3. **Details**

   * coin address, creator address, createdAt, supply
   * links: “View on Zora”, “View on Explorer”

**Acceptance**

* Each tab lazy-loads on first open.
* Pagination works (Load more / infinite scroll).
* Empty states are informative.

---

# Epic D — Embed + reuse across Z:Drive

### D1 — Embed on Release page (full mode)

**Goal:** Release pages include the widget in the right rail.

**Tasks**

* Add `<CoinTradeWidget mode="full" coinAddress />` to release page layout.
* Desktop: sticky right rail.
* Mobile: collapsed panel that expands.

**Acceptance**

* Preview content remains primary; widget feels secondary but accessible.

---

### D2 — Compact mode for Studio pages

**Goal:** Avoid mounting heavy widgets repeatedly.

**Tasks**

* Build `mode="compact"`:

  * header stats + quick buy/sell
  * “Expand” button opens full widget (modal/drawer)
* Ensure only one full widget mounts at a time.

**Acceptance**

* Studio page remains performant even with many releases.

---

# Standard states

### Loading

* Header skeleton
* Trade form disabled until coin data ready
* Tab skeleton on first open

### Empty

* Holders/Activity show “No data yet” with brief context

### Blocked

* If `platformBlocked`, hide trades and show “This coin is not available on this platform.”

---

# Definition of Done

* Widget works end-to-end on Base:

  * renders stats from `getCoin`
  * executes buy/sell swaps successfully
  * shows holders + swap activity with pagination
  * details tab links out correctly
  * no comment UI anywhere
* Referral hookData included on every trade.
* No custom contracts or non-SDK trading paths.

---

If you want, next I can turn this into a Jira-ready set of tickets with story points + clear dependencies (Data → UI shell → Trade → Tabs → Embeds) and a minimal QA checklist.
