// Decimal strings <-> bigint base units. Never goes through Number, so no float rounding.

// API format: digits, optional dot + digits, no leading zeros ("0.5", "12"; not ".5", "1.", "05").
const AMOUNT_PATTERN = /^(0|[1-9]\d*)(?:\.(\d+))?$/;

export type ParseError = 'format' | 'decimals';
export type ParseResult = { ok: true; units: bigint } | { ok: false; error: ParseError };

// A decimal value as an integer plus how many digits sit after the point.
export type Decimal = { units: bigint; scale: number };

// Many phone keyboards only offer "," as the decimal key, so accept it as ".".
export function normalizeAmountInput(raw: string): string {
  return raw.trim().replace(/,/g, '.');
}

export function parseDecimal(value: string): Decimal | null {
  const match = AMOUNT_PATTERN.exec(value);
  if (!match) return null;
  // Trailing zeros don't change the value, so "1.0" counts as 0 decimal places.
  const fraction = (match[2] ?? '').replace(/0+$/, '');
  return { units: BigInt(match[1] + fraction), scale: fraction.length };
}

export function parseUnits(value: string, decimals: number): ParseResult {
  const parsed = parseDecimal(value);
  if (!parsed) return { ok: false, error: 'format' };
  if (parsed.scale > decimals) return { ok: false, error: 'decimals' };
  return { ok: true, units: parsed.units * 10n ** BigInt(decimals - parsed.scale) };
}

// For values the API already guarantees; a bad one is a contract breach, not user input.
export function toUnits(value: string, decimals: number): bigint {
  const result = parseUnits(value, decimals);
  if (!result.ok) throw new Error(`Invalid amount "${value}" for ${decimals} decimals`);
  return result.units;
}

export function formatUnits(units: bigint, decimals: number): string {
  const sign = units < 0n ? '-' : '';
  const digits = (units < 0n ? -units : units).toString().padStart(decimals + 1, '0');
  const whole = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, '');
  return sign + (fraction ? `${whole}.${fraction}` : whole);
}
