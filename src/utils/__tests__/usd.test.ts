import { formatUsd, usdCents, usdTotals } from '@/utils/usd';

describe('usdCents', () => {
  it('multiplies amount by price exactly and rounds down to the cent', () => {
    // 820.413207 × 1.0002 = 820.5772896414
    expect(usdCents('820.413207', '1.0002')).toBe(82_057n);
  });

  it('rounds down, never up', () => {
    expect(usdCents('0.019999', '1')).toBe(1n);
    expect(usdCents('1', '0.999')).toBe(99n);
  });

  it('handles small amounts of expensive assets', () => {
    // 0.0005 × 67000.12 = 33.50006
    expect(usdCents('0.0005', '67000.12')).toBe(3_350n);
  });

  it('handles a price with fewer than two decimals', () => {
    expect(usdCents('3', '2')).toBe(600n);
  });

  it('returns zero for a zero amount', () => {
    expect(usdCents('0', '67000.12')).toBe(0n);
  });
});

describe('usdTotals', () => {
  const usdt = { available: '820.413207', pending: '50.12', claiming: '0', usdPrice: '1.0002' };
  const btc = { available: '0.0005', pending: '0.0001', claiming: '0.0002', usdPrice: '67000.12' };

  it('sums each bucket across assets', () => {
    expect(usdTotals([usdt, btc])).toEqual({
      available: 85_407n, // 820.5772896414 + 33.50006
      pending: 5_683n, // 50.130024 + 6.700012
      claiming: 1_340n, // 0 + 13.400024
      total: 92_430n,
    });
  });

  it('rounds each bucket down after summing the exact values', () => {
    // 0.005 + 0.005 = 0.01 exactly, so the bucket is 1 cent, not 0 + 0.
    const half = { available: '0.005', pending: '0', claiming: '0', usdPrice: '1' };
    expect(usdTotals([half, half]).available).toBe(1n);
  });

  it('makes the total equal the sum of the shown buckets', () => {
    const item = { available: '0.005', pending: '0.005', claiming: '0', usdPrice: '1' };
    const totals = usdTotals([item]);
    expect(totals.total).toBe(totals.available + totals.pending + totals.claiming);
  });

  it('returns zeros for no assets', () => {
    expect(usdTotals([])).toEqual({ available: 0n, pending: 0n, claiming: 0n, total: 0n });
  });
});

describe('formatUsd', () => {
  it.each([
    [0n, '$0.00'],
    [5n, '$0.05'],
    [100n, '$1.00'],
    [123_456_789n, '$1,234,567.89'],
  ])('formats %p cents as %p', (cents, text) => {
    expect(formatUsd(cents)).toBe(text);
  });
});
