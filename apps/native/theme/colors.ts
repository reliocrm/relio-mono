export const Colors = {
  // Base colors
  background: '#FFFFFF',
  foreground: '#171717',

  // Card colors
  card: '#FFFFFF',
  cardForeground: '#171717',

  // Popover colors
  popover: '#FFFFFF',
  popoverForeground: '#171717',

  // Primary colors
  primary: '#1A1A1A',
  primaryForeground: '#FBFBFB',

  // Secondary colors
  secondary: '#F7F7F7',
  secondaryForeground: '#1A1A1A',

  // Muted colors
  muted: '#F7F7F7',
  mutedForeground: '#8E8E8E',

  // Accent colors
  accent: '#F7F7F7',
  accentForeground: '#1A1A1A',

  // Destructive colors
  destructive: '#E5484D',
  destructiveForeground: '#FFFFFF',

  // Border and input
  border: '#ECECEC',
  input: '#ECECEC',
  ring: '#B5B5B5',

  // Text colors
  text: '#171717',
  textMuted: '#8E8E8E',

  // Legacy support for existing components
  tint: '#1A1A1A',
  icon: '#71717a',
  tabIconDefault: '#71717a',
  tabIconSelected: '#1A1A1A',

  // Default buttons, links, Send button, selected tabs
  blue: '#007AFF',

  // Success states, FaceTime buttons, completed tasks
  green: '#34C759',

  // Delete buttons, error states, critical alerts
  red: '#FF3B30',

  // VoiceOver highlights, warning states
  orange: '#FF9500',

  // Notes app accent, Reminders highlights
  yellow: '#FFCC00',

  // Pink accent color for various UI elements
  pink: '#FF2D92',

  // Purple accent for creative apps and features
  purple: '#AF52DE',

  // Teal accent for communication features
  teal: '#5AC8FA',

  // Indigo accent for system features
  indigo: '#5856D6',
};

// Utility type for color keys
export type ColorKeys = keyof typeof Colors;

// Dark palette aligned to web tokens
export const DarkColors = {
  // Base colors
  background: '#171717',
  foreground: '#FBFBFB',

  // Card colors
  card: '#1F1F1F',
  cardForeground: '#FBFBFB',

  // Popover colors
  popover: '#1F1F1F',
  popoverForeground: '#FBFBFB',

  // Primary colors (light in dark mode per web tokens)
  primary: '#ECECEC',
  primaryForeground: '#1F1F1F',

  // Secondary / muted surfaces
  secondary: '#2B2B2B',
  secondaryForeground: '#FBFBFB',

  muted: '#2B2B2B',
  mutedForeground: '#B4B4B4',

  // Accent
  accent: '#2B2B2B',
  accentForeground: '#FBFBFB',

  // Destructive
  destructive: '#B32D2F',
  destructiveForeground: '#FFFFFF',

  // Border / input / ring
  border: '#FFFFFF1A',
  input: '#FFFFFF26',
  ring: '#8E8E8E',

  // Text
  text: '#FBFBFB',
  textMuted: '#B4B4B4',

  // Legacy support for existing components
  tint: '#ECECEC',
  icon: '#B4B4B4',
  tabIconDefault: '#B4B4B4',
  tabIconSelected: '#ECECEC',

  // System accents (unchanged)
  blue: '#0A84FF',
  green: '#30D158',
  red: '#FF453A',
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  pink: '#FF2D92',
  purple: '#BF5AF2',
  teal: '#64D2FF',
  indigo: '#5E5CE6',
};
