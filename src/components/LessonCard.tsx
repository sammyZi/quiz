import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Lesson } from '../lib/lesson.schema';
import { theme } from '../theme/theme';
import { BrutalCard } from './BrutalCard';

type LessonCardProps = {
  lesson: Lesson;
  onPress: () => void;
  complete?: boolean;
  compact?: boolean;
};

export function LessonCard({ lesson, onPress, complete, compact }: LessonCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${lesson.title}${complete ? ', completed' : ''}`}
      style={({ pressed }) => pressed && { transform: [{ scale: 0.995 }] }}
    >
      <BrutalCard fill={theme.light.surface}>
        <View style={styles.topRow}>
          <Text style={styles.id}>{lesson.id}</Text>
          {complete ? <Text style={styles.done}>finished</Text> : null}
        </View>
        <Text style={styles.title}>{lesson.title}</Text>
        {compact ? null : <Text style={styles.hook}>{lesson.hook}</Text>}
      </BrutalCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  id: {
    flex: 1,
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
  },
  done: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
  },
  title: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.title,
    color: theme.light.ink,
  },
  hook: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
    lineHeight: 24,
    marginTop: theme.spacing.sm,
  },
});
