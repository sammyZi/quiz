# Monetization

## The model

Free: all 30 core lessons, quizzes, streaks, notifications. No paywall
anywhere in the primary learning path — this is the whole app for most
users, forever.

Paid (`pro` entitlement): the AI layer only.
- "Still confused?" → regenerate the current concept at a simpler level
- Unlimited practice questions targeted at your weak areas (tracked from
  quiz history)
- Ask a free-text follow-up question about the diagram on screen

## Why this split, specifically

The free tier has near-zero marginal cost — it's bundled static content,
same cost per user whether you have 10 or 10,000. The paid tier is the only
part with real per-use cost (LLM calls), which is exactly what should be
gated behind a subscription. This is the story the HAMM judges are looking
for: monetization that matches cost structure, not monetization bolted on
because the rules require an IAP.

It also means your acquisition funnel and your revenue funnel are honestly
separated. Free content gets people in the door and gets shared
(#BuildInPublic, organic reach). The AI layer converts people who are
already invested enough to be stuck on something specific — high intent,
easy to justify a subscription in the moment.

## RevenueCat setup

- One entitlement: `pro`
- One subscription product, monthly + annual (annual at a meaningful
  discount — this is standard and judges expect it)
- Paywall trigger: tapping "Still confused?" or "More practice" when not
  entitled — contextual, not a cold paywall on app open
- Required by hackathon rules: either a free trial *or* a promo code judges
  can use to unlock and test premium features without paying. Set the promo
  offering up in the RevenueCat dashboard early — don't leave it for
  submission week, it needs to actually work when a judge tries it.

## What NOT to gate

Do not paywall:
- Any of the 30 core lessons
- Quizzes
- Streaks or notifications
- The interactive diagram itself

If a judge hits a paywall while trying to see your core feature, that's an
instant negative signal for both the Design Award and general usability.
The AI layer is additive, not a crippled free tier.

## Notification strategy (ties to the OneSignal award)

- Daily: "Your streak is waiting" — timed off the user's own last-active
  time, not a blanket 9am blast
- Miss a day: a Journey with a softer re-engagement message, not a guilt
  trip — OneSignal judges are explicitly looking at Journey quality, not
  just that push notifications exist
- Never notify about the paywall itself. Notifications are a learning-habit
  tool, not a sales channel — mixing the two undermines both.

## Pricing (placeholder — validate before submission)

Start around $6.99/month or $39.99/year as a working number. This is a
guess, not research — if you have time in week 7, look at 2-3 comparable
learning apps' pricing before finalizing. Don't spend more than 30 minutes
on this; it's a hackathon submission, not a pricing strategy exercise.
