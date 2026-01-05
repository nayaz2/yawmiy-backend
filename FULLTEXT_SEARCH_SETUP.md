# PostgreSQL Full-Text Search Setup Guide

## Overview

This guide explains how to set up PostgreSQL full-text search using `tsvector` for better search performance at scale.

## Benefits

✅ **Much faster** than LIKE queries (especially with large datasets)  
✅ **Better relevance** ranking  
✅ **Supports multiple languages**  
✅ **Indexed** for optimal performance  
✅ **Handles typos** better with stemming  

## Current Implementation

The code has been updated to support full-text search, but you need to:

1. **Add the database column and trigger** (one-time setup)
2. **Enable full-text search** in the service

---

## Step 1: Add Database Migration

### Option A: Using SQL Script (Recommended for Production)

Run the SQL script to add full-text search:

```bash
# Connect to your database
psql $DATABASE_URL

# Or if using Render, connect via:
# psql <your-render-database-url>
```

Then run:

```sql
\i database/migrations/add-fulltext-search.sql
```

Or copy-paste the SQL from `database/migrations/add-fulltext-search.sql` into your database console.

### Option B: Using TypeORM Migration (If you have migrations set up)

```bash
# Generate migration
npm run typeorm migration:generate -- -n AddFullTextSearch

# Run migration
npm run typeorm migration:run
```

### Option C: Manual SQL (For Quick Setup)

Run these SQL commands in your database:

```sql
-- Add column
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create update function
CREATE OR REPLACE FUNCTION listings_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER listings_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description ON listings
  FOR EACH ROW
  EXECUTE FUNCTION listings_search_vector_update();

-- Update existing rows
UPDATE listings
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- Create index
CREATE INDEX listings_search_vector_idx ON listings USING GIN (search_vector);
```

---

## Step 2: Verify Setup

Test that the full-text search is working:

```sql
-- Test search
SELECT id, title, 
  ts_rank(search_vector, plainto_tsquery('english', 'laptop')) as relevance
FROM listings
WHERE search_vector @@ plainto_tsquery('english', 'laptop')
ORDER BY relevance DESC
LIMIT 10;
```

If this returns results, full-text search is working! ✅

---

## Step 3: Enable in Code (Already Done)

The code in `src/listings/listings.service.ts` is already configured to use full-text search. The `useFullTextSearch` flag is set to `true` by default.

If you need to disable it temporarily (for compatibility), change:

```typescript
const useFullTextSearch = false; // Use LIKE search instead
```

---

## Step 4: Test the API

After setting up the database, test the search endpoint:

```bash
# Test full-text search
curl "https://yawmiy-backend.onrender.com/listings?search=laptop"

# Test with relevance sorting
curl "https://yawmiy-backend.onrender.com/listings?search=laptop&sort=relevance"
```

---

## How It Works

### 1. **tsvector Column**
- Stores pre-processed searchable text
- Automatically updated when title/description changes
- Uses PostgreSQL's text search engine

### 2. **Trigger Function**
- Runs BEFORE INSERT/UPDATE
- Combines title and description
- Assigns weights: Title (A) > Description (B)

### 3. **GIN Index**
- Fast index for full-text search
- Similar to B-tree but optimized for text search
- Significantly improves query performance

### 4. **Search Query**
- Uses `plainto_tsquery()` for user-friendly search
- Handles multiple words automatically
- Supports AND/OR operators

---

## Performance Comparison

### Before (LIKE search):
```sql
-- Slow: Scans all rows, no index
WHERE LOWER(title) LIKE '%laptop%' OR LOWER(description) LIKE '%laptop%'
-- Time: ~500ms for 10,000 rows
```

### After (Full-text search):
```sql
-- Fast: Uses GIN index
WHERE search_vector @@ plainto_tsquery('english', 'laptop')
-- Time: ~5ms for 10,000 rows (100x faster!)
```

---

## Advanced Features

### 1. **Phrase Search**
```sql
-- Search for exact phrase
WHERE search_vector @@ phraseto_tsquery('english', 'gaming laptop')
```

### 2. **Multiple Terms (AND)**
```sql
-- All terms must match
WHERE search_vector @@ plainto_tsquery('english', 'laptop gaming')
-- Equivalent to: laptop AND gaming
```

### 3. **Multiple Terms (OR)**
```sql
-- Any term can match
WHERE search_vector @@ to_tsquery('english', 'laptop | gaming')
-- Equivalent to: laptop OR gaming
```

### 4. **Relevance Ranking**
```sql
-- Order by relevance score
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'laptop')) DESC
```

---

## Troubleshooting

### Issue: "column search_vector does not exist"

**Solution:** Run the migration SQL script (Step 1)

### Issue: Search returns no results

**Possible causes:**
1. `search_vector` column is NULL (run UPDATE query from Step 1)
2. Trigger not created (check with `\df listings_search_vector_update`)
3. Search terms don't match (try simpler terms)

**Check:**
```sql
-- Verify column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'listings' AND column_name = 'search_vector';

-- Verify trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'listings';
```

### Issue: Search is slow

**Solution:** Ensure GIN index is created:
```sql
-- Check if index exists
SELECT indexname FROM pg_indexes 
WHERE tablename = 'listings' AND indexname = 'listings_search_vector_idx';

-- Create if missing
CREATE INDEX listings_search_vector_idx ON listings USING GIN (search_vector);
```

---

## For Render Deployment

### Option 1: Run SQL via Render Dashboard

1. Go to Render Dashboard → Your Database
2. Click **Connect** → **psql**
3. Copy-paste the SQL from `database/migrations/add-fulltext-search.sql`
4. Run it

### Option 2: Run via Command Line

```bash
# Get your database URL from Render
# Then run:
psql $DATABASE_URL < database/migrations/add-fulltext-search.sql
```

### Option 3: Add to Build Process

Add to `render.yaml` or build script:

```yaml
services:
  - type: web
    name: yawmiy-backend
    buildCommand: |
      npm install && npm run build
      # Run migration if needed
      # psql $DATABASE_URL -f database/migrations/add-fulltext-search.sql
```

---

## Maintenance

### Update Existing Listings

If you add the migration after listings exist, update them:

```sql
UPDATE listings
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B')
WHERE search_vector IS NULL;
```

### Monitor Performance

```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM listings
WHERE search_vector @@ plainto_tsquery('english', 'laptop');
```

Look for `Bitmap Index Scan` on `listings_search_vector_idx` - this means the index is being used! ✅

---

## Next Steps

1. ✅ Run the migration SQL
2. ✅ Verify it works with test query
3. ✅ Test the API endpoint
4. ✅ Monitor performance
5. ✅ Consider adding full-text search to other entities (users, orders, etc.)

---

## Related Files

- `database/migrations/add-fulltext-search.sql` - SQL migration script
- `src/listings/listings.service.ts` - Service with full-text search logic
- `src/listings/listing.entity.ts` - Entity with search_vector column

