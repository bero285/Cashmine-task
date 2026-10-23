// Small runtime checks that turn untrusted JSON (`unknown`) into typed values.
// Each throws InvalidResponseError naming the bad path, so contract breaks are easy to spot.
import { InvalidResponseError } from '@/services/api-error';
import { parseDecimal } from '@/utils/amount';

export type JsonObject = Record<string, unknown>;

function fail(path: string, expected: string): never {
  throw new InvalidResponseError(`${path}: expected ${expected}`);
}

export function object(value: unknown, path: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(path, 'an object');
  return value as JsonObject;
}

export function array<T>(value: unknown, path: string, item: (v: unknown, p: string) => T): T[] {
  if (!Array.isArray(value)) fail(path, 'an array');
  return value.map((v: unknown, i) => item(v, `${path}[${i}]`));
}

export function string(value: unknown, path: string): string {
  if (typeof value !== 'string') fail(path, 'a string');
  return value;
}

export function nullableString(value: unknown, path: string): string | null {
  return value === null ? null : string(value, path);
}

export function integer(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    fail(path, 'a non-negative integer');
  }
  return value;
}

export function oneOf<T extends string>(value: unknown, path: string, options: readonly T[]): T {
  const found = options.find((option) => option === value);
  if (found === undefined) fail(path, options.join(' | '));
  return found;
}

// Unsigned decimal string in the API's amount format; `maxDecimals` when the asset is known.
export function amount(value: unknown, path: string, maxDecimals?: number): string {
  const text = string(value, path);
  const parsed = parseDecimal(text);
  if (!parsed) fail(path, 'a decimal string');
  if (maxDecimals !== undefined && parsed.scale > maxDecimals) {
    fail(path, `at most ${maxDecimals} decimals`);
  }
  return text;
}

// Activity amounts are signed ("-9.81").
export function signedAmount(value: unknown, path: string): string {
  const text = string(value, path);
  amount(text.startsWith('-') ? text.slice(1) : text, path);
  return text;
}
