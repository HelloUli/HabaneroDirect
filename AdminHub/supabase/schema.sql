-- ============================================================
-- Habanero Direct — Full Database Schema
-- Run this in Supabase SQL Editor (in order, top to bottom)
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ──────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('super_admin', 'admin');
CREATE TYPE order_status AS ENUM (
  'placed', 'confirmed', 'preparing', 'ready',
  'out_for_delivery', 'delivered', 'rejected', 'cancelled'
);
CREATE TYPE order_type AS ENUM ('pickup', 'delivery');
CREATE TYPE promo_type AS ENUM ('fixed', 'percentage');
CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json');

-- ─── Users (Admin Portal) ───────────────────────────────

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          VARCHAR(255) NOT NULL UNIQUE,
  name           VARCHAR(255) NOT NULL,
  password_hash  TEXT NOT NULL,
  role           user_role NOT NULL DEFAULT 'admin',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);

-- ─── Restaurants ────────────────────────────────────────

CREATE TABLE restaurants (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                        VARCHAR(255) NOT NULL,
  slug                        VARCHAR(255) NOT NULL UNIQUE,
  description                 TEXT,
  address                     TEXT,
  city                        VARCHAR(100),
  state                       VARCHAR(50),
  zip                         VARCHAR(20),
  phone                       VARCHAR(20),
  email                       VARCHAR(255),
  logo_url                    TEXT,
  cover_image_url             TEXT,
  timezone                    VARCHAR(50) NOT NULL DEFAULT 'America/Chicago',
  is_active                   BOOLEAN NOT NULL DEFAULT true,
  is_open                     BOOLEAN NOT NULL DEFAULT true,
  stripe_account_id           VARCHAR(255),
  stripe_onboarding_complete  BOOLEAN NOT NULL DEFAULT false,
  commission_rate             DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  has_website_subscription    BOOLEAN NOT NULL DEFAULT false,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurants_slug ON restaurants (slug);
CREATE INDEX idx_restaurants_is_active ON restaurants (is_active);

-- ─── Customers ──────────────────────────────────────────

CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(255),
  phone       VARCHAR(20),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_email ON customers (email);

-- ─── Promotions ─────────────────────────────────────────

CREATE TABLE promotions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          VARCHAR(50) NOT NULL UNIQUE,
  description   TEXT,
  type          promo_type NOT NULL,
  value         DECIMAL(10,2) NOT NULL,
  min_subtotal  DECIMAL(10,2),
  max_discount  DECIMAL(10,2),
  starts_at     TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  usage_limit   INT,
  usage_count   INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promotions_code ON promotions (code);

-- ─── Menus ──────────────────────────────────────────────

CREATE TABLE menus (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  external_id     VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menus_restaurant_id ON menus (restaurant_id);

-- ─── Menu Categories ────────────────────────────────────

CREATE TABLE menu_categories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id       UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0,
  external_id   VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_categories_menu_sort ON menu_categories (menu_id, sort_order);

-- ─── Menu Items ─────────────────────────────────────────

CREATE TABLE menu_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id       UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  price             DECIMAL(10,2) NOT NULL,
  image_url         TEXT,
  is_available      BOOLEAN NOT NULL DEFAULT true,
  sort_order        INT NOT NULL DEFAULT 0,
  prep_time_minutes INT,
  external_id       VARCHAR(255),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_category_sort ON menu_items (category_id, sort_order);

-- ─── Modifier Groups ────────────────────────────────────

CREATE TABLE modifier_groups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id    UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  min_selections  INT NOT NULL DEFAULT 0,
  max_selections  INT NOT NULL DEFAULT 1,
  is_required     BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0,
  external_id     VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modifier_groups_item_sort ON modifier_groups (menu_item_id, sort_order);

-- ─── Modifiers ──────────────────────────────────────────

CREATE TABLE modifiers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modifier_group_id   UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name                VARCHAR(255) NOT NULL,
  price               DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_default          BOOLEAN NOT NULL DEFAULT false,
  is_available        BOOLEAN NOT NULL DEFAULT true,
  sort_order          INT NOT NULL DEFAULT 0,
  external_id         VARCHAR(255),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modifiers_group_sort ON modifiers (modifier_group_id, sort_order);

-- ─── Orders ─────────────────────────────────────────────

CREATE TABLE orders (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number              VARCHAR(20) NOT NULL UNIQUE,
  restaurant_id             UUID NOT NULL REFERENCES restaurants(id),
  customer_id               UUID NOT NULL REFERENCES customers(id),
  status                    order_status NOT NULL DEFAULT 'placed',
  type                      order_type NOT NULL,
  subtotal                  DECIMAL(10,2) NOT NULL,
  discount_amount           DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee              DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount                DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_amount                DECIMAL(10,2) NOT NULL DEFAULT 0,
  total                     DECIMAL(10,2) NOT NULL,
  commission_rate_snapshot  DECIMAL(5,2) NOT NULL,
  commission_amount         DECIMAL(10,2) NOT NULL,
  net_restaurant_payout     DECIMAL(10,2) NOT NULL,
  promo_id                  UUID REFERENCES promotions(id),
  stripe_payment_intent_id  VARCHAR(255),
  refund_amount             DECIMAL(10,2),
  refund_reason             TEXT,
  refunded_at               TIMESTAMPTZ,
  doordash_delivery_id      VARCHAR(255),
  doordash_tracking_url     TEXT,
  delivery_address          JSONB,
  special_instructions      TEXT,
  estimated_prep_minutes    INT,
  placed_at                 TIMESTAMPTZ,
  confirmed_at              TIMESTAMPTZ,
  preparing_at              TIMESTAMPTZ,
  ready_at                  TIMESTAMPTZ,
  picked_up_at              TIMESTAMPTZ,
  delivered_at              TIMESTAMPTZ,
  cancelled_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_restaurant_status ON orders (restaurant_id, status);
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_placed_at ON orders (placed_at);
CREATE INDEX idx_orders_customer_id ON orders (customer_id);

-- ─── Order Items ────────────────────────────────────────

CREATE TABLE order_items (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id          UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  name                  VARCHAR(255) NOT NULL,
  quantity              INT NOT NULL,
  unit_price            DECIMAL(10,2) NOT NULL,
  total_price           DECIMAL(10,2) NOT NULL,
  special_instructions  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

-- ─── Order Item Modifiers ───────────────────────────────

CREATE TABLE order_item_modifiers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id   UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_id     UUID REFERENCES modifiers(id) ON DELETE SET NULL,
  name            VARCHAR(255) NOT NULL,
  price           DECIMAL(10,2) NOT NULL
);

CREATE INDEX idx_order_item_modifiers_item ON order_item_modifiers (order_item_id);

-- ─── Platform Settings ──────────────────────────────────

CREATE TABLE platform_settings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key           VARCHAR(100) NOT NULL UNIQUE,
  value         TEXT NOT NULL,
  type          setting_type NOT NULL DEFAULT 'string',
  label         VARCHAR(255),
  description   TEXT,
  updated_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Auto-update updated_at triggers ────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_menus_updated_at
  BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_menu_categories_updated_at
  BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_modifier_groups_updated_at
  BEFORE UPDATE ON modifier_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_modifiers_updated_at
  BEFORE UPDATE ON modifiers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Seed: Default Platform Settings ────────────────────

INSERT INTO platform_settings (key, value, type, label, description) VALUES
  ('delivery_fee', '4.99', 'number', 'Delivery Fee', 'Default delivery fee charged to customers'),
  ('tax_rate', '8.25', 'number', 'Tax Rate (%)', 'Default sales tax percentage'),
  ('platform_name', 'Habanero Direct', 'string', 'Platform Name', 'Display name for the platform'),
  ('support_email', 'support@habanero.direct', 'string', 'Support Email', 'Customer-facing support email'),
  ('min_order_amount', '10.00', 'number', 'Minimum Order Amount', 'Minimum subtotal required to place an order');

-- ─── Seed: Initial Super Admin ──────────────────────────
-- Password: "admin123" — CHANGE THIS IMMEDIATELY after first login
-- bcrypt hash generated for "admin123"
INSERT INTO users (email, name, password_hash, role) VALUES
  ('admin@habanero.direct', 'System Admin', '$2b$12$hcK5W6zsilm42mLSXbasPO20UYvNPbu1VVjKd/KSk2px8KgJ.WoAO', 'super_admin');
