import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useBalanceSync } from '@/hooks/use-balance-sync';
import { useRequiredToken } from '@/hooks/use-token';
import { getBalances } from '@/services/endpoints';
import { queryKeys } from '@/services/query-keys';
import type { BalancesResponse } from '@/services/types';
import { CLAIM_SYNC_POLL_MS, isAwaitingClaim, pickLatestSnapshot } from '@/utils/balance-sync';

// The server recomputes balance snapshots every 15 s; polling faster would only repeat data.
export const BALANCES_REFRESH_MS = 15_000;

export function useBalances() {
  const token = useRequiredToken();
  const queryClient = useQueryClient();
  const { sync } = useBalanceSync();

  const query = useQuery({
    queryKey: queryKeys.balances,
    queryFn: async ({ signal }) => {
      const next = await getBalances(token, signal);
      // Numbers only move forward: an older snapshot never replaces a newer one.
      return pickLatestSnapshot(queryClient.getQueryData<BalancesResponse>(queryKeys.balances), next);
    },
    // Faster while waiting for the snapshot that includes a just-made claim. Only while the tab
    // is visible (TanStack's default), so a background tab doesn't use the rate limit.
    refetchInterval: (q) =>
      isAwaitingClaim(q.state.data?.asOf, sync, Date.now())
        ? CLAIM_SYNC_POLL_MS
        : BALANCES_REFRESH_MS,
  });

  // Last fetch attempt time instead of Date.now(), to keep render pure; it advances every poll.
  const lastAttemptMs = Math.max(query.dataUpdatedAt, query.errorUpdatedAt);
  const awaitingClaim = isAwaitingClaim(query.data?.asOf, sync, lastAttemptMs);

  return { ...query, awaitingClaim };
}
