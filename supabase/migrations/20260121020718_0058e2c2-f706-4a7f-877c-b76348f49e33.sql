-- Enable trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable unaccent for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add tsvector column for full-text search
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate search_vector with product name and keywords
UPDATE products SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(search_keywords, ' '), '')), 'B');

-- GIN index for full-text search (exact/prefix matching)
CREATE INDEX IF NOT EXISTS idx_products_fts 
ON products USING GIN (search_vector);

-- GiST index for trigram similarity on name (typo tolerance)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
ON products USING GIST (name gist_trgm_ops);

-- Function to update search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.search_keywords, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search_vector
DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
CREATE TRIGGER products_search_vector_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION products_search_vector_update();

-- Hybrid Search Function (FTS + Trigram)
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
  -- Normalize and prepare search query
  processed_query := LOWER(TRIM(search_query));
  
  -- Create tsquery for full-text search
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
    -- Combined relevance score
    (
      -- FTS rank (0-1 range, weight: 40%)
      COALESCE(ts_rank_cd(p.search_vector, tsquery_val), 0) * 0.4 +
      -- Trigram similarity on name (0-1 range, weight: 40%)
      similarity(p.name, processed_query) * 0.4 +
      -- Exact/prefix match bonus (weight: 20%)
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
      -- Full-text search match
      p.search_vector @@ tsquery_val
      OR
      -- Trigram similarity match (threshold 0.25 for typos)
      similarity(p.name, processed_query) > 0.25
      OR
      -- Keyword trigram match
      similarity(COALESCE(array_to_string(p.search_keywords, ' '), ''), processed_query) > 0.2
      OR
      -- Fallback: ILIKE for simple contains
      p.name ILIKE '%' || processed_query || '%'
      OR
      -- Exact keyword match
      processed_query = ANY(SELECT LOWER(unnest(p.search_keywords)))
    )
  ORDER BY relevance_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;