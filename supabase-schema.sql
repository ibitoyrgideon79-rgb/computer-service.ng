-- =============================================================
-- computerservice.ng — Supabase Schema
-- Run this in your Supabase project's SQL Editor
-- =============================================================

-- 1. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id         TEXT        UNIQUE NOT NULL,

  -- Customer
  customer_name    TEXT        NOT NULL,
  phone_number     TEXT        NOT NULL,
  email            TEXT,

  -- Service
  service          TEXT        NOT NULL DEFAULT 'Unspecified',
  category         TEXT,

  -- Delivery
  delivery_method  TEXT,
  pickup_location  TEXT,
  delivery_details TEXT,
  location         TEXT,        -- computed: pickup area or delivery zone

  -- Timeline
  deadline         TEXT,

  -- Print options
  print_color      TEXT,
  paper_type       TEXT,
  copies           INTEGER     DEFAULT 1,
  print_layout     TEXT,
  finishing_option TEXT,
  specific_instruction TEXT,

  -- Financial
  amount           NUMERIC(10,2) DEFAULT 0,
  paystack_ref     TEXT,

  -- Status
  status           TEXT        DEFAULT 'Pending'
                   CHECK (status IN ('Pending','In Progress','In Transit','Completed','Delivered','Cancelled')),

  -- Timestamps
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone      ON orders(phone_number);

-- 3. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can insert an order
CREATE POLICY "public_insert" ON orders
  FOR INSERT WITH CHECK (true);

-- Only authenticated users (admin) can read all orders
CREATE POLICY "auth_select" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update orders
CREATE POLICY "auth_update" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Enable Realtime (run in SQL editor)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- =============================================================
-- SETUP INSTRUCTIONS
-- =============================================================
-- 1. Create a free Supabase project at https://supabase.com
-- 2. Go to SQL Editor and run this file
-- 3. Go to Authentication → Users → Add user
--    Email: admin@computerservice.ng
--    Password: (choose a strong password)
-- 4. Copy your project URL and keys from Settings → API
-- 5. Add them to your .env.local file
-- 6. In Supabase Dashboard → Realtime, enable the orders table
-- =============================================================
