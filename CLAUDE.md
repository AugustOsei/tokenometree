# Tokenometree — Claude Code Context

## What this project is

Tokenometree is an **AI token spend tracker** — a SaaS app that aggregates usage and cost across all major AI providers (Anthropic, OpenAI, Google, Groq, Mistral, OpenRouter) into one dashboard. This repo is the **marketing/waitlist landing page** only, not the app itself.

**Owner:** Augustine Osei — augustwheel.com  
**Domain:** tokenometree.com  
**Status:** Pre-launch, collecting waitlist signups

---

## Architecture — one sentence

Single `index.html` static site + one Vercel serverless function (`api/waitlist.js`) + Supabase Postgres for waitlist storage + Resend for transactional email.

---

## File map

```
index.html              — entire frontend (HTML + CSS + JS, single file, ~2800 lines)
api/waitlist.js         — Vercel serverless function (POST signup, GET count, referral logic)
supabase/schema.sql     — waitlist table DDL (run once in Supabase SQL Editor)
assets/
  logo.png              — pixel-art green tree app icon (square, used in nav + fallback)
  logo.svg              — SVG version of logo
  phone-screen.png      — app splash screen screenshot (used as reference, not shown on site)
  phone-splash.mp4      — Higgsfield-generated splash animation video (scroll-scrubbed)
  phone-rotate.mp4      — earlier phone rotation video (unused, can delete)
  token-tree.png        — decorative illustration
vercel.json             — rewrites /api/waitlist, cache headers, security headers
package.json            — only dependency: @supabase/supabase-js (used server-side only)
.env.example            — required env vars template
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no framework, no build step |
| Animations | GSAP 3.12.5 + ScrollTrigger (CDN) |
| 3D background | Three.js r134 (CDN) — floating particles on hero |
| Scroll video scrub | Native `video.currentTime` driven by ScrollTrigger |
| Backend API | Vercel serverless functions (Node.js ESM) |
| Database | Supabase (Postgres) — `waitlist` table |
| Email | Resend — confirmation + referral emails |
| Hosting | Vercel (static + serverless, no build step) |
| Video generation | Higgsfield AI (Cinema Studio / Grok Video models) |

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
2. **Hero** (`#hero`) — headline, subhead, waitlist email form, social proof counter
3. **Phone splash section** (`#phone-reveal`, 280vh tall) — sticky two-column layout:
   - Left: realistic iPhone CSS frame with `assets/phone-splash.mp4` scroll-scrubbed inside the screen (soil → pixel tree grows → app name/details appear)
   - Right: text panel ("Your AI spend, finally in one place") slides in as user scrolls
   - Full-width `#071409` background so phone screen blends seamlessly into section
4. **How it works** (`#how`) — 3-card bento grid
5. **Live monitor** (`#monitor`) — animated token usage dashboard mockup
6. **Stats bar** (`#stats`) — animated counters
7. **Maker note** (`#note`) — personal note from Augustine
8. **Bottom CTA** (`#cta`) — second waitlist form
9. **Footer**

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
- Do not regenerate the Higgsfield videos unless the design changes — costs credits
