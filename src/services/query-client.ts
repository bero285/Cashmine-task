import { QueryClient } from '@tanstack/react-query';

import { isRetryable, retryDelayMs, type ApiFailure } from '@/services/api-error';

// Every query/mutation error is typed as ApiFailure instead of plain Error.
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiFailure;
  }
}

const MAX_QUERY_RETRIES = 3;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => failureCount < MAX_QUERY_RETRIES && isRetryable(error),
        retryDelay: retryDelayMs,
      },
      // POSTs are not safe to repeat by default; the claim mutation opts in with its idempotency key.
      mutations: { retry: false },
    },
  });
}
