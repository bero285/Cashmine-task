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
  onRefresh: () => void;
};

export function FreshnessBar({ asOf, isRefreshing, refreshFailed, onRefresh }: FreshnessBarProps) {
  const theme = useTheme();
  const now = useNow();
  const age = formatAge(asOf, now) ?? 'at an unknown time';
  const text = refreshFailed ? `Couldn't refresh. Showing data from ${age}.` : `Updated ${age}`;

  return (
    <View style={styles.row}>
      <ThemedText
        type="small"
        themeColor={refreshFailed ? 'danger' : 'textSecondary'}
        style={styles.text}>
        {text}
      </ThemedText>
      {isRefreshing ? (
        <View style={styles.spinner}>
          <ActivityIndicator color={theme.primary} accessibilityLabel="Refreshing" />
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
