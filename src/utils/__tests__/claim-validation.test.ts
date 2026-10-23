import { formatUnits } from '@/utils/amount';
import { computeReceive, validateClaimAmount, type ClaimRules } from '@/utils/claim-validation';

const rules: ClaimRules = { decimals: 6, minAmount: '0.01', fee: '0.0012', available: '1.5' };

describe('validateClaimAmount', () => {
  it('accepts a valid amount and returns the receive amount', () => {
    const result = validateClaimAmount('0.5', rules);
    expect(result).toEqual({ ok: true, amount: '0.5', units: 500_000n, receiveUnits: 498_800n });
  });

  it('returns the amount in canonical form', () => {
    const result = validateClaimAmount('0.50', rules);
    expect(result.ok && result.amount).toBe('0.5');
  });

  it('accepts trailing zeros beyond the decimals and sends the canonical amount', () => {
    const result = validateClaimAmount('0.5000000', rules);
    expect(result.ok && result.amount).toBe('0.5');
  });

  it('accepts a comma as the decimal separator', () => {
    const result = validateClaimAmount('1,2', rules);
    expect(result.ok && result.amount).toBe('1.2');
  });

  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['abc', 'format'],
    ['.5', 'format'],
    ['05', 'format'],
    ['0.1234567', 'decimals'],
    ['0.005', 'belowMin'],
    ['1.500001', 'aboveAvailable'],
  ])('rejects %p with %p', (input, error) => {
    expect(validateClaimAmount(input, rules)).toEqual({ ok: false, error });
  });

  it('accepts exactly the minimum amount', () => {
    expect(validateClaimAmount('0.01', rules).ok).toBe(true);
  });

  it('accepts exactly the available amount (Max)', () => {
    expect(validateClaimAmount('1.5', rules).ok).toBe(true);
  });

  it('rejects an amount that does not exceed the fee', () => {
    const lowMin: ClaimRules = { ...rules, minAmount: '0.001' };
    expect(validateClaimAmount('0.0012', lowMin)).toEqual({ ok: false, error: 'notAboveFee' });
  });

  it('rejects any amount when nothing is available', () => {
    const empty: ClaimRules = { ...rules, available: '0' };
    expect(validateClaimAmount('0.01', empty)).toEqual({ ok: false, error: 'aboveAvailable' });
  });
});

describe('computeReceive', () => {
  it('subtracts the fee from the amount', () => {
    expect(formatUnits(computeReceive(500_000n, 1_200n), 6)).toBe('0.4988');
  });

  it('works at 18 decimals without precision loss', () => {
    const amount = 1_000_000_000_000_000_001n;
    const fee = 1_200_000_000_000_000n;
    expect(formatUnits(computeReceive(amount, fee), 18)).toBe('0.998800000000000001');
  });
});
