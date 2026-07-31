import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { theme } from '../theme/theme';

/**
 * Hero-moment character only — mascot, celebrations, onboarding.
 * Diagram packets stay View/SVG (see ARCHITECTURE.md).
 *
 * Avatars are AI-generated PNGs in /assets/avatars for each mood.
 */

export type RiveMood = 'idle' | 'wave' | 'celebrate' | 'think';

type RiveCharacterProps = {
  mood?: RiveMood;
  size?: number;
  label?: string;
  /** kept for API compat — images are static */
  animated?: boolean;
};

const AVATARS: Record<RiveMood, ImageSourcePropType> = {
  idle: require('../../assets/avatars/ping-idle.png'),
  wave: require('../../assets/avatars/ping-wave.png'),
  celebrate: require('../../assets/avatars/ping-celebrate.png'),
  think: require('../../assets/avatars/ping-think.png'),
};

export function RiveCharacter({ mood = 'idle', size = 120, label }: RiveCharacterProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size + (label ? 28 : 0) }]}>
      <Image
        source={AVATARS[mood]}
        style={{ width: size, height: size, borderRadius: size * 0.28 }}
        resizeMode="cover"
        accessibilityLabel={label ?? `Ping, ${mood}`}
      />
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
