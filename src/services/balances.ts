import { useQuery } from '@tanstack/react-query';

import { useRequiredToken } from '@/hooks/use-token';
import { getBalances } from '@/services/endpoints';
import { queryKeys } from '@/services/query-keys';

// The server recomputes balance snapshots every 15 s; polling faster would only repeat data.
export const BALANCES_REFRESH_MS = 15_000;

export function useBalances() {
  const token = useRequiredToken();
  return useQuery({
    queryKey: queryKeys.balances,
    queryFn: ({ signal }) => getBalances(token, signal),
    // Only while the tab is visible (TanStack's default), so a background tab doesn't use the rate limit.
    refetchInterval: BALANCES_REFRESH_MS,
  });
}
