-- Fix function search_path for security
CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.search_keywords, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix search_products function with search_path
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  user_lat DOUBLE PRECISION DEFAULT NULL,
  user_lng DOUBLE PRECISION DEFAULT NULL,
  result_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  original_price NUMERIC,
  discount_percent INTEGER,
  image_url TEXT,
  unit TEXT,
  stock_status TEXT,
  is_available BOOLEAN,
  is_popular BOOLEAN,
  category_id UUID,
  restaurant_id UUID,
  search_keywords TEXT[],
  relevance_score REAL
) AS $$
DECLARE
  processed_query TEXT;
  tsquery_val TSQUERY;
BEGIN
  processed_query := LOWER(TRIM(search_query));
  tsquery_val := plainto_tsquery('english', processed_query);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.discount_percent,
    p.image_url,
    p.unit,
    p.stock_status,
    p.is_available,
    p.is_popular,
    p.category_id,
    p.restaurant_id,
    p.search_keywords,
    (
      COALESCE(ts_rank_cd(p.search_vector, tsquery_val), 0) * 0.4 +
      similarity(p.name, processed_query) * 0.4 +
      CASE 
        WHEN LOWER(p.name) = processed_query THEN 0.2
        WHEN LOWER(p.name) LIKE processed_query || '%' THEN 0.15
        WHEN LOWER(p.name) LIKE '%' || processed_query || '%' THEN 0.1
        ELSE 0
      END
    )::REAL AS relevance_score
  FROM products p
  WHERE 
    p.is_available = TRUE
    AND (
      p.search_vector @@ tsquery_val
      OR
      similarity(p.name, processed_query) > 0.25
      OR
      similarity(COALESCE(array_to_string(p.search_keywords, ' '), ''), processed_query) > 0.2
      OR
      p.name ILIKE '%' || processed_query || '%'
      OR
      processed_query = ANY(SELECT LOWER(unnest(p.search_keywords)))
    )
  ORDER BY relevance_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;