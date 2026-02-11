/**
 * Polyfills for APIs not available in older Node.js versions.
 * Import this at the top of any entry point that uses these features.
 */

// Promise.withResolvers polyfill (added in Node.js 22, ES2024)
// Required by Three.js 0.169+ and some other modern libraries
if (typeof Promise.withResolvers !== 'function') {
  // TypeScript thinks this exists because of ES2024 lib, but Node 20 doesn't have it
  (Promise as { withResolvers?: typeof Promise.withResolvers }).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export {};
