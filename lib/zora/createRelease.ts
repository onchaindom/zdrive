import { createCoin, type ContentCoinCurrency } from "@zoralabs/coins-sdk";
import type { WalletClient, PublicClient } from "viem";
import { SUPPORTED_CHAIN_ID, ZDRIVE_PLATFORM_REFERRER } from "@/lib/constants";
import {
  buildReleaseMetadata,
  type CreateReleaseMetadataInput,
} from "./metadata";
import { ZoraUploadService } from "@/lib/uploads/zoraUploader";

/**
 * Get MIME type from filename extension.
 * Used as fallback when uploader doesn't return a MIME type.
 */
function getMimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    'ply': 'text/plain',
    'pdf': 'application/pdf',
    'glb': 'model/gltf-binary',
    'gltf': 'model/gltf+json',
    'mp4': 'video/mp4',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'json': 'application/json',
    'md': 'text/markdown',
    'txt': 'text/plain',
  };
  return mimeMap[ext ?? ''] ?? 'application/octet-stream';
}

export interface CreateReleaseInput {
  // Release details
  name: string;
  description: string;
  symbol: string;
  creatorAddress: string;

  // Coin pairing currency: "ETH" or "CREATOR_COIN_OR_ZORA"
  currency?: ContentCoinCurrency;

  // Files to upload
  coverImage: File;
  previewFile?: File;
  attachments?: File[];

  // External links
  external?: CreateReleaseMetadataInput["external"];

  // Collection
  collection?: CreateReleaseMetadataInput["collection"];

  // License
  license?: CreateReleaseMetadataInput["license"];

  // Progress callback
  onProgress?: (phase: UploadPhase, completed: number, total: number) => void;
}

export type UploadPhase =
  | "cover"
  | "preview"
  | "attachments"
  | "metadata"
  | "coin";

export interface CreateReleaseResult {
  success: boolean;
  coinAddress?: string;
  txHash?: string;
  error?: string;
}

/**
 * Create a release coin with Z:Drive metadata.
 * Uses the Zora SDK's native IPFS uploader — no Pinata, no gateway workaround.
 */
export async function createRelease(
  input: CreateReleaseInput,
  walletClient: WalletClient,
  publicClient: PublicClient,
): Promise<CreateReleaseResult> {
  try {
    const creatorAddress = walletClient.account?.address;
    if (!creatorAddress) {
      return { success: false, error: "Wallet not connected" };
    }

    const uploadService = new ZoraUploadService(creatorAddress);

    // 1. Upload cover image
    input.onProgress?.("cover", 0, 1);
    const coverResult = await uploadService.uploadFile(input.coverImage);
    input.onProgress?.("cover", 1, 1);

    // 2. Upload preview file if provided
    let previewFileData: { uri: string; mime: string; name?: string } | undefined;
    if (input.previewFile) {
      input.onProgress?.("preview", 0, 1);
      const previewResult = await uploadService.uploadFile(input.previewFile);
      // Use returned MIME, fall back to browser type, fall back to extension-based lookup
      const mime = previewResult.mimeType || input.previewFile.type || getMimeFromFilename(input.previewFile.name);
      previewFileData = {
        uri: previewResult.uri,
        mime,
        name: input.previewFile.name, // Store original filename for extension-based type detection
      };
      input.onProgress?.("preview", 1, 1);
    }

    // 3. Upload attachments in parallel with SHA256
    let uploadedAssets: CreateReleaseMetadataInput["assets"];
    if (input.attachments?.length) {
      const attachmentResults = await uploadService.uploadFiles(
        input.attachments,
        {
          computeSha256: true,
          onProgress: (completed, total) => {
            input.onProgress?.("attachments", completed, total);
          },
          maxConcurrency: 3,
        },
      );

      uploadedAssets = attachmentResults.map(({ file, result }) => ({
        name: file.name,
        mime: result.mimeType ?? file.type,
        uri: result.uri,
        size: result.size ?? file.size,
        sha256: result.sha256,
      }));
    }

    // 4. Build Z:Drive metadata
    input.onProgress?.("metadata", 0, 1);
    const metadata = buildReleaseMetadata({
      name: input.name,
      description: input.description,
      coverImageUri: coverResult.uri,
      previewFile: previewFileData,
      assets: uploadedAssets,
      external: input.external,
      collection: input.collection,
      license: input.license,
      creatorAddress,
    });

    // 5. Upload metadata JSON to IPFS
    const metadataResult = await uploadService.uploadJson(
      metadata as unknown as Record<string, unknown>,
    );
    input.onProgress?.("metadata", 1, 1);

    // 6. Create the coin via Zora SDK
    input.onProgress?.("coin", 0, 1);
    const result = await createCoin({
      call: {
        creator: creatorAddress,
        name: input.name,
        symbol: input.symbol,
        metadata: {
          type: "RAW_URI" as const,
          uri: metadataResult.uri,
        },
        currency: input.currency ?? "ETH",
        chainId: SUPPORTED_CHAIN_ID,
        platformReferrer: ZDRIVE_PLATFORM_REFERRER,
        payoutRecipientOverride: creatorAddress,
      },
      walletClient,
      publicClient,
    });
    input.onProgress?.("coin", 1, 1);

    if (result.address) {
      return {
        success: true,
        coinAddress: result.address,
        txHash: result.hash,
      };
    }

    return {
      success: false,
      error: "Failed to create coin — no address returned from transaction",
    };
  } catch (error) {
    console.error("Error creating release:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
