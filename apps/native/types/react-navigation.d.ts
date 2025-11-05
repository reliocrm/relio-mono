// Ambient namespace required by @react-navigation/core ThemeProvider
// Ensures ReactNavigation.Theme is available to TypeScript
declare namespace ReactNavigation {
  // Re-export the Theme type from @react-navigation/native to this namespace
  // so usages like ReactNavigation.Theme resolve correctly.
  type Theme = import('@react-navigation/native').Theme;
}


