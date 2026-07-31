import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';
import { BrutalButton } from './BrutalButton';
import { RiveCharacter } from './RiveCharacter';

type DonePopupProps = {
  score: string;
  onNext?: () => void;
  onClose: () => void;
};

/** Duolingo-style center pop — spring scale, not a bottom sheet. */
export function DonePopup({ score, onNext, onClose }: DonePopupProps) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    backdrop.setValue(0);
    scale.setValue(0.4);
    bounce.setValue(0);

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(bounce, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.back(1.8)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [backdrop, scale, bounce]);

  const checkScale = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]} />
      <Animated.View
        style={[
          styles.card,
          theme.clay.out,
          {
            opacity: backdrop,
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
          <RiveCharacter mood="celebrate" size={96} animated={false} />
        </Animated.View>
        <Text style={styles.title}>Nice!</Text>
        <Text style={styles.sub}>Lesson complete</Text>
        <Text style={styles.score}>{score}</Text>
        <View style={styles.actions}>
          {onNext ? (
            <BrutalButton label="Next lesson" color={theme.light.tint.sun} onPress={onNext} />
          ) : null}
          <BrutalButton label="Continue" color={theme.light.tint.mint} onPress={onClose} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    zIndex: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45,38,64,0.5)',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: theme.light.surface,
    borderRadius: theme.radius.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    marginTop: theme.spacing.md,
    fontFamily: theme.font.display,
    fontSize: 36,
    color: theme.light.ink,
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 4,
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.muted,
  },
  score: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.caption,
    color: theme.light.ink,
  },
  actions: {
    alignSelf: 'stretch',
    gap: theme.spacing.sm,
  },
});
