# Restaurant Owners Portal — MVP Plan & Status

> Restaurant management portal for Habanero Direct.
> See parent `PLAN.md` for cross-cutting architecture.

---

## Overview

The Restaurant Owners Portal is a **private, responsive web app** for restaurant owners and staff to manage their restaurant operations on the Habanero Direct platform. It connects to the **same Supabase backend** as all other apps.

**Users:** Restaurant owners, restaurant staff (limited permissions)

**Devices:** Must work well on tablets and desktop (operations context)

**Key principle:** This is the **operations layer** — it must be fast, clear, and reliable above all else.

---

## Status legend

- **DONE** — Built and functional
- **SHELL** — UI exists but no backend wiring
- **TODO** — Not started

---

## Tech stack (mirrors AdminHub)

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn components |
| Icons | Lucide React |
| Backend | Supabase (shared project `mxxwirncanrpzqdpafis`) |
| Auth | Supabase Auth (magic link or email/password for restaurant users) |
| Data fetching | Server components + API routes + Supabase client |
| Validation | Zod |
| Dates | date-fns |
| Toasts | Sonner |
| State | React Query (TanStack) |

---

## Database — existing tables used

All tables already exist in the shared Supabase. This app **reads and writes** to the same database as AdminHub and the Customer App.

### Tables this app interacts with

| Table | Access | Purpose |
|-------|--------|---------|
| `restaurants` | Read / Write | Store info, hours, open/close toggle |
| `menus` | Read / Write | Menu management |
| `menu_categories` | Read / Write | Category CRUD |
| `menu_items` | Read / Write | Item CRUD |
| `modifier_groups` | Read / Write | Modifier group CRUD |
| `modifiers` | Read / Write | Modifier CRUD |
| `orders` | Read / Write | Live order board, status updates |
| `order_items` | Read | Order detail line items |
| `order_item_modifiers` | Read | Modifier details on order items |
| `customers` | Read | Customer info on orders |
| `platform_settings` | Read | Delivery fee, tax rate (display only) |

### New table required: `restaurant_users`

The existing `users` table is for **admin portal accounts** (super_admin, admin roles). Restaurant owners/staff need their **own auth** tied to a specific restaurant.

```sql
CREATE TYPE restaurant_user_role AS ENUM ('owner', 'staff');

CREATE TABLE restaurant_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  name            VARCHAR(255) NOT NULL,
  password_hash   TEXT NOT NULL,
  role            restaurant_user_role NOT NULL DEFAULT 'staff',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurant_users_email ON restaurant_users (email);
CREATE INDEX idx_restaurant_users_restaurant ON restaurant_users (restaurant_id);

CREATE TRIGGER trg_restaurant_users_updated_at
  BEFORE UPDATE ON restaurant_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Roles:**
- `owner` — Full access to all features for their restaurant
- `staff` — Can manage orders (live order screen), cannot edit menu or settings

---

## 1. Auth & Access

| Feature | Status | Notes |
|---------|--------|-------|
| Email/password sign in | **TODO** | NextAuth credentials → `restaurant_users` table |
| JWT session | **TODO** | Includes `id`, `role`, `restaurant_id` |
| Route protection (middleware) | **TODO** | Redirect unauthenticated to `/login` |
| Role guard (owner vs staff) | **TODO** | Staff blocked from menu/settings pages |
| Sign out | **TODO** | Header dropdown |

**Scoping rule:** Every query in this app is **scoped to the authenticated user's `restaurant_id`**. A restaurant user can never see or modify another restaurant's data.

**Quick-fire tests:**
1. Go to `/orders` while logged out → should redirect to `/login`
2. Sign in with valid credentials → should land on `/orders` (live order screen is home)
3. Sign in with wrong password → should show error
4. Staff user visits `/menu` → should redirect to `/orders`
5. Owner user visits `/menu` → should load menu editor
6. Click Sign out → should return to `/login`

---

## 2. Live Order Screen (CRITICAL — highest priority)

This is the **primary screen** for restaurant operations. It must be fast, clear, and always up to date.

| Feature | Status | Notes |
|---------|--------|-------|
| Kanban columns: New / In Progress / Ready | **TODO** | Real-time via Supabase subscriptions |
| Order card: order #, items, type, time | **TODO** | Compact, scannable |
| Accept order action | **TODO** | `placed` → `confirmed` |
| Reject order action | **TODO** | `placed` → `rejected` (with reason) |
| Mark preparing | **TODO** | `confirmed` → `preparing` |
| Mark ready | **TODO** | `preparing` → `ready` |
| DoorDash trigger on ready (delivery) | **TODO** | When delivery order marked ready → call DoorDash Drive API |
| Real-time updates | **TODO** | Supabase Realtime subscription on `orders` table |
| Sound/notification on new order | **TODO** | Audio alert when new order arrives |
| Order detail expandable | **TODO** | Click to see full items, modifiers, instructions |

**Query:** `SELECT * FROM orders WHERE restaurant_id = $restaurant_id AND status IN ('placed', 'confirmed', 'preparing', 'ready') ORDER BY placed_at ASC`

**Columns mapping:**
- **New** → `status = 'placed'`
- **In Progress** → `status IN ('confirmed', 'preparing')`
- **Ready** → `status = 'ready'`

**Quick-fire tests:**
1. New order appears in "New" column automatically (real-time)
2. Click Accept → order moves to "In Progress"
3. Click Reject → order disappears with reason dialog
4. Click Mark Preparing → stays in "In Progress"
5. Click Mark Ready → moves to "Ready" column
6. Delivery order marked Ready → DoorDash API called (future integration)
7. Audio alert plays when new order arrives

---

## 3. Menu Management

| Feature | Status | Notes |
|---------|--------|-------|
| List menus for restaurant | **TODO** | |
| Create / edit / delete menu | **TODO** | |
| List categories per menu | **TODO** | |
| Create / edit / delete category | **TODO** | |
| List items per category | **TODO** | |
| Create / edit / delete item | **TODO** | Name, description, price, image, availability |
| List modifier groups per item | **TODO** | |
| Create / edit / delete modifier group | **TODO** | min/max selections, required flag |
| Create / edit / delete modifier | **TODO** | Name, price, default, availability |
| Image upload | **TODO** | Supabase Storage → public URL |
| Toggle item availability | **TODO** | Quick on/off without full edit |
| Drag-to-reorder (categories, items) | **TODO** | `sort_order` field |

**Scoping:** All queries filtered by `restaurant_id` via the menu → restaurant relationship.

**Quick-fire tests:**
1. Menu page shows all menus for this restaurant
2. Create new category → appears in list
3. Create new item with image → appears under category
4. Toggle item availability → `is_available` updates
5. Edit item price → persists on refresh
6. Delete item → removed from list (cascade handles modifiers)

---

## 4. Store Controls

| Feature | Status | Notes |
|---------|--------|-------|
| Open/close toggle | **TODO** | Updates `restaurants.is_open` |
| Business hours display | **TODO** | Read from restaurant record |
| Edit business hours | **TODO** | May need a `restaurant_hours` table or JSONB field |
| Restaurant info display | **TODO** | Name, address, phone, logo |

**Note:** Hours storage needs consideration. Options:
- JSONB column on `restaurants` (simplest for MVP)
- Separate `restaurant_hours` table (more structured)

**Recommendation for MVP:** JSONB column `operating_hours` on the `restaurants` table.

```sql
ALTER TABLE restaurants ADD COLUMN operating_hours JSONB DEFAULT '{}';
```

Format:
```json
{
  "monday":    { "open": "09:00", "close": "21:00", "is_closed": false },
  "tuesday":   { "open": "09:00", "close": "21:00", "is_closed": false },
  "wednesday": { "open": "09:00", "close": "21:00", "is_closed": false },
  "thursday":  { "open": "09:00", "close": "21:00", "is_closed": false },
  "friday":    { "open": "09:00", "close": "22:00", "is_closed": false },
  "saturday":  { "open": "10:00", "close": "22:00", "is_closed": false },
  "sunday":    { "open": "10:00", "close": "20:00", "is_closed": false }
}
```

**Quick-fire tests:**
1. Toggle open/close → `is_open` updates, reflected on customer app
2. Set hours for Monday → persists on refresh
3. Mark Sunday as closed → reflected correctly

---

## 5. Reporting (Basic Only)

| Feature | Status | Notes |
|---------|--------|-------|
| Total sales | **TODO** | `SUM(total)` from orders for this restaurant |
| Commission deducted | **TODO** | `SUM(commission_amount)` |
| Net payout | **TODO** | `SUM(net_restaurant_payout)` |
| Order counts | **TODO** | `COUNT(*)` by status and time period |
| Date range filter | **TODO** | Today, this week, this month, custom |
| Simple chart (orders over time) | **TODO** | Daily order count line chart |

**Queries scoped to:** `WHERE restaurant_id = $restaurant_id`

**Quick-fire tests:**
1. Reports page loads with today's stats
2. Switch to "This Week" → numbers update
3. Total sales = sum of all order totals in range
4. Net payout = total sales − commission
5. Order count matches visible orders

---

## 6. Order History

| Feature | Status | Notes |
|---------|--------|-------|
| Completed orders list | **TODO** | Orders with final statuses |
| Order detail view | **TODO** | Full breakdown of past orders |
| Search by order number | **TODO** | |
| Filter by date range | **TODO** | |
| Filter by status | **TODO** | delivered, cancelled, rejected |

**Quick-fire tests:**
1. Order history shows completed/cancelled/rejected orders
2. Click an order → see full item breakdown
3. Search "HD-001" → filters to matching order
4. Date filter works correctly

---

## App structure (pages)

| Route | Page | Access |
|-------|------|--------|
| `/login` | Sign in | Public |
| `/` | Redirects to `/orders` | Auth required |
| `/orders` | Live order screen (kanban) | Owner + Staff |
| `/orders/history` | Order history | Owner + Staff |
| `/menu` | Menu management | Owner only |
| `/store` | Store controls (hours, open/close) | Owner only |
| `/reports` | Basic reporting/analytics | Owner only |
| `/settings` | Account settings | Owner + Staff |

---

## Build priority (recommended order)

1. **Project scaffold + Supabase connection** — Next.js 16, Tailwind 4, shadcn, Supabase clients
2. **Database migration** — Create `restaurant_users` table, add `operating_hours` column
3. **Auth system** — Login, session, middleware, role guards
4. **Live Order Screen** — Kanban board with real-time subscriptions (THE critical feature)
5. **Menu Management** — Full CRUD for menus → categories → items → modifiers
6. **Store Controls** — Open/close toggle, business hours
7. **Reporting** — Basic sales/commission/payout stats
8. **Order History** — Past orders list with search/filter

---

## Schema changes needed (migration)

```sql
-- 1. Restaurant users table
CREATE TYPE restaurant_user_role AS ENUM ('owner', 'staff');

CREATE TABLE restaurant_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  name            VARCHAR(255) NOT NULL,
  password_hash   TEXT NOT NULL,
  role            restaurant_user_role NOT NULL DEFAULT 'staff',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurant_users_email ON restaurant_users (email);
CREATE INDEX idx_restaurant_users_restaurant ON restaurant_users (restaurant_id);

CREATE TRIGGER trg_restaurant_users_updated_at
  BEFORE UPDATE ON restaurant_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Operating hours column
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';
```

---

## Not in scope (MVP)

- Restaurant-managed promotions (admin only per parent PLAN)
- Customer messaging / chat
- Driver tracking / map
- Advanced analytics / charts
- Multi-location management
- Staff scheduling
- Inventory management
- Customer reviews / ratings
- Push notifications (web push)
- Delivery zone configuration
