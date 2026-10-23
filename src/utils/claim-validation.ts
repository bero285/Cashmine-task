import { formatUnits, normalizeAmountInput, parseUnits, toUnits } from '@/utils/amount';

// All values are API strings in the asset's unit.
export type ClaimRules = {
  decimals: number;
  minAmount: string;
  fee: string;
  available: string;
};

export type ClaimAmountError =
  | 'empty'
  | 'format'
  | 'decimals'
  | 'belowMin'
  | 'aboveAvailable'
  | 'notAboveFee';

export type ClaimAmountResult =
  | { ok: true; amount: string; units: bigint; receiveUnits: bigint }
  | { ok: false; error: ClaimAmountError };

// The fee is taken from the claimed amount.
export function computeReceive(amountUnits: bigint, feeUnits: bigint): bigint {
  return amountUnits - feeUnits;
}

export function validateClaimAmount(input: string, rules: ClaimRules): ClaimAmountResult {
  const value = normalizeAmountInput(input);
  if (value === '') return { ok: false, error: 'empty' };

  const parsed = parseUnits(value, rules.decimals);
  if (!parsed.ok) return parsed;

  const { units } = parsed;
  if (units < toUnits(rules.minAmount, rules.decimals)) return { ok: false, error: 'belowMin' };
  if (units > toUnits(rules.available, rules.decimals)) {
    return { ok: false, error: 'aboveAvailable' };
  }

  // The API doesn't promise minAmount > fee; receiving zero or less is never a valid claim.
  const receiveUnits = computeReceive(units, toUnits(rules.fee, rules.decimals));
  if (receiveUnits <= 0n) return { ok: false, error: 'notAboveFee' };

  // Send the canonical form ("0.50" -> "0.5") so the same value always gives the same body.
  return { ok: true, amount: formatUnits(units, rules.decimals), units, receiveUnits };
}
