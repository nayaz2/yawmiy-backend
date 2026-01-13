-- Database Optimization: Add Indexes for Performance (Safe Version)
-- This migration adds indexes to improve query performance across all tables
-- This version checks if tables exist before creating indexes

-- ============================================
-- USERS TABLE INDEXES
-- ============================================

-- Check if user table exists before creating indexes (note: table name is 'user', not 'users')
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user') THEN
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
        
        RAISE NOTICE 'User table indexes created';
    ELSE
        RAISE NOTICE 'User table does not exist, skipping user indexes';
    END IF;
END $$;

-- ============================================
-- LISTINGS TABLE INDEXES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings') THEN
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
        
        RAISE NOTICE 'Listings table indexes created';
    ELSE
        RAISE NOTICE 'Listings table does not exist, skipping listings indexes';
    END IF;
END $$;

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        -- Index for buyer lookups
        CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
        
        -- Index for seller lookups
        CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
        
        -- Index for status filtering
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        
        -- Index for listing orders
        CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
        
        -- Index for payment ID lookups (webhook processing)
        CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
        
        -- Composite index for buyer order history
        CREATE INDEX IF NOT EXISTS idx_orders_buyer_status_created ON orders(buyer_id, status, created_at DESC);
        
        -- Composite index for seller order history
        CREATE INDEX IF NOT EXISTS idx_orders_seller_status_created ON orders(seller_id, status, created_at DESC);
        
        -- CRITICAL: Composite index for scout earnings calculation
        -- This is essential for the optimized scout earnings query
        CREATE INDEX IF NOT EXISTS idx_orders_seller_status_completed ON orders(seller_id, status, completed_at) WHERE status = 'completed';
        
        -- Composite index for order listing
        CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
        
        RAISE NOTICE 'Orders table indexes created';
    ELSE
        RAISE NOTICE 'Orders table does not exist, skipping orders indexes';
    END IF;
END $$;

-- ============================================
-- SCOUTS TABLE INDEXES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scouts') THEN
        -- Index for user lookups (scout by user)
        CREATE INDEX IF NOT EXISTS idx_scouts_user_id ON scouts(user_id);
        
        -- Index for status queries
        CREATE INDEX IF NOT EXISTS idx_scouts_status ON scouts(status);
        
        -- Composite index for leaderboard (earnings-based ranking)
        CREATE INDEX IF NOT EXISTS idx_scouts_status_earnings ON scouts(status, earnings_paise DESC) 
        WHERE status = 'active';
        
        RAISE NOTICE 'Scouts table indexes created';
    ELSE
        RAISE NOTICE 'Scouts table does not exist, skipping scouts indexes';
    END IF;
END $$;

-- ============================================
-- PAYOUTS TABLE INDEXES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payouts') THEN
        -- Index for user payouts
        CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
        
        -- Index for status filtering
        CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
        
        -- Composite index for payable payouts (cron job processing)
        CREATE INDEX IF NOT EXISTS idx_payouts_status_created ON payouts(status, created_at) WHERE status = 'payable';
        
        -- Composite index for user payout history
        CREATE INDEX IF NOT EXISTS idx_payouts_user_status_created ON payouts(user_id, status, created_at DESC);
        
        -- Index for scout payouts
        CREATE INDEX IF NOT EXISTS idx_payouts_scout_id ON payouts(scout_id) WHERE scout_id IS NOT NULL;
        
        -- Index for order payouts
        CREATE INDEX IF NOT EXISTS idx_payouts_order_id ON payouts(order_id) WHERE order_id IS NOT NULL;
        
        RAISE NOTICE 'Payouts table indexes created';
    ELSE
        RAISE NOTICE 'Payouts table does not exist, skipping payouts indexes';
    END IF;
END $$;

-- ============================================
-- MESSAGES TABLE INDEXES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
        -- Index for sender lookups
        CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
        
        -- Index for recipient lookups
        CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
        
        -- Composite index for conversation retrieval
        CREATE INDEX IF NOT EXISTS idx_messages_recipient_status_created ON messages(recipient_id, status, created_at DESC);
        
        -- Composite index for unread message count
        CREATE INDEX IF NOT EXISTS idx_messages_recipient_status ON messages(recipient_id, status) WHERE status = 'sent';
        
        -- Composite index for conversation between two users
        CREATE INDEX IF NOT EXISTS idx_messages_participants_created ON messages(sender_id, recipient_id, created_at DESC);
        
        RAISE NOTICE 'Messages table indexes created';
    ELSE
        RAISE NOTICE 'Messages table does not exist, skipping messages indexes';
    END IF;
END $$;

-- ============================================
-- ANALYZE TABLES
-- ============================================

-- Update statistics for query planner
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ANALYZE %I', table_name);
        RAISE NOTICE 'Analyzed table: %', table_name;
    END LOOP;
    RAISE NOTICE 'All migrations completed successfully!';
END $$;
