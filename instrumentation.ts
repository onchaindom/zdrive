/**
 * Next.js instrumentation hook - runs before app loads.
 * Use this for server-side polyfills that need to be available globally.
 */

export async function register() {
  // Promise.withResolvers polyfill (added in Node.js 22, ES2024)
  // Required by Three.js 0.169+ and some other modern libraries
  if (typeof Promise.withResolvers !== 'function') {
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
}
