import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
} from 'react-native';
import type { Lesson } from '../lib/lesson.schema';
import { nodeArt } from '../lib/nodeArt';
import { theme } from '../theme/theme';
import { NodeFrameLoop } from './NodeFrameLoop';

const heatArt = nodeArt.heat?.frames[0];
const coolArt = nodeArt.cool?.frames[0];

type Props = {
  lesson: Lesson;
  stepIndex: number;
};

function framesFor(nodeId: string) {
  return nodeArt[nodeId]?.frames ?? [];
}

function labelFor(lesson: Lesson, nodeId: string) {
  return lesson.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
}

function actionIcon(action: string): ImageSourcePropType | null {
  if (/heat/i.test(action)) return heatArt ?? null;
  if (/cool/i.test(action)) return coolArt ?? null;
  return null;
}

/**
 * Single full-bleed form that morphs (ice → water → steam). No cards.
 */
export function MorphFlow({ lesson, stepIndex }: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const step = lesson.steps[stepIndex];
  const packet = step.packets[0];
  const fromId = packet.from;
  const toId = packet.to;
  const action = packet.label ?? '';
  const changing = fromId !== toId;
  const icon = actionIcon(action);

  const [displayId, setDisplayId] = useState(changing ? fromId : toId);

  const fade = useRef(new Animated.Value(1)).current;
  const badgeY = useRef(new Animated.Value(28)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.7)).current;

  // Slightly smaller so WebP art isn’t stretched/compressed-looking.
  const stageSize = Math.min(winW - theme.spacing.lg * 2, Math.round(winH * 0.34), 280);

  useEffect(() => {
    let cancelled = false;

    if (!changing) {
      setDisplayId(toId);
      fade.setValue(1);
      badgeOpacity.setValue(0);
      return;
    }

    setDisplayId(fromId);
    fade.setValue(1);
    badgeY.setValue(56);
    badgeOpacity.setValue(0);
    badgeScale.setValue(0.65);

    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(badgeY, {
          toValue: 18,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(320),
      Animated.timing(fade, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    anim.start(({ finished }) => {
      if (!finished || cancelled) return;
      setDisplayId(toId);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      cancelled = true;
      anim.stop();
    };
  }, [stepIndex, fromId, toId, changing, fade, badgeY, badgeOpacity, badgeScale]);

  const frames = framesFor(displayId);
  const name = labelFor(lesson, displayId);

  return (
    <View>
      <Text style={styles.story}>{step.caption}</Text>

      <View style={[styles.stage, { height: stageSize + 48 }]}>
        <Animated.View
          style={[styles.artWrap, { width: stageSize, height: stageSize, opacity: fade }]}
        >
          {frames.length > 0 ? (
            <NodeFrameLoop
              frames={frames}
              playing={false}
              fps={7}
              resizeMode="contain"
              style={styles.art}
            />
          ) : (
            <View style={styles.fallback} />
          )}
        </Animated.View>

        {action && changing ? (
          <Animated.View
            pointerEvents="none"
            style={[
              icon ? styles.actionIcon : styles.badge,
              {
                opacity: badgeOpacity,
                transform: [{ translateY: badgeY }, { scale: badgeScale }],
              },
            ]}
          >
            {icon ? (
              <Image source={icon} style={styles.actionImage} resizeMode="contain" />
            ) : (
              <Text style={styles.badgeText}>{action}</Text>
            )}
          </Animated.View>
        ) : null}
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.hint}>
        {stepIndex === 0
          ? 'Tap Next — heat will melt the ice'
          : `${labelFor(lesson, fromId)} → ${labelFor(lesson, toId)}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  story: {
    fontFamily: theme.font.body,
    fontSize: 17,
    color: theme.light.ink,
    lineHeight: 26,
    marginBottom: theme.spacing.md,
    minHeight: 52,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  artWrap: {
    overflow: 'hidden',
    borderRadius: 28,
  },
  art: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    backgroundColor: theme.light.tint.sky,
  },
  badge: {
    position: 'absolute',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: theme.light.ink,
    backgroundColor: theme.light.tint.sky,
  },
  actionIcon: {
    position: 'absolute',
    bottom: 20,
    width: 88,
    height: 88,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  actionImage: {
    width: '100%',
    height: '100%',
  },
  badgeText: {
    fontFamily: theme.font.display,
    fontSize: 20,
    color: theme.light.ink,
  },
  name: {
    fontFamily: theme.font.display,
    fontSize: 24,
    color: theme.light.ink,
    textAlign: 'center',
  },
  hint: {
    marginTop: 6,
    fontFamily: theme.font.mono,
    fontSize: 12,
    color: theme.light.muted,
    textAlign: 'center',
  },
});
