import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { createThemedStyles } from '@/hooks/use-themed-styles';

type OptionRowProps = {
  title: string;
  detail?: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

// One choice in a single-select list (asset, destination).
export function OptionRow({ title, detail, selected, disabled, onPress }: OptionRowProps) {
  const themed = useThemedStyles();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        themed.row,
        selected && themed.selected,
        (pressed || disabled) && styles.dimmed,
      ]}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {detail ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.detail}>
          {detail}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const useThemedStyles = createThemedStyles((theme) => ({
  row: { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundElement },
  selected: { borderColor: theme.primary },
}));

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing.three,
    borderWidth: 2,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  detail: {
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  dimmed: {
    opacity: 0.5,
  },
});
