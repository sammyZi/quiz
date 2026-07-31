import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme/theme';

// The offset shadow is a solid View behind the card, positioned with
// top/left offset — never `elevation` and never a blurred shadowColor.
// Android renders `elevation` as a soft blur, which is both the wrong look
// and the most expensive thing you can put in a scrolling list of lesson
// cards. Copy this pattern, don't reinvent it per-component.
//
// ponytail: light theme only — dark mode needs the shadow-becomes-accent-color
// prototype from DESIGN_SYSTEM.md before this component branches on theme.mode.

type BrutalCardProps = ViewProps & {
  accentColor?: string;
};

export function BrutalCard({ style, accentColor, children, ...rest }: BrutalCardProps) {
  const shadowColor = accentColor ?? theme.light.shadow;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.shadow, { backgroundColor: shadowColor }]} />
      <View style={[styles.card, style]} {...rest}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: theme.shadow.offset,
    left: theme.shadow.offset,
    right: -theme.shadow.offset,
    bottom: -theme.shadow.offset,
    borderRadius: theme.radius.card,
  },
  card: {
    backgroundColor: theme.light.surface,
    borderRadius: theme.radius.card,
    borderWidth: 2,
    borderColor: theme.light.border,
    padding: theme.spacing.md,
  },
});
