import { Card } from '@/components/card';
import { LabelValueRow } from '@/components/label-value-row';
import { ThemedText } from '@/components/themed-text';
import type { Claim, ClaimStatus } from '@/services/types';

const STATUS_TEXT: Record<ClaimStatus, string> = {
  pending: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

const STATUS_COLOR = {
  pending: 'textSecondary',
  completed: 'success',
  failed: 'danger',
} as const;

export function ClaimStatusCard({ claim }: { claim: Claim }) {
  return (
    <Card>
      <ThemedText type="smallBold" themeColor={STATUS_COLOR[claim.status]}>
        {STATUS_TEXT[claim.status]}
      </ThemedText>
      <LabelValueRow label="Amount" value={`${claim.amount} ${claim.asset}`} />
      <LabelValueRow label="Fee" value={`− ${claim.fee} ${claim.asset}`} />
      <LabelValueRow label="You receive" value={`${claim.receiveAmount} ${claim.asset}`} emphasis />
      <LabelValueRow label="Claim ID" value={claim.id} />
    </Card>
  );
}
