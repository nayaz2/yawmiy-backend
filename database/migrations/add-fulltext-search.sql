-- Migration: Add Full-Text Search to Listings
-- This migration adds PostgreSQL tsvector for efficient full-text search

-- Step 1: Add search_vector column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create function to update search_vector
CREATE OR REPLACE FUNCTION listings_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Combine title and description into searchable text
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  -- 'A' weight for title (higher priority)
  -- 'B' weight for description (lower priority)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to auto-update search_vector
DROP TRIGGER IF EXISTS listings_search_vector_trigger ON listings;

CREATE TRIGGER listings_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description ON listings
  FOR EACH ROW
  EXECUTE FUNCTION listings_search_vector_update();

-- Step 4: Update existing rows
UPDATE listings
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- Step 5: Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS listings_search_vector_idx 
ON listings 
USING GIN (search_vector);

-- Step 6: Create additional indexes for common queries
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings(category);
CREATE INDEX IF NOT EXISTS listings_price_idx ON listings(price);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON listings(created_at DESC);

-- Verification query (run to test):
-- SELECT id, title, ts_rank(search_vector, plainto_tsquery('english', 'laptop')) as relevance
-- FROM listings
-- WHERE search_vector @@ plainto_tsquery('english', 'laptop')
-- ORDER BY relevance DESC;



