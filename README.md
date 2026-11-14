# Madey Maison — Fashion · Interiors · Events

React + TypeScript + Vite + Tailwind (base reset) + Supabase.
Design direction: Asterix interior site (dark ink, cream, bronze/sand palette; letter-reveal intro; large display type with script accents).

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Supabase
1. Create a project, then run `supabase/migrations/20261114000000_madey_maison.sql` in the SQL editor
   (creates `products` + `orders`, RLS: public read products, public insert orders, seeds 8 products).
2. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `supabase/migrations/20261114100000_customer_accounts.sql` too (customer accounts: profiles, orders per customer).
4. In Supabase → Authentication → URL Configuration, set **Site URL** to your live address
   (e.g. `https://timothy7380.github.io/madey-maison/`) and add it to **Redirect URLs** — used by
   confirmation and password-reset emails.
5. For the GitHub Pages build, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repo secrets
   (Settings → Secrets and variables → Actions), then re-run the deploy workflow.
6. Without env vars the site runs on the sample catalogue in `src/lib/fallbackData.ts` and orders are simulated.

## Ordering logic
- `stock_qty >= qty` → ships, `ship_days` to deliver.
- Otherwise → pre-order, `preorder_days` to make/source.
- Each order row stores per-item fulfilment and days; status is `pre-order` if any line is pre-ordered.

## Customer accounts
- Sign up, sign in, sign out, forgot / reset password, change password (Supabase Auth).
- Checkout requires an account; delivery details prefill from the profile and can be saved back.
- My account: order history with status and per-item ship / pre-order dates, saved details, password.
- Without Supabase, a **preview mode** keeps accounts and orders in the visitor's browser only.

## Where things live
- `src/lib/auth.tsx` – auth provider (Supabase + preview mode)
- `src/components/AuthModal.tsx` – sign in / create account / forgot / reset
- `src/components/AccountDrawer.tsx` – orders, details, password, sign out
- `src/components/Intro.tsx` – loader
- `src/components/Sections.tsx` – Hero, About, Three Arms, Statement, FAQ, Footer
- `src/components/Boutique.tsx` – product grid + filters
- `src/components/CartDrawer.tsx` – bag, delivery details, confirmation
- `src/components/EventsSection.tsx` – **placeholder** for the Events interface (to be replaced)
- `src/index.css` – all custom styles and design tokens
- `public/images/` – images (from Unsplash, free licence). Swap for Madey Maison photography.
