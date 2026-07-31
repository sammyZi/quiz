import { StyleSheet, View } from 'react-native';
import { theme } from '../theme/theme';

// Drawn as a rotated square so it actually centres — glyph text ("›") sits
// off-optical-centre on Android because of font metrics / includeFontPadding.

type ChevronProps = {
  open?: boolean;
  filled?: boolean;
};

export function Chevron({ open, filled }: ChevronProps) {
  return (
    <View style={[styles.hit, filled && styles.filled, open && styles.open]}>
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.light.tint.cream,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  filled: {
    backgroundColor: theme.light.tint.lilac,
  },
  open: {
    transform: [{ rotate: '90deg' }],
    backgroundColor: theme.light.tint.lilac,
  },
  arrow: {
    width: 9,
    height: 9,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: theme.light.ink,
    transform: [{ rotate: '-45deg' }],
    marginLeft: -2,
  },
});
