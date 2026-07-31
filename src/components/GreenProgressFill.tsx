import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { theme } from '../theme/theme';

type GreenProgressFillProps = {
  /** 0–1 */
  progress: number;
  /** full mint card when true (hides partial bar) */
  complete?: boolean;
};

/**
 * Animated mint fill for curriculum cards — grows with a soft spring + sheen.
 */
export function GreenProgressFill({ progress, complete }: GreenProgressFillProps) {
  const [width, setWidth] = useState(0);
  const fill = complete ? 1 : Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prev = useRef(0);

  useEffect(() => {
    const rising = fill > prev.current;
    prev.current = fill;

    Animated.spring(anim, {
      toValue: fill,
      friction: 8,
      tension: 60,
      useNativeDriver: false, // width
    }).start();

    if (rising && fill > 0) {
      sheen.setValue(0);
      Animated.timing(sheen, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    if (complete || fill >= 1) {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.02,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(pulse, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fill, complete, anim, sheen, pulse]);

  if (fill <= 0 && !complete) return null;

  const barWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(width, 1)],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.track, { transform: [{ scale: pulse }] }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.fill, { width: barWidth }]}>
        <View style={styles.fillInner} />
        {width > 0 ? (
          <Animated.View
            style={[
              styles.sheen,
              {
                opacity: sheen.interpolate({
                  inputRange: [0, 0.2, 0.8, 1],
                  outputRange: [0, 0.55, 0.35, 0],
                }),
                transform: [
                  {
                    translateX: sheen.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-40, Math.max(width * fill, 40)],
                    }),
                  },
                ],
              },
            ]}
          />
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: theme.radius.button,
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
  fillInner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.light.tint.mint,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 36,
    backgroundColor: 'rgba(255,255,255,0.55)',
    transform: [{ skewX: '-20deg' }],
  },
});
