import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ClaimDraft } from '@/utils/claim-draft';
import { errorMessage } from '@/utils/error-message';

type PendingClaimBannerProps = {
  draft: ClaimDraft;
  resending: boolean;
  error: unknown;
  onResend: () => void;
  onDiscard: () => void;
};

export function PendingClaimBanner({
  draft,
  resending,
  error,
  onResend,
  onDiscard,
}: PendingClaimBannerProps) {
  return (
    <Card accessibilityRole="alert">
      <ThemedText type="smallBold">
        Unconfirmed claim: {draft.body.amount} {draft.body.asset}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        We didn&apos;t get an answer for this claim last time. Sending it again is safe: if it was
        already created, you will see that claim instead of a new one.
      </ThemedText>
      {error != null && !resending ? (
        <ThemedText type="small" themeColor="danger">
          {errorMessage(error)}
        </ThemedText>
      ) : null}
      <View style={styles.actions}>
        <Button label="Check and resend" onPress={onResend} loading={resending} />
        <Button label="Discard" variant="secondary" onPress={onDiscard} disabled={resending} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
});
