import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';
import { BrutalButton } from './BrutalButton';
import { RiveCharacter } from './RiveCharacter';

type DonePopupProps = {
  hasNext: boolean;
  onNext: () => void;
  onDone: () => void;
};

/** Full-screen transparent modal — Completed always dead-center. */
export function DonePopup({ hasNext, onNext, onDone }: DonePopupProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(40)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(40);
    scale.setValue(0.9);
    actionsOpacity.setValue(0);
    setShowActions(false);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.back(1.25)),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
    ]).start(({ finished }) => {
      if (!finished) return;
      setShowActions(true);
      Animated.timing(actionsOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [opacity, translateY, scale, actionsOpacity]);

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.screen}>
        <Animated.View
          style={[
            styles.card,
            theme.clay.out,
            {
              opacity,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <RiveCharacter mood="celebrate" size={96} />
          <Text style={styles.title}>Completed</Text>

          {showActions ? (
            <Animated.View style={[styles.actions, { opacity: actionsOpacity }]}>
              {hasNext ? (
                <BrutalButton label="Next lesson" color={theme.light.tint.sun} onPress={onNext} />
              ) : null}
              <BrutalButton label="Done" color={theme.light.tint.mint} onPress={onDone} />
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'rgba(45, 38, 64, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
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
  },
  title: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.font.display,
    fontSize: 32,
    color: theme.light.ink,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  actions: {
    marginTop: theme.spacing.lg,
    alignSelf: 'stretch',
    gap: theme.spacing.sm,
  },
});
