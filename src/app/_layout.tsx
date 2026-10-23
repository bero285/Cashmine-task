import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { HeaderLink } from '@/components/header-link';
import { LoadingState } from '@/components/loading-state';
import { createQueryClient } from '@/services/query-client';
import { TokenProvider, useToken } from '@/hooks/use-token';

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
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootStack />
        </ThemeProvider>
      </TokenProvider>
    </QueryClientProvider>
  );
}
