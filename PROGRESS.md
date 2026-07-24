# Kestrel - Progress

## Current phase: Full loop verified live end to end. Phase 4 polish nearly done.

## Done this session

**Phase 1 - Data & Core AI Logic - verified live**
- [x] Open-Meteo wired for real current+forecast weather, no API key - confirmed live for all 8 seeded locations (real EMERGENCY drought signal for Lodwar, WATCH flood signal for Gambela pulled live)
- [x] Rule-based hazard classifier (flood/drought/extreme heat, WATCH/WARNING/EMERGENCY) - transparent thresholds, not an AI guess
- [x] Groq prompt + `/api/warnings/generate` - confirmed live against a real Groq API key; tuned the prompt mid-session after the first pass produced overly generic copy ("Find water now") - now produces specific, location-aware, action-first warnings ("Ration water for children and animals first...")
- [x] Warnings persisted with full metadata (hazard type, severity, location, source, timestamp) - confirmed in real Postgres (Supabase)
- [x] `/admin` human-in-the-loop console: pull data → draft → **edit wording** → approve - confirmed live

**Phase 2 - Delivery + Verification Loop - verified live, including the real Telegram channel**
- [x] Real Telegram bot (@kestrel001_Bot) - confirmed a real message was sent, received, and tapped ("Understood"), and the confirmation correctly landed in that warning's live stats (`TELEGRAM: {total:1, confirmed:1}`)
- [x] Simulated SMS/USSD channel, clearly labeled in UI as a simulation - confirmed live
- [x] Aggregation: delivery rate, confirmation rate, time-to-confirm, per-channel breakdown, 50%-threshold escalation flag - confirmed live on both the warning-detail page and the cross-location dashboard
- [x] Groq-powered escalation suggestion - confirmed live, produced a specific recommendation referencing the actual confirmation rate and timing
- [x] Demo control panel - confirmed live; also fixed a real performance bug (see below)

**Bugs found and fixed during live verification (this is why live testing mattered, not just code review):**
- Telegram sends were failing on any warning containing a period, due to an unescaped literal string in the MarkdownV2 caption - fixed, reverified with a real send.
- The webhook could 500 on a stale/expired button-tap toast call even after the confirmation was already correctly recorded - Telegram would then retry the same update forever. Isolated the non-critical toast call so it can never affect the durable write.
- `/api/warnings/[id]/simulate` and the dispatch route were doing one sequential DB round-trip per recipient (20+ seconds for ~20 recipients against the real hosted Postgres). Batched into `createMany`/`updateMany` - now completes in under 2 seconds.
- Dashboard summary was pulling each warning's full raw hazard JSON payload (unused by the client) into every response - trimmed to just `{id, title}`, cutting payload size by an order of magnitude.

**Phase 3 - UI Build**
- [x] Landing page - real Unsplash editorial photography (hero, kestrel, community), core-loop explainer, scroll-reveal motion
- [x] Live map - MapLibre + OpenFreeMap, restyled to the paper/ink/ochre palette, severity-colored markers - confirmed live with real seeded locations
- [x] Warning feed + detail view - confirmed live with real generated warnings
- [x] Verification dashboard - confirmed live: real cross-location D3 comparison chart, real escalation flag, real cumulative-confirmation chart
- [x] Full responsive pass considerations built in
- [x] `npm run build` and `npm run lint` both pass with zero errors/warnings

**Phase 4 - Polish**
- [x] README (stack, setup, demo flow, disclosed substitutions)
- [x] ATTRIBUTIONS.md + image-prompts.md
- [x] `/about-data` in-app transparency page
- [x] 250-word Project Overview / Solution Details drafted (`SUBMISSION.md`) - needs your review/edit
- [x] Demo video script drafted (`DEMO_SCRIPT.md`) - needs a timed rehearsal
- [x] Full live run-through completed (see above)
- [ ] GitHub repo push / Vercel deploy - waiting on your go-ahead (publishing action)

## Known caveat for local dev: Telegram webhook needs a public URL

Locally, Telegram's webhook requires a public HTTPS URL - I used a free `localtunnel` tunnel to prove the real round-trip works, but that free tier dies after a few minutes and isn't durable enough to leave registered. **For the actual demo, deploy to Vercel first** and point the Telegram webhook at that stable URL (`/api/telegram/setup` handles this - just set `PUBLIC_BASE_URL` to your Vercel URL and call it once). No tunnel needed once deployed. The webhook is currently unset in the live bot; re-run setup before demoing the real-channel step.

## What's next

1. Review `SUBMISSION.md` and `DEMO_SCRIPT.md` and edit to taste.
2. When ready to deploy: say so explicitly and I'll walk through Vercel deploy + re-pointing the Telegram webhook at the production URL (I won't push/deploy without your go-ahead, since those are publishing actions).
3. Optional: register a couple more real Telegram testers (`/start` the bot) before the actual demo recording, so the real-channel moment has more than one live confirmation.
