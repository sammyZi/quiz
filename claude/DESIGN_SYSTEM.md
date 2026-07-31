# Design system

Full tokens live in `theme.ts`. Live, tappable preview in `style-guide.html`.
This doc is the *why* behind those files — read it before you improvise a
new colour or a new shadow style under deadline pressure.

## The direction, in one line

Neo-brutalism seen through networking hardware — indicator LEDs on a patch
panel, not the generic yellow-and-pink brutalism every AI tool defaults to.

## Why colour is load-bearing, not decorative

Every accent maps to exactly one packet variant or node kind:

- `request` → signal blue
- `response` → link green
- `malicious` → fault red
- `encrypted` → secure violet
- `data` / `control` → activity amber

This means a user reads what's happening in a diagram from colour alone,
before reading a single label. It also means: **never use these five colours
for anything else in the app.** No red buttons that aren't showing something
blocked. No green that isn't a successful response. Break this rule once and
the whole visual language stops teaching anything.

## Why the base is `#E8E6DD`, not cream

Warm cream (`#F5F0E8`-ish) is the default every generic AI-assisted design
lands on. This palette sits a shade cooler and more mineral — reads as
enamelled equipment rather than paper — and it creates real contrast against
the pure white cards. Cream-on-cream has almost no contrast and looks flat
in a demo video.

## Why nodes are square and cards are rounded

Radius 0 for anything inside a diagram (a node is equipment). Radius 8 for
anything you tap as interface (a lesson card, a button). This single
consistent difference teaches the user, without a word of explanation,
which things are "the world" and which things are "the app."

## Why every accent takes black text, only black

This is a hard constraint, not a preference. It keeps every colour in a
narrow lightness band, which is what makes six colours read as a designed
set instead of a bag of random brights. If you add a seventh colour later,
test black-text-on-it first. If it needs white text, it doesn't belong in
this palette.

## Type

- **Archivo Black** — anything that shouts: hero titles, lesson titles,
  the eyebrow-adjacent big numbers
- **Space Grotesk** — everything you actually read: body, captions,
  takeaways
- **JetBrains Mono** — anything a machine would have printed: IP addresses,
  status codes, packet labels, the eyebrow tag above a lesson title

If you're ever unsure which font a new piece of text should use, ask: would
a terminal have printed this? If yes, mono. Otherwise: is this a headline
or a sentence?

## The shadow rule (repeat this to anyone else who touches the code)

The offset shadow is a solid `View` behind the card, positioned with
`top/left` offset — never React Native's `elevation` prop and never a blurred
`shadowColor`. Android renders `elevation` as a soft blur: wrong look, and
measurably the most expensive thing you can put in a scrolling list of 40
lesson cards. `BrutalCard.tsx` implements this correctly — copy the pattern,
don't reinvent it per-component.

## Dark mode — the one open decision

A pure-black offset shadow disappears against a dark background. `theme.ts`
stubs a `dark` theme where the shadow becomes the element's own accent colour
instead of ink — turning each card into something closer to a backlit panel.
This needs a real prototype on one screen before you commit across the app.
Don't guess it under deadline pressure in week 6.

## Accessibility floor

- Every tappable target is minimum 48pt (`hit.min` in theme.ts)
- Colour is never the *only* signal — a blocked packet also gets an ✕ glyph
  and a stop animation, not just red, for colourblind users
- Body text never drops below 16px

## What "on-brand" means when you're improvising

If you're building a screen that isn't in the style guide yet, check: does
this new element use only the six palette colours, one of the three type
families, radius 0 or 8 (nothing in between), and the offset-shadow pattern?
If yes, it's on-brand no matter how novel the layout is.
