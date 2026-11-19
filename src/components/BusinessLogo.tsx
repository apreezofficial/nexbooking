import { View } from 'react-native';
import { Aperture, Scissors, Sparkles, type LucideIcon } from 'lucide-react-native';
import { colors, radii } from '../theme';
import { Text } from './primitives';

type Brand = 'Zara Nails' | 'Glow Studio' | 'Kemi Cuts' | 'Lagos Lens';
const brands: Record<Brand, { monogram: string; accent: string; background: string; icon: LucideIcon }> = {
  'Zara Nails': { monogram: 'ZN', accent: colors.gold, background: colors.ink900, icon: Sparkles },
  'Glow Studio': { monogram: 'GS', accent: colors.ink900, background: colors.crayolaGold, icon: Sparkles },
  'Kemi Cuts': { monogram: 'KC', accent: colors.ink900, background: colors.goldTint, icon: Scissors },
  'Lagos Lens': { monogram: 'LL', accent: colors.crayolaGold, background: colors.ink800, icon: Aperture },
};

/** Original sample marks for the four example businesses. Replace with approved brand files when available. */
export function BusinessLogo({ name, size = 64 }: { name: Brand; size?: number }) {
  const brand = brands[name];
  const Icon = brand.icon;
  return <View accessibilityLabel={`${name} logo`} style={{ width: size, height: size, borderRadius: size * 0.24, backgroundColor: brand.background, borderWidth: size > 50 ? 2 : 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <Icon size={size * 0.25} color={brand.accent} strokeWidth={1.8} style={{ marginBottom: -size * 0.04 }} />
    <Text variant={size >= 56 ? 'h2' : 'button'} color={brand.accent} style={{ fontSize: size * 0.3, lineHeight: size * 0.36 }}>{brand.monogram}</Text>
    <View style={{ position: 'absolute', bottom: size * 0.09, width: size * 0.32, height: 2, borderRadius: radii.pill, backgroundColor: brand.accent }} />
  </View>;
}
