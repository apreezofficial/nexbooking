import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { Text } from './primitives';

/**
 * React Native version of the "Voice assistant card" (Transitions.dev motion spec).
 * Core Animated only: streamed transcript words fade in, the caption swaps with a short
 * slide and fade, the bubble floats, the mic presses in, and the wave bars move while listening.
 * The web version's blur filters and the voice glow ring are not reproduced.
 */

const WORDS = 'Find me a quiet café nearby with good wifi for this afternoon'.split(' ');
const WORD_MS = 280;
const CAPTIONS = { idle: 'Tap to speak', listening: 'Listening…', thinking: 'One moment' } as const;
type Phase = keyof typeof CAPTIONS;

const STREAM_FADE_MS = 350;
const TEXT_SWAP_MS = 150;
const WAVE_MS = 900;
const FLOAT_MS = 4000;
const FLOAT_DISTANCE = 3;
const PRESS_SCALE = 0.95;
const PRESS_MS = 150;

export function VoiceAssistantCard({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [count, setCount] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [caption, setCaption] = useState<Phase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wordOpacity = useRef(WORDS.map(() => new Animated.Value(0))).current;
  const captionAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(Array.from({ length: 5 }, () => new Animated.Value(1))).current;
  const float = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  // Bubble float, always on.
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: FLOAT_MS / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: FLOAT_MS / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [float]);

  // Caption swap: fade and slide out, change the text, then fade and slide in.
  useEffect(() => {
    if (phase === caption) return;
    Animated.timing(captionAnim, { toValue: 0, duration: TEXT_SWAP_MS, useNativeDriver: true }).start(() => {
      setCaption(phase);
      Animated.timing(captionAnim, { toValue: 1, duration: TEXT_SWAP_MS, useNativeDriver: true }).start();
    });
  }, [phase]);

  // Streamed words: each newly counted word fades in.
  useEffect(() => {
    wordOpacity.forEach((value, index) => {
      if (index < count) {
        Animated.timing(value, { toValue: 1, duration: STREAM_FADE_MS, useNativeDriver: true }).start();
      }
    });
  }, [count]);

  // Wave bars move while listening.
  useEffect(() => {
    if (phase !== 'listening') {
      waveAnim.forEach(value => Animated.timing(value, { toValue: 1, duration: 150, useNativeDriver: true }).start());
      return;
    }
    const loops = waveAnim.map((value, index) => Animated.loop(Animated.sequence([
      Animated.delay(index * 60),
      Animated.timing(value, { toValue: 0.35, duration: WAVE_MS / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(value, { toValue: 1, duration: WAVE_MS / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])));
    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [phase]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const think = () => {
    setPhase('thinking');
    later(() => setPhase('idle'), 1800);
  };

  const start = () => {
    clearTimers();
    wordOpacity.forEach(value => value.setValue(0));
    setRunKey(key => key + 1);
    setCount(0);
    setPhase('listening');
    WORDS.forEach((_, index) => later(() => setCount(index + 1), 400 + index * WORD_MS));
    later(think, 400 + WORDS.length * WORD_MS + 500);
  };

  const onTap = () => {
    if (phase === 'listening') {
      clearTimers();
      setCount(WORDS.length);
      think();
    } else {
      start();
    }
  };

  const live = phase === 'listening';
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -FLOAT_DISTANCE] });

  return <View style={styles.card} accessibilityRole="summary">
    <View style={styles.top}>
      <View style={styles.avatar}><Text variant="button" color="#37364F">AR</Text></View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyLarge">Aria</Text>
        <Text variant="caption" color={colors.muted}>Voice assistant</Text>
      </View>
    </View>
    <View style={styles.divider} />

    <View style={styles.body}>
      <Animated.View style={[styles.bubbleRow, { transform: [{ translateY: floatY }] }]}>
        <View style={styles.bubble}><Text variant="body">How can I help you today?</Text></View>
      </Animated.View>
      <View style={styles.transcript}>
        {runKey > 0 && <Text variant="body" color={colors.ink900} style={{ textAlign: 'right' }}>
          {WORDS.map((word, index) => <Animated.Text key={`${runKey}-${index}`} style={{ opacity: wordOpacity[index] }}>
            {word}{index < WORDS.length - 1 ? ' ' : ''}
          </Animated.Text>)}
        </Text>}
      </View>
    </View>

    <View style={styles.bottom}>
      <Animated.View style={{ opacity: captionAnim, transform: [{ translateY: captionAnim.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] }) }] }}>
        <Text variant="caption" color={colors.muted} accessibilityLiveRegion="polite">{CAPTIONS[caption]}</Text>
      </Animated.View>
      <Pressable accessibilityRole="button" accessibilityLabel={live ? 'Stop speaking' : 'Start speaking'}
        accessibilityState={{ selected: live }} onPress={onTap}
        onPressIn={() => Animated.timing(press, { toValue: PRESS_SCALE, duration: PRESS_MS, useNativeDriver: true }).start()}
        onPressOut={() => Animated.timing(press, { toValue: 1, duration: PRESS_MS, useNativeDriver: true }).start()}>
        <Animated.View style={[styles.mic, live && styles.micLive, { transform: [{ scale: press }] }]}>
          <View style={styles.wave}>
            {waveAnim.map((value, index) => <Animated.View key={index} style={[styles.waveBar, {
              height: [6, 12, 18, 12, 6][index], backgroundColor: live ? colors.ink900 : colors.ink800,
              transform: [{ scaleY: value }],
            }]} />)}
          </View>
        </Animated.View>
      </Pressable>
      {onDone && <Pressable onPress={onDone} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text variant="button" color={colors.goldDeep}>Done</Text>
      </Pressable>}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 360, height: 340, borderRadius: 24, backgroundColor: colors.daisy, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E6DFEC', alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.line },
  body: { paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  bubbleRow: { paddingLeft: 8, alignItems: 'flex-start' },
  bubble: { maxWidth: 240, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(28,26,20,0.06)' },
  transcript: { paddingLeft: 32, minHeight: 60 },
  bottom: { marginTop: 'auto', paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center', gap: 12 },
  mic: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.pearl, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  micLive: { borderColor: colors.gold, backgroundColor: colors.goldTint },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 20 },
  waveBar: { width: 2, borderRadius: 1 },
});
