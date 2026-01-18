-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create restaurants table with geospatial data
CREATE TABLE public.restaurants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    ) STORED,
    delivery_radius_km NUMERIC NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT true,
    opening_time TIME DEFAULT '09:00:00',
    closing_time TIME DEFAULT '22:00:00',
    image_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add restaurant_id to products table to link products to restaurants
ALTER TABLE public.products 
ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL;

-- Create index on restaurant location for fast proximity queries
CREATE INDEX idx_restaurants_location ON public.restaurants USING GIST (location);

-- Create index on products restaurant_id for fast lookups
CREATE INDEX idx_products_restaurant_id ON public.products(restaurant_id);

-- Enable RLS on restaurants
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Restaurants are publicly readable
CREATE POLICY "Restaurants are publicly readable" 
ON public.restaurants 
FOR SELECT 
USING (true);

-- Only admins can modify restaurants
CREATE POLICY "Admins can insert restaurants"
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update restaurants"
ON public.restaurants
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete restaurants"
ON public.restaurants
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to get nearby restaurants within delivery radius
CREATE OR REPLACE FUNCTION public.get_nearby_restaurants(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    max_distance_km DOUBLE PRECISION DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    delivery_radius_km NUMERIC,
    distance_km DOUBLE PRECISION,
    is_within_delivery_radius BOOLEAN,
    is_active BOOLEAN,
    opening_time TIME,
    closing_time TIME,
    image_url TEXT,
    phone TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        r.id,
        r.name,
        r.slug,
        r.description,
        r.address,
        r.latitude,
        r.longitude,
        r.delivery_radius_km,
        ST_Distance(
            r.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) / 1000 AS distance_km,
        ST_DWithin(
            r.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            r.delivery_radius_km * 1000
        ) AS is_within_delivery_radius,
        r.is_active,
        r.opening_time,
        r.closing_time,
        r.image_url,
        r.phone
    FROM public.restaurants r
    WHERE r.is_active = true
    AND ST_DWithin(
        r.location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        max_distance_km * 1000
    )
    ORDER BY distance_km ASC;
$$;

-- Function to get products from nearby restaurants
CREATE OR REPLACE FUNCTION public.get_products_by_location(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION
)
RETURNS SETOF public.products
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.*
    FROM public.products p
    INNER JOIN public.restaurants r ON p.restaurant_id = r.id
    WHERE r.is_active = true
    AND p.is_available = true
    AND ST_DWithin(
        r.location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        r.delivery_radius_km * 1000
    )
    ORDER BY p.name ASC;
$$;

-- Trigger for updating restaurants updated_at
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add lat/lng to addresses table for location tracking (if not exists)
DO $$
BEGIN
    -- Update lat/lng columns to NOT NULL for proper geolocation (they already exist but are nullable)
    -- We'll keep them nullable for backward compatibility
END $$;