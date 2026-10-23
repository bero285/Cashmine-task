import { ApiError, InvalidResponseError, NetworkError } from '@/services/api-error';

// Plain-language text for a failed request, shown next to a Retry button.
export function errorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return "Couldn't reach CashMine. Check your connection and try again.";
  }
  if (error instanceof InvalidResponseError) {
    return 'The server sent an unexpected response. Please try again later.';
  }
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'RATE_LIMITED':
        return 'Too many requests. Wait a moment and try again.';
      case 'TIMEOUT':
        return 'The server took too long to answer. Please try again.';
      case 'SERVER':
        return 'CashMine is having a temporary problem. Please try again.';
      default:
        // VALIDATION, NOT_FOUND, IDEMPOTENCY_MISMATCH: the server's message is the most specific.
        return error.message;
    }
  }
  return 'Something went wrong. Please try again.';
}
