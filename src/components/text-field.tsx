import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createThemedStyles } from '@/hooks/use-themed-styles';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  // Rendered inside the field on the right, e.g. a Show/Hide or Max button.
  trailing?: ReactNode;
};

export function TextField({ label, error, trailing, style, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const themed = useThemedStyles();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={[styles.field, themed.field, error ? themed.fieldError : null]}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, themed.input, style]}
          {...rest}
        />
        {trailing}
      </View>
      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const useThemedStyles = createThemedStyles((theme) => ({
  field: {
    backgroundColor: theme.backgroundElement,
    borderColor: theme.border,
  },
  fieldError: { borderColor: theme.danger },
  input: { color: theme.text },
}));

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  field: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
  input: {
    flex: 1,
    // minWidth 0 lets the input shrink next to a trailing button instead of overflowing.
    minWidth: 0,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    // 16 px stops iOS Safari from zooming into the field on focus.
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
});
