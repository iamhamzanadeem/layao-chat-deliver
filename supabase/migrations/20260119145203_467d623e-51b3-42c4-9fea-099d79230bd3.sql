-- Add popularity and discount fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- Add constraint for discount_percent (using a trigger for validation instead of CHECK for mutability)
CREATE OR REPLACE FUNCTION public.validate_discount_percent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_percent IS NOT NULL AND (NEW.discount_percent < 0 OR NEW.discount_percent > 100) THEN
    RAISE EXCEPTION 'discount_percent must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_discount_percent_trigger ON public.products;
CREATE TRIGGER validate_discount_percent_trigger
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.validate_discount_percent();

-- Insert test restaurant data
INSERT INTO public.restaurants (name, slug, description, address, latitude, longitude, delivery_radius_km, is_active, phone)
VALUES 
  ('Layao Fresh Andheri', 'layao-andheri', 'Fresh groceries in Andheri West', 
   'Shop 12, Link Road, Andheri West, Mumbai', 19.1362, 72.8296, 5, true, '+91 9876543210'),
  ('Layao Fresh Bandra', 'layao-bandra', 'Premium groceries in Bandra',
   'Shop 45, Hill Road, Bandra West, Mumbai', 19.0596, 72.8295, 4, true, '+91 9876543211'),
  ('Layao Fresh Juhu', 'layao-juhu', 'Express delivery in Juhu',
   'Shop 78, Juhu Tara Road, Mumbai', 19.1075, 72.8263, 3, true, '+91 9876543212')
ON CONFLICT DO NOTHING;

-- Assign products to first restaurant (Andheri) if not assigned
UPDATE public.products 
SET restaurant_id = (SELECT id FROM public.restaurants WHERE slug = 'layao-andheri' LIMIT 1)
WHERE restaurant_id IS NULL;

-- Mark some products as popular
UPDATE public.products SET is_popular = true 
WHERE name ILIKE '%egg%' OR name ILIKE '%milk%' OR name ILIKE '%bread%';

-- Add discount to some products (20% off)
UPDATE public.products 
SET original_price = price * 1.25, discount_percent = 20
WHERE name ILIKE '%brown%' OR name ILIKE '%quail%' OR name ILIKE '%organic%';