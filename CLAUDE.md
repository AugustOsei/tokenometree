# Tokenometree — Claude Code Context

## What this product is

Tokenometree is an **AI spend monitoring app** — it lets users connect their API keys from multiple AI providers and see all their usage and costs in one dashboard. Users do NOT pay Tokenometree anything; they pay their providers (Anthropic, OpenAI, etc.) directly. Tokenometree just aggregates and visualises that data.

**Never write copy that implies Tokenometree bills or charges users.** The app monitors spend, it doesn't create it.

**Key differentiator — Learn feature:** Beyond monitoring, the app includes a "Learn" section that educates users on tokens: what they are, how each model consumes them, and tips to use them efficiently. Framed as: "Tokens are the next electricity — Tokenometree helps you understand and manage them." This ships day one.

**Owner:** Augustine Osei — augustwheel.com  
**Domain:** tokenometree.com  
**Status:** Pre-launch, collecting waitlist signups

---

## Architecture — one sentence

Single `index.html` static site + one Vercel serverless function (`api/waitlist.js`) + Supabase Postgres for waitlist storage + Resend for transactional email.

---

## File map

```
index.html                    — entire frontend (HTML + CSS + JS, single file, ~83KB)
api/waitlist.js               — Vercel serverless function (POST signup, GET count, referral logic)
supabase/schema.sql           — waitlist table DDL (run once in Supabase SQL Editor)
assets/
  tokenometree_logo2.png      — PRIMARY LOGO — pixel-art tree on dark rounded square, transparent bg
                                Used in: favicon, nav, hero, footer. Do not revert to logo.png.
  logo.png                    — old logo (superseded, kept for safety)
  logo.svg                    — SVG fallback (superseded)
  appstore2.png               — Apple App Store icon, shown in hero "Coming to iOS App Store" badge
  me_pic.png                  — Augustine's avatar (astronaut cartoon), used in maker note card
  phone-screen.png            — app screenshot reference (not shown on site)
  phone-scrub.mp4             — ALL-INTRA re-encoded video for scroll scrubbing (193 keyframes)
                                THIS is the video used on the site. Do not swap back to phone-splash.mp4.
  phone-splash.mp4            — original Higgsfield export (only 9 keyframes, not scrub-ready)
  phone-splash-original.mp4   — original source file
  phone-rotate.mp4            — unused, can delete
  token-tree.png              — old illustration (superseded by me_pic.png in maker note)
  frames/                     — 48 JPEG frames (frame_001.jpg … frame_048.jpg), superseded by video scrub
vercel.json                   — rewrites /api/waitlist, cache headers, security headers
package.json                  — only dependency: @supabase/supabase-js (used server-side only)
.env.example                  — required env vars template
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no framework, no build step |
| Smooth scroll | Lenis 1.1.14 (CDN) — replaces native scroll, wired to GSAP ticker |
| Animations | GSAP 3.12.5 + ScrollTrigger (CDN) |
| 3D background | Three.js r134 (CDN) — floating particles on hero |
| Scroll video scrub | `<video>` + `gsap.to(video, { currentTime })` with `scrub: 1` |
| Backend API | Vercel serverless functions (Node.js ESM) |
| Database | Supabase (Postgres) — `waitlist` table |
| Email | Resend — confirmation + referral emails |
| Hosting | Vercel (static + serverless, no build step) |
| Video generation | Higgsfield AI (Cinema Studio / Grok Video models) |

---

## Scroll video scrub — how it works

The phone section uses a real `<video>` element, not canvas/frames. The video (`phone-scrub.mp4`) was re-encoded with every frame as a keyframe so seeking is instant. Lenis provides smooth scroll momentum, GSAP drives `video.currentTime`.

```
assets/phone-scrub.mp4  →  193 keyframes, 8s, 720×1280, 3.3MB
```

To re-encode a new video for scroll scrub:
```bash
ffmpeg -i input.mp4 -c:v libx264 -x264-params "keyint=1:min-keyint=1" -crf 26 -preset fast -an -movflags +faststart output-scrub.mp4
```

Script load order in `index.html` (must be this order):
1. Three.js
2. GSAP
3. ScrollTrigger
4. Lenis
5. Inline `<script>` — `gsap.registerPlugin(ScrollTrigger)` then `new Lenis()` wired to ticker

---

## Environment variables

Set these in Vercel project settings (never commit `.env`):

```
SUPABASE_URL                 — https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY    — service role key (NOT anon key — runs server-side only)
RESEND_API_KEY               — re_xxxx
```

---

## Supabase setup (one-time)

Run `supabase/schema.sql` in the Supabase SQL Editor. Creates:
- `waitlist` table with `email`, `referral_code`, `referred_by`, `position`, `created_at`
- RLS enabled, no public policies (all access via service role in the API)

**Status:** Schema is written, needs to be run against a real Supabase project. Project URL/keys not yet configured.

---

## Resend setup (one-time)

- Verify sender domain or address: `hello@augustwheel.com`
- Add `RESEND_API_KEY` to Vercel env vars
- From address in `api/waitlist.js` line ~73: `from: 'Tokenometree <hello@augustwheel.com>'`

**Status:** API key not yet added. Code is complete and ready.

---

## Page sections (top to bottom)

1. **Sticky nav** — logo + "Join waitlist" CTA, slides in after hero
2. **Hero** (`#hero`) — headline "Know every token.", subhead, waitlist form, social proof counter,
   App Store badge ("Coming to iOS App Store"), provider ticker
3. **Phone splash section** (`#phone-reveal`, 180vh tall) — sticky two-column layout:
   - Left: iPhone CSS frame with `phone-scrub.mp4` scroll-scrubbed inside the screen
   - Right: text panel "Every model. One dashboard." slides in at 55–85% scroll progress
   - Background `#071409` so phone screen blends into section
4. **How it works** (`#how`) — 4-card 2×2 bento grid: "Paste your API key" / "See the full picture" / "Set a budget. Sleep soundly." / "Learn the language of tokens." (gold-accented, labelled "Also included" not a step number)
5. **Stats bar** (`#stats`) — animated counters: 6+ providers / 100% visibility / $0 surprise overages
6. **Live monitor** (`#monitor`) — animated token usage dashboard mockup with live log console
7. **Maker note** (`#note`) — Augustine's story + his avatar photo (`me_pic.png`)
8. **Bottom CTA** (`#cta`) — "Get in early. Lock your price." + second waitlist form
9. **Footer** — links to augustwheel.com

---

## Key copy rules

- Tokenometree **monitors** spend — users connect their existing AI provider API keys
- Users pay their providers directly; Tokenometree never charges them
- Never use "bill", "billing", or "invoice" in a way that implies Tokenometree is the biller
- "Surprise AI invoices / overages" = fine (refers to provider bills the user didn't expect)
- The app is **not yet launched** — it's iOS-first, coming to App Store

---

## Design tokens (CSS variables)

```
--bg:       #0a0a0a   dark background
--surface:  #111111   card surface
--lime:     #4ade80   primary green accent
--gold:     #FFD055   highlight / waitlist position colour
--text:     #f5f5f5   primary text
--muted:    #737373   secondary text
--border:   #1e1e1e   dividers
--forest:   #166534   dark green (shadows, borders)
```

Fonts: Space Grotesk (headings), Plus Jakarta Sans (body), JetBrains Mono (code/logs) — all via Google Fonts.

---

## Waitlist API (`/api/waitlist`)

- `GET /api/waitlist?count=1` — returns `{ count: N }` for social proof display
- `POST /api/waitlist` — body `{ email, ref? }`:
  - Validates email
  - Checks for duplicates (returns 409 with existing position)
  - Assigns sequential position
  - Generates unique 8-char referral code
  - Stores in Supabase
  - Bumps referrer's position up by 1 if valid `ref` provided
  - Sends Resend confirmation email with referral link

---

## Referral system

Share URL format: `https://tokenometree.com?ref=XXXXXXXX`  
When someone signs up with a valid ref code, the referrer moves up one position (min 1).  
Referral code: 8 chars, alphanumeric (no ambiguous chars like 0/O/1/I).

---

## Local development

```bash
npm install
npx vercel dev        # runs index.html + /api/waitlist at localhost:3000
# OR for frontend-only (no API):
npx serve . -p 3456
```

---

## Deploy checklist

- [ ] Create Supabase project, run `supabase/schema.sql`
- [ ] Add env vars to Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
- [ ] Verify sender in Resend (`hello@augustwheel.com`)
- [ ] Push to GitHub → import in Vercel → auto-deploys on push to main
- [ ] Add custom domain `tokenometree.com` in Vercel

---

## What NOT to do

- Do not use `anon` Supabase key anywhere — only `service_role` in the API
- Do not add a build step — this is intentionally zero-build
- Do not inline the env vars into `index.html` — they must stay server-side only
- Do not swap `phone-scrub.mp4` back to `phone-splash.mp4` — the original has only 9 keyframes and scrubs poorly
- Do not revert to the canvas/frame-sequence approach for the phone section — video scrub is smoother and simpler
- Do not regenerate the Higgsfield videos unless the design changes — costs credits
- Do not write copy implying Tokenometree charges users — it monitors their existing provider spend
