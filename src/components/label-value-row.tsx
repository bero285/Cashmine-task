import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type LabelValueRowProps = {
  label: string;
  value: string;
  emphasis?: boolean;
  // Card header style: label in the main text colour and bold.
  heading?: boolean;
};

// "Label ........ value" line used in balance cards and the claim summary.
// Long values (e.g. 18-decimal amounts) move to their own line and break if they still don't fit,
// so nothing is clipped or overflows on a narrow phone.
export function LabelValueRow({ label, value, emphasis, heading }: LabelValueRowProps) {
  return (
    <View style={styles.row}>
      <ThemedText
        type={heading ? 'smallBold' : 'small'}
        themeColor={heading ? 'text' : 'textSecondary'}
        style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText type={emphasis || heading ? 'smallBold' : 'small'} style={styles.value} selectable>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    // Wrap instead of squeezing: the value drops below the label when both don't fit.
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    columnGap: Spacing.three,
  },
  label: {
    flexShrink: 0,
  },
  value: {
    flexGrow: 1,
    flexShrink: 1,
    // Lets the text shrink below its longest unbroken run, so the default break-word can break it.
    minWidth: 0,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
