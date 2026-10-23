import { router } from 'expo-router';

import { Screen } from '@/components/screen';
import { TokenForm } from '@/components/token-form';

// Opened directly by URL there is no history to go back to.
function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function ChangeTokenScreen() {
  return (
    <Screen>
      <TokenForm title="Change token" onSaved={leave} onCancel={leave} />
    </Screen>
  );
}
