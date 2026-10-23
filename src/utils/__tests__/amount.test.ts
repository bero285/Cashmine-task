import { formatUnits, normalizeAmountInput, parseUnits, toUnits } from '@/utils/amount';

describe('normalizeAmountInput', () => {
  it('turns a comma decimal separator into a dot', () => {
    expect(normalizeAmountInput('1,5')).toBe('1.5');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeAmountInput('  2.5 ')).toBe('2.5');
  });
});

describe('parseUnits', () => {
  it.each([
    ['12', 6, 12_000_000n],
    ['0.5', 6, 500_000n],
    ['820.413207', 6, 820_413_207n],
    ['0', 6, 0n],
    ['0.000001', 6, 1n],
    ['0.5', 18, 500_000_000_000_000_000n],
    ['7', 0, 7n],
  ])('parses %s with %i decimals', (value, decimals, units) => {
    expect(parseUnits(value, decimals)).toEqual({ ok: true, units });
  });

  it.each(['', '.5', '1.', '05', '00', '1e-3', '-1', '+1', '1.2.3', '1,5', ' 1', 'abc', '1 000'])(
    'rejects %p as a format error',
    (value) => {
      expect(parseUnits(value, 6)).toEqual({ ok: false, error: 'format' });
    },
  );

  it('rejects more decimal places than the asset allows', () => {
    expect(parseUnits('0.1234567', 6)).toEqual({ ok: false, error: 'decimals' });
  });

  it('ignores trailing zeros when checking decimal places', () => {
    expect(parseUnits('1.0', 0)).toEqual({ ok: true, units: 1n });
    expect(parseUnits('0.5000000', 6)).toEqual({ ok: true, units: 500_000n });
  });

  it('still rejects significant digits beyond the allowed decimals', () => {
    expect(parseUnits('0.1234560', 5)).toEqual({ ok: false, error: 'decimals' });
  });
});

describe('toUnits', () => {
  it('returns units for a valid value', () => {
    expect(toUnits('0.0012', 6)).toBe(1_200n);
  });

  it('throws for an invalid value', () => {
    expect(() => toUnits('1e-3', 6)).toThrow();
  });
});

describe('formatUnits', () => {
  it.each([
    [820_413_207n, 6, '820.413207'],
    [12_000_000n, 6, '12'],
    [1_500_000n, 6, '1.5'],
    [5n, 6, '0.000005'],
    [0n, 6, '0'],
    [12n, 0, '12'],
  ])('formats %p with %i decimals as %p', (units, decimals, text) => {
    expect(formatUnits(units, decimals)).toBe(text);
  });

  it('round-trips with parseUnits', () => {
    expect(parseUnits(formatUnits(123_450_000n, 8), 8)).toEqual({ ok: true, units: 123_450_000n });
  });
});
