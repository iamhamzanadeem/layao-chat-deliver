-- =============================================
-- PHASE 1: Extend Orders Table for Multi-Mode
-- =============================================

-- Add order_type column to distinguish order modes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'inventory';

-- Add constraint for order types
ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
CHECK (order_type IN ('inventory', 'restaurant', 'errand'));

-- Link order to source restaurant (for partner orders or specific Layao store)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);

-- =============================================
-- PHASE 1.2: Extend Restaurants for Partners
-- =============================================

-- Add restaurant_type to distinguish Layao stores from partners
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS restaurant_type TEXT NOT NULL DEFAULT 'layao_store';
ALTER TABLE restaurants ADD CONSTRAINT restaurants_type_check 
CHECK (restaurant_type IN ('layao_store', 'partner'));

-- Add partner-specific fields
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cuisine_type TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS average_prep_time INTEGER DEFAULT 30;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS commission_percent NUMERIC DEFAULT 15;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_accepting_orders BOOLEAN DEFAULT true;

-- =============================================
-- PHASE 1.3: Create Errand Orders Table
-- =============================================

CREATE TABLE IF NOT EXISTS errand_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Task details
  task_type TEXT NOT NULL DEFAULT 'custom',
  task_description TEXT NOT NULL,
  
  -- Pickup location
  pickup_address TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  pickup_contact_name TEXT,
  pickup_contact_phone TEXT,
  
  -- Estimated pricing
  base_fee NUMERIC NOT NULL DEFAULT 150,
  distance_km NUMERIC,
  distance_fee NUMERIC DEFAULT 0,
  estimated_total NUMERIC NOT NULL,
  
  -- Admin approval
  approval_status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  final_price NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT errand_task_type_check CHECK (task_type IN ('document', 'restaurant', 'package', 'custom')),
  CONSTRAINT errand_approval_status_check CHECK (approval_status IN ('pending', 'approved', 'rejected', 'quoted'))
);

-- Enable RLS
ALTER TABLE errand_orders ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own errand orders" ON errand_orders FOR SELECT
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = errand_orders.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Users can insert own errand orders" ON errand_orders FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = errand_orders.order_id AND orders.user_id = auth.uid()));

-- Admin policies for full management
CREATE POLICY "Admins can view all errand orders" ON errand_orders FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update errand orders" ON errand_orders FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete errand orders" ON errand_orders FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- PHASE 2: Pricing Configuration
-- =============================================

CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default pricing
INSERT INTO pricing_config (config_key, config_value, description) VALUES
('errand_base_fee', '{"amount": 150, "currency": "PKR"}', 'Base fee for errand orders'),
('errand_per_km', '{"amount": 20, "currency": "PKR"}', 'Per kilometer charge for errand orders'),
('out_of_range_premium', '{"multiplier": 1.5}', 'Premium multiplier for out-of-range deliveries'),
('restaurant_order_fee', '{"amount": 120, "currency": "PKR"}', 'Delivery fee for restaurant orders'),
('instant_delivery', '{"amount": 100, "currency": "PKR"}', 'Fee for instant delivery (30-45 min)'),
('flexible_delivery', '{"amount": 50, "currency": "PKR"}', 'Fee for flexible delivery (batched)')
ON CONFLICT (config_key) DO NOTHING;

-- RLS for pricing config
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing is publicly readable" ON pricing_config FOR SELECT USING (true);

CREATE POLICY "Admins can manage pricing" ON pricing_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- PHASE 2.2: Distance Calculation Function
-- =============================================

CREATE OR REPLACE FUNCTION calculate_errand_price(
  p_pickup_lat DOUBLE PRECISION,
  p_pickup_lng DOUBLE PRECISION,
  p_delivery_lat DOUBLE PRECISION,
  p_delivery_lng DOUBLE PRECISION
)
RETURNS TABLE (
  distance_km NUMERIC,
  base_fee NUMERIC,
  distance_fee NUMERIC,
  total_fee NUMERIC
) AS $$
DECLARE
  v_base NUMERIC;
  v_per_km NUMERIC;
  v_dist NUMERIC;
BEGIN
  -- Get pricing from config
  SELECT (config_value->>'amount')::NUMERIC INTO v_base 
  FROM pricing_config WHERE config_key = 'errand_base_fee';
  
  SELECT (config_value->>'amount')::NUMERIC INTO v_per_km 
  FROM pricing_config WHERE config_key = 'errand_per_km';
  
  -- Default values if config not found
  v_base := COALESCE(v_base, 150);
  v_per_km := COALESCE(v_per_km, 20);
  
  -- Calculate distance using PostGIS
  SELECT ST_Distance(
    ST_SetSRID(ST_MakePoint(p_pickup_lng, p_pickup_lat), 4326)::geography,
    ST_SetSRID(ST_MakePoint(p_delivery_lng, p_delivery_lat), 4326)::geography
  ) / 1000 INTO v_dist;
  
  RETURN QUERY SELECT 
    ROUND(v_dist, 2) AS distance_km,
    v_base AS base_fee,
    ROUND(v_dist * v_per_km, 0) AS distance_fee,
    v_base + ROUND(v_dist * v_per_km, 0) AS total_fee;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- =============================================
-- PHASE 2.3: Trigger for updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_errand_orders_updated_at
BEFORE UPDATE ON errand_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_config_updated_at
BEFORE UPDATE ON pricing_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for errand_orders
ALTER PUBLICATION supabase_realtime ADD TABLE errand_orders;