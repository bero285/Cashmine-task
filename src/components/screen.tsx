import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = ViewProps & {
  // Scroll the whole page; the scrollbar stays at the window edge, not the content edge.
  scroll?: boolean;
};

// Full-height page with phone-width content centred on wider screens.
export function Screen({ scroll, style, children, ...rest }: ScreenProps) {
  const content = (
    <View style={[styles.content, scroll ? null : styles.grow, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <ThemedView style={styles.page}>
      {scroll ? (
        <ScrollView style={styles.fill} contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
  },
  // The ScrollView spans the window; the content inside it stays centred.
  fill: {
    flex: 1,
    alignSelf: 'stretch',
  },
  // Not alignSelf: 'stretch' here, or the page's alignItems: 'center' stops centring the content.
  grow: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
});
