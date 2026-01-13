-- Add delivery_type column to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_type text NOT NULL DEFAULT 'flexible';

-- Add check constraint for valid delivery types
ALTER TABLE public.orders 
ADD CONSTRAINT orders_delivery_type_check 
CHECK (delivery_type IN ('instant', 'flexible'));