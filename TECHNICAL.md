# Z:Drive Technical Overview

This document covers the architecture decisions, technical choices, and lessons learned during development.

## Stack Overview

- **Framework**: Next.js 14.2.14 (App Router)
- **Authentication**: Privy (`@privy-io/react-auth`)
- **Blockchain**: wagmi v2 + viem (via `@privy-io/wagmi` adapter)
- **Network**: Base (Chain ID 8453)
- **Content Protocol**: Zora Coins SDK (`@zoralabs/coins-sdk`)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)

## Key Architecture Decisions

### Authentication: Privy over Raw Wagmi

**Decision**: Use Privy for authentication instead of raw wagmi connectors.

**Rationale**:
- Privy provides email + wallet login options (similar to Zora's main site)
- Handles embedded wallets for users without existing wallets
- Better UX than asking users to choose between MetaMask, Coinbase, WalletConnect, etc.
- Privy's `@privy-io/wagmi` adapter maintains full wagmi hook compatibility

**Implementation**:
```typescript
// app/providers.tsx
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';

// Use createConfig from @privy-io/wagmi, NOT from wagmi directly
export const wagmiConfig = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
});
```

**Lesson Learned**: When using Privy with wagmi, import `createConfig` and `WagmiProvider` from `@privy-io/wagmi`, not from `wagmi` directly. This ensures proper integration.

### Wallet Client Creation

**Decision**: Create wallet clients dynamically using Privy's `useWallets` hook.

**Rationale**:
- wagmi's `useWalletClient` doesn't work reliably with Privy
- Need to access the EIP-1193 provider from Privy's wallet object

**Implementation**:
```typescript
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';

const { wallets } = useWallets();
const wallet = wallets.find(w => w.address === address);
const provider = await wallet.getEthereumProvider();
const walletClient = createWalletClient({
  chain: base,
  transport: custom(provider),
  account: address,
});
```

### Dynamic Imports for Heavy Components

**Decision**: Use Next.js `dynamic()` with `ssr: false` for PDF and 3D viewers.

**Rationale**:
- `react-pdf` uses `Promise.withResolvers` which requires Node.js 22+
- Three.js and related 3D libraries have browser-only APIs
- SSR errors occur when these libraries are imported at build time

**Implementation**:
```typescript
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(
  () => import('@/components/preview/PDFViewer').then(mod => mod.PDFViewer),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
```

**Lesson Learned**: Any component using browser-only APIs or modern Node.js features should be dynamically imported with `ssr: false`.

### Next.js 14 vs 15 Params Handling

**Decision**: Use synchronous params access (Next.js 14 style).

**Rationale**:
- Next.js 15 changed `params` to be a Promise
- This project runs Next.js 14.2.14 where params is a plain object

**Correct (Next.js 14)**:
```typescript
interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  const { id } = params; // Direct access
}
```

**Incorrect (Next.js 15 style)**:
```typescript
// Don't use this in Next.js 14!
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params); // Causes "unsupported type" error
}
```

## Dependency Quirks

### MetaMask SDK + React Native Async Storage

**Problem**: MetaMask SDK tries to import `@react-native-async-storage/async-storage` in browser builds.

**Solution**: Add webpack fallback in `next.config.mjs`:
```javascript
webpack: (config) => {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    '@react-native-async-storage/async-storage': false,
  };
  return config;
}
```

### Peer Dependency Conflicts

**Problem**: Privy packages have strict peer dependencies that conflict with other packages (especially `ox` versions).

**Solution**: Use `--legacy-peer-deps` when installing:
```bash
npm install @privy-io/react-auth @privy-io/wagmi --legacy-peer-deps
```

### Next.js Image Remote Patterns

**Problem**: Zora content comes from various CDN domains that need whitelisting.

**Solution**: Add patterns to `next.config.mjs`:
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'ipfs.io' },
    { protocol: 'https', hostname: '*.ipfs.dweb.link' },
    { protocol: 'https', hostname: 'zora.co' },
    { protocol: 'https', hostname: '*.zora.co' },
    { protocol: 'https', hostname: '*.choicecdn.com' },
    { protocol: 'https', hostname: 'magic.decentralized-content.com' },
  ],
}
```

**Note**: Animated images (GIFs) will show a warning. Add `unoptimized` prop to `<Image>` if needed.

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key  # Optional, for higher rate limits
```

Get Privy App ID from: https://dashboard.privy.io

## Project Structure

```
zdrive/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── feed/                # Explore/feed page
│   ├── create/              # Release creation
│   ├── [creator]/           # Creator profile
│   │   └── [releaseAddress]/ # Release detail page
│   └── collection/          # Collection pages
├── components/
│   ├── layout/              # Header, Footer
│   ├── wallet/              # ConnectButton
│   ├── release/             # ReleaseCard, ReleaseGrid
│   ├── preview/             # PDFViewer, ThreeDViewer, GitHubPreview
│   ├── create/              # CreateForm, FileUploader
│   ├── trade/               # CollectButton
│   └── ui/                  # Button, Modal, LoadingSpinner
├── hooks/                   # Custom React hooks
├── lib/
│   ├── zora/               # Zora SDK integration
│   └── constants.ts        # App constants, utilities
└── types/                  # TypeScript definitions
```

## Common Issues & Solutions

### "Cannot find module './vendor-chunks/tslib.js'"
**Cause**: Corrupted `.next` cache
**Solution**: `rm -rf .next && npm run dev`

### "An unsupported type was passed to use()"
**Cause**: Using Next.js 15 `use(params)` pattern in Next.js 14
**Solution**: Access params directly without `use()`

### "Promise.withResolvers is not a function"
**Cause**: Library requires Node.js 22+ feature
**Solution**: Use `dynamic()` import with `ssr: false`

### Connect button shows no wallets
**Cause**: Using raw wagmi connectors that require browser extensions
**Solution**: Switch to Privy for authentication

### 404 errors for static chunks
**Cause**: Corrupted `.next` build cache
**Solution**: `rm -rf .next && npm run dev`

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Clear cache and restart
rm -rf .next && npm run dev
```

## Future Considerations

1. **Upgrade to Next.js 15**: Will require updating all page components to use `use(params)` for async params
2. **Node.js 22+**: Would eliminate need for dynamic imports of react-pdf
3. **Image Optimization**: Consider adding `unoptimized` prop for animated images or implementing custom loader
