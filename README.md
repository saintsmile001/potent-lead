# Potent-Lead

Potent-Lead is a Vue 3 lead-generation SaaS prototype with a premium, credit-based workflow. It includes a public landing page, Supabase authentication, a protected dashboard shell, lead search UI, CSV export, local credit top-ups, and an n8n webhook bridge for lead generation requests.

## Tech Stack

- Vue 3 and Vite
- Tailwind CSS v4
- Pinia
- Vue Router
- Supabase Auth
- Axios
- GSAP
- Lucide Vue icons

## Main Screens

- `/` - Marketing landing page with animated hero, feature grid, and pricing calculator.
- `/auth` - Email/password auth, Google OAuth, and password recovery.
- `/dashboard` - Lead table with search, status filters, and CSV export.
- `/search` - Lead request console with location autocomplete, credit validation, and n8n webhook submission.
- `/downloads` - Download history placeholder.
- `/settings` - Local profile, theme, and usage settings.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Add your Supabase project values to `.env`.

4. Run the app:

   ```bash
   npm run dev
   ```

## Supabase

Run `supabase_schema.sql` in your Supabase SQL editor. It creates the `profiles` table, enables RLS, and installs a trigger to create a profile when a new auth user signs up.

Required environment variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Current Notes

This project still uses mock lead data in the dashboard and local browser storage for profile/credit UI state. The search page sends requests to the configured n8n webhook, but there is not yet a status polling endpoint or persisted download history.
