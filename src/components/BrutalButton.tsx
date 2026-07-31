import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

type BrutalButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
};

export function BrutalButton({ label, onPress, color, disabled }: BrutalButtonProps) {
  const fill = color ?? theme.light.tint.lilac;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        theme.clay.soft,
        { backgroundColor: fill },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.shine} pointerEvents="none" />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: theme.hit.min,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});
