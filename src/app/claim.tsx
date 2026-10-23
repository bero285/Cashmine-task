import { router } from 'expo-router';
import { useState } from 'react';

import { ClaimForm } from '@/components/claim/claim-form';
import { toClaimBody, type ClaimPlan } from '@/components/claim/claim-plan';
import { ClaimReview } from '@/components/claim/claim-review';
import { PendingClaimBanner } from '@/components/claim/pending-claim-banner';
import { InitialLoadState } from '@/components/initial-load-state';
import { Screen } from '@/components/screen';
import { usePendingClaimDraft } from '@/hooks/use-pending-claim-draft';
import { useSubmitClaim } from '@/hooks/use-submit-claim';
import { useBalances } from '@/services/balances';
import type { CreateClaimBody } from '@/services/types';

export default function ClaimScreen() {
  const balances = useBalances();
  const submitter = useSubmitClaim();
  const pending = usePendingClaimDraft();
  // Set = review step. Kept when going back so the form can be restored from it.
  const [plan, setPlan] = useState<ClaimPlan | null>(null);
  const [lastPlan, setLastPlan] = useState<ClaimPlan | null>(null);

  async function send(body: CreateClaimBody) {
    // Guards a double tap before the button shows its loading state.
    if (submitter.isPending) return;
    try {
      const claim = await submitter.submit(body);
      // Replace: Back from the claim's status goes Home, not to an already-submitted form.
      router.replace({ pathname: '/claims/[id]', params: { id: claim.id } });
    } catch {
      // Shown from submitter.error by the review step or the banner.
    }
  }

  function backToForm() {
    submitter.reset();
    setLastPlan(plan);
    setPlan(null);
  }

  if (balances.data === undefined) {
    return (
      <Screen>
        <InitialLoadState
          errorTitle="Couldn't load balances"
          loadingLabel="Loading balances…"
          error={balances.error}
          isFetching={balances.isFetching}
          failureCount={balances.failureCount}
          onRetry={() => void balances.refetch()}
        />
      </Screen>
    );
  }

  if (plan) {
    return (
      <Screen scroll>
        <ClaimReview
          plan={plan}
          submitting={submitter.isPending}
          paused={submitter.isPaused}
          error={submitter.error}
          onConfirm={() => void send(toClaimBody(plan))}
          onBack={backToForm}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      {pending.draft ? (
        <PendingClaimBanner
          draft={pending.draft}
          resending={submitter.isPending}
          error={submitter.error}
          onResend={() => pending.draft && void send(pending.draft.body)}
          onDiscard={() => void pending.discard()}
        />
      ) : null}
      <ClaimForm
        items={balances.data.items}
        initial={lastPlan}
        awaitingClaim={balances.awaitingClaim}
        onContinue={(next) => {
          submitter.reset();
          setPlan(next);
        }}
      />
    </Screen>
  );
}
