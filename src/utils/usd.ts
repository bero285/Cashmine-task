import { parseDecimal, type Decimal } from '@/utils/amount';

export type UsdBalance = {
  available: string;
  pending: string;
  claiming: string;
  usdPrice: string;
};

export type UsdTotals = { available: bigint; pending: bigint; claiming: bigint; total: bigint };

function decimal(value: string): Decimal {
  const parsed = parseDecimal(value);
  if (!parsed) throw new Error(`Invalid decimal "${value}"`);
  return parsed;
}

function multiply(a: Decimal, b: Decimal): Decimal {
  return { units: a.units * b.units, scale: a.scale + b.scale };
}

function add(a: Decimal, b: Decimal): Decimal {
  const scale = Math.max(a.scale, b.scale);
  return {
    units: a.units * 10n ** BigInt(scale - a.scale) + b.units * 10n ** BigInt(scale - b.scale),
    scale,
  };
}

// Values are never negative, so bigint division (truncation) is rounding down.
function floorCents(value: Decimal): bigint {
  return value.scale >= 2
    ? value.units / 10n ** BigInt(value.scale - 2)
    : value.units * 10n ** BigInt(2 - value.scale);
}

const ZERO: Decimal = { units: 0n, scale: 0 };

function sumCents(items: UsdBalance[], pick: (item: UsdBalance) => string): bigint {
  const exact = items.reduce(
    (sum, item) => add(sum, multiply(decimal(pick(item)), decimal(item.usdPrice))),
    ZERO,
  );
  return floorCents(exact);
}

export function usdCents(amount: string, usdPrice: string): bigint {
  return floorCents(multiply(decimal(amount), decimal(usdPrice)));
}

export function usdTotals(items: UsdBalance[]): UsdTotals {
  const available = sumCents(items, (item) => item.available);
  const pending = sumCents(items, (item) => item.pending);
  const claiming = sumCents(items, (item) => item.claiming);
  // Total is the sum of the shown (rounded-down) buckets so the numbers on screen add up.
  return { available, pending, claiming, total: available + pending + claiming };
}

export function formatUsd(cents: bigint): string {
  const dollars = (cents / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const rest = (cents % 100n).toString().padStart(2, '0');
  return `$${dollars}.${rest}`;
}
