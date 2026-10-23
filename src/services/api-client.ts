import { ApiError, NetworkError } from '@/services/api-error';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/services/config';
import { decodeErrorBody } from '@/services/decoders';
import type { ApiErrorCode } from '@/services/types';

export type RequestOptions<T> = {
  token: string;
  decode: (data: unknown) => T;
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

// Used when the error body isn't the documented envelope (e.g. a proxy's HTML 502).
function codeForStatus(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION';
    case 401:
      return 'UNAUTHORIZED';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'IDEMPOTENCY_MISMATCH';
    case 429:
      return 'RATE_LIMITED';
    case 504:
      return 'TIMEOUT';
    default:
      return 'SERVER';
  }
}

function retryAfterHeaderMs(response: Response): number | undefined {
  const seconds = Number(response.headers.get('Retry-After') ?? NaN);
  return Number.isFinite(seconds) ? seconds * 1_000 : undefined;
}

function toApiError(response: Response, data: unknown): ApiError {
  const body = decodeErrorBody(data);
  return new ApiError({
    status: response.status,
    code: body?.code ?? codeForStatus(response.status),
    message: body?.message ?? `Request failed with status ${response.status}`,
    field: body?.field,
    retryAfterMs: body?.retryAfterMs ?? retryAfterHeaderMs(response),
  });
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Not JSON: the decoder (2xx) or the status fallback (errors) handles it.
    return undefined;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const { token, decode, method = 'GET', body, headers, signal } = options;

  // Own controller so both the caller's signal (TanStack cancel) and our timeout can abort.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    let response: Response;
    let text: string;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body !== undefined && { 'Content-Type': 'application/json' }),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      // Read inside the try: a connection dropped mid-body is a network failure, not bad data.
      text = await response.text();
    } catch (error) {
      // Cancelled by the caller (unmount, newer fetch): TanStack discards it, so pass it through.
      if (signal?.aborted && !timedOut) throw error;
      throw new NetworkError(timedOut ? 'The request timed out' : 'Network request failed');
    }

    const data = parseJson(text);
    if (!response.ok) throw toApiError(response, data);
    return decode(data);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}
