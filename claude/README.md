# Uplink — doc index

*Working name. Rename anywhere you see "Uplink" once you've picked a real one.*

Learn computer science and cloud fundamentals through animated, interactive
diagrams — built for people trying to get their first job in IT. Built for
RevenueCat Shipaton 2026.

## What's in this folder

| Doc | What it's for |
|---|---|
| [PRD.md](./PRD.md) | What the app is, who it's for, what's in v1 and what isn't |
| [CURRICULUM.md](./CURRICULUM.md) | Every lesson, both modules, in build order |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack, folder structure, how the pieces connect |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | The neo-brutalist system and why each choice was made |
| [MONETIZATION.md](./MONETIZATION.md) | What's free, what's paid, how RevenueCat is wired in |
| [ROADMAP.md](./ROADMAP.md) | Week-by-week plan, Aug 1 → Sep 30 |
| [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) | Every Devpost requirement, mapped to a task |

## Already built, from earlier in this project

These live outside this folder, in your repo root once you copy them over:

- `lesson.schema.ts` — the zod schema every lesson config is validated against
- `generate-lessons.prompt.md` — the system prompt for batch-generating lessons
- `module-1-lessons.json` — six hand-written gold-standard lessons
- `theme.ts` — colour, type, spacing tokens
- `BrutalCard.tsx` — the offset-shadow card component
- `avatar-prompts.md` — image-gen prompts for the mascot cast
- `style-guide.html` — a live, tappable preview of the whole visual system

## Read order if you're starting cold

1. PRD — five minutes, gives you the shape of the whole thing
2. ARCHITECTURE — how it's actually built
3. ROADMAP — what you do this week
4. Everything else, as you hit it

## The one-sentence pitch

*Uplink teaches you how the internet and the cloud actually work, one animated
diagram at a time — then shows you the AWS service that does the same job.*
