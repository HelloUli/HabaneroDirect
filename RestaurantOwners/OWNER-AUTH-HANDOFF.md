# Restaurant Owner Authentication — Agent Handoff

## Context

The **AdminHub** app (sibling folder `../AdminHub`) now creates a `restaurant_users` row with `role: 'owner'` every time a new restaurant is added. The admin enters:

- **Owner Name**
- **Owner Email**
- **Owner Password** (hashed with bcrypt, cost 12)

These credentials are inserted into the shared Supabase `restaurant_users` table (same DB both apps use). The owner should then be able to log into **this** RestaurantOwners app using those exact credentials.

---

## What Already Exists in This App

| Area | File | Status |
|------|------|--------|
| NextAuth credentials provider | `src/lib/auth.ts` | Working — queries `restaurant_users` by email, compares bcrypt hash |
| Login page | `src/app/login/page.tsx` | Exists — email + password form |
| Middleware (route protection) | `src/middleware.ts` | Exists — redirects unauthenticated users to `/login` |
| Session helper | `src/lib/session.ts` | Exists — extracts `restaurantId`, `role`, `userId` from JWT |
| Signup API | `src/app/api/auth/signup/route.ts` | Exists — creates `staff` users for an existing restaurant |
| DB types | `src/types/database.ts` | Has `restaurant_users` table typed |
| Migration | `supabase/migration-001-restaurant-users.sql` | Already applied — `restaurant_users` table exists |

---

## What Needs to Be Built / Verified

### 1. Login Flow Verification
The login flow (`/login` -> NextAuth credentials -> `restaurant_users` lookup) should already work with accounts created from AdminHub. **Verify it end-to-end** with a test account.

### 2. Password Reset / Change
There is **no** password reset flow yet. Build:
- `POST /api/auth/reset-password` — accepts email, generates a time-limited token, sends a reset link (or for MVP: allow admin to reset from AdminHub)
- A `/reset-password?token=...` page in this app
- Alternatively (simpler MVP): a "Change Password" form under `/settings` that requires current password

### 3. Owner vs Staff Permissions
Middleware already gates `/menu`, `/store`, `/reports` to `owner` role. Make sure:
- Staff users created via `/api/auth/signup` (role: `staff`) are blocked from those routes
- The sidebar hides owner-only links for staff users

### 4. Signup Page (Optional)
The signup API exists at `POST /api/auth/signup` but there may not be a UI for it in `/login`. Decide:
- **Option A**: Only admins create accounts (from AdminHub). No self-signup UI needed. The existing signup API can remain for programmatic use.
- **Option B**: Allow owners to invite staff from a `/settings/team` page that calls the signup API with the restaurant's ID.

Recommended: **Option B** — owners manage their own staff.

### 5. Session Display
Verify the dashboard header/sidebar shows the logged-in user's name and restaurant name. The session already carries `restaurantId` — fetch the restaurant name on the layout if not already done.

---

## Shared Database Schema

Both apps share the same Supabase project. Key table:

```sql
CREATE TABLE restaurant_users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  name            VARCHAR(255) NOT NULL,
  password_hash   TEXT NOT NULL,
  role            restaurant_user_role NOT NULL DEFAULT 'staff',  -- 'owner' | 'staff'
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Accounts are created:
- **Owners** — from AdminHub when admin creates a restaurant (`role: 'owner'`)
- **Staff** — from RestaurantOwners signup API or a future team management page (`role: 'staff'`)

---

## Environment Variables Required

Both apps already share these (check `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
AUTH_SECRET=...
```

---

## Testing Checklist

- [ ] Create a restaurant in AdminHub with owner email `test@example.com` / password `Test1234!`
- [ ] Open RestaurantOwners app and log in with those credentials
- [ ] Confirm session shows correct restaurant name, user name, and role
- [ ] Confirm owner can access `/menu`, `/store`, `/reports`
- [ ] Create a staff user via API and confirm they cannot access owner-only routes
- [ ] Confirm logout works and redirects to `/login`
