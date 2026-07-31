import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BrutalCard } from '../components/BrutalCard';
import { ProgressBar } from '../components/ProgressBar';
import { CATALOG_TOTAL, catalogChapters, isLessonAvailable } from '../lib/curriculum';
import { lessons } from '../lib/loadLessons';
import { useProgress } from '../lib/progress';
import { theme } from '../theme/theme';

const MODULE_COLORS = [
  theme.light.tint.mint,
  theme.light.tint.sky,
  theme.light.tint.blush,
  theme.light.tint.lilac,
  theme.light.tint.sun,
  theme.light.tint.peach,
];

export function ProgressScreen() {
  const { completed, isComplete } = useProgress();
  const doneCount = Object.keys(completed).length;

  return (
    <View style={styles.container}>
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />

      <AppHeader title="Progress" eyebrow={`${doneCount}/${CATALOG_TOTAL} on the map`} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BrutalCard fill={theme.light.tint.sky}>
          <Text style={styles.bigNumber}>
            {doneCount}
            <Text style={styles.bigNumberTail}>/{CATALOG_TOTAL}</Text>
          </Text>
          <Text style={styles.body}>
            {lessons.length} lessons are playable right now. The rest of the map is listed but
            locked until content lands.
          </Text>
          <View style={styles.barGap}>
            <ProgressBar value={doneCount} max={CATALOG_TOTAL} label="overall map" />
          </View>
        </BrutalCard>

        {catalogChapters.map((chapter) => {
          const chapterLessons = chapter.modules.flatMap((m) => m.lessons);
          const chapterDone = chapterLessons.filter((l) => isComplete(l.id)).length;

          return (
            <View key={chapter.chapter} style={styles.chapterBlock}>
              <Text style={styles.eyebrow}>chapter {chapter.chapter}</Text>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              <ProgressBar
                value={chapterDone}
                max={chapterLessons.length}
                label={`${chapterDone} of ${chapterLessons.length}`}
                color={theme.light.tint.mint}
              />

              {chapter.modules.map((mod, index) => {
                const modDone = mod.lessons.filter((l) => isComplete(l.id)).length;
                const modReady = mod.lessons.filter((l) => isLessonAvailable(l.id)).length;
                return (
                  <BrutalCard
                    key={mod.key}
                    fill={theme.light.surface}
                    style={styles.module}
                  >
                    <Text style={styles.moduleTitle}>{mod.label}</Text>
                    <Text style={styles.moduleMeta}>
                      {modReady} playable · {mod.lessons.length} mapped
                    </Text>
                    <ProgressBar
                      value={modDone}
                      max={mod.lessons.length}
                      label={`${modDone}/${mod.lessons.length} done`}
                      color={MODULE_COLORS[index % MODULE_COLORS.length]}
                    />
                  </BrutalCard>
                );
              })}
            </View>
          );
        })}

        <Text style={styles.note}>Streaks land with persistent storage.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.bg,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.45,
  },
  blobA: {
    width: 180,
    height: 180,
    top: 80,
    right: -40,
    backgroundColor: theme.light.tint.mint,
  },
  blobB: {
    width: 140,
    height: 140,
    bottom: 160,
    left: -40,
    backgroundColor: theme.light.tint.blush,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
    gap: theme.spacing.md,
  },
  bigNumber: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.hero,
    color: theme.light.ink,
  },
  bigNumberTail: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.title,
    color: theme.light.muted,
  },
  body: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
    marginTop: theme.spacing.sm,
    lineHeight: 24,
  },
  barGap: {
    marginTop: theme.spacing.md,
  },
  chapterBlock: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
  },
  module: {
    marginTop: theme.spacing.sm,
  },
  moduleTitle: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
  moduleMeta: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },
  note: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    marginTop: theme.spacing.md,
  },
});
