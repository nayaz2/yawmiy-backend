-- Optimization: Improve scout earnings query
-- The getScoutEarnings method queries orders in a loop (N+1 problem)
-- This creates a materialized view to optimize the query

-- Create a materialized view for first sales per user
-- This pre-computes the first completed sale for each user (as seller)
CREATE MATERIALIZED VIEW IF NOT EXISTS first_sales_per_user AS
SELECT DISTINCT ON (seller_id)
    seller_id,
    order_id,
    item_price_paise,
    completed_at
FROM orders
WHERE status = 'completed'
ORDER BY seller_id, completed_at ASC;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_first_sales_seller_id ON first_sales_per_user(seller_id);

-- Create a function to refresh the materialized view
-- This should be called periodically (e.g., after order completion)
CREATE OR REPLACE FUNCTION refresh_first_sales_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY first_sales_per_user;
END;
$$ LANGUAGE plpgsql;

-- Note: In production, you may want to:
-- 1. Refresh this view after each order completion
-- 2. Or refresh it periodically via cron job
-- 3. Or use triggers to update it incrementally

-- Alternative: Use a regular view (always up-to-date, but slower)
-- DROP MATERIALIZED VIEW IF EXISTS first_sales_per_user;
-- CREATE VIEW first_sales_per_user AS
-- SELECT DISTINCT ON (seller_id)
--     seller_id,
--     order_id,
--     item_price_paise,
--     completed_at
-- FROM orders
-- WHERE status = 'completed'
-- ORDER BY seller_id, completed_at ASC;


