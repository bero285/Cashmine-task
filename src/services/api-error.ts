import type { ApiErrorCode } from '@/services/types';

// The server answered with an error status.
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly field?: string;
  readonly retryAfterMs?: number;

  constructor(init: {
    status: number;
    code: ApiErrorCode;
    message: string;
    field?: string;
    retryAfterMs?: number;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.field = init.field;
    this.retryAfterMs = init.retryAfterMs;
  }
}

// No response at all (offline, DNS, CORS, client timeout). The outcome of a POST is unknown.
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// A 2xx body that doesn't match the documented shape. Retrying won't fix it.
export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidResponseError';
  }
}

export type ApiFailure = ApiError | NetworkError | InvalidResponseError;

export function isRetryable(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof ApiError) return error.status === 429 || error.status >= 500;
  return false;
}

// For a POST: the server answered and refused (4xx except 429), so nothing was created.
// Anything else (network, 429, 5xx, 504 TIMEOUT) means the outcome is unknown.
export function isDefiniteRejection(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429;
}

const MAX_BACKOFF_MS = 8_000;

// failureCount is 0 on the first failure (TanStack's convention).
export function retryDelayMs(failureCount: number, error: unknown): number {
  if (error instanceof ApiError && error.retryAfterMs !== undefined) return error.retryAfterMs;
  return Math.min(1_000 * 2 ** failureCount, MAX_BACKOFF_MS);
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'UNAUTHORIZED';
}
