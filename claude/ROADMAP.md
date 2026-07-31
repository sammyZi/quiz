# Roadmap — Aug 1 to Sep 30

Working backward from the Sep 30 deadline, with the Google Play closed-testing
gate as the hard constraint that dictates everything else.

## Week 1 (Aug 1–7) — Foundation, no content yet

- Expo project scaffolded, New Architecture confirmed on
- `theme.ts`, `BrutalCard.tsx` in place
- `PacketFlowEngine` — one hardcoded lesson (firewall), rendering and
  animating correctly on a real mid-range Android phone
- Prototype the SVG + Reanimated interaction for one day before building
  anything else on top of it — this is the de-risking step, don't skip it
- Decision made: JetBrains Kotlin award in or out (only in if you're
  genuinely comfortable committing week 1 to learning Compose Multiplatform)

**Exit condition:** the firewall lesson from `module-1-lessons.json` animates
smoothly, tap-to-advance, on your own phone.

## Week 2 (Aug 8–14) — Engine hardening + hand-written content

- Lesson list screen, lesson screen, quiz screen wired end to end
- MMKV progress tracking, streak logic
- Hand-write lesson 7 (ports) as your second quality anchor
- Dev lesson browser screen built — you'll use this constantly from here on

## Week 3 (Aug 15–21) — Content generation, Module 1

- `scripts/generate-lessons.ts` built against `generate-lessons.prompt.md`
- Batch-generate lessons 8–15, five at a time, reviewing each batch
- Run `validate-lessons.ts` after every batch

## Week 4 (Aug 22–24) — Android closed testing starts (hard deadline)

- **This is the non-negotiable gate.** Google Play requires 12 testers
  opted in continuously for 14 days before production access, plus 1–3 days
  of review. Miss this window and Android submission is at risk.
- Get *something* installable into closed testing now, even rough —
  content can keep improving after testing starts, the app just needs to
  install and not crash
- Recruit 12 testers this week — Shipaton Discord tester-swap threads

## Week 5 (Aug 25–31) — Content generation, Module 2

- Generate lessons 16–29 (AWS bridge), feeding each its paired Module 1
  lesson as context
- Hand-write lesson 30 (the closer) yourself
- Fact-check lessons 21, 25, 26 against AWS docs directly

## Week 6 (Sep 1–7) — Mascot + avatars + visual polish

- Generate mascot cast and learner avatars (see `avatar-prompts.md`)
- Trace mascot to vector if it appears in more than a few places, import to
  Rive
- Dark mode prototype on one screen — decide and commit

## Week 7 (Sep 8–14) — Monetization + notifications

- RevenueCat entitlement, paywall screen, promo code set up in dashboard
  and tested end to end
- OneSignal daily streak notification + miss-a-day Journey
- iOS build via EAS if pursuing iOS as an Android-approval fallback

## Week 8 (Sep 15–21) — Polish pass

- Full pass through every lesson in the dev browser — fix anything that
  looks or reads wrong
- Performance pass on the mid-range Android phone specifically
- Store listing: icon, screenshots at 1179×2556, description

## Sep 22–28 — Ship + record

- Publish for real (not just closed testing — confirm production listing
  is live)
- Record the 2-minute demo video — budget two full days for this alone;
  for design-focused categories the video *is* the submission
- Write the Devpost text description

## Sep 29–30 — Buffer

- Deliberately empty. Something will go wrong in the last week. This is
  where it gets absorbed instead of costing you the deadline.

## The one rule that overrides this plan

If week 3 or 5 is running long, cut lesson count before you cut polish on
the lessons you keep. 20 lessons that animate beautifully and teach
clearly beats 30 that are rushed. Judges see the video, not the count.
