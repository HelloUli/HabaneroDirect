-- ============================================================
-- Restaurant Owners Portal — Migration 001
-- Creates restaurant_users table + operating_hours column
-- ALREADY APPLIED to Supabase project mxxwirncanrpzqdpafis
-- ============================================================

-- ─── Enum ──────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'restaurant_user_role') THEN
    CREATE TYPE restaurant_user_role AS ENUM ('owner', 'staff');
  END IF;
END $$;

-- ─── Restaurant Users ──────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurant_users (
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

CREATE INDEX IF NOT EXISTS idx_restaurant_users_email ON restaurant_users (email);
CREATE INDEX IF NOT EXISTS idx_restaurant_users_restaurant ON restaurant_users (restaurant_id);

CREATE OR REPLACE TRIGGER trg_restaurant_users_updated_at
  BEFORE UPDATE ON restaurant_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Operating Hours Column ────────────────────────────
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';

-- ─── Seed: Test Owner for Taco Palace ──────────────────
-- Password: "admin123" — CHANGE THIS
INSERT INTO restaurant_users (restaurant_id, email, name, password_hash, role) VALUES
  ('38c1d069-2f04-47d6-8d7f-f2b6cb5bfcb6', 'owner@tacopalace.com', 'Taco Palace Owner',
   '$2b$12$hcK5W6zsilm42mLSXbasPO20UYvNPbu1VVjKd/KSk2px8KgJ.WoAO', 'owner')
ON CONFLICT (email) DO NOTHING;
