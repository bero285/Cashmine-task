import { ApiError, InvalidResponseError, NetworkError } from '@/services/api-error';
import type { ApiErrorCode } from '@/services/types';
import { errorMessage } from '@/utils/error-message';

const apiError = (code: ApiErrorCode, status: number, message = 'Server says no') =>
  new ApiError({ status, code, message });

describe('errorMessage', () => {
  it('explains a network failure', () => {
    expect(errorMessage(new NetworkError('x'))).toMatch(/connection/i);
  });

  it('explains rate limiting', () => {
    expect(errorMessage(apiError('RATE_LIMITED', 429))).toMatch(/too many requests/i);
  });

  it.each([
    ['SERVER', 500],
    ['SERVER', 503],
  ] as const)('explains a temporary %s %i error', (code, status) => {
    expect(errorMessage(apiError(code, status))).toMatch(/temporary/i);
  });

  it('explains a timeout', () => {
    expect(errorMessage(apiError('TIMEOUT', 504))).toMatch(/took too long/i);
  });

  it('explains a malformed response', () => {
    expect(errorMessage(new InvalidResponseError('x'))).toMatch(/unexpected/i);
  });

  it('shows the server message for validation errors', () => {
    expect(errorMessage(apiError('VALIDATION', 400, 'amount exceeds available'))).toBe(
      'amount exceeds available',
    );
  });
});
