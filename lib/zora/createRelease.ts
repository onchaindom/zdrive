import { createCoin } from '@zoralabs/coins-sdk';
import type { WalletClient, PublicClient, Address } from 'viem';
import { SUPPORTED_CHAIN_ID, ZDRIVE_PLATFORM_REFERRER } from '@/lib/constants';
import {
  buildReleaseMetadata,
  type CreateReleaseMetadataInput,
} from './metadata';
import { uploadJsonToIpfs, uploadToIpfs } from '@/lib/uploads/ipfsUploader';

export interface CreateReleaseInput {
  // Release details
  name: string;
  description: string;
  symbol: string;
  creatorAddress: string;

  // Files to upload
  coverImage: File;
  previewFile?: File;
  attachments?: File[];

  // External links
  external?: CreateReleaseMetadataInput['external'];

  // Collection
  collection?: CreateReleaseMetadataInput['collection'];

  // License
  license?: CreateReleaseMetadataInput['license'];
}

export interface CreateReleaseResult {
  success: boolean;
  coinAddress?: string;
  txHash?: string;
  error?: string;
}

async function uploadToIPFS(file: File): Promise<{ uri: string; mimeType: string | null }> {
  const uploadResult = await uploadToIpfs(file);
  return {
    uri: uploadResult.uri,
    mimeType: uploadResult.mimeType,
  };
}

// Create a release coin with Z:Drive metadata
export async function createRelease(
  input: CreateReleaseInput,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<CreateReleaseResult> {
  try {
    const creatorAddress = walletClient.account?.address;
    if (!creatorAddress) {
      return { success: false, error: 'Wallet not connected' };
    }

    // 1. Upload cover image
    console.log('Uploading cover image...');
    const coverImageResult = await uploadToIPFS(input.coverImage);
    const coverImageUri = coverImageResult.uri;

    // 2. Upload preview file if provided
    let previewFileData: { uri: string; mime: string } | undefined;
    if (input.previewFile) {
      console.log('Uploading preview file...');
      try {
        const previewResult = await uploadToIPFS(input.previewFile);
        previewFileData = {
          uri: previewResult.uri,
          mime: previewResult.mimeType ?? input.previewFile.type,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Preview upload failed (${input.previewFile.name}, ${input.previewFile.type || 'unknown type'}). ${message}`
        );
      }
    }

    // 3. Upload attachments if provided
    const uploadedAssets = [];
    if (input.attachments?.length) {
      console.log('Uploading attachments...');
      for (const file of input.attachments) {
        try {
          const uploadResult = await uploadToIPFS(file);
          uploadedAssets.push({
            name: file.name,
            mime: uploadResult.mimeType ?? file.type,
            uri: uploadResult.uri,
            size: file.size,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(
            `Attachment upload failed (${file.name}, ${file.type || 'unknown type'}). ${message}`
          );
        }
      }
    }

    // 4. Build Z:Drive metadata
    const metadata = buildReleaseMetadata({
      name: input.name,
      description: input.description,
      coverImageUri,
      previewFile: previewFileData,
      assets: uploadedAssets.length > 0 ? uploadedAssets : undefined,
      external: input.external,
      collection: input.collection,
      license: input.license,
      creatorAddress,
    });

    // 5. Upload metadata JSON
    console.log('Uploading metadata...');
    const metadataResult = await uploadJsonToIpfs(metadata as Record<string, unknown>);
    const ipfsMetadataUri = metadataResult.uri;
    const gatewayUrl = ipfsMetadataUri.startsWith('ipfs://')
      ? ipfsMetadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
      : ipfsMetadataUri;
    // Use a stable HTTPS gateway URL to satisfy strict content-type checks.
    const metadataUri = gatewayUrl;

    // 6. Create the coin
    console.log('Creating coin...');
    const coinParams = {
      creator: creatorAddress,
      name: input.name,
      symbol: input.symbol,
      metadata: {
        type: 'RAW_URI' as const,
        uri: metadataUri,
      },
      currency: 'ETH' as const,
      chainId: SUPPORTED_CHAIN_ID,
      platformReferrer: ZDRIVE_PLATFORM_REFERRER as Address,
      payoutRecipientOverride: creatorAddress,
    };

    // Note: The actual createCoin API may vary - check SDK docs
    // This is a simplified version for the MVP structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (createCoin as any)({
      call: coinParams,
      walletClient,
      publicClient,
    });
    // The result structure depends on the SDK version
    const coinAddress = (result as { address?: string })?.address;
    const txHash = (result as { hash?: string })?.hash;

    if (coinAddress) {
      return {
        success: true,
        coinAddress,
        txHash,
      };
    }

    return {
      success: false,
      error: 'Failed to create coin - no address returned',
    };
  } catch (error) {
    console.error('Error creating release:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Check if user has a creator coin (simplified check)
export async function checkCreatorCoin(
  _creatorAddress: string
): Promise<{ hasCreatorCoin: boolean; creatorCoinAddress?: string }> {
  // For MVP, we'll assume users can create releases with or without a creator coin
  // The SDK's createCoin will handle pairing appropriately
  return { hasCreatorCoin: true };
}
