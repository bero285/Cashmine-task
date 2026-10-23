import { useMutation, useQuery } from '@tanstack/react-query';

import { useRequiredToken } from '@/hooks/use-token';
import { isRetryable, retryDelayMs } from '@/services/api-error';
import { getClaim, postClaim } from '@/services/endpoints';
import { queryKeys } from '@/services/query-keys';
import type { CreateClaimBody } from '@/services/types';

const MAX_SUBMIT_RETRIES = 3;

export type CreateClaimVariables = { body: CreateClaimBody; idempotencyKey: string };

export function useCreateClaim() {
  const token = useRequiredToken();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: CreateClaimVariables) =>
      postClaim(token, body, idempotencyKey),
    // Safe only because every retry sends the same Idempotency-Key and body: the server returns
    // the original claim instead of creating a second one.
    retry: (failureCount, error) => failureCount < MAX_SUBMIT_RETRIES && isRetryable(error),
    retryDelay: retryDelayMs,
  });
}

export function useClaim(id: string) {
  const token = useRequiredToken();
  return useQuery({
    queryKey: queryKeys.claim(id),
    queryFn: ({ signal }) => getClaim(token, id, signal),
  });
}
