import { useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import {
  ActivityIndicator, Pressable, StyleSheet, Text as NativeText, TextInput, View,
  type PressableProps, type StyleProp, type TextInputProps, type TextProps,
  type ViewProps, type ViewStyle,
} from 'react-native';
import { Check, type LucideIcon } from 'lucide-react-native';
import { colors, layout, radii, typography } from '../theme';
import { PressScale } from './motion';
import type { SoundName } from '../lib/sound';

export function Text({ variant = 'body', color = colors.ink900, style, ...props }: TextProps & {
  variant?: keyof typeof typography; color?: string;
}) {
  return <NativeText {...props} allowFontScaling={false} style={[typography[variant], { color }, style]} />;
}

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string; variant?: 'primary' | 'dark' | 'outline' | 'text';
  size?: 'small' | 'default' | 'large'; loading?: boolean; icon?: LucideIcon; sound?: SoundName | null;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', size = 'default', loading = false, disabled, icon: Icon, sound, style, ...props }: ButtonProps) {
  const inactive = disabled || loading;
  const foreground = disabled ? colors.muted : variant === 'dark' ? colors.pearl : variant === 'text' ? colors.goldDeep : colors.ink900;
  return (
    <PressScale {...props} sound={sound} accessibilityRole="button" accessibilityState={{ disabled: !!inactive, busy: loading }}
      disabled={inactive} style={[styles.button, {
        minHeight: size === 'large' ? 52 : layout.minimumTouchTarget,
        paddingVertical: size === 'large' ? 16 : 12,
        backgroundColor: disabled ? colors.line : variant === 'primary' ? colors.gold : variant === 'dark' ? colors.ink900 : variant === 'outline' ? colors.daisy : 'transparent',
        borderWidth: variant === 'outline' ? 1 : 0,
        paddingHorizontal: size === 'small' ? 16 : 24,
      }, style]}>
      {loading ? <ActivityIndicator size="small" color={foreground} /> : Icon ? <Icon size={22} strokeWidth={1.8} color={foreground} /> : null}
      <Text variant="button" color={foreground}>{label}</Text>
    </PressScale>
  );
}

export function IconButton({ icon: Icon, label, dot, selected, ...props }: Omit<ButtonProps, 'label' | 'icon'> & { icon: LucideIcon; label: string; dot?: boolean; selected?: boolean }) {
  return <PressScale {...props} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!props.disabled, selected }}
    style={[styles.iconButton, { opacity: props.disabled ? 0.4 : 1, backgroundColor: selected ? colors.goldTint : colors.daisy }, props.style]}>
    <Icon size={24} color={colors.ink900} strokeWidth={1.8} fill={selected && label.toLowerCase().includes('saved') ? colors.gold : 'none'} />
    {dot && <View style={styles.notificationDot} />}
  </PressScale>;
}

export function Chip({ label, selected = false, disabled = false, onPress }: { label: string; selected?: boolean; disabled?: boolean; onPress?: () => void }) {
  return <PressScale onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ selected, disabled }}
    style={[styles.chip, { backgroundColor: disabled ? colors.line : selected ? colors.gold : colors.daisy, borderColor: selected ? colors.gold : colors.line }]}>
    <Text variant="button" color={disabled ? colors.muted : colors.ink900}>{label}</Text>
  </PressScale>;
}

export type Status = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'Refunded' | 'In progress';
const statusColors: Record<Status, readonly [string, string]> = {
  Pending: [colors.warningTint, colors.goldDeep], Confirmed: [colors.successTint, colors.success],
  Completed: [colors.line, colors.ink800], Cancelled: [colors.errorTint, colors.error],
  Rescheduled: [colors.infoTint, colors.info], Refunded: [colors.goldTint, colors.ink900],
  'In progress': [colors.gold, colors.ink900],
};
export function Badge({ label, status, small = false }: { label?: string; status?: Status; small?: boolean }) {
  const [backgroundColor, color] = status ? statusColors[status] : [colors.goldTint, colors.ink900];
  return <View style={{ backgroundColor, borderRadius: small ? radii.tag : radii.chip, paddingHorizontal: small ? 10 : 16, paddingVertical: small ? 4 : 6, alignSelf: 'flex-start' }}>
    <Text variant={small ? 'overline' : 'button'} color={color}>{label ?? status}</Text>
  </View>;
}

export function VerifiedMark() {
  return <View accessibilityLabel="Verified business" style={styles.verified}><Check size={10} strokeWidth={3} color={colors.ink900} /></View>;
}

export function Input({ label, error, leading: Leading, trailing, style, ...props }: TextInputProps & {
  label: string; error?: string; leading?: LucideIcon; trailing?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return <View style={styles.inputGroup}>
    {label && <Text variant="button" nativeID={props.nativeID ? `${props.nativeID}-label` : undefined}>{label}</Text>}
    <View style={[styles.inputFrame, { borderColor: error ? colors.error : focused ? colors.gold : colors.line, borderWidth: error || focused ? 2 : 1 }]}>
      {Leading && <Leading size={22} strokeWidth={1.8} color={colors.muted} />}
      <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={colors.muted} selectionColor={colors.goldDeep}
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
        style={[styles.input, style]} />
      {trailing}
    </View>
    {error && <Text variant="caption" color={colors.error} accessibilityLiveRegion="polite">{error}</Text>}
  </View>;
}

// Cards rise in as a screen appears. Cards that mount in the same render are staggered automatically.
let mountOrder = 0;
function nextDelay() { const delay = Math.min(mountOrder, 9) * 45; mountOrder += 1; setTimeout(() => { mountOrder = 0; }, 0); return delay; }

export function Card({ style, ...props }: ViewProps) {
  const [delay] = useState(nextDelay);
  const progress = useRef(new Animated.Value(0)).current;
  useState(() => { Animated.timing(progress, { toValue: 1, duration: 320, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); return null; });
  return <Animated.View {...props} style={[styles.card, style, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]} />;
}

const styles = StyleSheet.create({
  button: { borderRadius: radii.button, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'flex-start' },
  iconButton: { width: 44, height: 44, borderRadius: radii.input, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', right: 7, top: 7, width: 8, height: 8, backgroundColor: colors.gold, borderRadius: 4 },
  chip: { minHeight: 44, borderRadius: radii.chip, borderWidth: 1, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  verified: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  inputGroup: { gap: 8 },
  inputFrame: { minHeight: 52, paddingHorizontal: 16, borderRadius: radii.input, backgroundColor: colors.daisy, flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { ...typography.bodyLarge, flex: 1, minWidth: 0, color: colors.ink900, paddingVertical: 14 },
  card: { backgroundColor: colors.daisy, borderColor: colors.line, borderWidth: 1, borderRadius: radii.card, overflow: 'hidden' },
});
