-- Drop existing function first (return type changed)
DROP FUNCTION IF EXISTS search_products(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER);

-- Fix SQL syntax error and add matched_term for grouped results
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
  relevance_score REAL,
  matched_term TEXT
) AS $$
DECLARE
  processed_query TEXT;
  search_terms TEXT[];
BEGIN
  -- Normalize query
  processed_query := LOWER(TRIM(search_query));
  
  -- FIXED: Correct array construction syntax with proper alias
  search_terms := ARRAY(
    SELECT term 
    FROM unnest(regexp_split_to_array(processed_query, '\s+')) AS term
    WHERE term != '' AND length(term) > 1
  );
  
  -- Handle empty search terms
  IF array_length(search_terms, 1) IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  WITH keyword_scores AS (
    SELECT 
      p.id AS product_id,
      term AS search_term,
      -- For each search term, find the best match across name and keywords
      GREATEST(
        -- Similarity against product name
        similarity(LOWER(p.name), term),
        -- Similarity against each search_keyword (find max)
        COALESCE((
          SELECT MAX(similarity(LOWER(kw), term))
          FROM unnest(p.search_keywords) AS kw
        ), 0),
        -- Exact keyword match bonus
        CASE WHEN term = ANY(SELECT LOWER(unnest(p.search_keywords))) THEN 0.95 ELSE 0 END,
        -- Contains match in name
        CASE WHEN LOWER(p.name) LIKE '%' || term || '%' THEN 0.7 ELSE 0 END
      ) AS term_score
    FROM products p
    CROSS JOIN unnest(search_terms) AS term
    WHERE p.is_available = TRUE
  ),
  filtered_scores AS (
    SELECT 
      ks.product_id,
      ks.search_term,
      ks.term_score
    FROM keyword_scores ks
    WHERE ks.term_score > 0.25
  ),
  best_term_per_product AS (
    SELECT DISTINCT ON (fs.product_id)
      fs.product_id,
      fs.search_term AS best_matched_term,
      fs.term_score AS best_score
    FROM filtered_scores fs
    ORDER BY fs.product_id, fs.term_score DESC
  ),
  aggregated_scores AS (
    SELECT 
      fs.product_id,
      SUM(fs.term_score) AS total_score,
      COUNT(DISTINCT fs.search_term) AS matched_terms_count
    FROM filtered_scores fs
    GROUP BY fs.product_id
  )
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
    (agg.total_score / GREATEST(array_length(search_terms, 1), 1))::REAL AS relevance_score,
    bt.best_matched_term AS matched_term
  FROM products p
  INNER JOIN aggregated_scores agg ON agg.product_id = p.id
  INNER JOIN best_term_per_product bt ON bt.product_id = p.id
  ORDER BY agg.matched_terms_count DESC, agg.total_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = public;