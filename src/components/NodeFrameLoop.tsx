import { useEffect, useState } from 'react';
import { Image, StyleSheet, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';

type Props = {
  frames: ImageSourcePropType[];
  playing?: boolean;
  /** Frames per second while playing. */
  fps?: number;
  resizeMode?: 'cover' | 'contain';
  style?: StyleProp<ImageStyle>;
};

/** Tiny still/loop player — cycles WebP frames when playing, otherwise frame 0. */
export function NodeFrameLoop({
  frames,
  playing = false,
  fps = 7,
  resizeMode = 'cover',
  style,
}: Props) {
  const [index, setIndex] = useState(0);
  const count = frames.length;

  useEffect(() => {
    if (!playing || count < 2) {
      setIndex(0);
      return;
    }
    const ms = Math.max(50, Math.round(1000 / fps));
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ms);
    return () => clearInterval(id);
  }, [playing, count, fps]);

  const source = frames[Math.min(index, count - 1)] ?? frames[0];
  if (!source) return null;

  return (
    <Image
      source={source}
      style={[styles.fill, style]}
      resizeMode={resizeMode}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
});
