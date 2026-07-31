// Claymorphism: soft pastel blobs, plump radii, dual soft shadows.
// Packet colours stay saturated so diagrams still teach by colour.

const packet = {
  request: '#5B7CFF',
  response: '#3DCF8E',
  malicious: '#FF6B6B',
  encrypted: '#9B7BFF',
  data: '#FFB347',
  control: '#FFB347',
} as const;

const tint = {
  sun: '#FFE08A',
  mint: '#B8F0D4',
  blush: '#FFC2D4',
  sky: '#B8D9FF',
  lilac: '#D9C2FF',
  peach: '#FFD0B5',
  cream: '#FFF6E8',
} as const;

const light = {
  mode: 'light' as const,
  bg: '#EDE7F6',
  bgDeep: '#D8CFE8',
  surface: '#F8F4FF',
  ink: '#2D2640',
  muted: '#7A7194',
  border: 'rgba(255,255,255,0.85)',
  packet,
  tint,
};

const dark = {
  mode: 'dark' as const,
  bg: '#1E1A2E',
  bgDeep: '#151222',
  surface: '#2A2438',
  ink: '#F4F0FF',
  muted: '#A89BC0',
  border: 'rgba(255,255,255,0.12)',
  packet,
  tint,
};

export const theme = {
  light,
  dark,
  radius: {
    node: 18,
    pill: 999,
    card: 28,
    button: 22,
  },
  // kept so any leftover `theme.shadow.offset` reads don't crash the app
  shadow: {
    offset: 4,
  },
  clay: {
    // outer soft shadow (bottom-right)
    out: {
      shadowColor: '#9B8EC4',
      shadowOffset: { width: 10, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 10,
    },
    // lighter lift for small chips
    soft: {
      shadowColor: '#9B8EC4',
      shadowOffset: { width: 6, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  hit: {
    min: 48,
  },
  font: {
    display: 'SpaceGrotesk_700Bold',
    body: 'SpaceGrotesk_400Regular',
    mono: 'JetBrainsMono_400Regular',
  },
  fontSize: {
    body: 16,
    caption: 13,
    title: 22,
    hero: 34,
  },
} as const;

export type Theme = typeof theme;
export type ThemeMode = 'light' | 'dark';
export type PacketVariant = keyof typeof packet;
export type Tint = keyof typeof tint;
