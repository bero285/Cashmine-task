import { StyleSheet, View } from 'react-native';

import { OptionRow } from '@/components/option-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Balance } from '@/services/types';
import { hasClaimable } from '@/utils/claim-validation';

type AssetPickerProps = {
  items: Balance[];
  selected: string | null;
  onSelect: (asset: string) => void;
};

export function AssetPicker({ items, selected, onSelect }: AssetPickerProps) {
  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      <ThemedText type="smallBold">Asset</ThemedText>
      {items.map((balance) => {
        const claimable = hasClaimable(balance);
        return (
          <OptionRow
            key={balance.asset}
            title={balance.asset}
            detail={claimable ? `${balance.available} available` : 'Nothing to claim'}
            selected={balance.asset === selected}
            disabled={!claimable}
            onPress={() => onSelect(balance.asset)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
