import type { CreateClaimBody } from '@/services/types';

// A claim submission that has not had a definite answer yet. Kept across reloads so a lost
// response is retried with the same Idempotency-Key and can never create a second claim.
export type ClaimDraft = {
  // The token it was sent with: never resend someone's claim under a different token.
  token: string;
  idempotencyKey: string;
  body: CreateClaimBody;
  savedAtMs: number;
};

export function isSameClaimBody(a: CreateClaimBody, b: CreateClaimBody): boolean {
  return a.asset === b.asset && a.amount === b.amount && a.destinationId === b.destinationId;
}

const isString = (value: unknown): value is string => typeof value === 'string';

// Storage is untrusted (old versions, manual edits): anything unexpected reads as "no draft".
export function parseClaimDraft(stored: string | null): ClaimDraft | null {
  if (!stored) return null;
  try {
    const value: unknown = JSON.parse(stored);
    if (typeof value !== 'object' || value === null) return null;
    const { token, idempotencyKey, body, savedAtMs } = value as Record<string, unknown>;
    if (typeof body !== 'object' || body === null) return null;
    const { asset, amount, destinationId } = body as Record<string, unknown>;
    if (![token, idempotencyKey, asset, amount, destinationId].every(isString)) return null;
    if (typeof savedAtMs !== 'number') return null;
    return {
      token: token as string,
      idempotencyKey: idempotencyKey as string,
      body: { asset: asset as string, amount: amount as string, destinationId: destinationId as string },
      savedAtMs,
    };
  } catch {
    return null;
  }
}
