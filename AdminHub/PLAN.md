# AdminHub — MVP Plan & Status

> Admin Portal for the Habanero Direct platform.
> See parent `PLAN.md` for cross-cutting architecture.

---

## Status legend

- **DONE** — Built and functional
- **SHELL** — UI exists but no backend wiring
- **TODO** — Not started

---

## 1. Auth & Access

| Feature | Status | Notes |
|---------|--------|-------|
| Email/password sign in | **DONE** | NextAuth credentials → Supabase `users` table, bcrypt verify |
| Email/password sign up | **DONE** | `POST /api/auth/signup` → Zod validate, bcrypt hash, insert `users` |
| JWT session (8h) | **DONE** | Includes `id`, `role` |
| Route protection (middleware) | **DONE** | Redirects unauthenticated to `/login` |
| Role guard (`/settings` → super_admin only) | **DONE** | Middleware checks `role` |
| Sign out | **DONE** | Header dropdown → `signOut()` |

**Quick-fire tests:**
1. Go to `/dashboard` while logged out → should redirect to `/login`
2. Sign up with a new email → should land on `/dashboard`
3. Sign up with the same email again → should show "already exists" error
4. Sign in with wrong password → should show "Invalid email or password"
5. Sign in with valid credentials → should land on `/dashboard`
6. Click Sign out → should return to `/login`
7. Visit `/settings` as `admin` role → should redirect to `/dashboard`

---

## 2. Restaurant Setup

| Feature | Status | Notes |
|---------|--------|-------|
| List restaurants | **SHELL** | Empty state UI only, no Supabase query |
| Create restaurant | **SHELL** | "Add Restaurant" button exists, no form/dialog/action |
| Generate slug | **TODO** | |
| Generate ordering link | **TODO** | |
| Generate embeddable order button | **TODO** | |
| Connect Stripe account | **TODO** | Needs Stripe Connect OAuth flow |
| Assign commission rate per restaurant | **TODO** | |
| Commission model (5%/10% based on subscription) | **TODO** | |

**Quick-fire tests (once built):**
1. Click "Add Restaurant" → form opens with name, slug fields
2. Submit → restaurant appears in list
3. Slug auto-generates from name
4. Ordering link displays correctly (e.g. `/order/[slug]`)
5. Commission rate defaults to 10%, editable
6. Stripe Connect button initiates OAuth

---

## 3. Orders Oversight

| Feature | Status | Notes |
|---------|--------|-------|
| View all orders | **SHELL** | Empty state card only, no table/data |
| Order detail view | **TODO** | |
| Issue refund | **TODO** | Needs Stripe refund API |
| Filter/search orders | **TODO** | |

**Quick-fire tests (once built):**
1. Orders page loads a table with columns: order #, restaurant, customer, status, total, date
2. Click an order → detail view with line items, customer info, status history
3. Refund button visible on eligible orders
4. Refund processes via Stripe and updates order status

---

## 4. Promotions Management

| Feature | Status | Notes |
|---------|--------|-------|
| List promo codes | **SHELL** | Empty state card only |
| Create promo code | **SHELL** | Button exists, no form |
| Configure type (fixed/percentage) | **TODO** | |
| Configure value, min subtotal, max discount | **TODO** | |
| Configure dates (start/expiry) | **TODO** | |
| Configure usage limit | **TODO** | |
| Enable/disable promo | **TODO** | |

**Quick-fire tests (once built):**
1. Click "Create Promo Code" → form with code, type, value, rules
2. Submit → promo appears in list
3. Toggle enable/disable → updates `is_active`
4. Expired promo shows as inactive

---

## 5. Platform Settings

| Feature | Status | Notes |
|---------|--------|-------|
| View settings | **SHELL** | 5 hardcoded mock values displayed as badges |
| Edit settings | **TODO** | No read/write to `platform_settings` table |
| Delivery fee | **TODO** | |
| Global config (tax, platform name, etc.) | **TODO** | |

**Quick-fire tests (once built):**
1. Settings page loads values from `platform_settings` table
2. Click edit on delivery fee → inline edit or dialog
3. Save → value persists on refresh
4. Only `super_admin` can access this page (already gated)

---

## 6. Basic Analytics

| Feature | Status | Notes |
|---------|--------|-------|
| Order count / chart | **SHELL** | 3 placeholder cards, no data |
| Revenue overview | **SHELL** | |
| Restaurant performance | **SHELL** | |

**Quick-fire tests (once built):**
1. Dashboard stats cards show real counts from `orders` table
2. Analytics page shows order volume over time
3. Revenue card shows sum of `total` from orders
4. Restaurant performance shows per-restaurant breakdown

---

## 7. Payments (Stripe Connect)

| Feature | Status | Notes |
|---------|--------|-------|
| Stripe Connect onboarding | **TODO** | "Coming Soon" placeholder page |
| Customer payments | **TODO** | Handled in Customer App, not AdminHub |
| Platform commission tracking | **TODO** | |
| Restaurant payout tracking | **TODO** | |
| Refund processing | **TODO** | |

**Quick-fire tests (once built):**
1. Restaurant detail shows Stripe onboarding status
2. Payments page lists transactions with commission breakdown
3. Payout amounts = order total − commission − fees
4. Refund reflected in payout ledger

---

## 8. Dashboard (home)

| Feature | Status | Notes |
|---------|--------|-------|
| Total restaurants stat | **SHELL** | Hardcoded "—" |
| Total orders stat | **SHELL** | Hardcoded "—" |
| Revenue stat | **SHELL** | Hardcoded "—" |
| Commission earned stat | **SHELL** | Hardcoded "—" |
| Recent orders list | **SHELL** | Empty state only |
| Restaurant performance summary | **SHELL** | Empty state only |

**Quick-fire tests (once built):**
1. Stats reflect real DB counts/sums
2. Recent orders shows last 5-10 orders with status badges
3. Restaurant performance shows top restaurants by order count

---

## Infrastructure (already in place)

| Item | Status |
|------|--------|
| Next.js 16 + Turbopack | **DONE** |
| Supabase client (server + browser) | **DONE** |
| NextAuth v5 with JWT | **DONE** |
| TypeScript DB types (all tables) | **DONE** |
| Tailwind v4 + shadcn components | **DONE** |
| Component library (17 UI primitives) | **DONE** |
| Sidebar + mobile nav | **DONE** |
| Brand theming (Habanero red) | **DONE** |
| Logo integration | **DONE** |
| Middleware auth + role guard | **DONE** |

---

## Build priority (recommended order)

1. **Restaurant CRUD** — Core of the admin portal; everything else depends on restaurants existing
2. **Dashboard stats** — Wire real data to the existing UI shells
3. **Orders table + detail** — Read-only view of all orders
4. **Promotions CRUD** — Create/edit/toggle promo codes
5. **Platform settings** — Read/write `platform_settings`
6. **Analytics** — Aggregate queries on orders/revenue
7. **Stripe Connect** — Onboarding + commission + payouts
8. **Refunds** — Stripe refund API integration
