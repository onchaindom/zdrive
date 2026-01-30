import { describe, it, expect } from "vitest";
import {
  getFileType,
  parseZDriveMetadata,
  buildCollectionId,
  parseCollectionId,
  getFilenameFromUri,
  ZDRIVE_SCHEMA_VERSION,
} from "@/types/zdrive";

describe("getFileType", () => {
  // PDF
  it("detects PDF by MIME", () => {
    expect(getFileType("application/pdf")).toBe("pdf");
  });
  it("detects PDF by extension", () => {
    expect(getFileType(undefined, "document.pdf")).toBe("pdf");
  });

  // 3D
  it("detects GLB by MIME", () => {
    expect(getFileType("model/gltf-binary")).toBe("glb");
  });
  it("detects GLB by extension", () => {
    expect(getFileType(undefined, "model.glb")).toBe("glb");
  });
  it("detects GLTF by MIME", () => {
    expect(getFileType("model/gltf+json")).toBe("glb");
  });
  it("detects GLTF by extension", () => {
    expect(getFileType(undefined, "scene.gltf")).toBe("gltf");
  });
  it("detects STL by MIME model/stl", () => {
    expect(getFileType("model/stl")).toBe("stl");
  });
  it("detects STL by MIME application/sla", () => {
    expect(getFileType("application/sla")).toBe("stl");
  });
  it("detects STL by extension", () => {
    expect(getFileType(undefined, "part.stl")).toBe("stl");
  });

  // ZIP
  it("detects ZIP by MIME", () => {
    expect(getFileType("application/zip")).toBe("zip");
  });
  it("detects ZIP by extension", () => {
    expect(getFileType(undefined, "archive.zip")).toBe("zip");
  });

  // Images (to be added in Phase 2 type update)
  it("detects JPEG by MIME", () => {
    expect(getFileType("image/jpeg")).toBe("image");
  });
  it("detects PNG by MIME", () => {
    expect(getFileType("image/png")).toBe("image");
  });
  it("detects GIF by MIME", () => {
    expect(getFileType("image/gif")).toBe("image");
  });
  it("detects WebP by MIME", () => {
    expect(getFileType("image/webp")).toBe("image");
  });
  it("detects JPG by extension", () => {
    expect(getFileType(undefined, "photo.jpg")).toBe("image");
  });
  it("detects PNG by extension", () => {
    expect(getFileType(undefined, "icon.png")).toBe("image");
  });

  // Video (to be added in Phase 2 type update)
  it("detects MP4 by MIME", () => {
    expect(getFileType("video/mp4")).toBe("video");
  });
  it("detects WebM by MIME", () => {
    expect(getFileType("video/webm")).toBe("video");
  });
  it("detects MP4 by extension", () => {
    expect(getFileType(undefined, "clip.mp4")).toBe("video");
  });

  // Fallback
  it("returns other for unknown MIME", () => {
    expect(getFileType("application/octet-stream")).toBe("other");
  });
  it("returns other for unknown extension", () => {
    expect(getFileType(undefined, "file.xyz")).toBe("other");
  });
  it("returns other with no input", () => {
    expect(getFileType()).toBe("other");
  });

  // Extension takes priority
  it("prefers extension over MIME", () => {
    expect(getFileType("application/octet-stream", "model.stl")).toBe("stl");
  });
});

describe("parseZDriveMetadata", () => {
  it("returns null for null input", () => {
    expect(parseZDriveMetadata(null)).toBeNull();
  });

  it("returns null for non-object input", () => {
    expect(parseZDriveMetadata("not an object")).toBeNull();
  });

  it("returns null for missing name", () => {
    expect(
      parseZDriveMetadata({
        image: "ipfs://Qm123",
        properties: { zdrive: { schemaVersion: ZDRIVE_SCHEMA_VERSION } },
      }),
    ).toBeNull();
  });

  it("returns null for missing image", () => {
    expect(
      parseZDriveMetadata({
        name: "Test",
        properties: { zdrive: { schemaVersion: ZDRIVE_SCHEMA_VERSION } },
      }),
    ).toBeNull();
  });

  it("returns null for wrong schema version", () => {
    expect(
      parseZDriveMetadata({
        name: "Test",
        image: "ipfs://Qm123",
        properties: { zdrive: { schemaVersion: 99 } },
      }),
    ).toBeNull();
  });

  it("returns null for missing zdrive properties", () => {
    expect(
      parseZDriveMetadata({
        name: "Test",
        image: "ipfs://Qm123",
        properties: {},
      }),
    ).toBeNull();
  });

  it("parses valid metadata", () => {
    const raw = {
      name: "Test Release",
      description: "A test",
      image: "ipfs://QmCover",
      properties: {
        zdrive: {
          schemaVersion: ZDRIVE_SCHEMA_VERSION,
          release: {
            assets: [
              { name: "file.zip", mime: "application/zip", uri: "ipfs://Qm1" },
            ],
          },
        },
      },
    };

    const result = parseZDriveMetadata(raw);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Test Release");
    expect(result!.properties.zdrive.release?.assets).toHaveLength(1);
  });
});

describe("buildCollectionId / parseCollectionId", () => {
  it("builds a collection ID", () => {
    const id = buildCollectionId(8453, "0xABC123", "my-collection");
    expect(id).toBe("8453:0xabc123:my-collection");
  });

  it("lowercases the creator address", () => {
    const id = buildCollectionId(8453, "0xABCDEF", "slug");
    expect(id).toContain("0xabcdef");
  });

  it("parses a valid collection ID", () => {
    const result = parseCollectionId("8453:0xabc123:my-collection");
    expect(result).not.toBeNull();
    expect(result!.chainId).toBe(8453);
    expect(result!.creatorAddress).toBe("0xabc123");
    expect(result!.slug).toBe("my-collection");
  });

  it("roundtrips build → parse", () => {
    const id = buildCollectionId(8453, "0xCreator", "test-slug");
    const parsed = parseCollectionId(id);
    expect(parsed).not.toBeNull();
    expect(parsed!.chainId).toBe(8453);
    expect(parsed!.slug).toBe("test-slug");
  });

  it("returns null for invalid format", () => {
    expect(parseCollectionId("invalid")).toBeNull();
    expect(parseCollectionId("not:enough")).toBeNull();
    expect(parseCollectionId("abc:0x123:slug")).toBeNull(); // non-numeric chainId
  });
});

describe("getFilenameFromUri", () => {
  it("extracts filename from IPFS URI", () => {
    expect(getFilenameFromUri("ipfs://QmHash/model.stl")).toBe("model.stl");
  });

  it("extracts filename from HTTP URL", () => {
    expect(
      getFilenameFromUri("https://gateway.ipfs.io/ipfs/QmHash/doc.pdf"),
    ).toBe("doc.pdf");
  });

  it("returns undefined for bare CID", () => {
    expect(getFilenameFromUri("ipfs://QmHash")).toBeUndefined();
  });

  it("returns undefined for hash-only segment", () => {
    expect(
      getFilenameFromUri("ipfs://bafkreiabcdef1234567890"),
    ).toBeUndefined();
  });
});
