import { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { theme } from '../theme/theme';

const COLORS = [
  theme.light.tint.sun,
  theme.light.tint.mint,
  theme.light.tint.sky,
  theme.light.tint.lilac,
  theme.light.tint.peach,
  theme.light.tint.blush,
  theme.light.tint.cream,
];

type Piece = {
  id: number;
  color: string;
  startX: number;
  drift: number;
  size: number;
  tall: boolean;
  delay: number;
  duration: number;
  spin: number;
};

function makePieces(width: number, count: number): Piece[] {
  return Array.from({ length: count }, (_, id) => {
    const size = 7 + (id % 5) * 2;
    return {
      id,
      color: COLORS[id % COLORS.length],
      startX: ((id * 47) % Math.max(1, width - 24)) + 8,
      drift: ((id % 7) - 3) * 28,
      size,
      tall: id % 3 !== 0,
      delay: (id % 12) * 45,
      duration: 2100 + (id % 8) * 160,
      spin: (id % 2 === 0 ? 1 : -1) * (260 + (id % 5) * 70),
    };
  });
}

function ConfettiPiece({
  piece,
  height,
  travel,
}: {
  piece: Piece;
  height: number;
  travel: Animated.Value;
}) {
  const w = piece.tall ? piece.size * 0.55 : piece.size;
  const h = piece.tall ? piece.size * 1.35 : piece.size;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.piece,
        {
          width: w,
          height: h,
          borderRadius: piece.tall ? 3 : piece.size / 2,
          backgroundColor: piece.color,
          borderWidth: 1.5,
          borderColor: theme.light.ink,
          left: piece.startX,
          opacity: travel.interpolate({
            inputRange: [0, 0.06, 0.8, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateY: travel.interpolate({
                inputRange: [0, 1],
                outputRange: [-28, height + 36],
              }),
            },
            {
              translateX: travel.interpolate({
                inputRange: [0, 0.35, 0.7, 1],
                outputRange: [0, piece.drift * 0.55, piece.drift, piece.drift * 0.65],
              }),
            },
            {
              rotate: travel.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${piece.spin}deg`],
              }),
            },
          ],
        },
      ]}
    />
  );
}

type ConfettiProps = {
  /** bump to replay the burst */
  playKey?: number;
  count?: number;
};

/** Full-screen falling confetti — pastel clay pieces. */
export function Confetti({ playKey = 0, count = 48 }: ConfettiProps) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => makePieces(width, count), [width, count]);
  const travels = useMemo(
    () => pieces.map(() => new Animated.Value(0)),
    // recreate when piece count / layout identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pieces.length, width, playKey]
  );

  useEffect(() => {
    travels.forEach((v) => v.setValue(0));
    const anim = Animated.parallel(
      pieces.map((piece, i) =>
        Animated.timing(travels[i], {
          toValue: 1,
          duration: piece.duration,
          delay: 60 + piece.delay,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
    anim.start();
    return () => anim.stop();
  }, [playKey, pieces, travels]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((piece, i) => (
        <ConfettiPiece
          key={`${playKey}-${piece.id}`}
          piece={piece}
          height={height}
          travel={travels[i]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
  },
});
