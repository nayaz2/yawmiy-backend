-- Database Optimization: Add Indexes for Performance
-- This migration adds indexes to improve query performance across all tables

-- ============================================
-- USER TABLE INDEXES (Note: table name is 'user', not 'users')
-- ============================================

-- Index for recruiter lookups (scout system)
CREATE INDEX IF NOT EXISTS idx_user_recruiter_id ON "user"(recruiter_id);

-- Index for role-based queries (admin panel)
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);

-- Index for banned user queries
CREATE INDEX IF NOT EXISTS idx_user_banned ON "user"(banned);

-- Composite index for admin user listing (common query pattern)
CREATE INDEX IF NOT EXISTS idx_user_role_banned_created ON "user"(role, banned, created_at DESC);

-- Index for email lookups (already unique, but explicit index helps)
-- Note: Unique constraint already creates an index, but we can add a partial index for active users
CREATE INDEX IF NOT EXISTS idx_user_email_active ON "user"(email) WHERE banned = false;

-- ============================================
-- LISTINGS TABLE INDEXES
-- ============================================

-- Index for seller lookups (user's listings)
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);

-- Index for location searches (case-insensitive)
-- Using GIN index for text search on location
CREATE INDEX IF NOT EXISTS idx_listings_location_gin ON listings USING gin(lower(location) gin_trgm_ops);

-- Composite index for active listings by seller
CREATE INDEX IF NOT EXISTS idx_listings_seller_status ON listings(seller_id, status);

-- Composite index for category + status queries (common browse pattern)
CREATE INDEX IF NOT EXISTS idx_listings_category_status_price ON listings(category, status, price);

-- Composite index for location + status (location-based browsing)
CREATE INDEX IF NOT EXISTS idx_listings_location_status ON listings(location, status) WHERE status = 'active';

-- Index for price range queries (already exists from fulltext migration, but ensure it's there)
-- CREATE INDEX IF NOT EXISTS listings_price_idx ON listings(price); -- Already exists

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================

-- Index for buyer lookups (user's orders as buyer)
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);

-- Index for seller lookups (user's orders as seller)
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);

-- Index for status queries (common filter)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Index for listing lookups
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);

-- Index for payment_id lookups (webhook processing)
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id) WHERE payment_id IS NOT NULL;

-- Composite index for buyer orders (common query pattern)
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status_created ON orders(buyer_id, status, created_at DESC);

-- Composite index for seller orders (common query pattern)
CREATE INDEX IF NOT EXISTS idx_orders_seller_status_created ON orders(seller_id, status, created_at DESC);

-- Composite index for scout earnings (first sale queries)
-- This is critical for getScoutEarnings performance
CREATE INDEX IF NOT EXISTS idx_orders_seller_status_completed ON orders(seller_id, status, completed_at ASC) 
WHERE status = 'completed';

-- Composite index for order status lookups
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- ============================================
-- SCOUTS TABLE INDEXES
-- ============================================

-- Index for user lookups (scout by user)
CREATE INDEX IF NOT EXISTS idx_scouts_user_id ON scouts(user_id);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_scouts_status ON scouts(status);

-- Composite index for leaderboard (earnings-based ranking)
CREATE INDEX IF NOT EXISTS idx_scouts_status_earnings ON scouts(status, earnings_paise DESC) 
WHERE status = 'active';

-- ============================================
-- PAYOUTS TABLE INDEXES
-- ============================================

-- Index for user payouts (already exists, but ensure it's optimized)
-- CREATE INDEX IF NOT EXISTS idx_payouts_user_status ON payouts(user_id, status); -- Already exists

-- Index for order lookups (refund checking)
CREATE INDEX IF NOT EXISTS idx_payouts_order_id ON payouts(order_id) WHERE order_id IS NOT NULL;

-- Index for scout lookups
CREATE INDEX IF NOT EXISTS idx_payouts_scout_id ON payouts(scout_id) WHERE scout_id IS NOT NULL;

-- Composite index for scheduled payout processing (critical for cron job)
-- This is the most important index for the 2-week hold system
CREATE INDEX IF NOT EXISTS idx_payouts_status_created ON payouts(status, created_at ASC) 
WHERE status = 'payable';

-- Composite index for user payout history
CREATE INDEX IF NOT EXISTS idx_payouts_user_created ON payouts(user_id, created_at DESC);

-- Index for payout type queries
CREATE INDEX IF NOT EXISTS idx_payouts_type ON payouts(payout_type);

-- Composite index for admin payout queries
CREATE INDEX IF NOT EXISTS idx_payouts_type_status ON payouts(payout_type, status, created_at DESC);

-- ============================================
-- MESSAGES TABLE INDEXES
-- ============================================

-- Composite index for conversation queries (optimize getConversation)
-- This replaces the existing single-column indexes with a more efficient composite
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient_created ON messages(sender_id, recipient_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_sender_created ON messages(recipient_id, sender_id, created_at ASC);

-- Index for unread count queries (critical for performance)
CREATE INDEX IF NOT EXISTS idx_messages_recipient_status ON messages(recipient_id, status, created_at DESC) 
WHERE status = 'sent';

-- Index for listing-related messages
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id) WHERE listing_id IS NOT NULL;

-- Index for order-related messages
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id) WHERE order_id IS NOT NULL;

-- Composite index for conversation list (getConversations)
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created ON messages(recipient_id, created_at DESC);

-- ============================================
-- PERFORMANCE NOTES
-- ============================================

-- These indexes will significantly improve:
-- 1. Listing searches by location (GIN index for text search)
-- 2. Scout earnings calculation (composite index on orders)
-- 3. Payout processing (status + created_at composite)
-- 4. Message queries (conversation and unread count)
-- 5. Admin user listing (role + banned composite)
-- 6. Order history queries (buyer/seller + status composite)

-- ============================================
-- ANALYZE TABLES (Update Statistics)
-- ============================================

-- Update table statistics for query planner
ANALYZE "user";
ANALYZE listings;
ANALYZE orders;
ANALYZE scouts;
ANALYZE payouts;
ANALYZE messages;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all indexes were created:
-- SELECT tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

-- Check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;


