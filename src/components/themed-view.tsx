import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { createThemedStyles, mapThemeColors } from '@/hooks/use-themed-styles';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const backgrounds = useBackgroundStyles();

  return <View style={[backgrounds[type ?? 'background'], style]} {...otherProps} />;
}

const useBackgroundStyles = createThemedStyles((theme) =>
  mapThemeColors(theme, (color) => ({ backgroundColor: color })),
);
