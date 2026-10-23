import { apiRequest } from '@/services/api-client';
import {
  decodeActivityPage,
  decodeBalances,
  decodeClaim,
  decodeClaimOptions,
} from '@/services/decoders';
import type {
  ActivityPage,
  BalancesResponse,
  Claim,
  ClaimOptions,
  CreateClaimBody,
} from '@/services/types';

export const ACTIVITY_PAGE_SIZE = 20;

export function getBalances(token: string, signal?: AbortSignal): Promise<BalancesResponse> {
  return apiRequest('/v1/balances', { token, signal, decode: decodeBalances });
}

export function getActivity(
  token: string,
  cursor: string | null,
  signal?: AbortSignal,
): Promise<ActivityPage> {
  const params = new URLSearchParams({ limit: String(ACTIVITY_PAGE_SIZE) });
  if (cursor) params.set('cursor', cursor);
  return apiRequest(`/v1/activity?${params}`, { token, signal, decode: decodeActivityPage });
}

export function getClaimOptions(
  token: string,
  asset: string,
  signal?: AbortSignal,
): Promise<ClaimOptions> {
  const params = new URLSearchParams({ asset });
  return apiRequest(`/v1/claim-options?${params}`, { token, signal, decode: decodeClaimOptions });
}

// Same key + same body is safe to repeat: the server returns the original claim.
export function postClaim(
  token: string,
  body: CreateClaimBody,
  idempotencyKey: string,
): Promise<Claim> {
  return apiRequest('/v1/claims', {
    token,
    method: 'POST',
    body,
    headers: { 'Idempotency-Key': idempotencyKey },
    decode: decodeClaim,
  });
}

export function getClaim(token: string, id: string, signal?: AbortSignal): Promise<Claim> {
  return apiRequest(`/v1/claims/${encodeURIComponent(id)}`, { token, signal, decode: decodeClaim });
}
