import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/button';
import { ClaimStatusCard } from '@/components/claim/claim-status-card';
import { EmptyState } from '@/components/empty-state';
import { InitialLoadState } from '@/components/initial-load-state';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ApiError } from '@/services/api-error';
import { useClaim } from '@/services/claims';

function goHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Basic claim screen. Live status polling and failure details come in step 6.
export default function ClaimStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const claim = useClaim(id);

  if (claim.data === undefined) {
    const notFound = claim.error instanceof ApiError && claim.error.code === 'NOT_FOUND';
    return (
      <Screen>
        {notFound ? (
          <EmptyState title="Claim not found" message="Check the link or go back to balances." />
        ) : (
          <InitialLoadState
            errorTitle="Couldn't load the claim"
            loadingLabel="Loading claim…"
            error={claim.error}
            isFetching={claim.isFetching}
            failureCount={claim.failureCount}
            onRetry={() => void claim.refetch()}
          />
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ThemedText type="subtitle">Claim submitted</ThemedText>
      <ClaimStatusCard claim={claim.data} />
      <Button label="Back to balances" variant="secondary" onPress={goHome} />
    </Screen>
  );
}
