import { View, Text, StyleSheet } from 'react-native';
import { BrutalCard } from '../components/BrutalCard';
import { theme } from '../theme/theme';

// ponytail: placeholder only — real "today's lesson" surfacing is a
// separate task. This exists to prove theme + BrutalCard render correctly.
export function HomeScreen() {
  return (
    <View style={styles.container}>
      <BrutalCard accentColor={theme.light.packet.request}>
        <Text style={styles.title}>Uplink</Text>
        <Text style={styles.body}>Scaffold is up. Lessons come next.</Text>
      </BrutalCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.font.display,
    fontSize: theme.fontSize.hero,
    color: theme.light.ink,
    marginBottom: theme.spacing.sm,
  },
  body: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.body,
    color: theme.light.ink,
  },
});
