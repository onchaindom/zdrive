# Z:Drive MVP One-Pager (Updated)

## Product

**Z:Drive** is an artist-first release platform on Zora where creators “coin” *releases* (not posts): PDFs, 3D print files, fonts, GitHub releases, zips, etc. A release is a **Zora content coin** whose metadata describes a bundle of assets and a license policy. Z:Drive emphasizes **viewing + interaction** first (Are.na-like), with collecting/trading secondary.

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

* `content` for the primary preview target file (PDF/GLB/STL/font), when applicable:

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
  "content": { "mime": "model/stl", "uri": "ipfs://<stl-file>" },

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

## Native Preview (guaranteed)

* **Images**: JPG, PNG, GIF, WebP — full-size viewer with zoom.
* **Video**: MP4, WebM — native HTML5 video player.
* **PDF**: embedded viewer.
* **3D**:

  * **GLB/GLTF**: three.js viewer
  * **STL**: three.js STL viewer (neutral shading, auto-fit, orbit controls)
* **GitHub**: render README + show repo/ref metadata (external link model).

## Download-only

* ZIP: show manifest (file list if feasible), hash/size, download link.
* Everything else: download link + metadata.

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
   * Optional preview target file (image/video/PDF/GLB/STL) OR GitHub external preview
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
  * see a native preview for images/video/PDF/GLB/STL/GitHub,
  * see license status based on their release-coin balance,
  * collect/trade from the release page.
* No schema migrations required to add richer collection pages later.

---

# Phase 2 (Roadmap)

* Optional server-side conversion pipeline (OBJ → GLB)
* Stronger feed via event indexing
* Optional “license receipt” proof page for qualifying holders
* Optional onchain “collection coin” as an augmentation only (must not replace `collection.id` grouping)
