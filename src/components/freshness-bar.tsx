import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TextButton } from '@/components/text-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { formatAge } from '@/utils/time';

type FreshnessBarProps = {
  asOf: string;
  isRefreshing: boolean;
  // A background refresh failed; the data shown is the last good snapshot.
  refreshFailed: boolean;
  // A claim was just made and the shown snapshot doesn't include it yet (approach C).
  awaitingClaim: boolean;
  onRefresh: () => void;
};

function label(age: string, refreshFailed: boolean, awaitingClaim: boolean): string {
  if (refreshFailed) return `Couldn't refresh. Showing data from ${age}.`;
  if (awaitingClaim) return `Updating after your claim… Showing data from ${age}.`;
  return `Updated ${age}`;
}

export function FreshnessBar({
  asOf,
  isRefreshing,
  refreshFailed,
  awaitingClaim,
  onRefresh,
}: FreshnessBarProps) {
  const theme = useTheme();
  const now = useNow();
  const age = formatAge(asOf, now) ?? 'an unknown time';

  return (
    <View style={styles.row}>
      <ThemedText
        type="small"
        themeColor={refreshFailed ? 'danger' : 'textSecondary'}
        style={styles.text}>
        {label(age, refreshFailed, awaitingClaim)}
      </ThemedText>
      {/* Spinner for the whole wait after a claim, not just during each 3 s poll. */}
      {isRefreshing || awaitingClaim ? (
        <View style={styles.spinner}>
          <ActivityIndicator color={theme.primary} accessibilityLabel="Updating balances" />
        </View>
      ) : (
        <TextButton label={refreshFailed ? 'Retry' : 'Refresh'} onPress={onRefresh} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    flexShrink: 1,
  },
  spinner: {
    paddingHorizontal: Spacing.three,
  },
});
