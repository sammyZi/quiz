import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { CATALOG_TOTAL, catalogChapters, isLessonAvailable } from '../lib/curriculum';
import { useProgress } from '../lib/progress';
import { subjectCardArt } from '../lib/subjectArt';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Per-subject card fills — distinct pastel, not all the same white. */
const SUBJECT_COLORS: Record<number, { card: string; chip: string }> = {
  3: { card: theme.light.tint.mint, chip: theme.light.tint.sun }, // Science
  1: { card: theme.light.tint.sun, chip: theme.light.tint.sky }, // Computers
  2: { card: theme.light.tint.sky, chip: theme.light.tint.peach }, // Cloud
};

/** Subject picker — each card opens a dedicated Subject screen. */
export function LessonsScreen() {
  const navigation = useNavigation<Nav>();
  const { isComplete } = useProgress();

  const readyCount = useMemo(
    () =>
      catalogChapters
        .flatMap((c) => c.modules)
        .flatMap((m) => m.lessons)
        .filter((l) => isLessonAvailable(l.id)).length,
    []
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Subjects"
        eyebrow={`${CATALOG_TOTAL} lessons · ${readyCount} playable`}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose a subject to explore.</Text>

        {catalogChapters.map((chapter) => {
          const chapterLessons = chapter.modules.flatMap((m) => m.lessons);
          const chapterDone = chapterLessons.filter((l) => isComplete(l.id)).length;
          const chapterReady = chapterLessons.filter((l) => isLessonAvailable(l.id)).length;
          const art = subjectCardArt[chapter.chapter];
          const colors = SUBJECT_COLORS[chapter.chapter] ?? {
            card: theme.light.surface,
            chip: theme.light.tint.mint,
          };

          return (
            <Pressable
              key={chapter.chapter}
              onPress={() => navigation.navigate('Subject', { chapter: chapter.chapter })}
              accessibilityRole="button"
              accessibilityHint={`Opens ${chapter.title}`}
              style={({ pressed }) => [
                styles.subjectCard,
                theme.clay.soft,
                { backgroundColor: colors.card },
                pressed && { transform: [{ scale: 0.995 }] },
              ]}
            >
              {art ? (
                <Image
                  source={art}
                  style={styles.thumb}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View style={[styles.thumb, { backgroundColor: colors.chip }]} />
              )}
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>subject</Text>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.meta}>
                  {chapterDone} done · {chapterReady} ready · {chapterLessons.length} total
                </Text>
              </View>
              <View style={[styles.openHint, { backgroundColor: colors.chip }]}>
                <Text style={styles.openHintText}>Open</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.bg,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  intro: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.muted,
    lineHeight: 22,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.card,
    borderWidth: 2,
    borderColor: theme.light.ink,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  /** Square thumb — keeps the old compact row height */
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.light.ink,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
  },
  chapterTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.title,
    color: theme.light.ink,
  },
  meta: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
  },
  openHint: {
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.light.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  openHintText: {
    fontFamily: theme.font.display,
    fontSize: 13,
    color: theme.light.ink,
  },
});
