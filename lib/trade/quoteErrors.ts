/**
 * Categorize quote errors into actionable types for the UI.
 *
 * - "transient": network/server issues that may resolve on retry
 * - "quote_unavailable": the quote service cannot produce a quote for this pair/amount
 * - "unknown": anything else
 */
export type QuoteErrorCategory = 'transient' | 'quote_unavailable' | 'unknown';

export interface CategorizedQuoteError {
  category: QuoteErrorCategory;
  userMessage: string;
  raw: unknown;
}

const TRANSIENT_PATTERNS = [
  'fetch failed',
  'network',
  'timed out',
  'timeout',
  'econnrefused',
  'econnreset',
  'enotfound',
  '500',
  '502',
  '503',
  '504',
  'internal server error',
  'service unavailable',
  'bad gateway',
  'gateway timeout',
  'rate limit',
  'too many requests',
] as const;

const QUOTE_UNAVAILABLE_PATTERNS = [
  'insufficient liquidity',
  'no route',
  'pair not found',
  'token not found',
  'unsupported',
  'invalid token',
  'cannot quote',
  'no pool',
  'quote failed',
] as const;

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function categorizeQuoteError(error: unknown): CategorizedQuoteError {
  const msg = extractMessage(error).toLowerCase();

  for (const pattern of TRANSIENT_PATTERNS) {
    if (msg.includes(pattern)) {
      return {
        category: 'transient',
        userMessage: 'Quote service temporarily unavailable \u2014 retrying...',
        raw: error,
      };
    }
  }

  for (const pattern of QUOTE_UNAVAILABLE_PATTERNS) {
    if (msg.includes(pattern)) {
      return {
        category: 'quote_unavailable',
        userMessage: 'Unable to get quote \u2014 the pool may still be initializing. Try again in a moment.',
        raw: error,
      };
    }
  }

  return {
    category: 'unknown',
    userMessage: 'Unable to get quote \u2014 try again',
    raw: error,
  };
}
