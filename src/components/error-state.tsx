import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { errorMessage } from '@/utils/error-message';

type ErrorStateProps = {
  title: string;
  error: unknown;
  onRetry: () => void;
  retrying?: boolean;
};

export function ErrorState({ title, error, onRetry, retrying }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
        {errorMessage(error)}
      </ThemedText>
      <View style={styles.action}>
        <Button label="Try again" onPress={onRetry} loading={retrying} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  message: {
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
});
