import { View, StyleSheet, ViewProps, Platform } from 'react-native';
import { theme } from '../theme/theme';

// Clay card: plump radius + soft outer shadow + pale top edge (fake inner light).
// Kept the BrutalCard name so existing screens don't all need a rename pass.

type BrutalCardProps = ViewProps & {
  accentColor?: string;
  fill?: string;
};

export function BrutalCard({ style, accentColor, fill, children, ...rest }: BrutalCardProps) {
  return (
    <View
      style={[
        styles.card,
        theme.clay.out,
        fill ? { backgroundColor: fill } : null,
        accentColor ? { borderBottomColor: accentColor, borderBottomWidth: 4 } : null,
        style,
      ]}
      {...rest}
    >
      {/* top specular highlight — the “wet clay” rim */}
      <View style={styles.shine} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.light.surface,
    borderRadius: theme.radius.card,
    borderWidth: Platform.OS === 'ios' ? 1.5 : 1,
    borderColor: theme.light.border,
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
});
