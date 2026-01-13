-- Enable pg_trgm extension for text similarity searches
-- This is needed for the GIN index on listings.location
-- Run this BEFORE add-database-indexes.sql

-- Check if extension exists, create if not
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Verify extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';


