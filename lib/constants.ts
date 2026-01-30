import { base } from 'viem/chains';

// Chain configuration - Base only for MVP
export const SUPPORTED_CHAIN = base;
export const SUPPORTED_CHAIN_ID = base.id; // 8453

// Z:Drive platform wallet - receives referral rewards
// Earns 20% of trade fees as platform referrer on coin creation,
// and 4% of trade fees as trade referrer on each swap.
export const ZDRIVE_PLATFORM_REFERRER = '0x5FBC8dA827bCF87979652d91AB7AF9Dd7E8ee3DD' as const;

// a16z "Can't Be Evil" License URIs (Arweave)
// These are the canonical license text locations
export const CBE_LICENSE_URLS = {
  CBE_CC0: 'ar://zmc1WTspIhFyVY82bq2HaOV5V5EKTIYmPfR6W6bGKac',
  CBE_EXCLUSIVE: 'ar://OxT27rKhP1LD7zmmYFYLqwBEf23bJAx4EWNVrNmgGsY',
  CBE_NONEXCLUSIVE: 'ar://8_7z-bpHOiJaJT8bzzqRpiwS9fBeDu9MGBQf7TE9po8',
  CBE_COMMERCIAL: 'ar://u7LWCPq8-vkOyPF7Ru2P0fnaIYn3FW4yrO0Jl-BWCUM',
  CBE_NONCOMMERCIAL: 'ar://3BH_gQL2SgnVeNvOkiSXwUPJLyKocBIw2MDn0z9-Xpw',
  CBE_PERSONAL: 'ar://3Cy0r-fY5NsxEprA7l6KSsEJaA9LlfuCbY49Fh6tzPE',
} as const;

// Human-readable license names
export const CBE_LICENSE_NAMES = {
  CBE_CC0: 'CC0 (Public Domain)',
  CBE_EXCLUSIVE: 'Exclusive Commercial Rights',
  CBE_NONEXCLUSIVE: 'Non-Exclusive Commercial Rights',
  CBE_COMMERCIAL: 'Commercial Use',
  CBE_NONCOMMERCIAL: 'Non-Commercial Use',
  CBE_PERSONAL: 'Personal Use Only',
} as const;

// License descriptions for the picker UI
export const CBE_LICENSE_DESCRIPTIONS = {
  CBE_CC0: 'Dedicate to public domain. Anyone can use for any purpose.',
  CBE_EXCLUSIVE: 'Grant exclusive commercial rights to token holders.',
  CBE_NONEXCLUSIVE: 'Grant non-exclusive commercial rights to token holders.',
  CBE_COMMERCIAL: 'Allow commercial use by token holders.',
  CBE_NONCOMMERCIAL: 'Allow non-commercial use only by token holders.',
  CBE_PERSONAL: 'Allow personal use only by token holders.',
} as const;

// File upload limits
export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
export const MAX_FILE_SIZE_DISPLAY = '200MB';

// Supported file types for preview
export const PREVIEWABLE_MIMES = [
  'application/pdf',
  'model/gltf-binary',
  'model/gltf+json',
  'model/stl',
  'font/otf',
  'font/ttf',
  'font/woff2',
] as const;

// Supported image types for cover
export const COVER_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

// IPFS gateway for fetching content
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Convert IPFS URI to HTTP URL
export function ipfsToHttp(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return IPFS_GATEWAY + uri.slice(7);
  }
  if (uri.startsWith('ar://')) {
    return 'https://arweave.net/' + uri.slice(5);
  }
  return uri;
}

// Truncate address for display
export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Format large numbers with K/M/B suffixes
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Format token balance as percentage of total supply
export function formatHoldingPercentage(balance: bigint, totalSupply: bigint): string {
  if (totalSupply === BigInt(0)) return '0%';
  const percentage = (Number(balance) / Number(totalSupply)) * 100;
  if (percentage < 0.01) return '<0.01%';
  if (percentage < 1) return percentage.toFixed(2) + '%';
  return percentage.toFixed(1) + '%';
}
