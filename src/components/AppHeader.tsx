import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

type AppHeaderProps = {
  title: string;
  eyebrow?: string;
  accentColor?: string;
  inverted?: boolean;
  onBack?: () => void;
};

export function AppHeader({ title, eyebrow, onBack }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        theme.clay.soft,
        { paddingTop: Math.max(insets.top, theme.spacing.sm) + theme.spacing.sm },
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            {/* Drawn chevron — text ← sits off-centre on Android fonts */}
            <View style={styles.backArrow} />
          </Pressable>
        ) : null}

        <View style={styles.titles}>
          {eyebrow ? (
            <Text style={styles.eyebrow} numberOfLines={1}>
              {eyebrow}
            </Text>
          ) : null}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.light.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.radius.card,
    borderBottomRightRadius: theme.radius.card,
    borderBottomWidth: 3,
    borderBottomColor: theme.light.tint.lilac,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: theme.hit.min,
  },
  back: {
    width: theme.hit.min,
    height: theme.hit.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.light.tint.cream,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: theme.light.ink,
    transform: [{ rotate: '45deg' }],
    marginLeft: 3,
  },
  titles: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    marginBottom: 2,
  },
  title: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.title,
    color: theme.light.ink,
  },
});
