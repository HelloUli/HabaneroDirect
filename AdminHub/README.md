# Habanero Direct — Admin Portal (AdminHub)

Internal admin portal for managing the Habanero Direct ordering platform.

## Tech Stack

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 7
- **Auth:** NextAuth.js v5 (credentials provider, JWT sessions)
- **Deployment:** Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your Supabase connection string and generate an auth secret:

```bash
openssl rand -base64 32
```

### 3. Set up the database

**Option A — Run SQL directly in Supabase:**

Open Supabase Dashboard → SQL Editor → paste and run `supabase/schema.sql`.

**Option B — Use Prisma:**

```bash
npm run db:push
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Login

| Field    | Value                    |
|----------|--------------------------|
| Email    | `admin@habanero.direct`  |
| Password | `admin123`               |

**Change this immediately in production.**

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Authenticated admin pages
│   │   ├── dashboard/       # Overview stats
│   │   ├── restaurants/     # Restaurant CRUD
│   │   ├── orders/          # Order oversight + refunds
│   │   ├── promotions/      # Promo code management
│   │   ├── analytics/       # Basic analytics
│   │   ├── payments/        # Stripe placeholder
│   │   └── settings/        # Platform settings (super_admin)
│   ├── login/               # Auth page
│   └── api/auth/            # NextAuth API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── sidebar.tsx          # Desktop sidebar nav
│   ├── mobile-sidebar.tsx   # Mobile sheet nav
│   ├── header.tsx           # Top bar with user menu
│   └── providers.tsx        # Session + tooltip providers
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client singleton
│   └── utils.ts             # Utility functions
└── types/
    └── next-auth.d.ts       # Auth type augmentations

prisma/
├── schema.prisma            # Database schema (all tables)
└── seed.ts                  # Seed script

supabase/
└── schema.sql               # Full SQL to run in Supabase
```

## Database Schema

The shared database serves all four Habanero Direct apps. Tables:

- `users` — Admin portal users (super_admin, admin)
- `restaurants` — Restaurant profiles, Stripe config, commission rates
- `customers` — Customer accounts (managed by ordering app)
- `orders` — Full order records with status lifecycle
- `order_items` — Line items with price snapshots
- `order_item_modifiers` — Modifier selections per item
- `menus` — Restaurant menus
- `menu_categories` — Menu sections
- `menu_items` — Individual dishes
- `modifier_groups` — Groupings for item options
- `modifiers` — Individual options (Extra cheese, etc.)
- `promotions` — Promo codes with rules
- `platform_settings` — Global key-value configuration

## Auth & Roles

| Role         | Access                                    |
|--------------|-------------------------------------------|
| `super_admin`| Full access including platform settings    |
| `admin`      | All features except platform settings      |

## Scripts

| Command          | Description                       |
|------------------|-----------------------------------|
| `npm run dev`    | Start dev server                  |
| `npm run build`  | Production build                  |
| `npm run db:push`| Push Prisma schema to database    |
| `npm run db:seed`| Seed admin user + settings        |
| `npm run db:studio`| Open Prisma Studio              |
