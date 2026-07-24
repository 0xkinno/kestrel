# Kestrel - Progress

## Current phase: Shipped. Live on Vercel, pushed to GitHub, full loop verified end to end.

## Final status

**Live:** [kestrel-pi.vercel.app](https://kestrel-pi.vercel.app)
**Source:** [github.com/0xkinno/kestrel](https://github.com/0xkinno/kestrel)
**Telegram bot:** [@kestrel001_Bot](https://t.me/kestrel001_Bot), webhook pointed at the production URL

## Done this session (latest pass)

1. **Fixed duplicate warnings.** Testing had left 4 draft/dispatched warnings against the same Lodwar drought hazard signal. Cleaned up the duplicate rows (and their dependent dispatches/confirmations/escalation suggestions) down to the one with the real verified Telegram confirmation, then added `@@unique([hazardSignalId])` to the `Warning` model at the database level. `/api/warnings/generate` is now idempotent: it returns the existing warning instead of creating a duplicate, and `/admin` shows "Already drafted, view" instead of a draft button once a signal has one.

2. **Removed every em dash from the codebase.** Swept all TypeScript, TSX, and Markdown files (31 files) plus `prisma/schema.prisma`, `src/app/globals.css`, and `.env.example`, replacing every em dash with a regular hyphen. Verified zero remain anywhere in the actual project (vendored editor-tooling folders `.agents/`, `.claude/`, `.windsurf/` are excluded from the repo entirely via `.gitignore`, since they are not project source).

3. **Investigated map marker rendering.** Code review confirms the marker logic is correct (proper `[lng, lat]` order, correct gating on the map's `load` event, correct MapLibre `Marker`/`Popup` API usage, all 8 locations flow through correctly, confirmed via the sidebar list rendering all 8 with correct severities). Live DOM confirmation of markers on the WebGL canvas was not obtainable through the automated browser tool in this session: MapLibre's tile pipeline depends on active compositing/render cycles, and the automation pane was not displayed on screen for the entire session (every screenshot attempt errored with "the Browser pane is not displayed, so the page is not compositing frames"), which stalls MapLibre's internal `load` event independent of any app-level bug. Fetch, Web Workers, and direct navigation to the tile host all worked correctly in the same environment, ruling out a network or CSP block. Recommend a quick visual check in a real browser tab to confirm the markers render as expected; the underlying code is correct.

4. **Rebuilt README.md** to the VETO-style spec: title block with badges, blockquoted positioning statement, real screenshots (6, captured from the actual running app and copied into `docs/screenshots/`), live links table (now pointing at the real deployed URLs), the problem statement, three numbered differentiators, a mermaid architecture flowchart, a three-lane ASCII request-lifecycle diagram, a core-loop table with real route names, an accurate repository tree, real quick-start commands, a data/AI disclosure table, a judging-criteria table, a tech stack table, and an honest status section. Zero em dashes, zero AI-slop phrasing, checked.

5. **Pushed to GitHub and deployed to Vercel.**
   - Committed 68 files, pushed to the existing `github.com/0xkinno/kestrel` repository (public, `main` branch).
   - Linked the project to Vercel, added all required environment variables (`DATABASE_URL`, `GROQ_API_KEY`, `GROQ_MODEL`, `TELEGRAM_BOT_TOKEN`, `KESTREL_ADMIN_SECRET`) to production, and deployed.
   - Added a `postinstall: prisma generate` script to `package.json` so Vercel's build correctly regenerates the Prisma client (the generated client directory is gitignored, matching standard practice, so it must be regenerated at install time).
   - Verified all six pages return 200 on the live production URL, and confirmed the production deployment reads the same real Supabase database (8 locations, 2 dispatched warnings visible).
   - Set `PUBLIC_BASE_URL` to the stable production alias (`https://kestrel-pi.vercel.app`), redeployed so the function picked up the new variable, then called `/api/telegram/setup` against production. Confirmed via Telegram's `getWebhookInfo` that the webhook now points at the production URL with zero pending updates and no delivery errors.

## What's next (optional)

- Visually confirm map markers in a real browser tab (see note above; code is correct, only live-tool confirmation is outstanding).
- Register a couple more real Telegram testers (`/start` the bot) before recording the demo video, so the real-channel moment has more than one live confirmation.
- Review `SUBMISSION.md` (Project Overview / Solution Details) and `DEMO_SCRIPT.md`, and do a timed rehearsal of the demo script against the live production URL.
