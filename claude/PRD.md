# Product requirements — Uplink

## The problem

People trying to break into IT — bootcamp grads, self-taught devs, career
switchers — are told to "learn the fundamentals" and "get AWS certified."
Free content for this is either a wall of text (docs, blog posts) or a
passive video they zone out on. Nobody has made the mental model *visible* —
what a packet actually does when it hits a firewall, what happens in the
half-second between typing a URL and a page appearing.

## The insight

Almost everything in networking and cloud infrastructure is the same shape:
**things happen at nodes, and something moves between them.** A firewall
blocks. A load balancer distributes. A cache short-circuits. If you build one
good animation engine for "nodes and moving things," you can represent nearly
the entire syllabus with it — and the user can *poke at it* instead of
watching it.

## Who it's for

Primary: someone 0–2 years from a first IT/dev job, comfortable with a phone,
not comfortable yet saying what a firewall actually does when asked in an
interview.

Explicitly not for: people already AWS certified, computer science students
past their second year, anyone wanting deep specialist content (Kubernetes
internals, distributed systems theory). Depth is a v2 problem. v1 wins on
clarity for beginners.

## v1 scope

**In:**
- Module 1: How the internet works (networking fundamentals) — ~15 lessons
- Module 2: The same concepts, bridged to their AWS service — ~15 lessons
- Interactive packet-flow diagrams (tap to trigger, not autoplay)
- Quiz after every lesson, 1–3 questions
- Streaks + daily reminder notification (OneSignal)
- One paid tier: AI tutor for "explain this differently" + unlimited practice
  questions
- Offline-first — all core lesson content ships in the bundle, no network
  required to learn

**Out of v1, explicitly:**
- User accounts / cloud sync (local only — add if traction demands it)
- Full certification exam simulation
- Any module beyond networking + AWS basics (no Kubernetes, no Terraform, no
  security deep-dive)
- Social features, leaderboards, friend streaks
- Android tablet / foldable-specific layouts (Galaxy submission uses the phone
  layout as-is; optimize only if time allows)

If you're tempted to add something mid-build, ask: does this make the first
15 lessons better, or does it add a fourth thing to finish? Cut ruthlessly.
Thirty excellent lessons beat eighty mediocre ones, and judges watch two
minutes of demo video, not eighty lessons.

## Success looks like

For the hackathon: a working, published app with ~25-30 polished lessons,
smooth interactive diagrams, a working paywall, and a 2-minute demo that
shows a judge tapping something and watching it react.

Not a metric. A feeling: someone finishes the firewall lesson and can
actually explain a firewall to a friend five minutes later.

## Core user flow

1. Open app → today's lesson is front and center (spaced-repetition-lite:
   surface what you haven't reviewed in a while, not strictly linear)
2. Read the hook (one sentence, why this matters)
3. Step through the animation — tap "next" to advance each beat, or tap a
   node to see what's happening there
4. Read the 2-3 takeaways
5. Answer the quiz
6. Streak updates, notification scheduled for tomorrow
7. (Paid) "Still confused?" → AI regenerates the same concept, simpler

## Content principle

Concept first, AWS name second. Teach *what a firewall is* before you ever
say "Security Group." This is both better pedagogy and a shortcut for you —
Module 2 lessons reuse Module 1's diagrams almost as-is, just with the
`awsBridge` field populated. See CURRICULUM.md for the full mapping.
