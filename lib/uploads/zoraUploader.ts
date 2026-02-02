import { createZoraUploaderForCreator } from "@zoralabs/coins-sdk";
import type { Uploader, UploadResult } from "@zoralabs/coins-sdk";
import type { Address } from "viem";

/**
 * Extension-to-MIME lookup for file types browsers commonly misidentify.
 * Zora's IPFS endpoint does server-side magic-byte sniffing and rejects
 * `application/octet-stream`. Browsers often fail to detect MIME for
 * GLB/GLTF files, so we correct before uploading.
 *
 * Only includes types empirically proven to work with Zora's endpoint
 * (tested via scripts/test-zora-upload.mjs).
 */
const EXTENSION_MIME_MAP: Record<string, string> = {
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

/**
 * Re-wrap a File with the correct MIME type if the browser assigned
 * `application/octet-stream` or left it empty.
 */
export function ensureCorrectMime(file: File): File {
  if (file.type && file.type !== "application/octet-stream") {
    return file;
  }

  const dotIndex = file.name.lastIndexOf(".");
  if (dotIndex === -1) return file;

  const ext = file.name.slice(dotIndex).toLowerCase();
  const correctMime = EXTENSION_MIME_MAP[ext];

  if (correctMime) {
    return new File([file], file.name, { type: correctMime });
  }

  return file;
}

export interface ZoraUploadFileResult {
  uri: `ipfs://${string}`;
  mimeType: string | undefined;
  size: number | undefined;
  sha256?: string;
}

export interface ZoraUploadJsonResult {
  uri: `ipfs://${string}`;
}

export interface UploadFilesOptions {
  computeSha256?: boolean;
  onProgress?: (completed: number, total: number) => void;
  maxConcurrency?: number;
}

export interface UploadFileEntry {
  file: File;
  result: ZoraUploadFileResult;
}

/**
 * Read a File/Blob as an ArrayBuffer.
 * Falls back to FileReader for environments where arrayBuffer() is unavailable (e.g. jsdom).
 */
function readAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") {
    return file.arrayBuffer();
  }
  // Fallback for older jsdom / environments
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Compute SHA-256 hash of a file using the Web Crypto API.
 * Returns hex string.
 */
export async function computeSha256(file: File): Promise<string> {
  const buffer = await readAsArrayBuffer(file);
  const bytes = new Uint8Array(buffer);

  // Use Web Crypto API in browser, fall back to Node crypto for test/SSR environments
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback: Node.js crypto (for jsdom/test environments)
    const { createHash } = await import("crypto");
    return createHash("sha256").update(bytes).digest("hex");
  }
}

/**
 * Retry wrapper with exponential backoff.
 * Only retries on network errors or 5xx status codes.
 * Does NOT retry on 400 (unsupported file type — won't change on retry).
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isRetryable =
        error instanceof TypeError || // network error (fetch failed)
        (error instanceof Error &&
          /5\d{2}|failed to upload/i.test(error.message));

      if (!isRetryable || attempt === maxAttempts - 1) {
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

/**
 * Simple concurrency limiter using a semaphore pattern.
 */
async function withConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  maxConcurrency: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      try {
        const value = await tasks[index]();
        results[index] = { status: "fulfilled", value };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(maxConcurrency, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return results;
}

/**
 * Upload service using Zora SDK's native IPFS uploader.
 * All supported file types (images, video, PDF, GLB/GLTF, JSON, text)
 * have been empirically verified to work with Zora's endpoint.
 */
export class ZoraUploadService {
  private uploader: Uploader;

  constructor(creatorAddress: Address) {
    this.uploader = createZoraUploaderForCreator(creatorAddress);
  }

  /**
   * Upload a single file to Zora's IPFS infrastructure.
   */
  async uploadFile(
    file: File,
    shouldComputeSha256 = false,
  ): Promise<ZoraUploadFileResult> {
    const correctedFile = ensureCorrectMime(file);

    const [uploadResult, sha256] = await Promise.all([
      withRetry(() => this.uploader.upload(correctedFile)),
      shouldComputeSha256 ? computeSha256(file) : undefined,
    ]);

    return {
      uri: uploadResult.url as `ipfs://${string}`,
      mimeType: uploadResult.mimeType,
      size: uploadResult.size,
      sha256,
    };
  }

  /**
   * Upload a JSON payload as a file to Zora's IPFS infrastructure.
   */
  async uploadJson(
    payload: Record<string, unknown>,
  ): Promise<ZoraUploadJsonResult> {
    const jsonString = JSON.stringify(payload);
    const file = new File([jsonString], "metadata.json", {
      type: "application/json",
    });

    const result = await withRetry(() => this.uploader.upload(file));

    return {
      uri: result.url as `ipfs://${string}`,
    };
  }

  /**
   * Upload multiple files in parallel with concurrency control and progress tracking.
   */
  async uploadFiles(
    files: File[],
    options: UploadFilesOptions = {},
  ): Promise<UploadFileEntry[]> {
    const {
      computeSha256: shouldComputeSha256 = false,
      onProgress,
      maxConcurrency = 3,
    } = options;

    let completed = 0;

    const tasks = files.map((file) => async () => {
      const result = await this.uploadFile(file, shouldComputeSha256);
      completed++;
      onProgress?.(completed, files.length);
      return { file, result };
    });

    const settled = await withConcurrency(tasks, maxConcurrency);

    // Collect results, throw on any failure
    const results: UploadFileEntry[] = [];
    const errors: string[] = [];

    for (let i = 0; i < settled.length; i++) {
      const entry = settled[i];
      if (entry.status === "fulfilled") {
        results.push(entry.value);
      } else {
        const reason =
          entry.reason instanceof Error
            ? entry.reason.message
            : String(entry.reason);
        errors.push(`${files[i].name}: ${reason}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Upload failed for: ${errors.join("; ")}`);
    }

    return results;
  }
}
