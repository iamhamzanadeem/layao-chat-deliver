-- Add parent_id to categories for hierarchical structure
ALTER TABLE public.categories 
ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Create index for faster hierarchy queries
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Add search_keywords to products for fuzzy search
ALTER TABLE public.products 
ADD COLUMN search_keywords text[] DEFAULT '{}';

-- Create GIN index for faster array search
CREATE INDEX idx_products_search_keywords ON public.products USING GIN(search_keywords);