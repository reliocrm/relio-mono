import {
  DefaultTheme,
  ThemeProvider as RNThemeProvider,
} from '@react-navigation/native';
import 'react-native-reanimated';

import { Colors, DarkColors } from '@/theme/colors';
import { useColorScheme } from '@/lib/use-color-scheme';
import { BORDER_RADIUS } from './globals';

type Props = {
  children: React.ReactNode;
};

export const ThemeProvider = ({ children }: Props) => {
  const { isDarkColorScheme } = useColorScheme();

  console.log("isDarkColorScheme", isDarkColorScheme);
  
  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.primary,
      background: Colors.background,
      card: Colors.card,
      text: Colors.text,
      border: Colors.border,
      notification: Colors.red,
      borderRadius: {
        xl: BORDER_RADIUS,
        lg: BORDER_RADIUS,
        md: BORDER_RADIUS,
        sm: BORDER_RADIUS,
      },
    },
  };

  const darkTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: DarkColors.primary,
      background: DarkColors.background,
      card: DarkColors.card,
      text: DarkColors.text,
      border: DarkColors.border,
      notification: DarkColors.red,
      borderRadius: {
        xl: BORDER_RADIUS,
        lg: BORDER_RADIUS,
        md: BORDER_RADIUS,
        sm: BORDER_RADIUS,
      },
    },
  };

  return (
    <RNThemeProvider value={isDarkColorScheme ? darkTheme : lightTheme}>
      {children}
    </RNThemeProvider>
  );
};
