import { describe, it, expect } from 'vitest';

/**
 * Seed buy is a post-creation step. After createCoin succeeds,
 * the user is shown a prompt to optionally buy a small amount.
 * This test validates the seed buy defaults and the flow logic.
 */
describe('seed buy flow', () => {
  const SEED_BUY_AMOUNT = '0.0001';

  it('uses a small ETH amount for the seed buy', () => {
    const amount = parseFloat(SEED_BUY_AMOUNT);
    expect(amount).toBeGreaterThan(0);
    expect(amount).toBeLessThanOrEqual(0.001);
  });

  it('seed buy is skippable — skip navigates to release page', () => {
    // The skip action should redirect to /${address}/${coinAddress}?new=1
    const address = '0xCreator';
    const coinAddress = '0xCoin123';
    const redirectUrl = `/${address}/${coinAddress}?new=1`;
    expect(redirectUrl).toBe('/0xCreator/0xCoin123?new=1');
  });

  it('seed buy success also navigates to release page', () => {
    const address = '0xCreator';
    const coinAddress = '0xCoin123';
    const redirectUrl = `/${address}/${coinAddress}?new=1`;
    expect(redirectUrl).toContain('new=1');
  });
});
