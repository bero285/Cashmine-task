import { useEffect, useState } from 'react';

import { useRequiredToken } from '@/hooks/use-token';
import { clearClaimDraft, loadClaimDraft } from '@/services/claim-draft-storage';
import type { ClaimDraft } from '@/utils/claim-draft';

// A submission from an earlier visit that never got a definite answer (e.g. the tab was closed
// or reloaded mid-request). Only drafts made with the current token are offered.
export function usePendingClaimDraft() {
  const token = useRequiredToken();
  const [draft, setDraft] = useState<ClaimDraft | null>(null);

  useEffect(() => {
    let active = true;
    loadClaimDraft().then((stored) => {
      if (active) setDraft(stored && stored.token === token ? stored : null);
    });
    return () => {
      active = false;
    };
  }, [token]);

  async function discard() {
    await clearClaimDraft();
    setDraft(null);
  }

  return { draft, discard };
}
