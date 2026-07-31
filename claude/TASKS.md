# Tasks — full build list

Generated from ROADMAP.md and CURRICULUM.md, ordered by build sequence. Repo
currently has only the docs in this folder — no code exists yet, so task 1 is
the actual starting point.

Numbers below are build order. The `#N` in each heading is the tracker task ID,
which does not always match (tasks added later kept their original IDs).

**Chapter 2 (AWS) tasks are deferred** — that curriculum is being revised. The
list below builds Chapter 1 (CS fundamentals) end to end.

---

## App foundation

### 1. Scaffold Expo project + theme/BrutalCard `#1`
Create the Expo (RN) project, confirm New Architecture is on, add `theme.ts`
and `BrutalCard.tsx` from earlier project files into `/src`. Navigation setup
lands here too.

### 2. Set up lesson data pipeline `#23`
Copy `lesson.schema.ts` into `/src/lib`. Split `module-1-lessons.json` (6
combined lessons) into one JSON file per lesson under `/lessons`, matching the
module-prefixed IDs in CURRICULUM.md (`net-001-client-server.json`). Build
`loadLessons.ts` to read `/lessons`, validate each against the zod schema, and
export a typed array. Everything downstream reads lessons through this.

### 3. Prototype PacketFlowEngine on one hardcoded lesson `#2`
Build `PacketFlowEngine.tsx` (SVG nodes/wires + Reanimated packets) against
`net-006` (firewall) — the most complex existing lesson (`blocked`, `stopsAt`).
This is the de-risking step: prove the animation is smooth on a real mid-range
Android phone before building anything else on top of it. Don't skip it.

### 4. Wire lesson list, lesson, and quiz screens end to end `#4`
Build `LessonListScreen`, `LessonScreen`, `QuizScreen` using FlashList +
`PacketFlowEngine` + `QuizCard`, reading from `loadLessons.ts`.
*Blocked by: 2.*

### 5. Add MMKV progress tracking + streak logic `#5`
Implement `streaks.ts` and MMKV-backed storage for lesson completion, quiz
history, and streak counts.

### 6. Build home screen with today's lesson surfacing `#24`
PRD core user flow step 1: on open, today's lesson is front and center.
Spaced-repetition-lite — surface what hasn't been reviewed in a while rather
than strictly linear order. Reads completion timestamps from the MMKV progress
store. First screen a judge sees in the demo video.
*Blocked by: 2, 5.*

### 7. Build DevLessonBrowser screen `#7`
Dev-only screen to swipe through every lesson and spot rendering breaks
quickly. You'll use this constantly from here on.

---

## Chapter 1 content — CS fundamentals

### 8. Hand-write ds-002 (linked lists) as second quality anchor `#6`
Write `ds-002` by hand, matching `lesson.schema.ts`, before generating anything
via LLM. Picked over `net-007` (ports) deliberately: it proves the engine
renders **non-networking** content, which is the whole bet of the
CS-fundamentals restructure. If linked lists don't work in PacketFlowEngine,
the curriculum needs rethinking before any generation happens.

### 9. Extend NodeShape with a non-networking node vocabulary `#26`
`PacketFlowEngine` and `NodeShape` were designed around client/server/router/
firewall boxes. Chapter 1 now needs visually distinct node types:
data-structure cells, linked-list nodes with pointer arrows, call-stack frames,
CPU registers, pipeline stages, process/thread boxes. Add these as a node-type
vocabulary in `NodeShape.tsx` and extend `lesson.schema.ts` to allow them.

Direct consequence of broadening past networking. Do it **before** generating
any Chapter 1 content, or every generated lesson needs reworking.
*Blocked by: 8.*

### 10. Decide the Chapter 1 scope cut before generation starts `#29`
Chapter 1 is 33 lessons against a PRD that scoped 30 total, with a Sep 30 ship
date. Pick the cut line **before** generating, not after — generated lessons
that get cut are wasted review time. CURRICULUM.md has a suggested cut order
(`build-`, then `os-`, then `cpu-`). Cut whole modules, never thin every
module. Module 1.2 (data structures) is not cuttable — best engine showcase and
strongest demo-video material.

### 11. Build generate-lessons.ts + validate-lessons.ts scripts `#8`
Build the batch LLM generation script against `generate-lessons.prompt.md`, and
a `validate-lessons.ts` that runs `validateLesson()` over every `/lessons`
file. Build-time only — don't let the generation script leak into the bundle.

### 12. Generate Module 1.2 (data structures) + 1.3 (algorithms) `#9`
Generate `ds-001`, `ds-003..005` and `algo-001..004` — 8 lessons. Best engine
fit in the curriculum, so validate the generation approach here first. Batch 5
at a time, review each batch, run `validate-lessons.ts` after every batch.
`algo-004` (Big O) needs growth curves drawn to scale, not approximated.
*Blocked by: 9, 10.*

### 13. Generate Module 1.1 (how a computer works) + 1.5 (code to machine) `#27`
Generate `cpu-001..004` (CPU/memory/storage, binary, fetch–decode–execute,
stack vs heap) and `build-001` (compiled vs interpreted). 5 lessons. Weaker
engine fit — if `build-001` fights the renderer, cut it per the cut order
rather than forcing it.
*Blocked by: 9, 10.*

### 14. Generate Module 1.4 (operating systems) `#28`
Generate `os-001..004` (processes vs threads, scheduling, concurrency/race
conditions, files and I/O). Accuracy checkpoint: the thread interleaving in
`os-003` must be an actually possible schedule, not an illustrative one —
verify by hand.
*Blocked by: 9, 10.*

### 15. Generate remaining Module 1.6 networking lessons `#11`
Generate `net-007` through `net-015` (ports, HTTPS, load balancers, caching/
CDNs, databases, APIs, authentication, rate limiting, scaling). Lessons
001–006 already exist hand-written as the quality bar — feed them as context so
voice stays consistent. Lowest-risk content in the curriculum.

---

## Monetization, retention, ship

### 16. Get an installable build into Google Play closed testing `#10`
**Hard deadline — everything else bends around this.** Google Play requires 12
testers opted in continuously for 14 days before production access, plus 1–3
days of review. Get something installable in now even if rough — content can
keep improving after testing starts, the app just needs to install and not
crash. Recruit 12 testers (Shipaton Discord tester-swap threads).

### 17. Generate mascot/avatar cast + Rive integration `#13`
Generate mascot and learner avatars per `avatar-prompts.md`. Trace mascot to
vector and import to Rive if it appears in more than a few places. Prototype
dark mode on one screen and decide.

### 18. Build the AI tutor layer (the actual paid feature) `#25`
The three `pro`-gated features from MONETIZATION.md, which the paywall exists
to gate:
1. "Still confused?" — regenerate the current concept at a simpler level
2. Unlimited practice questions targeted at weak areas from quiz history
3. Free-text follow-up question about the diagram on screen

Runtime LLM calls — the only part of the app with real per-use cost, which is
the whole HAMM cost-structure story. Needs a network path and graceful
offline/failure handling, since the rest of the app is offline-first.

### 19. Wire up RevenueCat entitlement + paywall `#14`
Set up `pro` entitlement, one subscription product (monthly + annual),
contextual paywall screen (triggered by "Still confused?"/"More practice"),
and a promo code or free trial in the RevenueCat dashboard, tested end to end.
*Blocked by: 18 — the paywall is meaningless until the thing it gates exists.*

### 20. Wire up OneSignal streak notifications + Journey `#15`
Daily "streak is waiting" notification timed off last-active time, plus a
softer miss-a-day re-engagement Journey. Never notify about the paywall.

### 21. iOS build via EAS (fallback path) `#16`
Only if pursuing iOS as an Android-approval fallback.

### 22. Full polish pass through every lesson `#17`
Walk every lesson in the dev browser, fix anything that looks or reads wrong.
Performance pass specifically on the mid-range Android phone.

### 23. Build store listing assets `#18`
1024×1024 icon, screenshots at 1179×2556 (no device frame), store description.

### 24. Publish to production + confirm live listing `#19`
Move past closed testing to a real public production release (Aug 1–Sep 30
window), confirm the production listing works by installing fresh.

### 25. Record 2-minute demo video `#20`
Follow the video script skeleton in `SUBMISSION_CHECKLIST.md`: hook, core
interaction, AWS bridge, quiz/streak/notification, paywall, design system
flourish + credit. Budget two full days.

### 26. Write Devpost text description `#21`
Problem-first opening, explicit category framing (Peace Prize, HAMM
cost-structure logic, OneSignal Journey detail), name the RevenueCat IAP
integration point, credit sponsor tools (Expo, OneSignal, RevenueCat).

### 27. Final submission checklist pass `#22`
Promo code tested by someone else on a different device; app installed fresh
from the production listing; video link opens in incognito with no login;
screenshot dimensions verified exactly.

---

## Deferred

- **Chapter 2 (AWS) content tasks** — curriculum being revised; tasks to be
  written once it lands. The existing Chapter 2 table in CURRICULUM.md is the
  old plan, kept as a starting point.
- **`aws-015` closer lesson** — hand-written, not delegated. Blocked on the
  Chapter 2 curriculum.

## Dropped

- **Decide: JetBrains Kotlin award in or out** — not an app task, and already
  answered by the stack. ARCHITECTURE.md commits to Expo/React Native; Compose
  Multiplatform would mean a second codebase. Award is out.
