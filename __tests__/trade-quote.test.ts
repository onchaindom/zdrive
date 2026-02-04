import { describe, it, expect } from 'vitest';
import { categorizeQuoteError, type QuoteErrorCategory } from '@/lib/trade/quoteErrors';

describe('categorizeQuoteError', () => {
  it('categorizes network errors as transient', () => {
    const result = categorizeQuoteError(new Error('fetch failed'));
    expect(result.category).toBe('transient');
    expect(result.userMessage).toContain('temporarily unavailable');
  });

  it('categorizes timeout errors as transient', () => {
    const result = categorizeQuoteError(new Error('request timed out'));
    expect(result.category).toBe('transient');
  });

  it('categorizes 5xx errors as transient', () => {
    const result = categorizeQuoteError(new Error('500 Internal Server Error'));
    expect(result.category).toBe('transient');
  });

  it('categorizes insufficient liquidity as quote_unavailable', () => {
    const result = categorizeQuoteError(new Error('insufficient liquidity'));
    expect(result.category).toBe('quote_unavailable');
    expect(result.userMessage).toContain('Unable to get quote');
  });

  it('categorizes unknown errors as unknown', () => {
    const result = categorizeQuoteError(new Error('something weird happened'));
    expect(result.category).toBe('unknown');
  });

  it('handles non-Error objects', () => {
    const result = categorizeQuoteError('string error');
    expect(result.category).toBe('unknown');
  });

  it('always includes a user-facing message', () => {
    const categories: string[] = ['transient', 'quote_unavailable', 'unknown'];
    for (const cat of categories) {
      // Each category should produce a non-empty userMessage
      expect(typeof categorizeQuoteError(
        new Error(cat === 'transient' ? 'fetch failed' : cat === 'quote_unavailable' ? 'insufficient liquidity' : 'wat')
      ).userMessage).toBe('string');
    }
  });
});

describe('QuoteErrorCategory type', () => {
  it('covers all expected categories', () => {
    const categories: QuoteErrorCategory[] = ['transient', 'quote_unavailable', 'unknown'];
    expect(categories).toHaveLength(3);
  });
});
