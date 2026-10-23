import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createThemedStyles } from '@/hooks/use-themed-styles';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const theme = useTheme();
  const themed = useThemedStyles();
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;
  const textColor = isPrimary ? 'onPrimary' : 'text';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? themed.primary : themed.secondary,
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}>
      {loading ? (
        <ActivityIndicator color={theme[textColor]} />
      ) : (
        <ThemedText type="smallBold" themeColor={textColor}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const useThemedStyles = createThemedStyles((theme) => ({
  primary: { backgroundColor: theme.primary },
  secondary: { backgroundColor: theme.backgroundElement },
}));

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  inactive: {
    opacity: 0.5,
  },
});
