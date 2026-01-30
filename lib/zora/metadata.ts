import {
  ZDRIVE_SCHEMA_VERSION,
  buildCollectionId,
  type ZDriveMetadata,
  type ZDriveAsset,
  type ZDriveExternalLink,
  type CBELicenseType,
} from '@/types/zdrive';
import { CBE_LICENSE_URLS, SUPPORTED_CHAIN_ID } from '@/lib/constants';
import { slugify } from '@/lib/utils/slugify';

export interface CreateReleaseMetadataInput {
  // Required
  name: string;
  description: string;
  coverImageUri: string;

  // Optional preview content
  previewFile?: {
    uri: string;
    mime: string;
  };

  // Attachments
  assets?: ZDriveAsset[];

  // External links (GitHub)
  external?: ZDriveExternalLink[];

  // Collection
  collection?: {
    title: string;
    slug?: string; // Auto-generated from title if not provided
    orderingIndex?: number;
  };

  // License
  license?: {
    cbeType: CBELicenseType;
    gate?: {
      minBalance: string;
    };
  };

  // Creator info for collection ID
  creatorAddress: string;
}

export function buildReleaseMetadata(
  input: CreateReleaseMetadataInput
): ZDriveMetadata {
  const metadata: ZDriveMetadata = {
    name: input.name,
    description: input.description,
    image: input.coverImageUri,
    properties: {
      zdrive: {
        schemaVersion: ZDRIVE_SCHEMA_VERSION,
      },
    },
  };

  // Add preview content if provided
  if (input.previewFile) {
    metadata.content = {
      mime: input.previewFile.mime,
      uri: input.previewFile.uri,
    };
    metadata.animation_url = input.previewFile.uri;
  }

  // Add release assets and external links
  if (input.assets?.length || input.external?.length) {
    metadata.properties.zdrive.release = {};

    if (input.assets?.length) {
      metadata.properties.zdrive.release.assets = input.assets;
    }

    if (input.external?.length) {
      metadata.properties.zdrive.release.external = input.external;
    }
  }

  // Add license
  if (input.license) {
    metadata.properties.zdrive.license = {
      baseline: 'ALL_RIGHTS_RESERVED',
      cbe: {
        type: input.license.cbeType,
        textUrl: CBE_LICENSE_URLS[input.license.cbeType],
      },
    };

    if (input.license.gate) {
      metadata.properties.zdrive.license.gate = {
        enabled: true,
        token: 'RELEASE_COIN',
        minBalance: input.license.gate.minBalance,
      };
    }
  }

  // Add collection
  if (input.collection) {
    const collectionSlug =
      input.collection.slug || slugify(input.collection.title);

    metadata.properties.zdrive.collection = {
      id: buildCollectionId(
        SUPPORTED_CHAIN_ID,
        input.creatorAddress,
        collectionSlug
      ),
      slug: collectionSlug,
      title: input.collection.title,
    };

    if (input.collection.orderingIndex !== undefined) {
      metadata.properties.zdrive.collection.ordering = {
        index: input.collection.orderingIndex,
      };
    }
  }

  return metadata;
}

// Validate metadata before submission
export function validateReleaseMetadata(
  metadata: ZDriveMetadata
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!metadata.name || metadata.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!metadata.description || metadata.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!metadata.image || metadata.image.trim().length === 0) {
    errors.push('Cover image is required');
  }

  if (metadata.properties.zdrive.schemaVersion !== ZDRIVE_SCHEMA_VERSION) {
    errors.push('Invalid schema version');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
