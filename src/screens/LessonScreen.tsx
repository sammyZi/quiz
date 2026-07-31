import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BrutalButton } from '../components/BrutalButton';
import { DonePopup } from '../components/DonePopup';
import { PacketFlow } from '../components/PacketFlow';
import { QuizCard } from '../components/QuizCard';
import { getLesson, lessons } from '../lib/loadLessons';
import { useProgress } from '../lib/progress';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';

type LessonRoute = RouteProp<RootStackParamList, 'Lesson'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Phase = 'watch' | 'remember' | 'quiz';

export function LessonScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<LessonRoute>();
  const { markComplete, isComplete } = useProgress();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>('watch');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showDone, setShowDone] = useState(false);

  const lesson = getLesson(params.lessonId);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <AppHeader title="Lesson not found" onBack={navigation.goBack} />
        <Text style={styles.missing}>No lesson with id "{params.lessonId}".</Text>
      </View>
    );
  }

  const onLastStep = stepIndex === lesson.steps.length - 1;
  const allAnswered = Object.keys(answers).length === lesson.quiz.length;
  const correctCount = Object.values(answers).filter(Boolean).length;
  const lessonIndex = lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson =
    lessons.slice(lessonIndex + 1).find((l) => !isComplete(l.id) && l.id !== lesson.id) ??
    lessons.find((l) => l.id !== lesson.id && !isComplete(l.id));

  const goPhase = (next: Phase) => {
    setPhase(next);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const finishLesson = () => {
    markComplete(lesson.id);
    setShowDone(true);
  };

  return (
    <View style={styles.container}>
      <AppHeader title={lesson.title} onBack={navigation.goBack} />

      <View style={styles.progressRow}>
        {(['watch', 'remember', 'quiz'] as const).map((key, i) => {
          const labels = ['Learn', 'Remember', 'Quiz'];
          const order = { watch: 0, remember: 1, quiz: 2 } as const;
          const current = order[phase];
          const active = i === current;
          const done = i < current;
          return (
            <Pressable
              key={key}
              onPress={() => {
                if (i <= current) goPhase(key);
              }}
              style={styles.progressItem}
            >
              <Text style={[styles.progressText, (active || done) && styles.progressTextOn]}>
                {labels[i]}
              </Text>
              {active ? <View style={styles.progressDot} /> : null}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {phase === 'watch' ? (
          <>
            <Text style={styles.stepMeta}>
              {stepIndex + 1}/{lesson.steps.length}
            </Text>
            {stepIndex === 0 ? <Text style={styles.hook}>{lesson.hook}</Text> : null}
            <PacketFlow lesson={lesson} stepIndex={stepIndex} />
          </>
        ) : null}

        {phase === 'remember' ? (
          <>
            <Text style={styles.title}>Remember this</Text>
            {lesson.takeaways.map((takeaway, index) => (
              <Text key={takeaway} style={styles.bullet}>
                {index + 1}. {takeaway}
              </Text>
            ))}
          </>
        ) : null}

        {phase === 'quiz' ? (
          <>
            <Text style={styles.title}>Quick check</Text>
            <Text style={styles.body}>
              {allAnswered
                ? `${correctCount}/${lesson.quiz.length} right`
                : `${lesson.quiz.length} questions`}
            </Text>
            {lesson.quiz.map((question, index) => (
              <View key={question.question} style={styles.quizBlock}>
                <QuizCard
                  question={question}
                  index={index}
                  total={lesson.quiz.length}
                  onAnswered={(correct) =>
                    setAnswers((prev) => ({ ...prev, [index]: correct }))
                  }
                />
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
        {phase === 'watch' ? (
          <View style={styles.controls}>
            {stepIndex > 0 ? (
              <View style={styles.control}>
                <BrutalButton
                  label="Back"
                  color={theme.light.tint.cream}
                  onPress={() => setStepIndex((i) => Math.max(0, i - 1))}
                />
              </View>
            ) : null}
            <View style={styles.control}>
              <BrutalButton
                label={onLastStep ? 'Got it' : 'Next'}
                color={theme.light.tint.sun}
                onPress={() => {
                  if (onLastStep) goPhase('remember');
                  else setStepIndex((i) => i + 1);
                }}
              />
            </View>
          </View>
        ) : null}

        {phase === 'remember' ? (
          <View style={styles.controls}>
            <View style={styles.control}>
              <BrutalButton
                label="Back"
                color={theme.light.tint.cream}
                onPress={() => goPhase('watch')}
              />
            </View>
            <View style={styles.control}>
              <BrutalButton
                label="Quiz"
                color={theme.light.tint.sun}
                onPress={() => goPhase('quiz')}
              />
            </View>
          </View>
        ) : null}

        {phase === 'quiz' ? (
          <View style={styles.controls}>
            <View style={styles.control}>
              {allAnswered ? (
                <BrutalButton
                  label="Finish"
                  color={theme.light.tint.mint}
                  onPress={finishLesson}
                />
              ) : (
                <BrutalButton
                  label="Back"
                  color={theme.light.tint.cream}
                  onPress={() => goPhase('remember')}
                />
              )}
            </View>
          </View>
        ) : null}
      </View>

      {showDone ? (
        <DonePopup
          score={`${correctCount}/${lesson.quiz.length} correct`}
          onNext={
            nextLesson
              ? () => navigation.replace('Lesson', { lessonId: nextLesson.id })
              : undefined
          }
          onClose={() => navigation.goBack()}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  missing: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
    padding: theme.spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45,38,64,0.08)',
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontFamily: theme.font.body,
    fontSize: 14,
    color: theme.light.muted,
    textAlign: 'center',
  },
  progressTextOn: {
    fontFamily: theme.font.display,
    color: theme.light.ink,
  },
  progressDot: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.light.ink,
  },
  stepMeta: {
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    marginBottom: theme.spacing.sm,
  },
  hook: {
    fontFamily: theme.font.display,
    fontSize: 20,
    color: theme.light.ink,
    lineHeight: 28,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.font.display,
    fontSize: 28,
    color: theme.light.ink,
    marginBottom: theme.spacing.md,
  },
  body: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.muted,
    marginBottom: theme.spacing.lg,
  },
  bullet: {
    fontFamily: theme.font.body,
    fontSize: 17,
    color: theme.light.ink,
    lineHeight: 26,
    marginBottom: theme.spacing.md,
  },
  quizBlock: {
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45,38,64,0.08)',
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.light.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(45,38,64,0.08)',
  },
  controls: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  control: {
    flex: 1,
  },
});

