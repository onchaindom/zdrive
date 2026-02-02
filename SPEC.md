# Z:Drive MVP One-Pager (Updated)

## Product

**Z:Drive** is an artist-first release platform on Zora where creators "coin" *releases* (not posts): images, videos, PDFs, 3D print files, GitHub releases, zips, etc. A release is a **Zora content coin** whose metadata describes a bundle of assets and a license policy. Z:Drive emphasizes **viewing + interaction** first (Are.na-like), with collecting/trading secondary.

## Goals

1. Make it easy for indie creators of “things” to publish releases as Zora content coins with **arbitrary assets**.
2. Provide a **beautiful release page** with native preview for key formats.
3. Support **collection/series grouping** that is stable forever (no migrations).
4. Support **a16z “Can’t Be Evil” (CBE) licensing** with an optional **hold threshold gate** based on **release coin** balance.
5. Provide an **artist-first feed** driven by holdings: creator coin holdings ≈ “following”; content coin holdings ≈ “likes/collects”.

## Hard Constraints (MVP)

* **SDK-first:** All coin creation, queries, and trading use **Zora Coins SDK** and Zora’s default/official endpoints. No custom token contracts, no custom AMMs, no bespoke licensing contracts, no bespoke bundle-checkout mechanics.
* **No custom “pair with arbitrary community coin” mechanics** (only what Zora supports via SDK).
* **No DRM / download gating** in MVP (licensing is public signaling + social/legal enforcement).
* **Collections are metadata + UI only** (no onchain collection contract in MVP).

---

# Core Concepts

## Release = Content Coin

Each release is a **Zora content coin** created via Zora Coins SDK. Creators can:

* Pair with their **creator coin** (preferred), or
* Create a standalone release paired with **ETH** if they don’t have/don’t want a creator coin.

## Collections / Series (Future-Proofed)

A release can belong to **at most one** collection.

**Collection identity must be stable and unspoofable:**

* `collection.id = "<chainId>:<creatorAddress>:<collectionSlug>"`

Example: `8453:0xabc123...:tyrolean-chair-studies`

**Collection page logic:** list all releases where `properties.zdrive.collection.id` matches exactly.

---

# Licensing (a16z CBE)

**License system = a16z Crypto “Can’t Be Evil” (CBE) NFT licenses.**
These license texts are published immutably (canonical references commonly point to **Arweave**) and are intended to be linkable/verifiable by reference (URI + license name/type).

## MVP License Behavior

* Baseline state: **All rights reserved unless you qualify.**
* Creator selects **one** CBE license type for the release.
* Optional gate: viewer must hold **≥ minBalance** of the **release coin** to be shown as “Licensed under CBE X.”
* If viewer does not qualify (or gate enabled and not met): show “All rights reserved.”

**No custom licensing contracts in MVP.** Z:Drive stores:

* `cbe.type` (which CBE license)
* `cbe.textUrl` (canonical license text URI, e.g., Arweave)
* optional gate config

---

# Metadata Contract (Z:Drive Schema v1)

Use standard token metadata fields for display + preview, and store Z:Drive-specific data under `properties.zdrive`. Store “preview target” separately from attachments.

### Required

* `name` (string)
* `description` (string)
* `image` (cover/thumbnail; required)
* `properties.zdrive.schemaVersion = 1`

### Optional but recommended

* `content` for the primary preview target file (image/video/PDF/GLB/GLTF), when applicable:

  * `content.mime`
  * `content.uri`
* `properties.zdrive.release.assets[]` for attachments (any file types)
* `properties.zdrive.release.external[]` for offsite sources (GitHub, etc.)
* `properties.zdrive.collection` for grouping + ordering
* `properties.zdrive.license` for CBE + optional gate

### Canonical schema (example)

```json
{
  "name": "Tyrolean Chair Studies #12",
  "description": "Ongoing release series…",
  "image": "ipfs://<cover>",
  "content": { "mime": "model/gltf-binary", "uri": "ipfs://<glb-file>" },

  "properties": {
    "zdrive": {
      "schemaVersion": 1,

      "release": {
        "assets": [
          {
            "name": "source.zip",
            "mime": "application/zip",
            "uri": "ipfs://<zip>",
            "sha256": "<hex>",
            "size": 12345678
          }
        ],
        "external": [
          {
            "type": "github",
            "url": "https://github.com/org/repo",
            "ref": "v1.0.0"
          }
        ]
      },

      "license": {
        "baseline": "ALL_RIGHTS_RESERVED",
        "cbe": {
          "type": "CBE_COMMERCIAL",
          "textUrl": "arweave://<canonical-license-uri>"
        },
        "gate": {
          "enabled": true,
          "token": "RELEASE_COIN",
          "minBalance": "10000"
        }
      },

      "collection": {
        "id": "8453:0xCreator:tyrolean-chair-studies",
        "slug": "tyrolean-chair-studies",
        "title": "Tyrolean Chair Studies",
        "ordering": { "index": 12 }
      }
    }
  }
}
```

### Schema stability rules

* Always include `schemaVersion`.
* Never remove fields; only add new optional fields in future versions.

---

# Supported Formats (MVP)

## Native Preview (empirically verified against Zora IPFS endpoint)

* **Images**: JPG, PNG, GIF, WebP, SVG — full-size viewer with zoom.
* **Video**: MP4 — native HTML5 video player.
* **PDF**: embedded viewer.
* **3D**: GLB/GLTF — three.js viewer with orbit controls + error boundary.
* **GitHub**: render README + show repo/ref metadata (external link model).

## Dropped from MVP (Zora IPFS rejects these)

* **STL**: Zora's IPFS endpoint does server-side magic-byte sniffing; binary STL has no recognizable magic bytes → rejected as `application/octet-stream`. Use GLB/GLTF instead.
* **WebM**: Failed empirical upload test against live Zora endpoint.
* **ZIP**: Explicitly blocked by Zora's IPFS endpoint even when correctly detected.

## Download-only

* Everything else: download link + metadata.

## Upload Architecture

* **Zora-only**: All uploads go through Zora's native IPFS uploader (`ipfs-uploader.zora.co`). No Pinata fallback.
* **Server-side MIME sniffing**: Zora ignores client-sent MIME types and detects format from raw bytes. `ensureCorrectMime()` still needed for GLB/GLTF because browsers assign `application/octet-stream` to these, and the multipart form boundary needs a recognizable MIME.
* **IPFS gateway**: `magic.decentralized-content.com` (Zora's gateway, CORS-friendly for binary files like GLB).

---

# Core Pages

## 1) Creator “Studio” Page

* Creator identity / avatar
* Creator coin info (if exists)
* Releases grid, filter by:

  * Collection
  * File type (Image / Video / PDF / 3D / GitHub / Zip / Other)
* “Follow strength” indicator = creator coin balance tiers (UI-only)

## 2) Release Page (Are.na-like)

Main column: preview (PDF/3D/font/specimen/README)
Side panel:

* Release metadata (creator, created date, formats, hashes)
* License panel (CBE + gate status; shows qualification)
* Collect/trade widget (secondary CTA)
* Collection context (link to collection page + position/index)

## 3) Collection Page

* Collection title + cover (use first release cover if none provided)
* Releases list/grid
* Ordering:

  * If `ordering.index` exists, sort ascending
  * Else sort by created date

## 4) Feed

Holdings-driven activity:

* New releases from creators whose **creator coin** viewer holds (weighted by balance)
* Collects by those creators
* Collects *of* those creators’ releases by others

Tabs:

* **Feed** (default)
* **Explore** (new releases chronologically)
* **Markets** (volume/mcap sorts; secondary)

---

# Key Flows

## Create Release

1. Connect wallet (Base, EOA).
2. Choose pairing mode:

   * “Pair with my creator coin” (default)
   * “Standalone (ETH)” (fallback)
3. Upload:

   * Cover image (required)
   * Optional preview target file (image/video/PDF/GLB/GLTF) OR GitHub external preview
   * Attachments (any)
4. Set collection (optional):

   * Create new collection (slug/title)
   * Or choose existing (by `collection.id`)
   * Optional ordering index
5. Set license:

   * Choose a16z CBE type
   * Optional gate: min release-coin balance
6. Mint/create content coin via Zora Coins SDK (standard functions only):

   * Metadata as `RAW_URI`
   * Set platform referrer to Z:Drive (referral rewards)
7. Confirm + land on Release Page.

## View Release (license evaluation)

* Fetch viewer’s release-coin balance.
* If balance ≥ minBalance (or no gate): show “Licensed under CBE X”
* Else: “All rights reserved”
* No download gating beyond what’s public.

---

# Auth / “Login”

* **User login (preferred / MVP):** wallet connect = login.
* Optional: **SIWE** for a server session if needed for drafts, preferences, saved views.
* **Zora developer access:** backend uses a Zora API key obtained via Zora’s official developer settings/login (for production reliability).

---

# Storage

* Use **Zora uploader** for assets by default (no custom storage stack in MVP).
* Store asset URIs in metadata.
* For very large assets or GitHub-based releases, store as `external[]` links.

---

# Monetization

* **Platform referral rewards:** set Z:Drive as platform referrer at coin creation (SDK-supported).
* **Trade referral rewards:** set when routing trades via the app (SDK-supported).

---

# Acceptance Criteria (MVP)

* A creator can mint a release coin with:

  * cover image,
  * any number of attachments,
  * optional preview target (image/video/PDF/3D) or GitHub external,
  * optional collection membership (stable `collection.id`),
  * a16z CBE license with optional gate (release coin balance).
* A viewer can:

  * browse creator pages, releases, collections,
  * see a native preview for images/video/PDF/GLB/GLTF/GitHub,
  * see license status based on their release-coin balance,
  * collect/trade from the release page.
* No schema migrations required to add richer collection pages later.

---

# Implementation Status

All six phases of the initial build plus post-merge fixes are complete and merged to `main`.

## Phase 1: Upload Pipeline Migration ✅

* Replaced Pinata IPFS with Zora native uploader (`createZoraUploaderForCreator`)
* New `lib/uploads/zoraUploader.ts`: `ZoraUploadService` with parallel uploads, retry, SHA-256 hashing
* Rewrote `lib/zora/createRelease.ts` to use new service
* Deleted `app/api/upload/`, `app/api/upload-json/`, `lib/uploads/ipfsUploader.ts`
* Fixed `publicClient` type cast for Base OP Stack chain types
* Tests: `upload-pipeline.test.ts`, `metadata.test.ts`, `zdrive-types.test.ts`

## Phase 2: Release Detail Page ✅

* Created `PreviewRenderer` dispatcher: routes by MIME type → ImageViewer, VideoPlayer, PDFViewer, ThreeDViewer, GitHubPreview, or fallback
* Created `ImageViewer` (click-to-zoom fullscreen) and `VideoPlayer` (HTML5 with poster frame)
* Rewrote `app/[creator]/[releaseAddress]/page.tsx`: two-column responsive layout with preview, trade widget, license panel, collection context, metadata details
* Updated `CollectButton` with inline `CoinTradeWidget` instead of external Zora link
* Removed `FontViewer` (fonts no longer a supported preview type)
* Tests: `preview-renderer.test.ts`

## Phase 3: Create Flow Improvements ✅

* Created `hooks/useCreatorCollections.ts`: scans existing releases for collection metadata
* Updated `CollectionPicker`: "Existing / Create New" toggle with auto-populated fields
* Added upload progress state with phase indicators to create page
* Updated preview file accept types: added image/video, removed fonts

## Phase 4: Cleanup ✅

* Deleted `FontViewer.tsx`
* Updated `PREVIEWABLE_MIMES` (removed fonts, added image/video)
* Bounded metadata cache: `MAX_CACHE_SIZE = 200` with LRU eviction
* Verified all Pinata references removed

## Phase 5: Error Handling ✅

* Created `ErrorBoundary` class component (`components/ui/ErrorBoundary.tsx`)
* Wrapped `PreviewRenderer` on release page
* Added `retry: 2` to `useRelease` and `useCoin` hooks
* Added `staleTime: 30_000` to `useRelease`

## Phase 6: Polish ✅

* Fixed unescaped apostrophe build error
* Added `Suspense` boundary for search page (`useSearchParams`)
* Type safety audit: only 3 justified `as unknown` casts remain
* Updated marketing copy (fonts → images/videos)
* Production build passes, 85 tests passing across 6 test files

## Post-Phase Fix: BigInt Balance Formatting ✅

* `formatTokenBalance` now correctly handles 18-decimal ERC-20 balances
* API returns raw integers like `"990000000000000000000"` (= 990 tokens); previously `parseFloat` treated the whole string as a regular number
* Now strips API decimal noise (`.split('.')[0]`), converts from 18-decimal, formats with K/M/B abbreviations
* Tests: `format-balance.test.ts` (11 tests)

## Post-Merge: Upload Strategy & Viewer Fixes ✅

* Empirically tested 15+ MIME/magic-byte combinations against live Zora IPFS endpoint
* Dropped STL (no magic bytes), WebM (failed test), ZIP (explicitly blocked)
* Simplified to Zora-only upload (removed Pinata fallback code)
* Fixed Collect button ticker: uses real on-chain symbol from `useCoin()` instead of name truncation
* Switched IPFS gateway from `ipfs.io` to Zora's `magic.decentralized-content.com` (better CORS)
* Added `GLTFErrorBoundary` to ThreeDViewer for graceful failure with download fallback
* Removed STL viewer code, STLLoader import, and all STL/WebM/ZIP references across codebase
* 90 tests passing, clean production build

---

# Tech Stack

* **Framework**: Next.js 14 (App Router, `'use client'` pages)
* **Language**: TypeScript strict
* **Styling**: Tailwind CSS with `zdrive-*` design tokens
* **Auth**: Privy (`@privy-io/react-auth`)
* **Wallet**: wagmi v2 + viem (Base chain)
* **Blockchain**: Zora Coins SDK v0.4.0 (`@zoralabs/coins-sdk`)
* **3D**: Three.js via `@react-three/fiber` + `@react-three/drei`
* **State**: React Query (`@tanstack/react-query`)
* **Testing**: Vitest
* **Linting**: ESLint + Prettier

---

# Future Roadmap

* **Pinata fallback for exotic file types** (STL, WebM, ZIP etc.) — add when user demand is validated
* Optional server-side conversion pipeline (OBJ/STL → GLB)
* UX polish pass + design system / branding
* Stronger feed via event indexing
* Optional "license receipt" proof page for qualifying holders
* Optional onchain "collection coin" as an augmentation only (must not replace `collection.id` grouping)
