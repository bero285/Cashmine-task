import { TextButton } from '@/components/text-button';
import { TextField } from '@/components/text-field';

type AmountFieldProps = {
  asset: string;
  value: string;
  onChange: (value: string) => void;
  onMax: () => void;
  error?: string;
};

export function AmountField({ asset, value, onChange, onMax, error }: AmountFieldProps) {
  return (
    <TextField
      label={`Amount (${asset})`}
      value={value}
      onChangeText={onChange}
      error={error}
      placeholder="0.0"
      // Decimal keypad on phones; a "," from it is turned into "." by the validation.
      inputMode="decimal"
      keyboardType="decimal-pad"
      autoCorrect={false}
      autoComplete="off"
      spellCheck={false}
      trailing={<TextButton label="Max" accessibilityLabel="Claim maximum" onPress={onMax} />}
    />
  );
}
