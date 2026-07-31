import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { QuizQuestion } from '../lib/lesson.schema';
import { theme } from '../theme/theme';

type QuizCardProps = {
  question: QuizQuestion;
  index: number;
  total: number;
  onAnswered: (correct: boolean) => void;
};

export function QuizCard({ question, index, total, onAnswered }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  const choose = (choiceIndex: number) => {
    if (answered) return;
    setSelected(choiceIndex);
    onAnswered(choiceIndex === question.correctIndex);
  };

  return (
    <View>
      <Text style={styles.eyebrow}>
        question {index + 1}/{total}
      </Text>
      <Text style={styles.question}>{question.question}</Text>

      {question.choices.map((choice, choiceIndex) => {
        const isCorrect = choiceIndex === question.correctIndex;
        const isChosen = selected === choiceIndex;
        const reveal = answered && (isCorrect || isChosen);

        return (
          <Pressable
            key={choice}
            onPress={() => choose(choiceIndex)}
            disabled={answered}
            accessibilityRole="button"
            accessibilityState={{ disabled: answered, selected: isChosen }}
            style={[
              styles.choice,
              theme.clay.soft,
              reveal && isCorrect && styles.choiceCorrect,
              reveal && isChosen && !isCorrect && styles.choiceWrong,
            ]}
          >
            <Text style={styles.choiceText}>{choice}</Text>
            {reveal ? (
              <Text style={styles.glyph}>{isCorrect ? '✓' : '✕'}</Text>
            ) : null}
          </Pressable>
        );
      })}

      {answered && question.explanation ? (
        <Text style={styles.explanation}>{question.explanation}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: theme.font.mono,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    marginBottom: theme.spacing.sm,
  },
  question: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.title,
    color: theme.light.ink,
    marginBottom: theme.spacing.md,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: theme.hit.min,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.light.border,
    borderRadius: theme.radius.button,
    backgroundColor: theme.light.surface,
  },
  choiceCorrect: {
    backgroundColor: theme.light.tint.mint,
  },
  choiceWrong: {
    backgroundColor: theme.light.tint.blush,
  },
  choiceText: {
    flex: 1,
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
  glyph: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
  explanation: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.muted,
    lineHeight: 24,
    marginTop: theme.spacing.sm,
  },
});
