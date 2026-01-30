import { describe, it, expect } from "vitest";
import {
  buildReleaseMetadata,
  validateReleaseMetadata,
} from "@/lib/zora/metadata";
import { ZDRIVE_SCHEMA_VERSION } from "@/types/zdrive";

describe("buildReleaseMetadata", () => {
  const minimalInput = {
    name: "Test Release",
    description: "A test release",
    coverImageUri: "ipfs://QmCover123",
    creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
  };

  it("produces correct minimal metadata", () => {
    const metadata = buildReleaseMetadata(minimalInput);

    expect(metadata.name).toBe("Test Release");
    expect(metadata.description).toBe("A test release");
    expect(metadata.image).toBe("ipfs://QmCover123");
    expect(metadata.properties.zdrive.schemaVersion).toBe(
      ZDRIVE_SCHEMA_VERSION,
    );
    expect(metadata.content).toBeUndefined();
    expect(metadata.properties.zdrive.release).toBeUndefined();
    expect(metadata.properties.zdrive.license).toBeUndefined();
    expect(metadata.properties.zdrive.collection).toBeUndefined();
  });

  it("includes preview file as content and animation_url", () => {
    const metadata = buildReleaseMetadata({
      ...minimalInput,
      previewFile: { uri: "ipfs://QmPdf123", mime: "application/pdf" },
    });

    expect(metadata.content).toEqual({
      mime: "application/pdf",
      uri: "ipfs://QmPdf123",
    });
    expect(metadata.animation_url).toBe("ipfs://QmPdf123");
  });

  it("includes STL preview file", () => {
    const metadata = buildReleaseMetadata({
      ...minimalInput,
      previewFile: { uri: "ipfs://QmStl123", mime: "model/stl" },
    });

    expect(metadata.content).toEqual({
      mime: "model/stl",
      uri: "ipfs://QmStl123",
    });
  });

  it("includes assets in release", () => {
    const assets = [
      {
        name: "source.zip",
        mime: "application/zip",
        uri: "ipfs://QmZip123",
        size: 12345,
      },
    ];
    const metadata = buildReleaseMetadata({ ...minimalInput, assets });

    expect(metadata.properties.zdrive.release?.assets).toEqual(assets);
  });

  it("includes external links in release", () => {
    const external = [
      {
        type: "github" as const,
        url: "https://github.com/org/repo",
        ref: "v1.0.0",
      },
    ];
    const metadata = buildReleaseMetadata({ ...minimalInput, external });

    expect(metadata.properties.zdrive.release?.external).toEqual(external);
  });

  it("builds collection with auto-generated slug", () => {
    const metadata = buildReleaseMetadata({
      ...minimalInput,
      collection: { title: "Tyrolean Chair Studies" },
    });

    const collection = metadata.properties.zdrive.collection;
    expect(collection).toBeDefined();
    expect(collection!.title).toBe("Tyrolean Chair Studies");
    expect(collection!.slug).toBe("tyrolean-chair-studies");
    expect(collection!.id).toContain("tyrolean-chair-studies");
    expect(collection!.id).toContain("8453");
  });

  it("builds collection with explicit slug and ordering", () => {
    const metadata = buildReleaseMetadata({
      ...minimalInput,
      collection: {
        title: "My Series",
        slug: "custom-slug",
        orderingIndex: 5,
      },
    });

    const collection = metadata.properties.zdrive.collection;
    expect(collection!.slug).toBe("custom-slug");
    expect(collection!.ordering).toEqual({ index: 5 });
  });

  it("builds license without gate", () => {
    const metadata = buildReleaseMetadata({
      ...minimalInput,
      license: { cbeType: "CBE_COMMERCIAL" },
    });

    const license = metadata.properties.zdrive.license;
    expect(license).toBeDefined();
    expect(license!.baseline).toBe("ALL_RIGHTS_RESERVED");
    expect(license!.cbe?.type).toBe("CBE_COMMERCIAL");
    expect(license!.cbe?.textUrl).toBeTruthy();
    expect(license!.gate).toBeUndefined();
  });

  it("builds license with gate", () => {
    const metadata = buildReleaseMetadata({
      ...minimalInput,
      license: {
        cbeType: "CBE_NONCOMMERCIAL",
        gate: { minBalance: "10000" },
      },
    });

    const license = metadata.properties.zdrive.license;
    expect(license!.gate).toEqual({
      enabled: true,
      token: "RELEASE_COIN",
      minBalance: "10000",
    });
  });

  it("builds metadata with all fields combined", () => {
    const metadata = buildReleaseMetadata({
      ...minimalInput,
      previewFile: { uri: "ipfs://QmGlb123", mime: "model/gltf-binary" },
      assets: [
        {
          name: "model.glb",
          mime: "model/gltf-binary",
          uri: "ipfs://QmGlb123",
          size: 5000,
        },
      ],
      external: [
        { type: "github", url: "https://github.com/test/repo" },
      ],
      collection: { title: "Test Collection", orderingIndex: 1 },
      license: {
        cbeType: "CBE_CC0",
        gate: { minBalance: "1" },
      },
    });

    expect(metadata.content).toBeDefined();
    expect(metadata.properties.zdrive.release?.assets).toHaveLength(1);
    expect(metadata.properties.zdrive.release?.external).toHaveLength(1);
    expect(metadata.properties.zdrive.collection).toBeDefined();
    expect(metadata.properties.zdrive.license).toBeDefined();
  });
});

describe("validateReleaseMetadata", () => {
  it("validates correct metadata", () => {
    const metadata = buildReleaseMetadata({
      name: "Test",
      description: "Desc",
      coverImageUri: "ipfs://Qm123",
      creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    });

    const result = validateReleaseMetadata(metadata);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects missing name", () => {
    const metadata = buildReleaseMetadata({
      name: "",
      description: "Desc",
      coverImageUri: "ipfs://Qm123",
      creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    });

    const result = validateReleaseMetadata(metadata);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Name is required");
  });

  it("rejects missing description", () => {
    const metadata = buildReleaseMetadata({
      name: "Test",
      description: "",
      coverImageUri: "ipfs://Qm123",
      creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    });

    const result = validateReleaseMetadata(metadata);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Description is required");
  });

  it("rejects missing image", () => {
    const metadata = buildReleaseMetadata({
      name: "Test",
      description: "Desc",
      coverImageUri: "",
      creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    });

    const result = validateReleaseMetadata(metadata);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Cover image is required");
  });

  it("rejects wrong schema version", () => {
    const metadata = buildReleaseMetadata({
      name: "Test",
      description: "Desc",
      coverImageUri: "ipfs://Qm123",
      creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    });
    // Force a wrong version
    (metadata.properties.zdrive as { schemaVersion: number }).schemaVersion = 99;

    const result = validateReleaseMetadata(metadata);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid schema version");
  });
});
