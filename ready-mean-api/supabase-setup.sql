-- ============================================
-- Ready Meen — Supabase Setup SQL
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- 1. Add default values for created_at columns
ALTER TABLE user_info ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE vendor_info ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE product_info ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE order_info ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE order_items ALTER COLUMN created_at SET DEFAULT now();

-- 2. Add default for order status
ALTER TABLE order_info ALTER COLUMN status SET DEFAULT 'placed';

-- 3. Add foreign keys (required for Supabase join queries)
-- These may already exist — if you get "already exists" errors, that's fine

-- product_info.vendor_id → vendor_info.id
DO $$ BEGIN
  ALTER TABLE product_info
    ADD CONSTRAINT fk_product_vendor
    FOREIGN KEY (vendor_id) REFERENCES vendor_info(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- order_info.user_id → user_info.id
DO $$ BEGIN
  ALTER TABLE order_info
    ADD CONSTRAINT fk_order_user
    FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- order_items.order_id → order_info.id
DO $$ BEGIN
  ALTER TABLE order_items
    ADD CONSTRAINT fk_orderitem_order
    FOREIGN KEY (order_id) REFERENCES order_info(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- order_items.product_id → product_info.id
DO $$ BEGIN
  ALTER TABLE order_items
    ADD CONSTRAINT fk_orderitem_product
    FOREIGN KEY (product_id) REFERENCES product_info(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Disable RLS on all tables (API uses service_role key which bypasses RLS,
--    but this ensures no issues if RLS was enabled by default)
ALTER TABLE user_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 5. Add mobile column to user_info (for mobile-based registration)
ALTER TABLE user_info ADD COLUMN IF NOT EXISTS mobile text;

-- 6. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_product_vendor ON product_info(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_category ON product_info(category);
CREATE INDEX IF NOT EXISTS idx_order_user ON order_info(user_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON order_info(status);
CREATE INDEX IF NOT EXISTS idx_orderitem_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orderitem_product ON order_items(product_id);

-- 7. Customer saved addresses (max 3 per user, enforced at API level)
CREATE TABLE IF NOT EXISTS customer_addresses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES user_info(id) ON DELETE CASCADE,
  label text,
  flat_name text NOT NULL,
  flat_number text,
  floor text,
  area text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customer_addresses DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user ON customer_addresses(user_id);
