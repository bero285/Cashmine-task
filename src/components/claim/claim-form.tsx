import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { AmountField } from '@/components/claim/amount-field';
import { AssetPicker } from '@/components/claim/asset-picker';
import type { ClaimPlan } from '@/components/claim/claim-plan';
import { DestinationPicker } from '@/components/claim/destination-picker';
import { EmptyState } from '@/components/empty-state';
import { InitialLoadState } from '@/components/initial-load-state';
import { LabelValueRow } from '@/components/label-value-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useClaimOptions } from '@/services/claim-options';
import type { Balance } from '@/services/types';
import { formatUnits, toUnits } from '@/utils/amount';
import { claimAmountMessage } from '@/utils/claim-messages';
import { hasClaimable, validateClaimAmount } from '@/utils/claim-validation';

type ClaimFormProps = {
  items: Balance[];
  // Restores the form when coming back from the review step.
  initial: ClaimPlan | null;
  awaitingClaim: boolean;
  onContinue: (plan: ClaimPlan) => void;
};

export function ClaimForm({ items, initial, awaitingClaim, onContinue }: ClaimFormProps) {
  const [asset, setAsset] = useState<string | null>(
    initial?.asset ?? items.find(hasClaimable)?.asset ?? null,
  );
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [destinationId, setDestinationId] = useState<string | null>(
    initial?.destination.id ?? null,
  );
  // "Enter an amount" only after Continue; other errors show while typing.
  const [submitted, setSubmitted] = useState(false);
  const options = useClaimOptions(asset);
  const balance = items.find((item) => item.asset === asset);

  function selectAsset(next: string) {
    setAsset(next);
    setAmount('');
    setDestinationId(null);
    setSubmitted(false);
  }

  if (!items.some(hasClaimable)) {
    return (
      <EmptyState
        title="Nothing to claim yet"
        message="Available payback shows up here once it is confirmed."
      />
    );
  }

  const picker = <AssetPicker items={items} selected={asset} onSelect={selectAsset} />;
  if (!balance) return picker;

  if (options.data === undefined) {
    return (
      <View style={styles.container}>
        {picker}
        <InitialLoadState
          errorTitle="Couldn't load claim options"
          loadingLabel="Loading fee and limits…"
          error={options.error}
          isFetching={options.isFetching}
          failureCount={options.failureCount}
          onRetry={() => void options.refetch()}
        />
      </View>
    );
  }

  const { decimals } = balance;
  const rules = {
    asset: balance.asset,
    decimals,
    available: balance.available,
    minAmount: options.data.minAmount,
    fee: options.data.fee,
  };
  const result = validateClaimAmount(amount, rules);
  const { destinations } = options.data;
  const destination =
    destinations.length === 1 ? destinations[0] : destinations.find((d) => d.id === destinationId);
  const showError = !result.ok && (submitted || result.error !== 'empty');

  function handleContinue() {
    setSubmitted(true);
    if (!result.ok || !destination) return;
    onContinue({
      asset: rules.asset,
      decimals,
      amount: result.amount,
      fee: formatUnits(toUnits(rules.fee, decimals), decimals),
      receive: formatUnits(result.receiveUnits, decimals),
      destination,
    });
  }

  return (
    <View style={styles.container}>
      {picker}
      {awaitingClaim ? (
        <ThemedText type="small" themeColor="textSecondary">
          Balances are still updating after your last claim, so available may be lower than shown.
        </ThemedText>
      ) : null}
      <AmountField
        asset={rules.asset}
        value={amount}
        onChange={setAmount}
        // Canonical form of the available string, so Max always passes the format check.
        onMax={() => setAmount(formatUnits(toUnits(rules.available, decimals), decimals))}
        error={showError && !result.ok ? claimAmountMessage(result.error, rules) : undefined}
      />
      <Card>
        <LabelValueRow label="Available" value={`${rules.available} ${rules.asset}`} />
        <LabelValueRow label="Minimum" value={`${rules.minAmount} ${rules.asset}`} />
        <LabelValueRow label="Fee" value={`${rules.fee} ${rules.asset}`} />
        <LabelValueRow
          label="You receive"
          value={result.ok ? `${formatUnits(result.receiveUnits, decimals)} ${rules.asset}` : '—'}
          emphasis
        />
      </Card>
      {destinations.length === 0 ? (
        <ThemedText type="small" themeColor="danger">
          No payout destination is set up for {rules.asset}.
        </ThemedText>
      ) : (
        <DestinationPicker
          destinations={destinations}
          selectedId={destination?.id ?? null}
          onSelect={setDestinationId}
        />
      )}
      {submitted && destinations.length > 1 && !destination ? (
        <ThemedText type="small" themeColor="danger">
          Choose where to send it.
        </ThemedText>
      ) : null}
      <Button label="Review claim" onPress={handleContinue} disabled={destinations.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
});
