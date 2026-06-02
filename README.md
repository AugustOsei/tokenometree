# Tokenometree — Landing Page

Waitlist landing page for **Tokenometree** — an AI token spend tracker that unifies usage and cost across Anthropic, OpenAI, Google, Groq, Mistral, and OpenRouter.

**Stack:** Static HTML/CSS/JS · Vercel serverless · Supabase · Resend

---

## Quick start

```bash
npm install
npx vercel dev    # frontend + API at localhost:3000
```

## One-time setup

### 1. Supabase
Create a project at [supabase.com](https://supabase.com), then run `supabase/schema.sql` in the SQL Editor.

### 2. Resend
Create an account at [resend.com](https://resend.com), verify `hello@augustwheel.com` as your sender, and grab an API key.

### 3. Environment variables
Add these to your Vercel project (Settings → Environment Variables):

```
SUPABASE_URL                 https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY    <service role key — never the anon key>
RESEND_API_KEY               re_xxxx
```

Copy `.env.example` to `.env` for local `vercel dev`.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add the three env vars above
4. Add custom domain `tokenometree.com`

No build step — Vercel serves `index.html` at root, `/api/waitlist` as a serverless function.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/waitlist?count=1` | Returns `{ count: N }` for social proof |
| POST | `/api/waitlist` | `{ email, ref? }` — signup + referral handling |

## Referrals

Share URL: `https://tokenometree.com?ref=XXXXXXXX`  
Each referral moves the referrer up one position (minimum 1).

## Assets

| File | Description |
|---|---|
| `assets/logo.png` | Pixel-art tree app icon |
| `assets/phone-splash.mp4` | Higgsfield-generated splash animation (scroll-scrubbed in phone section) |
| `assets/token-tree.png` | Decorative illustration |

> See `CLAUDE.md` for full architecture, section map, and Claude Code context.
