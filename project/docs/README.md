# MathQuest v4.2 — All‑Up Safe (FULL)
**Date:** 2025-08-12

## What’s inside
- Events (12 weeks, server‑rotated) and home banner
- Games scaffold + **Quickfire** with server hints & XP posting
- Groups with friend codes; group leaderboard
- Missions (Free + Premium tracks) with progress endpoints
- Class import (CSV) → group + members
- Ads‑for‑Gems (3/day) **blocked for no‑consent accounts**
- Cosmetics & Inventory (seed + equip)
- Anonymized leaderboards unless age ≥13 and consent on
- Privacy Center (export/delete), Consent flow (birth year + token demo)
- Teacher Onboarding Wizard with **preloaded Demo Class** + printable cards
- Guided **Teacher Demo** (10 steps) & **Parent Tour** (5 steps) with **Switch Audience**
- “What’s New” modal + **click tracking** to Admin Analytics

## Run locally
### 1) Server
```bash
cd server
cp .env.example .env
npm i
npx prisma generate
npx prisma migrate dev --name v42_full
npm run dev   # http://localhost:8788
```
(Optionally seed cosmetics: `curl -XPOST http://localhost:8788/dev/seed-cosmetics`)

### 2) Client
```bash
cd client
python -m http.server 8000
# Open http://localhost:8000
```

---

## Basic test paths (step‑by‑step)
### A) Core smoke test (2 minutes)
1. Open **Home** → “What’s New” appears. Click a card (logs analytics).
2. Go **Admin → Analytics** → see charts update.
3. Go **Games → Quickfire** → play 30–60s; score posts XP to server.

### B) Privacy & consent
1. **Consent page**: enter a birth year <2013 (under‑13). Request token with any email; copy the token from alert; verify token.
2. **Privacy Center**: click **Export** (downloads JSON). Try **Delete** (demo immediate).

### C) Missions & events
1. **Missions** page shows Free/Premium tracks with progress bars.
2. **Home** banner uses the current server event (rotates weekly).

### D) Groups & leaderboards
1. **Groups** → copy your friend code, **Create Group**, then **Join Group** in another browser/profile if you like.
2. **Leaderboards**: view **Global Top** (shows anonymized names if no consent/under‑13).

### E) Ads for Gems (consent‑gated)
1. With **no consent**, calling `/ads/reward` will return **403**.
2. After verifying consent on **Consent** page, ads endpoint gives +5 gems (up to 3/day).

### F) Teacher Wizard & Demo flow
1. **Teacher Wizard** → Demo Class is preloaded; click **Print Cards** (prints demo login cards).
2. **Home** → **Start Teacher Demo** (10 steps) → **Switch to Parent** mid‑flow (5 steps).

---

## Notes
- This build uses a **demo user "admin"** by default (client sets `mq.user` in localStorage). Change as desired.
- The consent token flow is **for demo only**; replace with a verifiable method in production.
- All pages are static HTML + ES modules; no framework required.
