import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';
import { BrutalButton } from './BrutalButton';
import { Confetti } from './Confetti';
import { RiveCharacter } from './RiveCharacter';

type DonePopupProps = {
  hasNext: boolean;
  onNext: () => void;
  onDone: () => void;
};

const BURST = [
  { color: theme.light.tint.sun, angle: -70, dist: 72 },
  { color: theme.light.tint.mint, angle: -25, dist: 86 },
  { color: theme.light.tint.sky, angle: 20, dist: 78 },
  { color: theme.light.tint.lilac, angle: 55, dist: 90 },
  { color: theme.light.tint.peach, angle: -120, dist: 80 },
  { color: theme.light.tint.blush, angle: 130, dist: 74 },
  { color: theme.light.tint.sun, angle: 180, dist: 68 },
  { color: theme.light.tint.mint, angle: -160, dist: 84 },
];

function BurstDot({
  color,
  angle,
  dist,
  progress,
}: {
  color: string;
  angle: number;
  dist: number;
  progress: Animated.Value;
}) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.burstDot,
        {
          backgroundColor: color,
          opacity: progress.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0, 1, 0],
          }),
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, tx],
              }),
            },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, ty],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 0.35, 1],
                outputRange: [0.4, 1.15, 0.6],
              }),
            },
          ],
        },
      ]}
    />
  );
}

/** Full-screen transparent modal — Completed always dead-center. */
export function DonePopup({ hasNext, onNext, onDone }: DonePopupProps) {
  const scrim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardY = useRef(new Animated.Value(20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const mascotScale = useRef(new Animated.Value(0.6)).current;
  const mascotBounce = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;

  const dots = useMemo(() => BURST, []);

  useEffect(() => {
    scrim.setValue(0);
    cardScale.setValue(0.88);
    cardY.setValue(20);
    cardOpacity.setValue(0);
    mascotScale.setValue(0.6);
    mascotBounce.setValue(0);
    ring.setValue(0);
    burst.setValue(0);

    // Card + buttons appear together (no late mount / layout jump).
    // Celebration runs in parallel so it doesn’t delay the CTAs.
    Animated.parallel([
      Animated.timing(scrim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 7,
        tension: 130,
        useNativeDriver: true,
      }),
      Animated.timing(cardY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(mascotScale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.timing(burst, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ring, {
        toValue: 1,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(mascotBounce, {
          toValue: -10,
          duration: 160,
          delay: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(mascotBounce, {
          toValue: 0,
          duration: 220,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scrim, cardScale, cardY, cardOpacity, mascotScale, mascotBounce, ring, burst]);

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.screen}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.scrim,
            { opacity: scrim },
          ]}
        />

        <Animated.View
          style={[
            styles.card,
            theme.clay.out,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardY }, { scale: cardScale }],
            },
          ]}
        >
          <View style={styles.hero}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ring,
                {
                  opacity: ring.interpolate({
                    inputRange: [0, 0.4, 1],
                    outputRange: [0, 0.55, 0],
                  }),
                  transform: [
                    {
                      scale: ring.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.55, 1.55],
                      }),
                    },
                  ],
                },
              ]}
            />

            {dots.map((dot, i) => (
              <BurstDot key={i} {...dot} progress={burst} />
            ))}

            <Animated.View
              style={{
                transform: [{ translateY: mascotBounce }, { scale: mascotScale }],
              }}
            >
              <RiveCharacter mood="celebrate" size={104} />
            </Animated.View>
          </View>

          <Text style={styles.title}>Completed</Text>
          <Text style={styles.subtitle}>Nice work — lesson locked in</Text>

          <View style={styles.actions}>
            {hasNext ? (
              <BrutalButton label="Next lesson" color={theme.light.tint.sun} onPress={onNext} />
            ) : null}
            <BrutalButton label="Done" color={theme.light.tint.mint} onPress={onDone} />
          </View>
        </Animated.View>

        <Confetti playKey={1} count={52} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  scrim: {
    backgroundColor: 'rgba(45, 38, 64, 0.42)',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card,
    borderWidth: 2,
    borderColor: theme.light.ink,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    overflow: 'visible',
  },
  hero: {
    width: 160,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.light.tint.mint,
    backgroundColor: theme.light.tint.cream,
  },
  burstDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.light.ink,
  },
  title: {
    marginTop: theme.spacing.xs,
    fontFamily: theme.font.display,
    fontSize: 32,
    color: theme.light.ink,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontFamily: theme.font.body,
    fontSize: 15,
    color: theme.light.muted,
    textAlign: 'center',
  },
  actions: {
    marginTop: theme.spacing.lg,
    alignSelf: 'stretch',
    gap: theme.spacing.sm,
  },
});
