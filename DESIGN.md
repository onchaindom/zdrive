# Z:DRIVE Design & Branding System

## Philosophy

Z:DRIVE is a quiet gallery meets digital archive for self-authored creative work. The interface should feel like a sophisticated file explorer designed by an artist — structured, honest, and minimal. The work itself shines; the UI gets out of the way. Where design decisions exist, they are warm, considered, and intentional. Interactions are smooth but barely perceptible — nothing calls attention to itself.

**North star**: Are.na's humility and restraint, applied to a creative monetization platform.

---

## 1. Color System

### Warm Grayscale — Sand/Stone Bias

The palette is essentially monochrome with a warm, earthy undertone. Color comes from the content, not the interface.

#### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#F7F5F2` | Page background — warm off-white with sand undertone |
| `--surface` | `#FDFCFA` | Cards, panels, elevated surfaces |
| `--surface-hover` | `#F0EDE8` | Hovered list rows, interactive surfaces |
| `--border` | `#E2DED8` | Hairline dividers, table borders |
| `--border-hover` | `#CCC7BF` | Hovered borders |
| `--text` | `#1A1917` | Primary text — near-black with warmth |
| `--text-secondary` | `#6B6560` | Secondary labels, metadata |
| `--text-muted` | `#9C9590` | Timestamps, tertiary info |
| `--accent` | `#1A1917` | Primary buttons, active states |
| `--accent-hover` | `#3D3A35` | Button hover |
| `--button-bg` | `#EAE6E0` | Flat button background (Are.na-style) |
| `--button-bg-hover` | `#DDD8D0` | Flat button hover |

#### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#171615` | Page background — warm near-black |
| `--surface` | `#1F1E1C` | Cards, panels |
| `--surface-hover` | `#2A2826` | Hovered surfaces |
| `--border` | `#2E2C29` | Hairline dividers |
| `--border-hover` | `#3E3B37` | Hovered borders |
| `--text` | `#EDEAE6` | Primary text — warm off-white |
| `--text-secondary` | `#9C9590` | Secondary labels |
| `--text-muted` | `#6B6560` | Timestamps, tertiary info |
| `--accent` | `#EDEAE6` | Primary buttons |
| `--accent-hover` | `#C5C0B8` | Button hover |
| `--button-bg` | `#2A2826` | Flat button background |
| `--button-bg-hover` | `#3E3B37` | Flat button hover |

#### No Accent Colors
There is no brand accent color. File type labels are plain text. Semantic colors (error red, success green) are used only where functionally necessary, and are muted/desaturated to stay within the warm palette.

---

## 2. Typography

### Typeface Selection

**Display/Headings**: **Inter** (Google Fonts)
- A variable sans-serif with excellent optical sizing, giving Z:DRIVE a clean, modern look
- Loaded via `next/font/google` in the demo layout (auto-optimized, self-hosted)
- Used for: page titles, release names, the Z:DRIVE wordmark, landing page statement
- Weights: Variable (100–900), Regular (400) primary
- CSS variable: `--font-display`
- Tailwind utility: `font-display` (maps to `var(--font-display)`)
- **Tracking**: `tracking-tight` at display sizes (18px+), `tracking-tighter` at hero sizes (32px+). Condensed tracking gives headings a confident, editorial feel.

**Body/UI**: **System sans-serif stack**
- `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Used for: body text, labels, metadata, buttons, navigation
- Clean, familiar, zero-load-time

**Monospace/Data**: **System monospace stack**
- `ui-monospace, 'SF Mono', 'Cascadia Code', 'Consolas', monospace`
- Used for: contract addresses, stats, numerical data, code

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 0.6875rem (11px) | 1.4 | Timestamps, fine print |
| `--text-sm` | 0.8125rem (13px) | 1.45 | Metadata, secondary labels, table data |
| `--text-base` | 0.9375rem (15px) | 1.5 | Body text, descriptions, list items |
| `--text-lg` | 1.125rem (18px) | 1.4 | Section headings, release titles in list (Inter, tracking-tight) |
| `--text-xl` | 1.5rem (24px) | 1.3 | Page titles (Inter, tracking-tight) |
| `--text-2xl` | 2rem (32px) | 1.2 | Landing page, hero text (Inter, tracking-tighter) |
| `--text-3xl` | 2.75rem (44px) | 1.1 | Landing page statement (Inter, tracking-tighter) |

### Font Weight Usage
- **Light (300)**: Never used — too wispy
- **Regular (400)**: Default for all body text and UI
- **Medium (500)**: Column headers, emphasis within body text
- **Bold (700)**: Sparingly — only for the strongest emphasis

---

## 3. Layout & Spacing

### Spacing Scale
Base unit: 4px. All spacing is multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps (icon to label) |
| `--space-2` | 8px | Within components (padding) |
| `--space-3` | 12px | Between related elements |
| `--space-4` | 16px | Standard component padding, list item vertical padding |
| `--space-5` | 20px | Between sections |
| `--space-6` | 24px | Page horizontal padding |
| `--space-8` | 32px | Major section breaks |
| `--space-12` | 48px | Page vertical padding |
| `--space-16` | 64px | Landing page vertical rhythm |

### Page Layout
- Max content width: `960px` (centered)
- Page horizontal padding: `24px`
- Density: compact/balanced — more Are.na, less luxury brand

### Grid (Release List)
The primary content display is a **stacked list**, not an image grid.

---

## 4. Components

### 4a. Release List (Primary Content Display)

A stacked, table-like list inspired by Finder's list view. Each row is a release.

**Column structure:**
| Column | Content | Width | Alignment |
|--------|---------|-------|-----------|
| Icon | Monochrome file-type icon (Finder-inspired, 16px) | ~40px fixed | Center |
| Name | Release title (Inter, `--text-lg`, tracking-tight) | Flexible (fills remaining) | Left |
| Collection | Collection name or `—` | ~140px | Left |
| Contract | Truncated hex address (monospace, xs) | ~140px | Left |
| Holders | Holder count | ~80px | Right |
| Created | Relative timestamp (e.g., `3d ago`, `Jan 12`) | ~80px | Right |

**Behavior:**
- Column headers visible, medium weight, `--text-sm`, `--text-secondary`
- Sort by Date (default, newest first). Limited sort: Name, Date only.
- Rows separated by 1px `--border` hairlines
- Row height: ~48px (comfortable but compact)
- Hover: row background shifts to `--surface-hover`, subtle transition (150ms)
- Click: navigates to release detail page
- Type icon: monochrome Finder-inspired icon in `--text-muted`, 16px, centered in first column. Each file type has a distinct icon silhouette (document for PDF, cube for 3D, landscape for image, play button for video, brackets for code, page for generic file, cloud for PLY)

**Mobile adaptation**: Collapses to Name + Type on primary line, Creator + Date on secondary line. Single stacked card per row.

### 4b. Buttons

**Primary style (Are.na-inspired flat buttons):**
- Background: `--button-bg`
- Text: `--text`
- No border, no border-radius (or very subtle 2-3px)
- Padding: `8px 16px`
- Font: system sans, `--text-sm`, medium weight
- Hover: background shifts to `--button-bg-hover`, 150ms transition
- No shadows, no gradients

**Collect CTA:**
- Same flat style but uses `--accent` background and inverted text
- Text: `COLLECT` or `+ COLLECT`
- Slightly larger padding: `10px 20px`
- This is the single most prominent interactive element on a release page

**Text links / secondary actions:**
- Underlined text, `--text-secondary` color
- Hover: color shifts to `--text`, 150ms

### 4c. Navigation (Header)

Refined sticky top bar. Minimal.

- Height: ~48px
- Background: `--bg` with subtle backdrop blur on scroll
- Bottom border: 1px `--border`
- **Left**: Breadcrumb file-path navigation (see below)
- **Center/Right**: Navigation links as plain text (`Feed`, `Create`), `--text-secondary`, hover → `--text`
- **Right**: Search (expands on hover/click), Connect button
- Active nav link: `--text` color (not bold, not underlined — just darker)

**Search**: Text "Search" in `--text-muted`. On hover, expands to reveal an input field inline in the header. Results appear in a dropdown panel below.

**Breadcrumb file-path navigation** (inspired by Are.na's breadcrumbs, adapted to Z:DRIVE's drive-notation brand):
- Replaces the static "Z:DRIVE" wordmark with a contextual file path
- Home: `Z:` | Creator: `Z:/morph.eth` | Collection: `Z:/morph.eth/Morphic Studies` | Release: `Z:/morph.eth/Morphic Studies/Emergence.pdf`
- All segments and `/` separators share the same color: `text-zd-text` (uniform black/white string)
- No underlines on any segment — the breadcrumb reads as a single path
- Parent segments are clickable `<a>` links with `hover:text-zd-text-secondary` for subtle feedback
- Current segment (rightmost): plain `text-zd-text`, not linked
- Font: `font-display tracking-tight` (same as wordmark)
- File extension on release name derived from type (`.pdf`, `.glb`, `.png`, `.mp4`, `.md`, `.ply`)

### 4d. Release Detail Page

Two-column layout (refined current approach):

**Left column (2/3 width):**
- Preview content (full width of column)
- If no preview: cover image or type-specific placeholder

**Right column (1/3 width), sticky sidebar:**
- **Title** (Inter, `--text-xl`, tracking-tight)
- **Creator** (linked, with small Zorb avatar inline)
- **Collection** label: "Part of [Collection Name]" (linked)
- **Description** (body text, `--text-base`)
- **Candlestick chart** (full content width ~280px × 48px, below description, above divider). Monochrome, traditional Japanese convention: up candles (close ≥ open) are **hollow** (stroke only), down candles (close < open) are **filled**. Wicks are 1px lines. No axes or grid — just floating candles. Inherits `text-zd-text-muted` from parent for automatic dark mode inversion.
- 1px divider
- **Collect button** (full-width of sidebar, primary flat button)
- **"Details"** single disclosure (DisclosureLink) containing three labeled sub-sections:

  **Sub-section headings**: `text-[11px] font-medium text-zd-text-muted uppercase tracking-wide` — quiet organizers, not full headings. `mb-2` below each, `mt-3` above all but first.

  **MARKET**
  - Market cap, Volume (24h), Holders
  - Link: View on GeckoTerminal

  **COIN**
  - Symbol (`$EMRG`), Contract (truncated), Created date
  - Links: View on Zora, View on Basescan

  **LICENSE** — coin-gated licensing tiers
  - Content type: what the file physically is (PDF, GLB, image, etc.)
  - License: identifier rendered as a clickable link (e.g., `CBE-CC0` underlined)
  - Download: minimum collection threshold to unlock file download (e.g., "Collect 1")
  - Commercial use: ownership threshold for commercial license rights (e.g., "Own 100 $EMRG")

**DisclosureLink pattern**: Minimal inline disclosure with a 6×8px SVG triangle that rotates 90° when open, paired with underlined text label. Fits the file-explorer ethos.

**Download overlay**: Instead of a sidebar download link, a hover-overlay download icon appears in the top-right corner of the preview container (`bg-zd-bg/70`, `opacity-0` → `opacity-100` on hover). Available only after collecting.

### 4e. Creator Profile / Studio

- **Header area**: Small Zorb avatar (48px), name (Inter, `--text-xl`), one-line bio, link to Basescan
- Artist statement / bio: 2-3 lines max, `--text-base`, `--text-secondary`
- Creator coin badge if exists: `$SYMBOL` in monospace
- "New Release" button (only on own profile)
- Below: Release list (same stacked list component as feed)
- Filter row: text buttons for type filtering (`All`, `PDF`, `3D`, `IMG`, etc.)
- Collection grouping toggle: `All` / `By Collection`

### 4f. Create Page (Single Long Form)

One scrollable page, no wizard steps. Sections separated by generous spacing (`--space-8`) and 1px dividers.

**Sections:**
1. **Details**: Name input, Symbol input, Description textarea
2. **Files**: Cover image uploader, Preview file uploader, GitHub link input, Attachments uploader
3. **Options**: Coin pairing selector, Collection settings, License picker
4. **Submit**: "Create Release" button (primary), summary of what will happen

**Form elements:**
- Inputs: No visible border by default. Bottom-border only (1px `--border`). On focus: bottom-border darkens to `--text`. No border-radius.
- Labels: `--text-sm`, `--text-secondary`, medium weight, above input
- File uploaders: Dashed border area, `--text-muted` icon + text, drag-and-drop

### 4g. Landing Page

Grounded in the product rather than a marketing splash. A single animated tagline and two CTAs.

- **BreadcrumbHeader** at top with `segments={[{ label: 'Z:' }]}` — establishes the navigation pattern immediately
- **Tagline**: "Let your (cycling phrase) make markets." Left-aligned, `font-display tracking-tighter`, `2rem` (32px). The phrase in parentheses is the animated element.
- **Typewriter animation**: The parenthesized word cycles through quirky work-type descriptions via a type-and-delete animation (adapted from [fancycomponents.dev typewriter](https://www.fancycomponents.dev/docs/components/text/typewriter)):
  - Phrases: `random sketches`, `pdf manifestos`, `3d models`, `side project repos`, `notes about notes`, `half-finished drafts`, `field recordings`, `weird prototypes`
  - Type speed: 50ms per character, delete speed: 30ms per character, 2s pause between phrases
  - Blinking cursor: 2px wide bar, CSS `cursor-blink` keyframe at 0.8s step-end
  - No external dependencies — pure React state + CSS animation
  - Text styling matches surrounding display text (same font, color, tracking)
- **No release list** on landing page — the tagline animation is the hero
- **Two CTAs** left-aligned below tagline (`mt-8`): `Explore` and `Create` as flat text buttons
- Subtle background: faint Zorb element (6% opacity), positioned bottom-right
- Dark mode / light mode should both feel beautiful here

### 4h. Tabs (Feed Page)

- `Feed` / `Explore` / `Markets` as text links in a row
- Active tab: `--text` color + 1px bottom border
- Inactive: `--text-muted`, no border
- Hover: `--text-secondary`
- Spacing: `--space-6` between tabs

### 4i. Modal / Overlay

- Backdrop: `--bg` at 80% opacity (not black — stays warm)
- Modal surface: `--surface`
- Border: 1px `--border`
- No border-radius (or max 2px)
- Close: `×` in top-right, `--text-muted`

### 4j. Loading States

- **Primary loader**: "Wandering Light" — Zorb SVG with a rotating gradient focal point and 12s hue cycle across the full color wheel. The orb rotates clockwise at 2s with ease-in-out easing. Selected from five candidate concepts for its balance of motion and restraint.
- **Skeleton loaders**: Warm-toned pulse animation. Background oscillates between `--surface` and `--surface-hover`. No distinct skeleton shapes — just subtle blocks.
- **Inline spinners**: Not used. Buttons show "..." or text change on loading.

---

## 5. Iconography

Inspired by macOS Finder file type icons, but simplified to monochrome line drawings.

- **Style**: 1.5px stroke, monochrome (`--text-muted` by default)
- **Size**: 16px for inline, 20px for standalone
- **Types to cover**: Document (PDF), 3D cube (GLB/GLTF), Image (landscape), Video (play triangle), Code (angle brackets), File (generic), Cloud (point cloud/PLY)
- No filled icons — always outline/stroke
- Could use a small icon library like Lucide or Phosphor (outline weight) to start, customizing if needed

---

## 6. Brand

### Wordmark
**Z:DRIVE** set in Inter, regular weight, `tracking-tight`. The colon is part of the identity — it references the classic drive notation (`C:\`, `D:\`) and adds a deliberate pause.

### Zorb Mark
A custom Z:DRIVE Zorb (to be designed) used as:
- Favicon
- Loading animation
- Default user avatar (using Zora's Zorb SVGs, which generate unique gradients per address)
- Possible subtle background element on landing page

### No Tagline
The product speaks for itself. If forced: "Creative work, collected."

---

## 7. Dark Mode Implementation

Toggle in the header (sun/moon icon or similar minimal indicator). Persisted to localStorage.

The dark mode is not simply inverted — it's a warm dark palette in its own right. Think: late-night reading mode on warm paper, not a code editor.

Key principle: same spatial relationships, same type hierarchy, just shifted tone. Content (images, previews) should feel equally at home in both modes.

---

## 8. Motion & Interaction

### Principles
- **Duration**: 100-200ms for micro-interactions, 300ms for layout shifts
- **Easing**: `ease-out` for most transitions, `ease-in-out` for color shifts
- **Hover states**: Background color shift only. No scale transforms, no shadows appearing.
- **Page transitions**: None. Instant navigation. Content fades in if loaded async (200ms opacity transition).
- **Zorb loading animation**: The one exception to subtlety — a smooth, continuous gradient rotation at ~3s cycle. Mesmerizing but calm.

### Specific Interactions
- **List row hover**: bg → `--surface-hover` (150ms)
- **Button hover**: bg shift (150ms)
- **Link hover**: color shift (150ms)
- **Search expand**: width transition (200ms ease-out)
- **Tab switch**: Content area fades (150ms)
- **Collect button press**: Brief darken on press, return on release

---

## 9. Responsive Behavior

Desktop-first. Mobile should work but is not the primary experience.

### Breakpoints
| Name | Width | Notes |
|------|-------|-------|
| `sm` | 640px | Mobile → tablet transition |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |

### Mobile Adaptations
- Release list: collapses to 2-line stacked cards (name + type on top, creator + date below)
- Detail page: single column, preview on top, info below
- Header: Logo + hamburger menu or simplified nav
- Create form: full-width inputs, same single-page flow
- Search: full-screen overlay on mobile
