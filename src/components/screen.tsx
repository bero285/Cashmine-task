import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

// Full-height page with phone-width content centred on wider screens.
export function Screen({ style, children, ...rest }: ViewProps) {
  return (
    <ThemedView style={styles.page}>
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
});
