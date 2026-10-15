# 🌳 CareTree

Gamified micro-habit tracker + AI gift/care-package recommender for elders.
Stack: Next.js 15 (App Router) · Tailwind CSS · Framer Motion · Supabase.

**Included in this drop (Part 1):** Supabase schema + RLS, auth (magic link), and the Dashboard
(growing tree, cat mascot, habit checklist with water-splash / confetti, Supabase sync).
**Coming next (Parts 2–3):** Elder Profile form, AI route handler, "Care Package" modal.

## Project structure

```
caretree/
├─ supabase/
│  └─ schema.sql                 # tables, enum, RLS policies, signup trigger, seed RPC
├─ app/
│  ├─ layout.tsx                 # fonts + global shell
│  ├─ globals.css
│  ├─ page.tsx                   # Dashboard (server: auth guard → DashboardClient)
│  ├─ login/page.tsx             # magic-link sign in
│  ├─ auth/callback/route.ts     # exchanges the magic-link code for a session
│  ├─ elders/new/page.tsx        # (Part 2) Elder Profile form
│  └─ api/recommend/route.ts     # (Part 3) AI route handler
├─ components/
│  ├─ dashboard/
│  │  ├─ DashboardClient.tsx     # state, Supabase reads/writes, layout
│  │  ├─ GrowingTree.tsx         # animated SVG tree (6 growth stages)
│  │  ├─ CatMascot.tsx           # green cat from CSS shapes (3 moods)
│  │  ├─ HabitList.tsx           # animated checklist, grouped by category
│  │  └─ Burst.tsx               # water-splash / confetti particles
│  ├─ elders/ElderForm.tsx       # (Part 2)
│  └─ rewards/CarePackageModal.tsx  # (Part 3)
├─ lib/
│  ├─ supabase/{client,server}.ts
│  ├─ tree.ts                    # date helpers + growth-stage formula
│  └─ types.ts
├─ middleware.ts                 # keeps the Supabase session fresh
└─ .env.local.example
```

## Setup, step by step

1. **Create a Supabase project** at supabase.com.
2. **Run the schema**: Dashboard → SQL Editor → paste `supabase/schema.sql` → Run.
3. **Auth**: Authentication → URL Configuration → add `http://localhost:3000/auth/callback`
   to Redirect URLs (and your production URL later). Email (magic link) is enabled by default.
4. **Install**: `npm install`
5. **Env**: copy `.env.local.example` → `.env.local` and fill in the Project URL and anon key
   (Project Settings → API).
6. **Run**: `npm run dev` → open http://localhost:3000, sign in, and you'll land on the dashboard
   with 5 starter habits.

## How the pieces work

- **Users**: Supabase's built-in `auth.users` holds credentials; `public.profiles` is the app-level
  users table, auto-filled by a trigger on signup.
- **Security**: every table has Row Level Security; users can only see and change their own rows.
  `habit_logs` carries `user_id` too so its policy is a simple equality check, and
  `unique (habit_id, completed_date)` guarantees one check-in per habit per day.
- **Tree growth** (`lib/tree.ts`): `score = 0.6 × today's completion + 0.4 × this week's completion`,
  mapped to stages 0–5. Completing every habit today lifts the tree to at least stage 4, and a perfect
  day in a strong week (≥ 70%) gives full bloom. Edit `computeStage` to tune it.
- **Animation**: the tree is one SVG. A wrapper group sways, an inner group scales up from the ground
  per stage (spring), and canopy blobs / blossoms pop in with staggered springs.
- **Checking a habit**: optimistic UI update → burst animation (water for self-care, confetti for
  family-care) → insert into `habit_logs`; unchecking deletes the row. A failed write rolls back.
- **Dates** are computed in the browser's local time, so "today" matches the user's day.

## Next steps (outline)

**Part 2 — Elder Profile form.** Client form posting with `supabase.from("elders").insert({...})`
(`user_id` = signed-in user). Store `health_conditions` as a `text[]` (comma/tag input) and put
diet restrictions in `preferences`.

**Part 3 — AI recommendations.**
- `POST /api/recommend` with `{ elderId }`. Create the **server** Supabase client so RLS still applies,
  `select` the elder, return 404 if not found.
- Call OpenAI or Gemini **from the route handler only** (keys stay server-side). Ask for structured
  JSON: `[{ item, reason, where_to_buy }]` × 3, using your prompt about age, diet and conditions.
- Add a "not medical advice — check with their doctor" note, since supplements are involved.
- `CarePackageModal` opens from the Reward button (already wired as a placeholder in
  `DashboardClient`), shows loading skeleton → 3 cards, each with a *simulated* affiliate button
  (e.g. a Shopee/Makro search URL with a fake `?aff=caretree` param).
