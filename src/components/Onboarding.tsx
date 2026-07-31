import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProgress } from '../lib/progress';
import { theme } from '../theme/theme';
import { BrutalButton } from './BrutalButton';
import { RiveCharacter } from './RiveCharacter';

/** First-launch hero moment — the only place onboarding shows the mascot. */
export function Onboarding() {
  const insets = useSafeAreaInsets();
  const { ready, onboardingDone, finishOnboarding } = useProgress();

  // Wait for storage so we don't flash onboarding over a returning user.
  if (!ready || onboardingDone) return null;

  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen">
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + theme.spacing.xl,
            paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
          },
        ]}
      >
        <RiveCharacter mood="wave" size={160} />
        <Text style={styles.title}>Hey — I’m Ping</Text>
        <Text style={styles.body}>
          Short lessons. Moving pictures. You tap Next when it clicks.
        </Text>
        <View style={styles.cta}>
          <BrutalButton label="Let’s go" color={theme.light.tint.sun} onPress={finishOnboarding} />
        </View>
        <Pressable onPress={finishOnboarding} hitSlop={8}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.light.bg,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing.xl,
    fontFamily: theme.font.display,
    fontSize: 32,
    color: theme.light.ink,
    textAlign: 'center',
  },
  body: {
    marginTop: theme.spacing.md,
    fontFamily: theme.font.body,
    fontSize: 17,
    lineHeight: 26,
    color: theme.light.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
  cta: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.xl,
  },
  skip: {
    marginTop: theme.spacing.md,
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    textDecorationLine: 'underline',
  },
});
