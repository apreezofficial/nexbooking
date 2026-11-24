import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { colors } from '../theme';

/**
 * Dotted "thinking" loader in the spirit of libraries.dev Thinking orbs.
 * Plain React Native (core Animated, no native modules).
 */
export function ThinkingOrbs({ size = 8, color = colors.gold, count = 3, label = 'Working' }: {
  size?: number; color?: string; count?: number; label?: string;
}) {
  const values = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = values.map((value, index) => Animated.loop(Animated.sequence([
      Animated.delay(index * 140),
      Animated.timing(value, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: 420, useNativeDriver: true }),
    ])));
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [values]);

  return <View accessibilityLabel={label} accessibilityRole="progressbar" style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.6 }}>
    {values.map((value, index) => <Animated.View key={index} style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: color,
      opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
      transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.6] }) }],
    }} />)}
  </View>;
}
