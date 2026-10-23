import { useSyncExternalStore } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';

function subscribe(onChange: () => void) {
  const subscription = Appearance.addChangeListener(onChange);
  return () => subscription.remove();
}

function getSnapshot(): ColorSchemeName | null {
  return Appearance.getColorScheme();
}

// The server renders HTML without knowing the browser's scheme. Hydrating as 'light' matches that
// HTML; React then re-renders with the real scheme, so there is no hydration mismatch.
function getServerSnapshot(): ColorSchemeName | null {
  return 'light';
}

export function useColorScheme(): ColorSchemeName | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
