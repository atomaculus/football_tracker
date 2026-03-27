# Football Tracker

A web app for managing weekly amateur football matches - from confirming attendance to tracking match history.

---

## Why I built this

Every Tuesday we play football with a group of friends. The coordination happened over WhatsApp and a shared Excel file: who's coming, who's a sub, what was the score, who scored. It worked, but barely.

This app replaces that Excel. It handles the full weekly operation - attendance, lineups, results, stats - from a mobile-friendly web interface that anyone in the group can open from their phone.

---

## Features

- **Attendance confirmation** - players confirm or decline each week from their phone
- **Lineup builder** - starters and subs list generated from confirmed players
- **Team assignment** - assign players to teams before the match
- **Match result** - log final score and goalscorers
- **Match history** - full record of past games with results and stats
- **Player roster** - a clean roster view for active, inactive, and admin players
- **Admin controls** - open, close, or suspend a match week, with compact collapsible sections
- **Laundry logistics** - automatic shirt assignment on list closure plus manual admin override
- **Weekly automation** - match week opens automatically on Sunday at 10:00 and closes 90 minutes before kickoff

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| Deployment | Vercel |

---

## Architecture

```text
web/
  src/app/         -> App Router pages
  src/components/  -> Match flow UI, admin panels, auth
  src/lib/         -> Supabase access, domain rules, helpers
  public/          -> Branding and static assets
```

The app is designed mobile-first because the real use case is players opening it quickly before a weekly match.

---

## Core flows

1. Admin opens the weekly match
2. Players confirm or decline attendance
3. Admin reviews confirmed players and defines teams
4. Match result and scorers are recorded
5. History and player stats are updated

---

## Status

This project is already functional for real weekly use. The current version includes a stabilized admin workflow for closing a real match, saving attendance in bulk, assigning teams in bulk, recording goals by quantity, and showing real match data across home, match, and history views. Current focus has shifted to importing more historical data and handling guest players more cleanly.

---

## Local setup

```bash
npm install
npm run dev
```

You will need the corresponding Supabase and environment configuration to run the full app locally.
