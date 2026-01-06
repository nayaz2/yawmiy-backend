-- Verification queries for full-text search setup
-- Run these to verify everything is working correctly

-- 1. Check if search_vector column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' AND column_name = 'search_vector';

-- 2. Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'listings' AND trigger_name = 'listings_search_vector_trigger';

-- 3. Check if GIN index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'listings' AND indexname = 'listings_search_vector_idx';

-- 4. Check if search_vector is populated (if you have listings)
SELECT id, title, 
  CASE 
    WHEN search_vector IS NULL THEN 'NULL - needs update'
    ELSE 'Populated ✓'
  END as search_vector_status
FROM listings 
LIMIT 5;

-- 5. Test full-text search (if you have listings with "laptop" in title/description)
SELECT id, title, 
  ts_rank(search_vector, plainto_tsquery('english', 'laptop')) as relevance
FROM listings
WHERE search_vector @@ plainto_tsquery('english', 'laptop')
ORDER BY relevance DESC
LIMIT 10;

-- 6. If search_vector is NULL for existing listings, run this to populate:
-- UPDATE listings
-- SET search_vector = 
--   setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
--   setweight(to_tsvector('english', COALESCE(description, '')), 'B')
-- WHERE search_vector IS NULL;



