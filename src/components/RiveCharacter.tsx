import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { theme } from '../theme/theme';

/**
 * Hero-moment character only — mascot, celebrations, onboarding.
 * Diagram packets stay on Reanimated/Views (see ARCHITECTURE.md).
 *
 * When a real `.riv` lands + a native/dev build exists, swap the body of
 * `MascotFallback` for `<RiveView>` and keep this public API the same.
 */

export type RiveMood = 'idle' | 'wave' | 'celebrate' | 'think';

type RiveCharacterProps = {
  mood?: RiveMood;
  size?: number;
  label?: string;
  /** Home and quiet UI — no bounce. */
  animated?: boolean;
};

function MascotFace({ mood, size }: { mood: RiveMood; size: number }) {
  const eyeY = mood === 'think' ? 38 : 36;
  const mouth =
    mood === 'celebrate'
      ? 'M28 52 Q40 62 52 52'
      : mood === 'think'
        ? 'M32 54 Q40 50 48 54'
        : 'M30 52 Q40 58 50 52';

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* soft body */}
      <Circle cx={40} cy={44} r={26} fill={theme.light.tint.lilac} />
      <Circle cx={40} cy={44} r={26} stroke={theme.light.ink} strokeWidth={2.5} fill="none" />
      {/* antenna */}
      <Path d="M40 18 L40 8" stroke={theme.light.ink} strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={40} cy={6} r={4} fill={theme.light.tint.sun} stroke={theme.light.ink} strokeWidth={2} />
      {/* cheeks */}
      <Ellipse cx={24} cy={48} rx={4} ry={2.5} fill={theme.light.tint.blush} opacity={0.85} />
      <Ellipse cx={56} cy={48} rx={4} ry={2.5} fill={theme.light.tint.blush} opacity={0.85} />
      {/* eyes */}
      <Circle cx={32} cy={eyeY} r={3.2} fill={theme.light.ink} />
      <Circle cx={48} cy={eyeY} r={3.2} fill={theme.light.ink} />
      {mood === 'celebrate' ? (
        <>
          <Path d="M26 28 Q32 24 36 28" stroke={theme.light.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d="M44 28 Q48 24 54 28" stroke={theme.light.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
        </>
      ) : null}
      {/* mouth */}
      <Path d={mouth} stroke={theme.light.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* little signal bars for "uplink" */}
      <Rect x={58} y={22} width={3} height={6} rx={1} fill={theme.light.tint.mint} />
      <Rect x={63} y={18} width={3} height={10} rx={1} fill={theme.light.tint.mint} />
      <Rect x={68} y={14} width={3} height={14} rx={1} fill={theme.light.tint.mint} />
    </Svg>
  );
}

export function RiveCharacter({
  mood = 'idle',
  size = 120,
  label,
  animated = true,
}: RiveCharacterProps) {
  const bob = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    bob.setValue(0);
    spin.setValue(0);
    if (!animated) return;

    if (mood === 'celebrate') {
      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(bob, {
            toValue: -14,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bob, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      const wiggle = Animated.loop(
        Animated.sequence([
          Animated.timing(spin, { toValue: 1, duration: 160, useNativeDriver: true }),
          Animated.timing(spin, { toValue: -1, duration: 160, useNativeDriver: true }),
          Animated.timing(spin, { toValue: 0, duration: 160, useNativeDriver: true }),
        ])
      );
      bounce.start();
      wiggle.start();
      return () => {
        bounce.stop();
        wiggle.stop();
      };
    }

    if (mood === 'wave' || mood === 'idle') {
      const float = Animated.loop(
        Animated.sequence([
          Animated.timing(bob, {
            toValue: mood === 'wave' ? -10 : -6,
            duration: mood === 'wave' ? 500 : 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bob, {
            toValue: 0,
            duration: mood === 'wave' ? 500 : 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      float.start();
      return () => float.stop();
    }

    // think — slow nod
    const nod = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 4,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    nod.start();
    return () => nod.stop();
  }, [mood, bob, spin, animated]);

  const rotate = spin.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size + (label ? 28 : 0) }]} accessibilityRole="image">
      <Animated.View style={{ transform: [{ translateY: bob }, { rotate }] }}>
        <MascotFace mood={mood} size={size} />
      </Animated.View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  label: {
    marginTop: 4,
    fontFamily: theme.font.mono,
    fontSize: 12,
    color: theme.light.muted,
  },
});
