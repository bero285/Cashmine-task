import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { isUnauthorized } from '@/services/api-error';

// AsyncStorage is localStorage on web, so the token stays in this browser only.
const STORAGE_KEY = 'cashmine.token';

type TokenState = {
  isLoading: boolean;
  token: string | null;
  // The API answered 401 for the last token (invalid or expired).
  rejected: boolean;
};

type TokenContextValue = TokenState & {
  saveToken: (raw: string) => Promise<void>;
};

const TokenContext = createContext<TokenContextValue | null>(null);

async function readStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (e.g. private mode): behave like a first open.
    return null;
  }
}

async function writeStoredToken(token: string | null): Promise<void> {
  try {
    if (token === null) await AsyncStorage.removeItem(STORAGE_KEY);
    else await AsyncStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Can't persist: the in-memory token still works for this session.
  }
}

export function TokenProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<TokenState>({ isLoading: true, token: null, rejected: false });

  useEffect(() => {
    let active = true;
    readStoredToken().then((token) => {
      if (active) setState({ isLoading: false, token, rejected: false });
    });
    return () => {
      active = false;
    };
  }, []);

  // Every API call goes through TanStack, so watching both caches catches any 401.
  // Dropping the token flips the route guard, which sends the user back to /token.
  useEffect(() => {
    function rejectToken() {
      setState({ isLoading: false, token: null, rejected: true });
      queryClient.clear();
      void writeStoredToken(null);
    }
    function onError(error: unknown) {
      // Deferred: clearing the cache from inside its own notification is not safe.
      if (isUnauthorized(error)) setTimeout(rejectToken, 0);
    }
    const stopQueries = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error') onError(event.action.error);
    });
    const stopMutations = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error') onError(event.action.error);
    });
    return () => {
      stopQueries();
      stopMutations();
    };
  }, [queryClient]);

  async function saveToken(raw: string) {
    const token = raw.trim();
    if (token === '') return;
    // Data belongs to one token; drop everything (and in-flight requests) from the previous one.
    await queryClient.cancelQueries();
    queryClient.clear();
    await writeStoredToken(token);
    setState({ isLoading: false, token, rejected: false });
  }

  return <TokenContext value={{ ...state, saveToken }}>{children}</TokenContext>;
}

export function useToken(): TokenContextValue {
  const value = use(TokenContext);
  if (!value) throw new Error('useToken must be used inside <TokenProvider>');
  return value;
}

// For screens behind the token guard, where a token is guaranteed.
export function useRequiredToken(): string {
  const { token } = useToken();
  if (token === null) throw new Error('useRequiredToken used without a token');
  return token;
}
