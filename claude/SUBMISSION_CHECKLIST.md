# Submission checklist

## Devpost requirements (every submission needs these)

- [ ] Text description of features and functionality
- [ ] Demo video, ≤ 2 minutes of essential footage, uploaded to YouTube or
      Vimeo, publicly visible, link on the submission form
      - [ ] No third-party trademarks or copyrighted music without permission
      - [ ] Shows the app running on the device it was built for
- [ ] URL to the fully published app — App Store, Google Play, or Galaxy
      Store (must be the first public release, made between Aug 1–Sep 30)
- [ ] 1024×1024 app icon
- [ ] At least one screenshot at 1179×2556, no device frame
- [ ] Free trial OR promo code so judges can unlock premium features —
      test this end to end yourself before submitting, as a judge would

## Categories this app targets

Based on the profile: cross-platform, design-strength, no existing
audience, recent grad (Next Gen likely not eligible — confirm with
hackathon manager if unsure).

- [ ] **RevenueCat Peace Prize** — social good framing: helping people into
      their first IT job. Make this explicit in the text description, not
      just implied.
- [ ] **RevenueCat Design Award** — this is where the neo-brutalist system
      and interactive diagrams need to shine in the video. Lead the demo
      with the tap-to-trigger interaction, not a feature list.
- [ ] **OneSignal — Keep Them Coming Back** — the daily streak notification
      + miss-a-day Journey. Judges look at Journey quality and correct
      implementation, not notification volume. Show this in the video if
      you can (a notification arriving, tapped, opening the app).
- [ ] **Best App for Galaxy (Samsung)** — near-free cross-submit if you're
      building for Android anyway. Check Galaxy Store submission
      requirements separately — they differ slightly from Google Play.
- [ ] **HAMM Award** — the monetization write-up matters as much as the
      implementation. Explicitly explain the free/paid cost-structure logic
      from MONETIZATION.md in your text description.

## Video script skeleton (2 minutes, essential footage only)

1. **0:00–0:10** — the hook: "Nobody explains what a firewall actually
   does." Show the problem, not the app yet.
2. **0:10–0:40** — the core interaction: open a lesson, tap through the
   animation, tap a node for the tooltip, tap "send a malicious packet"
   and watch it get blocked. This is the whole pitch. Don't rush it.
3. **0:40–1:00** — the AWS bridge: same diagram, now labeled Security
   Groups. This is your "oh, that's clever" moment for judges.
4. **1:00–1:20** — quiz, streak, the daily notification arriving
5. **1:20–1:40** — the paywall / AI layer, shown briefly, framed as "when
   you're stuck," not as a sales pitch
6. **1:40–2:00** — the design system on screen for a few seconds (a fast
   scroll through several lesson cards) + your name/handle for
   #BuildInPublic credit if you post the journey publicly

Cut ruthlessly. Judges are not required to watch past 2:00 — anything after
that mark may as well not exist.

## Text description checklist

- [ ] States the problem in the first sentence, not the tech stack
- [ ] Names the categories you're targeting explicitly (Peace Prize framing,
      HAMM cost-structure logic, OneSignal Journey detail) — don't make
      judges infer it
- [ ] Mentions RevenueCat SDK integration point explicitly (which IAP it
      powers)
- [ ] Credits sponsor tools used (Expo, OneSignal, RevenueCat) by name

## Before you hit submit

- [ ] Promo code tested by someone who is NOT you, on a device that is NOT
      yours
- [ ] App installed fresh (not from your dev build) to confirm the
      production listing actually works
- [ ] Video link opens in an incognito window and plays without a login
- [ ] Screenshot pixel dimensions verified exactly, not "close enough"
