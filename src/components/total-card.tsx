import { StyleSheet, View } from 'react-native';

import { LabelValueRow } from '@/components/label-value-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Balance } from '@/services/types';
import { formatUsd, usdTotals } from '@/utils/usd';

// About this many characters of the 32 px total fit on a 390 px phone; longer totals use a
// smaller size, and anything longer still wraps instead of overflowing.
const LONG_TOTAL_CHARS = 16;

export function TotalCard({ items }: { items: Balance[] }) {
  // Each bucket is summed exactly across assets, then rounded down to the cent; the total is the
  // sum of the three rounded buckets so the numbers on screen add up (see utils/usd.ts).
  const totals = usdTotals(items);
  const total = formatUsd(totals.total);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        Total payback
      </ThemedText>
      <ThemedText
        type="subtitle"
        style={[styles.total, total.length > LONG_TOTAL_CHARS && styles.totalLong]}
        selectable>
        {total}
      </ThemedText>
      <View style={styles.breakdown}>
        <LabelValueRow label="Available now" value={formatUsd(totals.available)} emphasis />
        <LabelValueRow label="Pending" value={formatUsd(totals.pending)} />
        <LabelValueRow label="Claiming" value={formatUsd(totals.claiming)} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  total: {
    fontVariant: ['tabular-nums'],
  },
  totalLong: {
    fontSize: 24,
    lineHeight: 32,
  },
  breakdown: {
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
});
