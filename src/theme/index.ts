import type { TextStyle } from 'react-native';

export const colors = {
  gold: '#D4AF37',
  goldTint: '#FAFAD2',
  crayolaGold: '#E6BE8A', // Provisional value in the supplied design system.
  goldDeep: '#7A5F0A',
  pearl: '#FBFCF8',
  daisy: '#FAFAFA',
  line: '#E8E6DA',
  muted: '#6B6757',
  ink800: '#2B2618',
  ink900: '#1C1A14',
  success: '#2E7D4F',
  successTint: '#E3F3EA',
  warning: '#B7791F',
  warningTint: '#FFF1D6',
  error: '#C0392B',
  errorTint: '#FBE4E1',
  info: '#2F6DB5',
  infoTint: '#E1ECF8',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40, giant: 48 } as const;
export const radii = { tag: 6, chip: 12, button: 14, input: 16, tile: 18, card: 24, pill: 32 } as const;
export const fonts = {
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontFamily: fonts.extraBold },
  h1: { fontSize: 24, lineHeight: 32, fontFamily: fonts.extraBold },
  h2: { fontSize: 20, lineHeight: 28, fontFamily: fonts.bold },
  h3: { fontSize: 17, lineHeight: 24, fontFamily: fonts.bold },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontFamily: fonts.medium },
  body: { fontSize: 14, lineHeight: 20, fontFamily: fonts.medium },
  button: { fontSize: 14, lineHeight: 20, fontFamily: fonts.extraBold },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.medium },
  overline: { fontSize: 11, lineHeight: 16, fontFamily: fonts.bold },
} satisfies Record<string, TextStyle>;

export const layout = {
  referenceWidth: 390,
  referenceHeight: 844,
  screenPadding: 16,
  minimumTouchTarget: 44,
  tabBarHeight: 64,
  tabBarBottom: 24,
} as const;

export const theme = { colors, spacing, radii, fonts, typography, layout };
