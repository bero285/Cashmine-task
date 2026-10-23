import { Screen } from '@/components/screen';
import { TokenForm } from '@/components/token-form';
import { useToken } from '@/hooks/use-token';

// First open, or after a 401. Only reachable without a token; once saved, the guard in
// _layout hides this screen and the router moves to Home by itself.
export default function TokenScreen() {
  const { rejected } = useToken();

  return (
    <Screen>
      <TokenForm
        title={rejected ? 'Token not accepted' : 'Welcome to CashMine'}
        notice={
          rejected ? 'Your token is invalid or has expired. Please enter a new one.' : undefined
        }
      />
    </Screen>
  );
}
