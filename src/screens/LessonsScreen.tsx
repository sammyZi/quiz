import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Chevron } from '../components/Chevron';
import {
  CATALOG_TOTAL,
  catalogChapters,
  isLessonAvailable,
  type CatalogLesson,
} from '../lib/curriculum';
import { useProgress } from '../lib/progress';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function CatalogRow({
  lesson,
  index,
  complete,
  onPress,
}: {
  lesson: CatalogLesson;
  index: number;
  complete: boolean;
  onPress?: () => void;
}) {
  const available = isLessonAvailable(lesson.id);
  const numberLabel = `${index}`;

  return (
    <Pressable
      onPress={available ? onPress : undefined}
      disabled={!available}
      accessibilityRole="button"
      accessibilityState={{ disabled: !available }}
      accessibilityLabel={`${numberLabel} ${lesson.title}${complete ? ', done' : available ? '' : ', coming soon'}`}
      style={({ pressed }) => [
        styles.row,
        theme.clay.soft,
        complete && styles.rowDoneBg,
        !available && styles.rowLocked,
        pressed && available && { transform: [{ scale: 0.995 }] },
      ]}
    >
      <View style={[styles.rowMark, complete && styles.rowMarkDone]}>
        <Text style={[styles.rowMarkText, complete && styles.rowMarkTextDone]}>
          {complete ? '✓' : numberLabel}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowId}>{lesson.id}</Text>
          {complete ? (
            <View style={styles.donePill}>
              <Text style={styles.donePillText}>Done</Text>
            </View>
          ) : !available ? (
            <Text style={styles.soon}>soon</Text>
          ) : null}
        </View>
        <Text style={styles.rowTitle}>{lesson.title}</Text>
        <Text style={styles.rowBeat}>{lesson.beat}</Text>
        {lesson.awsService ? (
          <Text style={styles.rowAws}>AWS · {lesson.awsService}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function LessonsScreen() {
  const navigation = useNavigation<Nav>();
  const { isComplete, completed } = useProgress();
  // Open chapter 1 by default; also keep any chapter/module with done lessons open.
  const [openChapters, setOpenChapters] = useState<Set<number>>(() => new Set([1]));
  const [openModules, setOpenModules] = useState<Set<string>>(() => new Set(['cpu']));

  const readyCount = useMemo(
    () =>
      catalogChapters
        .flatMap((c) => c.modules)
        .flatMap((m) => m.lessons)
        .filter((l) => isLessonAvailable(l.id)).length,
    []
  );

  // When a lesson is finished, open its chapter/module so Done is visible.
  useEffect(() => {
    if (Object.keys(completed).length === 0) return;
    setOpenChapters((prev) => {
      const next = new Set(prev);
      for (const chapter of catalogChapters) {
        if (chapter.modules.some((m) => m.lessons.some((l) => completed[l.id]))) {
          next.add(chapter.chapter);
        }
      }
      return next;
    });
    setOpenModules((prev) => {
      const next = new Set(prev);
      for (const chapter of catalogChapters) {
        for (const mod of chapter.modules) {
          if (mod.lessons.some((l) => completed[l.id])) next.add(mod.key);
        }
      }
      return next;
    });
  }, [completed]);

  const toggleChapter = (chapter: number) => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapter)) next.delete(chapter);
      else next.add(chapter);
      return next;
    });
  };

  const toggleModule = (key: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Curriculum"
        eyebrow={`${CATALOG_TOTAL} lessons · ${readyCount} playable`}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {catalogChapters.map((chapter) => {
          const chapterOpen = openChapters.has(chapter.chapter);
          const chapterLessons = chapter.modules.flatMap((m) => m.lessons);
          const chapterDone = chapterLessons.filter((l) => isComplete(l.id)).length;
          const chapterReady = chapterLessons.filter((l) => isLessonAvailable(l.id)).length;

          return (
            <View key={chapter.chapter} style={styles.block}>
              <Pressable
                onPress={() => toggleChapter(chapter.chapter)}
                accessibilityRole="button"
                accessibilityState={{ expanded: chapterOpen }}
                style={({ pressed }) => [
                  styles.chapterHeader,
                  theme.clay.soft,
                  pressed && { transform: [{ scale: 0.995 }] },
                ]}
              >
                <View style={styles.headerText}>
                  <Text style={styles.eyebrow}>chapter {chapter.chapter}</Text>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                  <Text style={styles.meta}>
                    {chapterDone} done · {chapterReady} ready · {chapterLessons.length} total
                  </Text>
                </View>
                <Chevron open={chapterOpen} />
              </Pressable>

              {chapterOpen
                ? chapter.modules.map((mod) => {
                    const modOpen = openModules.has(mod.key);
                    const modDone = mod.lessons.filter((l) => isComplete(l.id)).length;
                    const modReady = mod.lessons.filter((l) => isLessonAvailable(l.id)).length;

                    return (
                      <View key={mod.key} style={styles.moduleWrap}>
                        <Pressable
                          onPress={() => toggleModule(mod.key)}
                          accessibilityRole="button"
                          accessibilityState={{ expanded: modOpen }}
                          style={({ pressed }) => [
                            styles.moduleHeader,
                            pressed && { transform: [{ scale: 0.995 }] },
                          ]}
                        >
                          <View style={styles.headerText}>
                            <Text style={styles.moduleTitle}>{mod.label}</Text>
                            <Text style={styles.meta}>
                              {modDone}/{mod.lessons.length}
                              {modReady < mod.lessons.length
                                ? ` · ${modReady} playable`
                                : ''}
                            </Text>
                          </View>
                          <Chevron open={modOpen} />
                        </Pressable>

                        {modOpen ? (
                          <View style={styles.lessonList}>
                            <Text style={styles.blurb}>{mod.blurb}</Text>
                            {mod.lessons.map((lesson, lessonIndex) => (
                              <CatalogRow
                                key={lesson.id}
                                lesson={lesson}
                                index={lessonIndex + 1}
                                complete={isComplete(lesson.id)}
                                onPress={() =>
                                  navigation.navigate('Lesson', { lessonId: lesson.id })
                                }
                              />
                            ))}
                          </View>
                        ) : null}
                      </View>
                    );
                  })
                : null}
            </View>
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
  block: {
    gap: theme.spacing.sm,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.light.surface,
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.light.border,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
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
  moduleWrap: {
    marginLeft: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.light.tint.cream,
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    borderColor: theme.light.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  moduleTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
  lessonList: {
    gap: theme.spacing.sm,
    paddingLeft: theme.spacing.xs,
  },
  blurb: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    backgroundColor: theme.light.surface,
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    borderColor: theme.light.border,
    padding: theme.spacing.md,
  },
  rowDoneBg: {
    backgroundColor: theme.light.tint.mint,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  rowLocked: {
    opacity: 0.55,
  },
  rowMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.light.tint.cream,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  rowMarkDone: {
    backgroundColor: theme.light.ink,
  },
  rowMarkText: {
    fontFamily: theme.font.display,
    fontSize: 14,
    color: theme.light.ink,
  },
  rowMarkTextDone: {
    color: theme.light.surface,
    fontSize: 16,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  rowId: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.muted,
    flexShrink: 1,
  },
  donePill: {
    backgroundColor: theme.light.ink,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  donePillText: {
    fontFamily: theme.font.display,
    fontSize: 12,
    color: theme.light.surface,
  },
  soon: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.muted,
  },
  rowTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
  rowBeat: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    lineHeight: 18,
  },
  rowAws: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.ink,
    marginTop: 2,
  },
});
