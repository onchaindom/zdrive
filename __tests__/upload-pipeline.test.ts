import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeSha256 } from "@/lib/uploads/zoraUploader";

// We test computeSha256 directly since it's a pure function.
// The ZoraUploadService class depends on the Zora SDK (network calls),
// so we test its logic through the pure helpers and integration tests.

describe("computeSha256", () => {
  it("computes correct SHA-256 for known input", async () => {
    // SHA-256 of "hello world" is well-known
    const file = new File(["hello world"], "test.txt", {
      type: "text/plain",
    });
    const hash = await computeSha256(file);

    // SHA-256("hello world") = b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
    expect(hash).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    );
  });

  it("computes correct SHA-256 for empty file", async () => {
    const file = new File([""], "empty.txt", { type: "text/plain" });
    const hash = await computeSha256(file);

    // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    expect(hash).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("produces 64-character hex string", async () => {
    const file = new File(["test data"], "test.bin");
    const hash = await computeSha256(file);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different content", async () => {
    const file1 = new File(["content A"], "a.txt");
    const file2 = new File(["content B"], "b.txt");

    const hash1 = await computeSha256(file1);
    const hash2 = await computeSha256(file2);

    expect(hash1).not.toBe(hash2);
  });

  it("produces same hash for same content regardless of filename", async () => {
    const file1 = new File(["same content"], "file1.txt");
    const file2 = new File(["same content"], "file2.txt");

    const hash1 = await computeSha256(file1);
    const hash2 = await computeSha256(file2);

    expect(hash1).toBe(hash2);
  });
});
