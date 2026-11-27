import { View } from 'react-native';
import { type LucideIcon } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { Button, Text } from './primitives';

/**
 * Empty, error and offline states: a soft ring around an icon, a title, a short line, and up to two actions.
 * Tone "error" uses the error colours; the default is the warm gold used for empty states.
 */
export function StateView({ icon: Icon, title, body, primary, secondary, tone = 'empty' }: {
  icon: LucideIcon; title: string; body: string;
  primary?: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
  tone?: 'empty' | 'error';
}) {
  const ring = tone === 'error' ? colors.errorTint : colors.goldTint;
  const iconColor = tone === 'error' ? colors.error : colors.ink900;
  return <View accessibilityRole="summary" style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl }}>
    <View style={{ width: 128, height: 128, borderRadius: 64, backgroundColor: ring, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.pearl, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={32} color={iconColor} strokeWidth={1.8} />
      </View>
    </View>
    <Text variant="h2" style={{ textAlign: 'center' }}>{title}</Text>
    <Text variant="body" color={colors.muted} style={{ textAlign: 'center', maxWidth: 300 }}>{body}</Text>
    {primary && <Button label={primary.label} size="large" style={{ alignSelf: 'stretch', marginTop: spacing.sm }} onPress={primary.onPress} />}
    {secondary && <Button label={secondary.label} variant="outline" style={{ alignSelf: 'stretch' }} onPress={secondary.onPress} />}
  </View>;
}
