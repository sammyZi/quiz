// Neo-brutalism seen through networking hardware. See claude/DESIGN_SYSTEM.md
// for the reasoning behind every choice here — read that before changing a
// value under deadline pressure.

const packet = {
  request: '#4C6FFF', // signal blue
  response: '#2FBF71', // link green
  malicious: '#FF4C4C', // fault red
  encrypted: '#8B5CF6', // secure violet
  data: '#F5A623', // activity amber
  control: '#F5A623',
} as const;

const light = {
  mode: 'light',
  bg: '#E8E6DD', // mineral base, not cream — see DESIGN_SYSTEM.md
  surface: '#FFFFFF',
  ink: '#111111',
  border: '#111111',
  shadow: '#111111', // solid offset shadow colour, never React Native `elevation`
  packet,
} as const;

// Stub only — needs a real one-screen prototype before it's used app-wide.
// A pure-black offset shadow disappears on a dark background, so the shadow
// becomes the card's own accent colour instead of ink.
const dark = {
  mode: 'dark',
  bg: '#1A1A1A',
  surface: '#242424',
  ink: '#F2F2F2',
  border: '#F2F2F2',
  shadow: packet.request,
  packet,
} as const;

export const theme = {
  light,
  dark,
  radius: {
    node: 0, // anything inside a diagram — a node is equipment
    card: 8, // anything you tap as interface
  },
  shadow: {
    offset: 4, // px, both x and y — BrutalCard.tsx offsets a solid View by this
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  hit: {
    min: 48, // accessibility floor, every tappable target
  },
  font: {
    display: 'ArchivoBlack_400Regular', // hero titles, lesson titles
    body: 'SpaceGrotesk_400Regular', // body, captions, takeaways
    mono: 'JetBrainsMono_400Regular', // IPs, status codes, packet labels
  },
  fontSize: {
    body: 16, // never drop below this
    caption: 13,
    title: 22,
    hero: 32,
  },
} as const;

export type Theme = typeof theme;
export type ThemeMode = 'light' | 'dark';
export type PacketVariant = keyof typeof packet;
