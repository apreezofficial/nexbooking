import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { playSound, type SoundName } from '../lib/sound';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** A pressable that shrinks and dims slightly while held, and plays a soft sound on press. */
export function PressScale({ style, onPress, onPressIn, onPressOut, sound = 'tap', ...rest }: Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>; sound?: SoundName | null;
}) {
  const held = useRef(new Animated.Value(0)).current;
  const to = (value: number) => Animated.timing(held, { toValue: value, duration: value ? 90 : 180, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  return <AnimatedPressable {...rest}
    onPressIn={event => { to(1); onPressIn?.(event); }}
    onPressOut={event => { to(0); onPressOut?.(event); }}
    onPress={event => { if (sound) playSound(sound); onPress?.(event); }}
    style={[style, {
      opacity: held.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }),
      transform: [{ scale: held.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }) }],
    }]} />;
}

/** Fades and rises into place. Use `delay` to stagger a list. */
export function FadeInUp({ children, delay = 0, distance = 14, duration = 340, style }: {
  children: ReactNode; delay?: number; distance?: number; duration?: number; style?: StyleProp<ViewStyle>;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [progress, delay, duration]);
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] }]}>{children}</Animated.View>;
}

/** Springs in from a smaller size, for badges, checks and logos. */
export function PopIn({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, delay, friction: 6, tension: 90, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, delay, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity, delay]);
  return <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>{children}</Animated.View>;
}

/** Counts a number up to its value when it first appears. */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const progress = new Animated.Value(0);
    const id = progress.addListener(({ value: v }) => setValue(Math.round(target * v)));
    Animated.timing(progress, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => progress.removeListener(id);
  }, [target, duration]);
  return value;
}
