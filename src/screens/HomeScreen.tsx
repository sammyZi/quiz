import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BrutalButton } from '../components/BrutalButton';
import { BrutalCard } from '../components/BrutalCard';
import { ProgressBar } from '../components/ProgressBar';
import { RiveCharacter } from '../components/RiveCharacter';
import type { Lesson } from '../lib/lesson.schema';
import { lessons } from '../lib/loadLessons';
import { useProgress } from '../lib/progress';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { TabParamList } from '../navigation/TabNavigator';
import { theme } from '../theme/theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function QueueChip({ lesson, onPress }: { lesson: Lesson; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={lesson.title}
      style={({ pressed }) => [
        styles.chip,
        theme.clay.soft,
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.chipAccent} />
      <View style={styles.chipText}>
        <Text style={styles.chipId}>{lesson.id}</Text>
        <Text style={styles.chipTitle}>{lesson.title}</Text>
      </View>
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { completed, isComplete } = useProgress();

  const doneCount = Object.keys(completed).length;
  const chapter1 = lessons.filter((l) => l.chapter === 1);
  const next = chapter1.find((lesson) => !isComplete(lesson.id)) ?? chapter1[0] ?? lessons[0];
  const queue = chapter1
    .filter((lesson) => lesson.id !== next?.id && !isComplete(lesson.id))
    .slice(0, 8);
  const openLesson = (lessonId: string) => navigation.navigate('Lesson', { lessonId });

  if (!next) {
    return (
      <View style={styles.container}>
        <AppHeader title="Uplink" eyebrow="curriculum" />
        <Text style={styles.empty}>No lessons loaded yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <View style={[styles.blob, styles.blobC]} />

      <AppHeader title="Uplink" eyebrow="chapter 1" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mascotRow}>
          <RiveCharacter mood="idle" size={88} animated={false} />
          <View style={styles.mascotCopy}>
            <Text style={styles.mascotHi}>{doneCount === 0 ? 'Ready when you are' : 'Keep going'}</Text>
            <Text style={styles.mascotSub}>
              {doneCount}/{chapter1.length} lessons done
            </Text>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <ProgressBar
            value={chapter1.filter((l) => isComplete(l.id)).length}
            max={chapter1.length}
            label="Chapter 1 progress"
            color={theme.light.tint.mint}
          />
        </View>

        <BrutalCard fill={theme.light.tint.cream} style={styles.hero}>
          <Text style={styles.eyebrow}>{doneCount === 0 ? 'start here' : "today's lesson"}</Text>
          <Text style={styles.heroTitle}>{next.title}</Text>
          <Text style={styles.heroHook}>{next.hook}</Text>
          <View style={styles.heroCta}>
            <BrutalButton
              label={isComplete(next.id) ? 'Review' : 'Start lesson'}
              color={theme.light.tint.sun}
              onPress={() => openLesson(next.id)}
            />
          </View>
        </BrutalCard>

        {queue.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Up next</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {queue.map((lesson) => (
                <QueueChip
                  key={lesson.id}
                  lesson={lesson}
                  onPress={() => openLesson(lesson.id)}
                />
              ))}
            </ScrollView>
          </>
        ) : (
          <BrutalCard fill={theme.light.tint.lilac}>
            <Text style={styles.heroTitle}>Chapter 1 done</Text>
            <Text style={styles.heroHook}>
              All {chapter1.length} fundamentals lessons finished. Chapter 2 (AWS) is next on the
              map.
            </Text>
            <View style={styles.heroCta}>
              <BrutalButton
                label="Browse curriculum"
                color={theme.light.tint.sun}
                onPress={() => navigation.navigate('Lessons')}
              />
            </View>
          </BrutalCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.bg,
  },
  empty: {
    padding: theme.spacing.lg,
    fontFamily: theme.font.body,
    color: theme.light.ink,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  blobA: {
    width: 220,
    height: 220,
    top: -40,
    right: -60,
    backgroundColor: theme.light.tint.lilac,
  },
  blobB: {
    width: 160,
    height: 160,
    top: 180,
    left: -50,
    backgroundColor: theme.light.tint.mint,
  },
  blobC: {
    width: 140,
    height: 140,
    bottom: 120,
    right: -30,
    backgroundColor: theme.light.tint.peach,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  mascotCopy: {
    flex: 1,
    gap: 4,
  },
  mascotHi: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.title,
    color: theme.light.ink,
  },
  mascotSub: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
  },
  progressWrap: {
    marginBottom: theme.spacing.xl,
  },
  hero: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  eyebrow: {
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    marginBottom: theme.spacing.sm,
  },
  heroTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.hero,
    color: theme.light.ink,
    letterSpacing: -0.5,
  },
  heroHook: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
    lineHeight: 24,
    marginTop: theme.spacing.sm,
  },
  heroCta: {
    marginTop: theme.spacing.lg,
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.title,
    color: theme.light.ink,
    marginBottom: theme.spacing.md,
  },
  chipRow: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  chip: {
    width: 180,
    backgroundColor: theme.light.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.light.border,
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  chipAccent: {
    height: 6,
    borderRadius: 3,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.light.tint.lilac,
  },
  chipText: {
    gap: 4,
  },
  chipId: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.muted,
  },
  chipTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
});
