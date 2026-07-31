# Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Expo (React Native, New Architecture) | You know RN; Expo builds iOS in the cloud with no Mac; sponsor credits available |
| Animation | Reanimated 4 | Worklets run on the UI thread — smooth even under JS load |
| Diagram rendering | `react-native-svg` + `View`-based packets | SVG for static node shapes, Views for anything animated (cheaper to move) |
| Character animation | Rive | Hero moments only — mascot, celebrations, onboarding |
| Lists | FlashList | Lesson list, module list |
| Local storage | MMKV | Progress, streaks, quiz history — synchronous, fast |
| Monetization | RevenueCat SDK | Required by hackathon rules |
| Push | OneSignal | Daily review reminders, streak recovery |
| State | Zustand or plain Context | No Redux needed at this scope |
| Validation | zod | Same schema validates lesson JSON at build time and at runtime |

## Folder structure

```
/app
  /lessons/                  — one JSON file per lesson, matches lesson.schema.ts
    net-001-client-server.json
    net-002-ip-addresses.json
    ...
  /src
    /components
      BrutalCard.tsx
      PacketFlowEngine.tsx    — the core renderer, reads a Lesson and animates it
      QuizCard.tsx
      NodeShape.tsx
    /screens
      LessonListScreen.tsx
      LessonScreen.tsx
      QuizScreen.tsx
      PaywallScreen.tsx
      DevLessonBrowser.tsx    — dev-only, swipe through every lesson to spot breaks
    /theme
      theme.ts
    /lib
      lesson.schema.ts
      loadLessons.ts          — reads /lessons, validates, exports typed array
      revenuecat.ts
      onesignal.ts
      streaks.ts
  /scripts
    generate-lessons.ts       — calls the LLM, writes to /lessons, run at build time only
    validate-lessons.ts       — runs validateLesson() over every file, run in CI / pre-build
```

## The packet-flow engine, concretely

`PacketFlowEngine` takes one `Lesson` and one `stepIndex`, and renders:

1. Nodes — positioned left to right by array order, offset by `lane`
2. Wires — static SVG lines connecting nodes in the order packets reference them
3. Packets for the current step — `View`s animated with Reanimated
   `useAnimatedStyle`, driven by `translateX`/`translateY` from node A's
   position to node B's, with a bounce-stop-fade if `outcome !== "pass"`

State machine per step: `idle → animating → settled`. "Next" only advances
once `settled`. Tapping a highlighted node while settled shows a one-line
tooltip pulled from that step's caption — this is the interactivity that
separates the app from a video.

## Why generation happens at build time, not runtime

Covered in depth earlier in this project, restated here because it's an
architecture decision, not just a workflow preference:

- Correctness is reviewable before ship, not after
- Zero runtime cost for the free tier (matters for HAMM judging — cost
  structure should match monetization)
- Works fully offline, loads instantly
- `scripts/generate-lessons.ts` is a one-time tool, not part of the shipped
  app — don't let it leak into the bundle

## RevenueCat integration points

- One entitlement: `pro`
- Gates: AI "explain differently," unlimited practice quiz generation
- Does NOT gate: any of the 30 core lessons — those are always free
- Free trial or promo code required by hackathon rules — set up a promo
  offering in RevenueCat dashboard before submission, not the week of

## OneSignal integration points

- Daily notification: "Your streak is waiting" — scheduled based on local
  last-completed timestamp, not a fixed time
- Streak-recovery Journey: if a user misses a day, a softer nudge the next
  day rather than a guilt-trip
- This is the Keep Them Coming Back Award's actual judging criteria — the
  quality of the Journey logic matters more than notification volume

## Performance rules, non-negotiable

- Never use `elevation` for the brutalist shadow — solid offset `View` only
  (see `BrutalCard.tsx`)
- Test on a genuinely mid-range Android device, not an emulator, not a
  flagship
- Keep packets on screen per step to 1–3 (schema enforces this)
- Rive for characters, Reanimated for UI motion — don't blur the line
  between the two
