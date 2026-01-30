// Z:Drive Metadata Schema v1
// Stored in Zora content coin metadata under properties.zdrive

export const ZDRIVE_SCHEMA_VERSION = 1;

// CBE License Types from a16z "Can't Be Evil" licenses
export type CBELicenseType =
  | 'CBE_CC0'           // Public domain dedication
  | 'CBE_EXCLUSIVE'     // Exclusive commercial rights
  | 'CBE_NONEXCLUSIVE'  // Non-exclusive commercial rights
  | 'CBE_COMMERCIAL'    // Commercial use allowed
  | 'CBE_NONCOMMERCIAL' // Non-commercial use only
  | 'CBE_PERSONAL';     // Personal use only

export interface ZDriveAsset {
  name: string;
  mime: string;
  uri: string;
  sha256?: string;
  size?: number;
}

export interface ZDriveExternalLink {
  type: 'github';
  url: string;
  ref?: string; // e.g., "v1.0.0" or "main"
}

export interface ZDriveLicenseGate {
  enabled: boolean;
  token: 'RELEASE_COIN';
  minBalance: string; // BigInt as string
}

export interface ZDriveLicense {
  baseline: 'ALL_RIGHTS_RESERVED';
  cbe?: {
    type: CBELicenseType;
    textUrl: string; // Arweave URI to canonical license text
  };
  gate?: ZDriveLicenseGate;
}

export interface ZDriveCollection {
  id: string;       // Format: "<chainId>:<creatorAddress>:<slug>"
  slug: string;     // URL-friendly identifier
  title: string;    // Display name
  ordering?: {
    index: number;  // Position in collection
  };
}

export interface ZDriveRelease {
  assets?: ZDriveAsset[];
  external?: ZDriveExternalLink[];
}

export interface ZDriveProperties {
  schemaVersion: typeof ZDRIVE_SCHEMA_VERSION;
  release?: ZDriveRelease;
  license?: ZDriveLicense;
  collection?: ZDriveCollection;
}

// Full metadata structure for a Z:Drive release coin
export interface ZDriveMetadata {
  name: string;
  description: string;
  image: string; // Cover image URI (required)
  animation_url?: string; // Zora uses this for rich content preview
  content?: {
    mime: string;
    uri: string;
  };
  properties: {
    zdrive: ZDriveProperties;
  };
}

// Supported preview file types
export type PreviewableFileType = 'pdf' | 'glb' | 'gltf' | 'stl' | 'github' | 'image' | 'video';
export type DownloadOnlyFileType = 'zip' | 'other';
export type FileType = PreviewableFileType | DownloadOnlyFileType;

// Helper to extract filename from URI or path
export function getFilenameFromUri(uri: string): string | undefined {
  // Handle IPFS URIs like ipfs://Qm.../filename.stl
  // Handle HTTP URLs like https://gateway.ipfs.io/ipfs/Qm.../filename.stl
  const lastSegment = uri.split('/').pop();
  // Check if it looks like a filename (has an extension)
  if (lastSegment && lastSegment.includes('.')) {
    return lastSegment;
  }
  return undefined;
}

// Helper to determine file type from MIME or extension
export function getFileType(mime?: string, filename?: string): FileType {
  // First check filename extension - most reliable for non-standard MIME types
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'glb': return 'glb';
      case 'gltf': return 'gltf';
      case 'stl': return 'stl';
      case 'zip': return 'zip';
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': return 'image';
      case 'mp4': case 'webm': return 'video';
    }
  }

  if (mime) {
    if (mime === 'application/pdf') return 'pdf';
    if (mime === 'model/gltf-binary' || mime === 'model/gltf+json') return 'glb';
    // STL has many non-standard MIME types reported by browsers
    if (
      mime === 'model/stl' ||
      mime === 'application/sla' ||
      mime === 'application/vnd.ms-pki.stl' ||
      mime === 'model/x.stl-binary' ||
      mime === 'model/x.stl-ascii'
    ) return 'stl';
    if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return 'zip';
    if (
      mime === 'image/jpeg' || mime === 'image/png' ||
      mime === 'image/gif' || mime === 'image/webp'
    ) return 'image';
    if (mime === 'video/mp4' || mime === 'video/webm') return 'video';
  }

  return 'other';
}

// Parse Z:Drive metadata from raw coin metadata
export function parseZDriveMetadata(rawMetadata: unknown): ZDriveMetadata | null {
  if (!rawMetadata || typeof rawMetadata !== 'object') return null;

  const meta = rawMetadata as Record<string, unknown>;

  if (!meta.name || !meta.image) return null;

  const properties = meta.properties as Record<string, unknown> | undefined;
  const zdrive = properties?.zdrive as ZDriveProperties | undefined;

  if (!zdrive || zdrive.schemaVersion !== ZDRIVE_SCHEMA_VERSION) {
    // Not a Z:Drive release or incompatible version
    return null;
  }

  return rawMetadata as ZDriveMetadata;
}

// Collection ID helpers
export function buildCollectionId(
  chainId: number,
  creatorAddress: string,
  slug: string
): string {
  return `${chainId}:${creatorAddress.toLowerCase()}:${slug}`;
}

export function parseCollectionId(id: string): {
  chainId: number;
  creatorAddress: string;
  slug: string;
} | null {
  const parts = id.split(':');
  if (parts.length !== 3) return null;

  const [chainIdStr, creatorAddress, slug] = parts;
  const chainId = parseInt(chainIdStr, 10);

  if (isNaN(chainId)) return null;

  return { chainId, creatorAddress, slug };
}
