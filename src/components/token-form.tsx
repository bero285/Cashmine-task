import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { TextButton } from '@/components/text-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useToken } from '@/hooks/use-token';

type TokenFormProps = {
  title: string;
  notice?: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function TokenForm({ title, notice, onSaved, onCancel }: TokenFormProps) {
  const { saveToken } = useToken();
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const canSave = value.trim() !== '' && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await saveToken(value);
    onSaved?.();
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {notice ? <ThemedText themeColor="danger">{notice}</ThemedText> : null}
      <ThemedText themeColor="textSecondary">
        Paste the API token from your task email. It is stored only in this browser.
      </ThemedText>
      <TextField
        label="API token"
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSave}
        placeholder="Paste your token"
        // Hidden by default: it's a secret and may be entered where others can see the screen.
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        autoFocus
        trailing={
          <TextButton
            label={visible ? 'Hide' : 'Show'}
            accessibilityLabel={visible ? 'Hide token' : 'Show token'}
            onPress={() => setVisible((v) => !v)}
          />
        }
      />
      <Button label="Save token" onPress={handleSave} disabled={!canSave} loading={saving} />
      {onCancel ? <Button label="Cancel" variant="secondary" onPress={onCancel} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
});
