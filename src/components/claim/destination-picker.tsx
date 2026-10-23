import { StyleSheet, View } from 'react-native';

import { LabelValueRow } from '@/components/label-value-row';
import { OptionRow } from '@/components/option-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Destination } from '@/services/types';

type DestinationPickerProps = {
  destinations: Destination[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DestinationPicker({ destinations, selectedId, onSelect }: DestinationPickerProps) {
  // A single destination needs no choice; the form selects it automatically.
  if (destinations.length === 1) {
    return <LabelValueRow label="Send to" value={destinations[0].label} />;
  }

  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      <ThemedText type="smallBold">Send to</ThemedText>
      {destinations.map((destination) => (
        <OptionRow
          key={destination.id}
          title={destination.label}
          selected={destination.id === selectedId}
          onPress={() => onSelect(destination.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
