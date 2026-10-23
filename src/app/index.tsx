import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BalanceRow } from '@/components/balance-row';
import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { FreshnessBar } from '@/components/freshness-bar';
import { InitialLoadState } from '@/components/initial-load-state';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { TotalCard } from '@/components/total-card';
import { Spacing } from '@/constants/theme';
import { useBalances } from '@/services/balances';
import { hasClaimable } from '@/utils/claim-validation';

export default function HomeScreen() {
  const { data, error, isFetching, failureCount, refetch, awaitingClaim } = useBalances();
  const retry = () => void refetch();

  // No data yet: first load, or it failed before anything arrived.
  if (data === undefined) {
    return (
      <Screen>
        <InitialLoadState
          errorTitle="Couldn't load balances"
          loadingLabel="Loading balances…"
          error={error}
          isFetching={isFetching}
          failureCount={failureCount}
          onRetry={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <TotalCard items={data.items} />
      <Button
        label="Claim payback"
        onPress={() => router.push('/claim')}
        disabled={!data.items.some(hasClaimable)}
      />
      <FreshnessBar
        asOf={data.asOf}
        isRefreshing={isFetching}
        // TanStack keeps the last good data when a refetch fails, and keeps `error` set until a
        // later refetch succeeds, so the warning stays up through the automatic retries.
        refreshFailed={error !== null}
        awaitingClaim={awaitingClaim}
        onRefresh={retry}
      />
      {data.items.length === 0 ? (
        <EmptyState
          title="No payback yet"
          message="Trade on a connected exchange and your payback will show up here."
        />
      ) : (
        <View style={styles.list}>
          {data.items.map((balance) => (
            <BalanceRow key={balance.asset} balance={balance} />
          ))}
        </View>
      )}
      <ThemedText type="small" themeColor="textSecondary">
        Balances are recalculated every 15 seconds, so a new claim can take a moment to appear.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
});
