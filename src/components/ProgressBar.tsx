import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

type ProgressBarProps = {
  value: number;
  max: number;
  label?: string;
  color?: string;
};

export function ProgressBar({ value, max, label, color }: ProgressBarProps) {
  const safeMax = Math.max(0, max);
  const safeValue = Math.min(safeMax, Math.max(0, value));
  const pct = safeMax === 0 ? 0 : safeValue / safeMax;
  const fill = color ?? theme.light.tint.mint;

  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.pct} numberOfLines={1}>
            {safeValue}/{safeMax}
          </Text>
        </View>
      ) : null}
      <View style={[styles.track, theme.clay.soft]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round(pct * 1000) / 10}%`,
              backgroundColor: fill,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
    alignSelf: 'stretch',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    width: '100%',
  },
  label: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
  },
  pct: {
    flexShrink: 0,
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.caption,
    color: theme.light.ink,
    textAlign: 'right',
  },
  track: {
    height: 16,
    width: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.light.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
});
