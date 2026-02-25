// ─── Shared Mock Data for Demo Pages ─────────────────────────────────────────

export type ReleaseType = 'PDF' | '3D' | 'IMG' | 'VID' | 'CODE' | 'PLY' | 'BLOG';

export interface MockRelease {
  name: string;
  type: ReleaseType;
  creator: string;
  collection: string | null;
  date: string; // ISO date string
  holders: number;
  marketCap: number;
  volume: number;
  contractAddress: string;
}

export interface MockCreator {
  address: string;
  name: string;
  bio: string;
  avatarSeed: string;
  coinSymbol: string;
}

export interface MockCollection {
  id: string;
  title: string;
  slug: string;
  creator: string;
  releaseCount: number;
}

export interface PlatformStats {
  totalReleases: number;
  creators: number;
  totalVolume: number;
  uniqueHolders: number;
}

// ─── Creators ────────────────────────────────────────────────────────────────

export const MOCK_CREATORS: MockCreator[] = [
  { address: '0xA3f2B7c9D1e4F8a6', name: 'morph.eth', bio: 'Exploring the boundaries of generative art and computational form. Based in Berlin.', avatarSeed: '0xA3f2B7c9', coinSymbol: 'MORPH' },
  { address: '0x7Fe1D4a2B9c3E5f8', name: 'vera.base', bio: 'Documentary photographer and visual researcher. Long-form projects on landscape and memory.', avatarSeed: '0x7Fe1D4a2', coinSymbol: 'VERA' },
  { address: '0xB8c4E9f3A1d6C7b2', name: 'fieldwork.eth', bio: 'Field recordings, spatial audio, and sound design for physical spaces.', avatarSeed: '0xB8c4E9f3', coinSymbol: 'FIELD' },
  { address: '0x2Da9F6b1C8e4A3d7', name: 'syl.base', bio: 'Writer and researcher. Essays on technology, culture, and the built environment.', avatarSeed: '0x2Da9F6b1', coinSymbol: 'SYL' },
  { address: '0xC5e7A4d2F9b1E8c3', name: 'hex.eth', bio: 'Creative coder. Tools, toys, and experiments in browser-native media.', avatarSeed: '0xC5e7A4d2', coinSymbol: 'HEX' },
  { address: '0x9Fb3C8e5D2a4B7f1', name: 'archive.base', bio: 'Digital preservation and open-access publishing. Running a small press on-chain.', avatarSeed: '0x9Fb3C8e5', coinSymbol: 'ARCH' },
];

// ─── Collections ─────────────────────────────────────────────────────────────

export const MOCK_COLLECTIONS: MockCollection[] = [
  { id: 'c1', title: 'Morphic Studies', slug: 'morphic-studies', creator: '0xA3f2B7c9D1e4F8a6', releaseCount: 8 },
  { id: 'c2', title: 'Field Notes', slug: 'field-notes', creator: '0xB8c4E9f3A1d6C7b2', releaseCount: 12 },
  { id: 'c3', title: 'Slow Glass', slug: 'slow-glass', creator: '0x7Fe1D4a2B9c3E5f8', releaseCount: 6 },
  { id: 'c4', title: 'Research', slug: 'research', creator: '0x2Da9F6b1C8e4A3d7', releaseCount: 15 },
  { id: 'c5', title: 'Toolkit', slug: 'toolkit', creator: '0xC5e7A4d2F9b1E8c3', releaseCount: 9 },
  { id: 'c6', title: 'Open Archive', slug: 'open-archive', creator: '0x9Fb3C8e5D2a4B7f1', releaseCount: 22 },
];

// ─── Releases ────────────────────────────────────────────────────────────────

export const MOCK_RELEASES: MockRelease[] = [
  { name: 'Emergence', type: 'PDF', creator: '0xA3f2B7c9D1e4F8a6', collection: 'Morphic Studies', date: '2026-02-23', holders: 1247, marketCap: 4280, volume: 89.3, contractAddress: '0xA3f2...1B4c' },
  { name: 'Lattice Dreams', type: '3D', creator: '0xA3f2B7c9D1e4F8a6', collection: 'Morphic Studies', date: '2026-02-21', holders: 847, marketCap: 2150, volume: 42.1, contractAddress: '0x7Fe1...9D2a' },
  { name: 'Erosion Study #4', type: 'IMG', creator: '0x7Fe1D4a2B9c3E5f8', collection: 'Slow Glass', date: '2026-02-20', holders: 2134, marketCap: 8920, volume: 156.7, contractAddress: '0xB8c4...3E7f' },
  { name: 'Resonance', type: 'VID', creator: '0xB8c4E9f3A1d6C7b2', collection: 'Field Notes', date: '2026-02-18', holders: 562, marketCap: 1340, volume: 28.4, contractAddress: '0x2Da9...6F1b' },
  { name: 'substrate.md', type: 'CODE', creator: '0xC5e7A4d2F9b1E8c3', collection: 'Toolkit', date: '2026-02-17', holders: 189, marketCap: 780, volume: 12.6, contractAddress: '0xC5e7...4A2d' },
  { name: 'genesis.ply', type: 'PLY', creator: '0xA3f2B7c9D1e4F8a6', collection: 'Morphic Studies', date: '2026-02-15', holders: 93, marketCap: 420, volume: 5.2, contractAddress: '0x9Fb3...8C5e' },
  { name: 'On Permanence', type: 'PDF', creator: '0x2Da9F6b1C8e4A3d7', collection: 'Research', date: '2026-02-14', holders: 1856, marketCap: 6730, volume: 112.4, contractAddress: '0xD4e8...2A9c' },
  { name: 'Coastal Survey 2026', type: 'IMG', creator: '0x7Fe1D4a2B9c3E5f8', collection: 'Slow Glass', date: '2026-02-12', holders: 945, marketCap: 3210, volume: 67.8, contractAddress: '0xE1f3...7B4d' },
  { name: 'Drift', type: 'VID', creator: '0xB8c4E9f3A1d6C7b2', collection: 'Field Notes', date: '2026-02-10', holders: 678, marketCap: 1890, volume: 34.5, contractAddress: '0xF2a4...8C1e' },
  { name: 'zd-cli v0.4.0', type: 'CODE', creator: '0xC5e7A4d2F9b1E8c3', collection: 'Toolkit', date: '2026-02-09', holders: 312, marketCap: 1120, volume: 18.9, contractAddress: '0xA5b7...3D6f' },
  { name: 'Morphic Studies Catalog', type: 'PDF', creator: '0xA3f2B7c9D1e4F8a6', collection: 'Morphic Studies', date: '2026-02-08', holders: 2341, marketCap: 9870, volume: 201.3, contractAddress: '0xB6c8...4E7a' },
  { name: 'City Fragments', type: 'IMG', creator: '0x7Fe1D4a2B9c3E5f8', collection: 'Slow Glass', date: '2026-02-06', holders: 1567, marketCap: 5430, volume: 89.1, contractAddress: '0xC7d9...5F8b' },
  { name: 'Toward Open Provenance', type: 'BLOG', creator: '0x2Da9F6b1C8e4A3d7', collection: 'Research', date: '2026-02-05', holders: 723, marketCap: 2340, volume: 45.6, contractAddress: '0xD8e1...6A9c' },
  { name: 'Interior Volume', type: '3D', creator: '0xA3f2B7c9D1e4F8a6', collection: 'Morphic Studies', date: '2026-02-03', holders: 456, marketCap: 1670, volume: 23.4, contractAddress: '0xE9f2...7B1d' },
  { name: 'Archive Index 2025', type: 'PDF', creator: '0x9Fb3C8e5D2a4B7f1', collection: 'Open Archive', date: '2026-02-01', holders: 3421, marketCap: 12400, volume: 267.8, contractAddress: '0xF1a3...8C2e' },
  { name: 'Night Walk', type: 'VID', creator: '0xB8c4E9f3A1d6C7b2', collection: 'Field Notes', date: '2026-01-30', holders: 891, marketCap: 2980, volume: 56.7, contractAddress: '0xA2b4...9D3f' },
  { name: 'Grid System', type: 'CODE', creator: '0xC5e7A4d2F9b1E8c3', collection: 'Toolkit', date: '2026-01-28', holders: 234, marketCap: 890, volume: 14.2, contractAddress: '0xB3c5...1E4a' },
  { name: 'Vanishing Points', type: 'IMG', creator: '0x7Fe1D4a2B9c3E5f8', collection: null, date: '2026-01-26', holders: 1234, marketCap: 4560, volume: 78.9, contractAddress: '0xC4d6...2F5b' },
  { name: 'scan_berlin_01.ply', type: 'PLY', creator: '0xA3f2B7c9D1e4F8a6', collection: 'Morphic Studies', date: '2026-01-24', holders: 67, marketCap: 310, volume: 3.8, contractAddress: '0xD5e7...3A6c' },
  { name: 'On the Commons', type: 'BLOG', creator: '0x2Da9F6b1C8e4A3d7', collection: 'Research', date: '2026-01-22', holders: 512, marketCap: 1890, volume: 34.1, contractAddress: '0xE6f8...4B7d' },
  { name: 'Tidal Patterns', type: 'IMG', creator: '0x7Fe1D4a2B9c3E5f8', collection: 'Slow Glass', date: '2026-01-20', holders: 1678, marketCap: 6120, volume: 98.4, contractAddress: '0xF7a9...5C8e' },
  { name: 'Protocol Notes #7', type: 'PDF', creator: '0x9Fb3C8e5D2a4B7f1', collection: 'Open Archive', date: '2026-01-18', holders: 456, marketCap: 1560, volume: 25.3, contractAddress: '0xA8b1...6D9f' },
  { name: 'Canopy', type: '3D', creator: '0xA3f2B7c9D1e4F8a6', collection: 'Morphic Studies', date: '2026-01-16', holders: 345, marketCap: 1230, volume: 19.7, contractAddress: '0xB9c2...7E1a' },
  { name: 'Sound Map: Kreuzberg', type: 'VID', creator: '0xB8c4E9f3A1d6C7b2', collection: 'Field Notes', date: '2026-01-14', holders: 567, marketCap: 2010, volume: 38.6, contractAddress: '0xC1d3...8F2b' },
  { name: 'License Framework v2', type: 'CODE', creator: '0xC5e7A4d2F9b1E8c3', collection: 'Toolkit', date: '2026-01-12', holders: 289, marketCap: 980, volume: 15.8, contractAddress: '0xD2e4...9A3c' },
  { name: 'Threshold', type: 'IMG', creator: '0x7Fe1D4a2B9c3E5f8', collection: null, date: '2026-01-10', holders: 1890, marketCap: 7340, volume: 123.5, contractAddress: '0xE3f5...1B4d' },
  { name: 'The Long View', type: 'BLOG', creator: '0x2Da9F6b1C8e4A3d7', collection: 'Research', date: '2026-01-08', holders: 834, marketCap: 2890, volume: 52.3, contractAddress: '0xF4a6...2C5e' },
  { name: 'Reading List 2025', type: 'PDF', creator: '0x9Fb3C8e5D2a4B7f1', collection: 'Open Archive', date: '2026-01-06', holders: 2567, marketCap: 8910, volume: 178.9, contractAddress: '0xA5b7...3D6f' },
];

// ─── Platform Stats ──────────────────────────────────────────────────────────

export const PLATFORM_STATS: PlatformStats = {
  totalReleases: 847,
  creators: 124,
  totalVolume: 42.3,
  uniqueHolders: 3200,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getCreatorByAddress(address: string): MockCreator | undefined {
  return MOCK_CREATORS.find(c => c.address === address);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

/** Get type counts from release list */
export function getTypeCounts(releases: MockRelease[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of releases) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }
  return counts;
}

/** Get collection counts from release list */
export function getCollectionCounts(releases: MockRelease[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of releases) {
    const key = r.collection || 'Uncollected';
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

/** Get creator counts from release list */
export function getCreatorCounts(releases: MockRelease[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of releases) {
    const creator = getCreatorByAddress(r.creator);
    const key = creator?.name || r.creator;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
