import {
  ApiError,
  InvalidResponseError,
  NetworkError,
  isRetryable,
  retryDelayMs,
} from '@/services/api-error';

const apiError = (status: number, retryAfterMs?: number) =>
  new ApiError({ status, code: 'SERVER', message: 'x', retryAfterMs });

describe('isRetryable', () => {
  it.each([429, 500, 502, 503, 504])('retries HTTP %i', (status) => {
    expect(isRetryable(apiError(status))).toBe(true);
  });

  it.each([400, 401, 404, 409])('does not retry HTTP %i', (status) => {
    expect(isRetryable(apiError(status))).toBe(false);
  });

  it('retries network failures', () => {
    expect(isRetryable(new NetworkError('offline'))).toBe(true);
  });

  it('does not retry a response that breaks the API contract', () => {
    expect(isRetryable(new InvalidResponseError('bad'))).toBe(false);
  });
});

describe('retryDelayMs', () => {
  it('waits retryAfterMs on 429', () => {
    expect(retryDelayMs(0, apiError(429, 2300))).toBe(2300);
  });

  it('backs off exponentially from 1 s otherwise', () => {
    expect(retryDelayMs(0, apiError(500))).toBe(1000);
    expect(retryDelayMs(1, apiError(500))).toBe(2000);
    expect(retryDelayMs(2, new NetworkError('offline'))).toBe(4000);
  });

  it('caps the backoff at 8 s', () => {
    expect(retryDelayMs(10, apiError(503))).toBe(8000);
  });
});
