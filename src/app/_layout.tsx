import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useState } from 'react';

import { HeaderLink } from '@/components/header-link';
import { LoadingState } from '@/components/loading-state';
import { BalanceSyncProvider } from '@/hooks/use-balance-sync';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TokenProvider, useToken } from '@/hooks/use-token';
import { createQueryClient } from '@/services/query-client';

function RootStack() {
  const { isLoading, token } = useToken();
  const hasToken = token !== null;

  // Wait for the stored token so the guard doesn't flash the token screen on reload.
  if (isLoading) return <LoadingState />;

  return (
    <Stack>
      <Stack.Protected guard={hasToken}>
        <Stack.Screen
          name="index"
          options={{
            title: 'Balances',
            headerRight: () => <HeaderLink href="/change-token" label="Change token" />,
          }}
        />
        <Stack.Screen name="change-token" options={{ title: 'Change token' }} />
        <Stack.Screen name="claim" options={{ title: 'Claim payback' }} />
        <Stack.Screen name="claims/[id]" options={{ title: 'Claim' }} />
      </Stack.Protected>
      <Stack.Protected guard={!hasToken}>
        <Stack.Screen name="token" options={{ title: 'CashMine' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // One client for the app's lifetime; useState keeps it stable across renders.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TokenProvider>
        <BalanceSyncProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootStack />
          </ThemeProvider>
        </BalanceSyncProvider>
      </TokenProvider>
    </QueryClientProvider>
  );
}
