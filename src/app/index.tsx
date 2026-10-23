import { StyleSheet, View } from 'react-native';

import { BalanceRow } from '@/components/balance-row';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { FreshnessBar } from '@/components/freshness-bar';
import { LoadingState } from '@/components/loading-state';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { TotalCard } from '@/components/total-card';
import { Spacing } from '@/constants/theme';
import { useBalances } from '@/services/balances';

export default function HomeScreen() {
  const { data, error, isFetching, failureCount, refetch } = useBalances();
  const retry = () => void refetch();

  // No data yet: first load, or it failed before anything arrived.
  if (data === undefined) {
    return (
      <Screen>
        {error ? (
          <ErrorState
            title="Couldn't load balances"
            error={error}
            onRetry={retry}
            retrying={isFetching}
          />
        ) : (
          <LoadingState label={failureCount > 0 ? 'Still trying…' : 'Loading balances…'} />
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <TotalCard items={data.items} />
      <FreshnessBar
        asOf={data.asOf}
        isRefreshing={isFetching}
        // TanStack keeps the last good data when a refetch fails, and keeps `error` set until a
        // later refetch succeeds, so the warning stays up through the automatic retries.
        refreshFailed={error !== null}
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
