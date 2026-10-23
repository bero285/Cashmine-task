import { useQueryClient } from '@tanstack/react-query';

import { useBalanceSync } from '@/hooks/use-balance-sync';
import { useRequiredToken } from '@/hooks/use-token';
import { isDefiniteRejection } from '@/services/api-error';
import { clearClaimDraft, loadClaimDraft, saveClaimDraft } from '@/services/claim-draft-storage';
import { useCreateClaim } from '@/services/claims';
import { queryKeys } from '@/services/query-keys';
import type { Claim, CreateClaimBody } from '@/services/types';
import { isSameClaimBody } from '@/utils/claim-draft';
import { newIdempotencyKey } from '@/utils/idempotency';

// Submits a claim so that it can never be created twice by a retry or a reload:
// - the key is reused for the same body under the same token (in memory and after a reload),
// - the draft is saved before sending and cleared only on a definite answer.
export function useSubmitClaim() {
  const token = useRequiredToken();
  const queryClient = useQueryClient();
  const { startAwaiting } = useBalanceSync();
  const mutation = useCreateClaim();

  async function submit(body: CreateClaimBody): Promise<Claim> {
    const previous = await loadClaimDraft();
    const idempotencyKey =
      previous && previous.token === token && isSameClaimBody(previous.body, body)
        ? previous.idempotencyKey
        : newIdempotencyKey();
    await saveClaimDraft({ token, idempotencyKey, body, savedAtMs: Date.now() });

    try {
      const claim = await mutation.mutateAsync({ body, idempotencyKey });
      await clearClaimDraft();
      queryClient.setQueryData(queryKeys.claim(claim.id), claim);
      startAwaiting(claim.createdAt);
      void queryClient.invalidateQueries({ queryKey: queryKeys.balances });
      return claim;
    } catch (error) {
      // The server refused (4xx), so nothing was created and the key must not be reused.
      // Unknown outcomes keep the draft so the next attempt replays the same key.
      if (isDefiniteRejection(error)) await clearClaimDraft();
      throw error;
    }
  }

  return {
    submit,
    isPending: mutation.isPending,
    // TanStack pauses mutations while the browser is offline and resumes them when back online.
    isPaused: mutation.isPaused,
    error: mutation.error,
    reset: mutation.reset,
  };
}
