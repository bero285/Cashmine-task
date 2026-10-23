import { StyleSheet } from 'react-native';

import { Colors, type ThemeColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type Theme = (typeof Colors)[keyof typeof Colors];

type StyleInput = Parameters<typeof StyleSheet.create>[0];

// One style per theme color, e.g. { text: { color: '#000' }, danger: { color: '#D92D20' }, ... }.
export function mapThemeColors<T>(theme: Theme, toStyle: (color: string) => T) {
  const keys = Object.keys(theme) as ThemeColor[];
  return Object.fromEntries(keys.map((key) => [key, toStyle(theme[key])])) as Record<ThemeColor, T>;
}

// Theme-dependent styles without inline objects: one StyleSheet per scheme, built once at load.
export function createThemedStyles<S extends StyleInput>(factory: (theme: Theme) => S) {
  const sheets = {
    light: StyleSheet.create(factory(Colors.light)),
    dark: StyleSheet.create(factory(Colors.dark)),
  };
  return function useThemedStyles() {
    return sheets[useColorScheme() === 'dark' ? 'dark' : 'light'];
  };
}
