import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import type { ClaimPlan } from '@/components/claim/claim-plan';
import { LabelValueRow } from '@/components/label-value-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { isDefiniteRejection } from '@/services/api-error';
import { errorMessage } from '@/utils/error-message';

type ClaimReviewProps = {
  plan: ClaimPlan;
  submitting: boolean;
  paused: boolean;
  error: unknown;
  onConfirm: () => void;
  onBack: () => void;
};

export function ClaimReview({ plan, submitting, paused, error, onConfirm, onBack }: ClaimReviewProps) {
  // Unknown outcome (network, 5xx, 504 TIMEOUT): the claim may exist. The retry reuses the same
  // Idempotency-Key, so it returns that claim instead of creating a second one.
  const unknownOutcome = error != null && !isDefiniteRejection(error);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Review claim</ThemedText>
      <Card>
        <LabelValueRow label="Amount" value={`${plan.amount} ${plan.asset}`} />
        <LabelValueRow label="Fee" value={`− ${plan.fee} ${plan.asset}`} />
        <LabelValueRow label="You receive" value={`${plan.receive} ${plan.asset}`} emphasis />
        <LabelValueRow label="Send to" value={plan.destination.label} />
      </Card>
      <ThemedText type="small" themeColor="textSecondary">
        The fee is taken from the amount you claim.
      </ThemedText>

      {paused ? (
        <ThemedText type="small" themeColor="textSecondary" accessibilityRole="alert">
          You are offline. The claim will be sent when the connection is back.
        </ThemedText>
      ) : null}
      {error != null && !submitting ? (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {unknownOutcome
            ? "We couldn't confirm your claim. It may already have been created. Trying again is safe: it won't create a second claim."
            : `${errorMessage(error)} Go back to change the claim.`}
        </ThemedText>
      ) : null}

      <Button
        label={unknownOutcome ? 'Try again' : 'Confirm claim'}
        onPress={onConfirm}
        loading={submitting}
      />
      <Button label="Back" variant="secondary" onPress={onBack} disabled={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
});
