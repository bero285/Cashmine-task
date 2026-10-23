import { Card } from '@/components/card';
import { LabelValueRow } from '@/components/label-value-row';
import type { Balance } from '@/services/types';
import { formatUsd, usdTotals } from '@/utils/usd';

export function BalanceRow({ balance }: { balance: Balance }) {
  // Same rule as the total card: each bucket (available, pending, claiming) is rounded down to
  // the cent, then the three are added. Because the total card rounds each bucket across all
  // assets together, the per-asset values can add up to a cent or two less than the total.
  const usd = usdTotals([balance]).total;

  return (
    <Card>
      <LabelValueRow label={balance.asset} value={formatUsd(usd)} heading />
      {/* Amounts shown exactly as the API sends them: no rounding, no float conversion. */}
      <LabelValueRow label="Available" value={balance.available} emphasis />
      <LabelValueRow label="Pending" value={balance.pending} />
      <LabelValueRow label="Claiming" value={balance.claiming} />
    </Card>
  );
}
