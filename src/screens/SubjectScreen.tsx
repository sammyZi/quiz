import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Chevron } from '../components/Chevron';
import { GreenProgressFill } from '../components/GreenProgressFill';
import {
  catalogChapters,
  isLessonAvailable,
  type CatalogChapterId,
  type CatalogLesson,
} from '../lib/curriculum';
import { getLesson } from '../lib/loadLessons';
import { useProgress } from '../lib/progress';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SubjectRoute = RouteProp<RootStackParamList, 'Subject'>;

function LessonRow({
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
  const fill = complete ? 1 : total > 0 ? done / total : 0;
  const badge = complete ? 'Done' : done > 0 ? `${done}/${total}` : null;

  return (
    <Pressable
      onPress={available ? onPress : undefined}
      disabled={!available}
      accessibilityRole="button"
      accessibilityLabel={lesson.title}
      style={({ pressed }) => [
        styles.row,
        theme.clay.soft,
        !available && styles.rowLocked,
        pressed && available && { transform: [{ scale: 0.995 }] },
      ]}
    >
      <GreenProgressFill progress={fill} complete={complete} />
      <View style={[styles.rowMark, complete && styles.rowMarkDone]}>
        <Text style={[styles.rowMarkText, complete && styles.rowMarkTextDone]}>
          {complete ? '✓' : `${index}`}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {lesson.title}
          </Text>
          {badge === 'Done' ? (
            <View style={styles.donePill}>
              <Text style={styles.donePillText}>Done</Text>
            </View>
          ) : badge ? (
            <Text style={styles.partial}>{badge}</Text>
          ) : !available ? (
            <Text style={styles.soon}>soon</Text>
          ) : null}
        </View>
        <Text style={styles.rowBeat} numberOfLines={2}>
          {lesson.beat}
        </Text>
      </View>
    </Pressable>
  );
}

function defaultOpenModule(chapter: CatalogChapterId): string | null {
  const subject = catalogChapters.find((c) => c.chapter === chapter);
  return subject?.modules[0]?.key ?? null;
}

/** Full-screen subject hub — Science, Computers, Cloud, etc. */
export function SubjectScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<SubjectRoute>();
  const { isComplete, getLessonProgress } = useProgress();

  const subject = useMemo(
    () => catalogChapters.find((c) => c.chapter === params.chapter),
    [params.chapter]
  );

  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    const key = defaultOpenModule(params.chapter);
    return key ? new Set([key]) : new Set();
  });

  useEffect(() => {
    const key = defaultOpenModule(params.chapter);
    setOpenModules(key ? new Set([key]) : new Set());
  }, [params.chapter]);

  if (!subject) {
    return (
      <View style={styles.container}>
        <AppHeader title="Subject" onBack={() => navigation.goBack()} />
        <Text style={styles.missing}>Subject not found.</Text>
      </View>
    );
  }

  const allLessons = subject.modules.flatMap((m) => m.lessons);
  const doneCount = allLessons.filter((l) => isComplete(l.id)).length;

  const toggle = (key: string) => {
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
        title={subject.title}
        eyebrow={`${doneCount}/${allLessons.length} explored`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Pick a topic. Tap a lesson when you’re ready.</Text>

        {subject.modules.map((mod) => {
          const open = openModules.has(mod.key);
          const total = mod.lessons.length;
          const done = mod.lessons.filter((l) => isComplete(l.id)).length;

          return (
            <View key={mod.key} style={styles.moduleBlock}>
              <Pressable
                onPress={() => toggle(mod.key)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                style={({ pressed }) => [
                  styles.moduleHeader,
                  theme.clay.soft,
                  pressed && { transform: [{ scale: 0.995 }] },
                ]}
              >
                <View style={styles.moduleFill}>
                  <GreenProgressFill
                    progress={total ? done / total : 0}
                    complete={done === total && total > 0}
                  />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.moduleTitle}>{mod.label}</Text>
                  <Text style={styles.meta} numberOfLines={2}>
                    {done}/{total} · {mod.blurb}
                  </Text>
                </View>
                <Chevron open={open} />
              </Pressable>

              {open ? (
                <View style={styles.lessonList}>
                  {mod.lessons.map((lesson, i) => {
                    const full = getLesson(lesson.id);
                    const parts = getLessonProgress(
                      lesson.id,
                      full?.steps.length ?? 3,
                      full?.quiz.length ?? 3
                    );
                    return (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        index={i + 1}
                        complete={isComplete(lesson.id)}
                        done={parts.done}
                        total={parts.total}
                        onPress={() =>
                          navigation.navigate('Lesson', { lessonId: lesson.id })
                        }
                      />
                    );
                  })}
                </View>
              ) : null}
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
  missing: {
    padding: theme.spacing.lg,
    fontFamily: theme.font.body,
    color: theme.light.ink,
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
  moduleBlock: {
    gap: theme.spacing.sm,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.light.surface,
    borderRadius: theme.radius.card,
    borderWidth: 2,
    borderColor: theme.light.ink,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  moduleFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.5,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    zIndex: 1,
  },
  moduleTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
  meta: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
  },
  lessonList: {
    gap: theme.spacing.sm,
    paddingLeft: theme.spacing.xs,
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
  },
  rowLocked: { opacity: 0.55 },
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
  rowMarkDone: { backgroundColor: theme.light.ink },
  rowMarkText: {
    fontFamily: theme.font.display,
    fontSize: 14,
    color: theme.light.ink,
  },
  rowMarkTextDone: { color: theme.light.surface, fontSize: 16 },
  rowBody: { flex: 1, minWidth: 0, gap: 4, zIndex: 1 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  rowTitle: {
    flex: 1,
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
  partial: {
    flexShrink: 0,
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.ink,
  },
  soon: {
    flexShrink: 0,
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.muted,
  },
});
