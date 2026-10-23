import {
  amount,
  array,
  integer,
  nullableString,
  object,
  oneOf,
  signedAmount,
  string,
} from '@/services/json-guards';
import type {
  ActivityItem,
  ActivityPage,
  ApiErrorBody,
  ApiErrorCode,
  Balance,
  BalancesResponse,
  Claim,
  ClaimOptions,
  Destination,
} from '@/services/types';

const ERROR_CODES: readonly ApiErrorCode[] = [
  'VALIDATION',
  'UNAUTHORIZED',
  'NOT_FOUND',
  'IDEMPOTENCY_MISMATCH',
  'RATE_LIMITED',
  'SERVER',
  'TIMEOUT',
];

function balance(value: unknown, path: string): Balance {
  const o = object(value, path);
  const decimals = integer(o.decimals, `${path}.decimals`);
  return {
    asset: string(o.asset, `${path}.asset`),
    decimals,
    // Checked against decimals here so the money utils can trust these strings later.
    available: amount(o.available, `${path}.available`, decimals),
    pending: amount(o.pending, `${path}.pending`, decimals),
    claiming: amount(o.claiming, `${path}.claiming`, decimals),
    usdPrice: amount(o.usdPrice, `${path}.usdPrice`),
  };
}

export function decodeBalances(value: unknown): BalancesResponse {
  const o = object(value, 'balances');
  return {
    asOf: string(o.asOf, 'balances.asOf'),
    items: array(o.items, 'balances.items', balance),
  };
}

function activityItem(value: unknown, path: string): ActivityItem {
  const o = object(value, path);
  return {
    id: string(o.id, `${path}.id`),
    type: oneOf(o.type, `${path}.type`, ['accrual', 'reversal', 'claim']),
    asset: string(o.asset, `${path}.asset`),
    amount: signedAmount(o.amount, `${path}.amount`),
    status: oneOf(o.status, `${path}.status`, ['pending', 'confirmed', 'completed', 'failed']),
    exchange: nullableString(o.exchange, `${path}.exchange`),
    createdAt: string(o.createdAt, `${path}.createdAt`),
    relatedId: nullableString(o.relatedId, `${path}.relatedId`),
  };
}

export function decodeActivityPage(value: unknown): ActivityPage {
  const o = object(value, 'activity');
  return {
    items: array(o.items, 'activity.items', activityItem),
    nextCursor: nullableString(o.nextCursor, 'activity.nextCursor'),
  };
}

function destination(value: unknown, path: string): Destination {
  const o = object(value, path);
  return { id: string(o.id, `${path}.id`), label: string(o.label, `${path}.label`) };
}

export function decodeClaimOptions(value: unknown): ClaimOptions {
  const o = object(value, 'claimOptions');
  return {
    asset: string(o.asset, 'claimOptions.asset'),
    minAmount: amount(o.minAmount, 'claimOptions.minAmount'),
    fee: amount(o.fee, 'claimOptions.fee'),
    destinations: array(o.destinations, 'claimOptions.destinations', destination),
  };
}

export function decodeClaim(value: unknown): Claim {
  const o = object(value, 'claim');
  return {
    id: string(o.id, 'claim.id'),
    asset: string(o.asset, 'claim.asset'),
    amount: amount(o.amount, 'claim.amount'),
    fee: amount(o.fee, 'claim.fee'),
    receiveAmount: amount(o.receiveAmount, 'claim.receiveAmount'),
    destinationId: string(o.destinationId, 'claim.destinationId'),
    status: oneOf(o.status, 'claim.status', ['pending', 'completed', 'failed']),
    failureReason: nullableString(o.failureReason, 'claim.failureReason'),
    createdAt: string(o.createdAt, 'claim.createdAt'),
    updatedAt: string(o.updatedAt, 'claim.updatedAt'),
  };
}

// Error bodies come from proxies too (HTML 502s), so a mismatch is not an exception here.
export function decodeErrorBody(value: unknown): ApiErrorBody | null {
  try {
    const e = object(object(value, 'body').error, 'error');
    const body: ApiErrorBody = {
      code: oneOf(e.code, 'error.code', ERROR_CODES),
      message: string(e.message, 'error.message'),
    };
    if (typeof e.field === 'string') body.field = e.field;
    if (typeof e.retryAfterMs === 'number') body.retryAfterMs = e.retryAfterMs;
    return body;
  } catch {
    return null;
  }
}
