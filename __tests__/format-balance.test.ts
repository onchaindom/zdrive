import { describe, it, expect } from 'vitest';

// Inline the function for testing since it's not exported
function formatTokenBalance(balance: string): string {
  const cleaned = balance.split('.')[0];
  let num: number;
  if (cleaned.length > 18) {
    const intPart = cleaned.slice(0, cleaned.length - 18);
    const fracPart = cleaned.slice(cleaned.length - 18, cleaned.length - 12);
    num = parseFloat(`${intPart}.${fracPart}`);
  } else {
    const padded = cleaned.padStart(18, '0');
    num = parseFloat(`0.${padded}`);
  }
  if (isNaN(num)) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  if (num >= 1) return num.toFixed(2);
  if (num < 0.001 && num > 0) return '<0.001';
  return num.toFixed(3);
}

describe('formatTokenBalance', () => {
  it('formats a large holder balance (990 tokens)', () => {
    // 990 * 10^18 = 990000000000000000000
    expect(formatTokenBalance('990000000000000000000')).toBe('990.00');
  });

  it('formats 1 billion tokens', () => {
    // 1B * 10^18
    expect(formatTokenBalance('1000000000000000000000000000')).toBe('1.00B');
  });

  it('formats 5 million tokens', () => {
    // 5M * 10^18
    expect(formatTokenBalance('5000000000000000000000000')).toBe('5.00M');
  });

  it('formats 1500 tokens', () => {
    // 1500 * 10^18
    expect(formatTokenBalance('1500000000000000000000')).toBe('1.50K');
  });

  it('formats 10 tokens', () => {
    expect(formatTokenBalance('10000000000000000000')).toBe('10.00');
  });

  it('formats 1 token', () => {
    expect(formatTokenBalance('1000000000000000000')).toBe('1.00');
  });

  it('formats fractional tokens (0.5)', () => {
    expect(formatTokenBalance('500000000000000000')).toBe('0.500');
  });

  it('formats tiny amounts', () => {
    expect(formatTokenBalance('100000000000')).toBe('<0.001');
  });

  it('formats zero', () => {
    expect(formatTokenBalance('0')).toBe('0.000');
  });

  it('handles balance string with decimal point from API', () => {
    // The API sometimes returns "990000000000000000.008"
    expect(formatTokenBalance('990000000000000000.008')).toBe('0.990');
  });

  it('handles balance string with larger integer + decimal from API', () => {
    // "10000000000000000000.5" should be ~10 tokens
    expect(formatTokenBalance('10000000000000000000.5')).toBe('10.00');
  });
});
