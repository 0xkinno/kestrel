# Kestrel - 5-Minute Demo Video Script

**Hard cap: 5:00.** Timings are targets, not guarantees - rehearse and adjust.

---

### 0:00–0:20 - The problem, cold open (no feature tour)

> "In [Kenya's Turkana / Ethiopia's Gambela - pick the one with live data on demo day], a flood or drought warning goes out - and nobody knows if it actually reached anyone, or if they understood what to do. Most early-warning systems stop at 'alert sent.' IGAD's own brief says the real gap is what happens next: generate, communicate, understand, act. Kestrel is the first system in this space that closes that whole loop - and proves it, live."

*(Show: the dashboard's "confirmation rate" number sitting well below the delivery rate - the gap, visualized, in the first 20 seconds.)*

### 0:20–1:00 - Signal → Generate

- Open `/admin`. Click **"Pull latest hazard data."**
- Point out: this is a real Open-Meteo call, not canned data - narrate the returned severity for one or two locations.
- Click **"Draft warning"** on an EMERGENCY or WARNING signal.
- Show the Groq-generated plain-language warning appear in under 10 seconds.

> "That's not a template - it's generated live from the actual reading, in plain language, action first."

### 1:00–1:40 - Human-in-the-loop review

- Open the draft warning's detail page.
- Show the **edit-wording** option - emphasize nothing dispatches automatically.
- Approve as the demo officer, then dispatch.

> "A life-safety product doesn't get to skip human review. An officer sees exactly what's about to go out, can rewrite it, and only then does it move."

### 1:40–2:40 - Communicate → Understand (the differentiator)

- Show the real Telegram message landing on a phone (screen-recorded or a second device) with tap-to-confirm buttons.
- Tap **"Understood"** on the real device - cut to the dashboard number ticking up live.
- Use the **demo controls** on the warning page to simulate the rest of the seeded recipient pool responding (strong response scenario first).

> "Every other team in this space will stop at step three - the message going out. We verify it was actually received and understood, in real time, for a real recipient."

### 2:40–3:40 - Escalate (second AI touchpoint)

- Trigger the **"simulate low turnout"** demo control on a second location.
- Show confirmation rate drop below the 50% threshold on `/dashboard` - the location gets flagged.
- Click into that warning, hit **"Get escalation suggestion."**
- Read the Groq-generated fallback recommendation aloud.

> "This is the second AI layer - not just drafting the warning, but reasoning over how it's actually performing and recommending a concrete next move. That's the AI-creativity bar most teams won't clear."

### 3:40–4:20 - The map and the region view

- Switch to `/map` - show severity-colored markers across all eight IGAD locations.
- Switch to `/dashboard` - show the region-comparison chart, the confirmation gap called out by name (e.g. "only 40% of Ward X confirmed").

### 4:20–4:50 - Close

> "Kestrel: real hazard data, a plain-language AI layer, a human officer who stays in control, a real delivery channel with proof of understanding, and a second AI layer that knows what to do when that understanding doesn't happen fast enough. Generate, communicate, understand, escalate - the whole loop IGAD asked for, built and demoable today."

### 4:50–5:00 - Credits / data transparency card

- Quick card: "Real data: Open-Meteo, Groq, Telegram, MapLibre, Unsplash - full source list at `/about-data`."

---

## Rehearsal checklist

- [ ] Confirm live Open-Meteo + Groq calls both complete within the segment's time budget before recording
- [ ] Pre-register at least one real Telegram tester (`/start` the bot) before recording so the real-channel moment isn't empty
- [ ] Have one location already primed to drop below the 50% threshold so the escalation beat doesn't need to be simulated live under time pressure
- [ ] Time a full dry run once - this script assumes ~2 seconds of dead air per transition; adjust if your click-through is slower
