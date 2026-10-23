import { createContext, use, useState, type PropsWithChildren } from 'react';

import { useToken } from '@/hooks/use-token';
import type { ClaimSync } from '@/utils/balance-sync';

type BalanceSyncValue = {
  sync: ClaimSync | null;
  // Call with the server's createdAt of a claim just made.
  startAwaiting: (claimCreatedAt: string) => void;
};

const BalanceSyncContext = createContext<BalanceSyncValue | null>(null);

// Remembers the latest claim made on this device so the balances can wait for a snapshot that
// includes it (approach C, see utils/balance-sync.ts). In memory only: after a reload the
// normal 15 s refresh applies.
export function BalanceSyncProvider({ children }: PropsWithChildren) {
  const { token } = useToken();
  const [state, setState] = useState<(ClaimSync & { token: string }) | null>(null);

  // Tied to the token it was made under, so a token change silently drops it.
  const sync = state && state.token === token ? state : null;

  function startAwaiting(claimCreatedAt: string) {
    if (token === null) return;
    setState({ token, since: claimCreatedAt, startedAtMs: Date.now() });
  }

  return <BalanceSyncContext value={{ sync, startAwaiting }}>{children}</BalanceSyncContext>;
}

export function useBalanceSync(): BalanceSyncValue {
  const value = use(BalanceSyncContext);
  if (!value) throw new Error('useBalanceSync must be used inside <BalanceSyncProvider>');
  return value;
}
