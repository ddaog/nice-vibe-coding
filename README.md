# nice vibe coding

A growth tracking service for solo builders and vibe coders. Track daily progress across multiple projects with a GitHub Contribution Graph-style visualization.

## Tech Stack

- **Next.js** (App Router)
- **Supabase** (DB + Auth)
- **TailwindCSS**
- **Vercel** (deployment)

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com)
   - Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
   - Enable Google & GitHub in Authentication → Providers (set Client ID/Secret). GitHub `repo` scope is requested automatically on sign-in.
   - Add redirect URL: `http://localhost:3001/auth/callback` (and your production URL)

3. **Environment**

   ```bash
   cp .env.example .env.local
   ```

   Fill in:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3001`)

4. **Run**

   ```bash
   npm run dev
   ```

## Features

- **Auth** – Google & GitHub login via Supabase OAuth
- **Projects** – Create, edit, delete projects (idea / building / blocked / launched)
- **Activity log** – Log daily activity per project (type, intensity 1–3)
- **Heatmap** – Yearly contribution graph
- **Share view** – Minimal UI for screenshots (use `/share?screenshot=1` to hide nav)

## Future Scalability

- **Public profiles** – Shareable URLs like `/u/username` with optional privacy
- **Activity filters** – Filter heatmap by project or activity type in the UI
- **Streak reminders** – Email/push when streak is at risk
- **Export** – CSV/JSON export of activities
- **Rate limits** – Supabase edge functions for high-traffic share pages
