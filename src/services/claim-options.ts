import { useQuery } from '@tanstack/react-query';

import { useRequiredToken } from '@/hooks/use-token';
import { getClaimOptions } from '@/services/endpoints';
import { queryKeys } from '@/services/query-keys';

// Fee, minimum and destinations change rarely; a minute avoids refetching while the user types.
const CLAIM_OPTIONS_STALE_MS = 60_000;

export function useClaimOptions(asset: string | null) {
  const token = useRequiredToken();
  return useQuery({
    queryKey: queryKeys.claimOptions(asset ?? ''),
    queryFn: ({ signal }) => getClaimOptions(token, asset ?? '', signal),
    enabled: asset !== null,
    staleTime: CLAIM_OPTIONS_STALE_MS,
  });
}
