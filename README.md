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
3. Without env vars the site runs on the sample catalogue in `src/lib/fallbackData.ts` and orders are simulated.

## Ordering logic
- `stock_qty >= qty` → ships, `ship_days` to deliver.
- Otherwise → pre-order, `preorder_days` to make/source.
- Each order row stores per-item fulfilment and days; status is `pre-order` if any line is pre-ordered.

## Where things live
- `src/components/Intro.tsx` – loader
- `src/components/Sections.tsx` – Hero, About, Three Arms, Statement, FAQ, Footer
- `src/components/Boutique.tsx` – product grid + filters
- `src/components/CartDrawer.tsx` – bag, delivery details, confirmation
- `src/components/EventsSection.tsx` – **placeholder** for the Events interface (to be replaced)
- `src/index.css` – all custom styles and design tokens
- `public/images/` – images (from Unsplash, free licence). Swap for Madey Maison photography.
