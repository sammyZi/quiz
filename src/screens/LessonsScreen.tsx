import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Chevron } from '../components/Chevron';
import { GreenProgressFill } from '../components/GreenProgressFill';
import {
  CATALOG_TOTAL,
  catalogChapters,
  isLessonAvailable,
  type CatalogLesson,
} from '../lib/curriculum';
import { getLesson } from '../lib/loadLessons';
import { useProgress } from '../lib/progress';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function CatalogRow({
  lesson,
  index,
  complete,
  done,
  total,
  onPress,
}: {
  lesson: CatalogLesson;
  index: number;
  complete: boolean;
  done: number;
  total: number;
  onPress?: () => void;
}) {
  const available = isLessonAvailable(lesson.id);
  const numberLabel = `${index}`;
  const fill = complete ? 1 : total > 0 ? Math.max(0, Math.min(1, done / total)) : 0;
  const label = complete ? 'Done' : done > 0 ? `${done}/${total}` : null;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fill <= 0 && !complete) return;
    Animated.sequence([
      Animated.timing(pop, { toValue: 1.015, duration: 140, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }),
    ]).start();
  }, [fill, complete, pop]);

  return (
    <Animated.View style={[styles.rowAnim, { transform: [{ scale: pop }] }]}>
      <Pressable
        onPress={available ? onPress : undefined}
        disabled={!available}
        accessibilityRole="button"
        accessibilityState={{ disabled: !available }}
        accessibilityLabel={`${numberLabel} ${lesson.title}${complete ? ', done' : done > 0 ? `, ${done} of ${total}` : available ? '' : ', coming soon'}`}
        style={({ pressed }) => [
          styles.row,
          theme.clay.soft,
          complete && styles.rowDoneBg,
          !available && styles.rowLocked,
          pressed && available && { transform: [{ scale: 0.995 }] },
        ]}
      >
        <GreenProgressFill progress={fill} complete={complete} />
        <View style={[styles.rowMark, complete && styles.rowMarkDone, fill > 0 && !complete && styles.rowMarkPartial]}>
          <Text style={[styles.rowMarkText, complete && styles.rowMarkTextDone]}>
            {complete ? '✓' : numberLabel}
          </Text>
        </View>
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={styles.rowTitle} numberOfLines={2}>
              {lesson.title}
            </Text>
            {label === 'Done' ? (
              <View style={styles.donePill}>
                <Text style={styles.donePillText}>Done</Text>
              </View>
            ) : label ? (
              <Text style={styles.partialPct} numberOfLines={1}>
                {label}
              </Text>
            ) : !available ? (
              <Text style={styles.soon}>soon</Text>
            ) : null}
          </View>
          <Text style={styles.rowBeat} numberOfLines={3}>
            {lesson.beat}
          </Text>
          {lesson.awsService ? (
            <Text style={styles.rowAws}>AWS · {lesson.awsService}</Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ModuleCard({
  label,
  blurb,
  done,
  total,
  ready,
  open,
  onToggle,
  children,
}: {
  label: string;
  blurb: string;
  done: number;
  total: number;
  ready: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const fill = total === 0 ? 0 : done / total;
  const allDone = done === total && total > 0;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fill <= 0 && !allDone) return;
    Animated.sequence([
      Animated.timing(pop, { toValue: 1.02, duration: 160, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [fill, allDone, pop]);

  return (
    <View style={styles.moduleWrap}>
      <Animated.View style={{ transform: [{ scale: pop }] }}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${label}, ${done} of ${total} done`}
          style={({ pressed }) => [
            styles.moduleHeader,
            theme.clay.soft,
            allDone && styles.moduleHeaderDone,
            pressed && { transform: [{ scale: 0.995 }] },
          ]}
        >
          <GreenProgressFill progress={fill} complete={allDone} />
          <View style={styles.headerText}>
            <Text style={styles.moduleTitle}>{label}</Text>
            <Text style={styles.meta}>
              {done}/{total}
              {ready < total ? ` · ${ready} playable` : ''}
            </Text>
          </View>
          <View style={styles.moduleChevron}>
            <Chevron open={open} />
          </View>
        </Pressable>
      </Animated.View>

      {open ? (
        <View style={styles.lessonList}>
          <Text style={styles.blurb}>{blurb}</Text>
          {children}
        </View>
      ) : null}
    </View>
  );
}

export function LessonsScreen() {
  const navigation = useNavigation<Nav>();
  const { isComplete, completed, getLessonProgress } = useProgress();
  // Science first for kids; keep modules with progress open too.
  const [openChapters, setOpenChapters] = useState<Set<number>>(() => new Set([3]));
  const [openModules, setOpenModules] = useState<Set<string>>(() => new Set(['3-matter']));

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
                  <Text style={styles.eyebrow}>subject</Text>
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
                    const modTotal = mod.lessons.length;
                    const modDone = mod.lessons.filter((l) => isComplete(l.id)).length;
                    const modReady = mod.lessons.filter((l) => isLessonAvailable(l.id)).length;

                    return (
                      <ModuleCard
                        key={mod.key}
                        label={mod.label}
                        blurb={mod.blurb}
                        done={modDone}
                        total={modTotal}
                        ready={modReady}
                        open={modOpen}
                        onToggle={() => toggleModule(mod.key)}
                      >
                        {mod.lessons.map((lesson, lessonIndex) => {
                          const full = getLesson(lesson.id);
                          const parts = getLessonProgress(
                            lesson.id,
                            full?.steps.length ?? 3,
                            full?.quiz.length ?? 3
                          );
                          return (
                            <CatalogRow
                              key={lesson.id}
                              lesson={lesson}
                              index={lessonIndex + 1}
                              complete={isComplete(lesson.id)}
                              done={parts.done}
                              total={parts.total}
                              onPress={() =>
                                navigation.navigate('Lesson', { lessonId: lesson.id })
                              }
                            />
                          );
                        })}
                      </ModuleCard>
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
    zIndex: 1,
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
    backgroundColor: theme.light.surface,
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    borderColor: theme.light.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  moduleHeaderDone: {
    backgroundColor: theme.light.tint.mint,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  moduleTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
  moduleChevron: {
    zIndex: 1,
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
  rowAnim: {
    width: '100%',
    alignSelf: 'stretch',
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
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  rowDoneBg: {
    backgroundColor: 'transparent',
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
    zIndex: 1,
  },
  rowMarkPartial: {
    backgroundColor: '#FFFFFF',
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
    minWidth: 0,
    gap: 4,
    zIndex: 1,
  },
  partialPct: {
    flexShrink: 0,
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.ink,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  donePill: {
    flexShrink: 0,
    backgroundColor: theme.light.ink,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  donePillText: {
    fontFamily: theme.font.display,
    fontSize: 11,
    color: theme.light.surface,
  },
  soon: {
    flexShrink: 0,
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.muted,
  },
  rowTitle: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
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
