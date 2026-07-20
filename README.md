# Integration World — Course Platform

A Coursera-style learning platform: students log in, browse courses, buy them, and
watch protected videos with quizzes and assignments. You author everything from a
built-in **admin panel**.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + RLS) · Stripe
(checkout) · Mux (protected, adaptive video) · Tailwind CSS.

The **Oracle Fusion AI Agent Studio — Complete Course 2026** (25 modules, 15
projects, quizzes + assignments) ships as seed data. Add your other courses from
the admin panel.

---

## What's included

- **Auth** — email/password + Google sign-in (Supabase Auth)
- **Catalog + course detail** — hero, highlights, outcomes, interactive curriculum
- **Payments** — Stripe Checkout for paid courses, instant enroll for free ones,
  enrollment granted via a Stripe webhook
- **Player** — Mux adaptive video with **signed playback URLs** (paid videos can't
  be shared), resume-where-you-left-off, progress tracking, course sidebar
- **Quizzes** — single/multiple choice, **graded server-side** (answers never
  reach the browser)
- **Assignments** — text + link submissions, instructor grading + feedback
- **Student dashboard** — enrolled courses with % progress and "continue"
- **Admin panel** — create/edit/publish courses, modules, lessons, upload videos
  to Mux, build quizzes, create assignments, grade submissions

---

## 1. Prerequisites

- Node 18+ (you have Node 26)
- Free accounts: [Supabase](https://supabase.com), [Stripe](https://stripe.com),
  [Mux](https://mux.com)

## 2. Install

```bash
npm install
```

## 3. Supabase

1. Create a project at supabase.com.
2. In **SQL Editor**, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   (creates all tables + Row Level Security), then run
   [`supabase/seed.sql`](supabase/seed.sql) to load the Oracle course.
3. **Project Settings → API** → copy the values into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
4. **Google login (optional):** Authentication → Providers → enable Google, add
   your Google OAuth client id/secret, and set the redirect URL to
   `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.

## 4. Stripe

1. **Developers → API keys** → `STRIPE_SECRET_KEY` and
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. **Webhook:** add an endpoint at `https://YOUR-SITE/api/stripe/webhook`
   listening for `checkout.session.completed`, then copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. Local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## 5. Mux (protected video)

1. **Settings → Access Tokens** → new token → `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`.
2. **Settings → Signing Keys** → create a signing key. Put the key id in
   `MUX_SIGNING_KEY_ID` and the **base64** private key in `MUX_SIGNING_PRIVATE_KEY`.
   Signing keys are what make paid videos un-shareable.
3. To add a video to a lesson: in the admin course editor, paste a **direct video
   URL** (e.g. a shared Google Drive download link, or any public URL) and click
   **Upload to Mux** — the app creates the Mux asset and stores its playback id on
   the lesson. Mux transcodes it for adaptive streaming.

> Videos still in Drive? Share the file → "Anyone with the link" → use the direct
> download URL. Mux ingests it once; playback then streams from Mux, not Drive.

## 6. Make yourself an admin

Sign up in the app first, then in Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where id =
  (select id from auth.users where email = 'you@example.com');
```

Now `/admin` is available from your account menu.

## 7. Run

```bash
npm run dev      # http://localhost:3000
```

The app runs even with empty keys — pages that need a service show a friendly
"connect your services" notice until configured.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add **all** the variables from `.env.example` in Vercel's Environment Variables,
   and set `NEXT_PUBLIC_SITE_URL` to your Vercel URL.
4. Deploy. Then point your Stripe webhook and Supabase Google redirect at the live
   URL.

---

## Adding more courses

- **From the UI:** `/admin` → *New course* → add modules, lessons, videos,
  quizzes, assignments.
- **As seed data:** edit the `COURSES` array in
  [`scripts/generate-seed.mjs`](scripts/generate-seed.mjs), run
  `node scripts/generate-seed.mjs`, and re-run the generated `supabase/seed.sql`.

## Project structure

```
src/
  app/
    (marketing)         page.tsx, courses/            public catalog + detail
    login, signup, auth/callback                      Supabase auth
    dashboard/                                         student "my learning"
    learn/[lessonId]/                                  video player (gated)
    quiz/[quizId], assignment/[assignmentId]           gated activities
    admin/                                             authoring + grading
    api/                                               checkout, webhook, enroll,
                                                       progress, quiz, assignment
  components/                                          UI (player, sidebar, forms)
  lib/                                                 supabase/stripe/mux clients,
                                                       auth helpers, types, queries
supabase/                                              schema + seed
scripts/generate-seed.mjs                              PDF → course seed generator
```

## Security notes

- Row Level Security is enabled on every table. Students can only read published
  content and their own rows.
- Quiz answer keys live in `quiz_questions`, which is **admin-only** under RLS;
  questions are served to students through a route that strips the answers, and
  grading happens server-side with the service role.
- Enrollment is written only by the Stripe webhook / free-enroll route using the
  service role — never directly by the client.
- Video is gated by enrollment: signed Mux tokens are minted per request only
  after an enrollment check.
