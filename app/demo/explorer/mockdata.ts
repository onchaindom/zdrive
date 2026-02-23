// Shared mock data for all file explorer redesign demos

export interface MockFile {
  name: string;
  type: string;
  ext: string;
  creator: string;
  creatorAddr: string;
  folder: string | null;
  date: string;
  holders: number;
  marketCap: string;
  mcapNum: number;
  volume: string;
  volNum: number;
  contract: string;
  size: string;
  description: string;
  symbol: string;
}

export const MOCK_FILES: MockFile[] = [
  {
    name: 'Emergence',
    type: 'PDF',
    ext: '.pdf',
    creator: 'morph.eth',
    creatorAddr: '0xA3f2...1B4c',
    folder: 'Morphic Studies',
    date: '2026-02-20',
    holders: 1247,
    marketCap: '$4,280',
    mcapNum: 4280,
    volume: '89.3 ETH',
    volNum: 89.3,
    contract: '0xA3f2B7c9D1e4F8a6',
    size: '2.4 MB',
    description: 'An exploration of emergent patterns in generative systems.',
    symbol: 'EMRG',
  },
  {
    name: 'Lattice Dreams',
    type: '3D',
    ext: '.glb',
    creator: 'morph.eth',
    creatorAddr: '0xA3f2...1B4c',
    folder: 'Morphic Studies',
    date: '2026-02-15',
    holders: 847,
    marketCap: '$2,100',
    mcapNum: 2100,
    volume: '42.1 ETH',
    volNum: 42.1,
    contract: '0x7Fe1D4a29B3c8E5f',
    size: '18.7 MB',
    description: 'Interactive 3D lattice structure with generative animation.',
    symbol: 'LTDR',
  },
  {
    name: 'Field Notes vol. 3',
    type: 'IMG',
    ext: '.png',
    creator: 'campo.eth',
    creatorAddr: '0xB8c4...3E7f',
    folder: 'Field Notes',
    date: '2026-01-12',
    holders: 2100,
    marketCap: '$8,750',
    mcapNum: 8750,
    volume: '156.2 ETH',
    volNum: 156.2,
    contract: '0xB8c4E9f37A2dC5e6',
    size: '4.1 MB',
    description: 'Third installment of photographic field documentation.',
    symbol: 'FN3',
  },
  {
    name: 'Resonance',
    type: 'VID',
    ext: '.mp4',
    creator: 'wave.eth',
    creatorAddr: '0x2Da9...6F1b',
    folder: null,
    date: '2026-01-08',
    holders: 562,
    marketCap: '$1,340',
    mcapNum: 1340,
    volume: '28.9 ETH',
    volNum: 28.9,
    contract: '0x2Da9F6b17C4eA8d3',
    size: '67.2 MB',
    description: 'Audio-visual piece exploring resonant frequencies.',
    symbol: 'RSNC',
  },
  {
    name: 'substrate',
    type: 'CODE',
    ext: '.md',
    creator: 'dev.eth',
    creatorAddr: '0xC5e7...4A2d',
    folder: 'Research',
    date: '2025-12-29',
    holders: 189,
    marketCap: '$420',
    mcapNum: 420,
    volume: '8.3 ETH',
    volNum: 8.3,
    contract: '0xC5e7A4d2B9f1E3c8',
    size: '12 KB',
    description: 'Technical substrate documentation for generative framework.',
    symbol: 'SBST',
  },
  {
    name: 'genesis',
    type: '3D',
    ext: '.ply',
    creator: 'scan.eth',
    creatorAddr: '0x9Fb3...8C5e',
    folder: 'Scans',
    date: '2025-12-15',
    holders: 93,
    marketCap: '$180',
    mcapNum: 180,
    volume: '3.1 ETH',
    volNum: 3.1,
    contract: '0x9Fb3C8e5D2a7F4b1',
    size: '45.8 MB',
    description: 'High-resolution point cloud scan of architectural form.',
    symbol: 'GNSS',
  },
  {
    name: 'Chromatic Study #14',
    type: 'IMG',
    ext: '.png',
    creator: 'color.eth',
    creatorAddr: '0xD4e8...2F9a',
    folder: 'Chromatic Studies',
    date: '2025-12-10',
    holders: 421,
    marketCap: '$1,890',
    mcapNum: 1890,
    volume: '35.6 ETH',
    volNum: 35.6,
    contract: '0xD4e82F9aB5c1E7d3',
    size: '8.2 MB',
    description: 'Fourteenth study in ongoing chromatic series.',
    symbol: 'CHR14',
  },
  {
    name: 'Protocol Spec v2',
    type: 'PDF',
    ext: '.pdf',
    creator: 'dev.eth',
    creatorAddr: '0xC5e7...4A2d',
    folder: 'Research',
    date: '2025-12-01',
    holders: 312,
    marketCap: '$780',
    mcapNum: 780,
    volume: '14.2 ETH',
    volNum: 14.2,
    contract: '0xE1f3A5b7C9d2F4e6',
    size: '1.8 MB',
    description: 'Version 2 of the protocol specification document.',
    symbol: 'PRTCL',
  },
  {
    name: 'Drift',
    type: 'VID',
    ext: '.mp4',
    creator: 'wave.eth',
    creatorAddr: '0x2Da9...6F1b',
    folder: null,
    date: '2025-11-20',
    holders: 734,
    marketCap: '$3,200',
    mcapNum: 3200,
    volume: '67.8 ETH',
    volNum: 67.8,
    contract: '0xF2a4B6c8D1e3A5f7',
    size: '112 MB',
    description: 'Long-form video meditation on movement and stillness.',
    symbol: 'DRFT',
  },
  {
    name: 'Surface Tension',
    type: 'IMG',
    ext: '.svg',
    creator: 'morph.eth',
    creatorAddr: '0xA3f2...1B4c',
    folder: 'Morphic Studies',
    date: '2025-11-15',
    holders: 1560,
    marketCap: '$5,400',
    mcapNum: 5400,
    volume: '98.1 ETH',
    volNum: 98.1,
    contract: '0xA1b3C5d7E9f2B4a6',
    size: '340 KB',
    description: 'SVG exploration of tension at material boundaries.',
    symbol: 'SFTN',
  },
];

export const MOCK_FOLDERS = [
  { name: 'Morphic Studies', creator: 'morph.eth', count: 3 },
  { name: 'Field Notes', creator: 'campo.eth', count: 1 },
  { name: 'Research', creator: 'dev.eth', count: 2 },
  { name: 'Scans', creator: 'scan.eth', count: 1 },
  { name: 'Chromatic Studies', creator: 'color.eth', count: 1 },
];

/** YYYY.M.DD format matching existing ReleaseRow style */
export function formatDateDot(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export function formatHolders(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}
