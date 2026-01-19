-- Fix function search_path security issue
CREATE OR REPLACE FUNCTION public.validate_discount_percent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_percent IS NOT NULL AND (NEW.discount_percent < 0 OR NEW.discount_percent > 100) THEN
    RAISE EXCEPTION 'discount_percent must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;