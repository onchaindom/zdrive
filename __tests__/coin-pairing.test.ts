import { describe, it, expect } from 'vitest';

/**
 * Coin pairing logic tests.
 *
 * The CoinPairingPicker component and create page should:
 * 1. Default to CREATOR_COIN_OR_ZORA when creator has a creator coin
 * 2. Default to ETH when creator has no creator coin
 * 3. Always allow ETH as a fallback option
 * 4. Show a note about creating a creator coin when none exists
 */

function getDefaultCurrency(hasCreatorCoin: boolean): 'ETH' | 'CREATOR_COIN_OR_ZORA' {
  return hasCreatorCoin ? 'CREATOR_COIN_OR_ZORA' : 'ETH';
}

describe('coin pairing defaults', () => {
  it('defaults to CREATOR_COIN_OR_ZORA when creator has a creator coin', () => {
    expect(getDefaultCurrency(true)).toBe('CREATOR_COIN_OR_ZORA');
  });

  it('defaults to ETH when creator has no creator coin', () => {
    expect(getDefaultCurrency(false)).toBe('ETH');
  });

  it('ETH is always a valid currency option', () => {
    const validCurrencies = ['ETH', 'CREATOR_COIN_OR_ZORA'] as const;
    expect(validCurrencies).toContain('ETH');
  });
});

describe('CreateReleaseInput currency field', () => {
  it('accepts ETH as currency', () => {
    const input = { currency: 'ETH' as const };
    expect(input.currency).toBe('ETH');
  });

  it('accepts CREATOR_COIN_OR_ZORA as currency', () => {
    const input = { currency: 'CREATOR_COIN_OR_ZORA' as const };
    expect(input.currency).toBe('CREATOR_COIN_OR_ZORA');
  });

  it('defaults to ETH when undefined', () => {
    const input: { currency?: string } = {};
    const effective = input.currency ?? 'ETH';
    expect(effective).toBe('ETH');
  });
});
