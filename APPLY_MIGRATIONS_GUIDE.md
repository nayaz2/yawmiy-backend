# Apply Database Migrations Guide

This guide helps you apply the database optimization migrations to your PostgreSQL database.

---

## 📋 Prerequisites

1. **PostgreSQL client installed** (`psql` command available)
2. **Database connection details** (host, user, database name, password)
3. **Access to the database** (read/write permissions)

---

## ⚠️ Important: Run This After Tables Are Created

**Before running migrations, ensure your database tables exist!**

If you're using TypeORM with `synchronize: true`:
1. **First, start your NestJS application** to create all tables:
   ```bash
   npm run start:dev
   ```
2. **Wait for the app to start** and create all tables
3. **Then run the migrations** (you can stop the app or run in another terminal)

If tables don't exist, you'll get errors like `relation "users" does not exist`.

---

## 🚀 Quick Start

### Option 1: Using DATABASE_URL (Recommended)

If you have `DATABASE_URL` environment variable set:

#### Linux/Mac:
```bash
# Make script executable
chmod +x database/migrations/apply-migrations.sh

# Run migrations
./database/migrations/apply-migrations.sh
```

#### Windows PowerShell:
```powershell
# Run migrations
.\database/migrations/apply-migrations.ps1
```

#### Windows Command Prompt:
```cmd
# Set DATABASE_URL (if not already set)
set DATABASE_URL=postgresql://user:password@host:port/database

# Run migrations manually
psql %DATABASE_URL% -f database/migrations/enable-pg-trgm-extension.sql
psql %DATABASE_URL% -f database/migrations/add-database-indexes.sql
```

---

### Option 2: Using Connection Details

If you don't have `DATABASE_URL`, provide connection details directly:

#### Linux/Mac:
```bash
./database/migrations/apply-migrations.sh <host> <user> <database>
```

**Example:**
```bash
./database/migrations/apply-migrations.sh \
  dpg-d5d8aj15pdvs73d54sb0-a.singapore-postgres.render.com \
  yawmiy_user \
  yawmiy
```

#### Windows PowerShell:
```powershell
.\database/migrations/apply-migrations.ps1 `
  -Host "dpg-d5d8aj15pdvs73d54sb0-a.singapore-postgres.render.com" `
  -User "yawmiy_user" `
  -Database "yawmiy"
```

#### Windows Command Prompt:
```cmd
psql -h <host> -U <user> -d <database> -f database/migrations/enable-pg-trgm-extension.sql
psql -h <host> -U <user> -d <database> -f database/migrations/add-database-indexes.sql
```

**Example:**
```cmd
psql -h dpg-d5d8aj15pdvs73d54sb0-a.singapore-postgres.render.com -U yawmiy_user -d yawmiy -f database/migrations/enable-pg-trgm-extension.sql
psql -h dpg-d5d8aj15pdvs73d54sb0-a.singapore-postgres.render.com -U yawmiy_user -d yawmiy -f database/migrations/add-database-indexes.sql
```

---

## 📝 Manual Steps

If you prefer to run migrations manually:

### Step 1: Enable pg_trgm Extension

```bash
psql -h <host> -U <user> -d <database> -f database/migrations/enable-pg-trgm-extension.sql
```

**Or using DATABASE_URL:**
```bash
psql $DATABASE_URL -f database/migrations/enable-pg-trgm-extension.sql
```

**What it does:**
- Enables PostgreSQL `pg_trgm` extension for fuzzy text matching
- Required for the GIN index on `listings.location`

---

### Step 2: Add Database Indexes

```bash
psql -h <host> -U <user> -d <database> -f database/migrations/add-database-indexes.sql
```

**Or using DATABASE_URL:**
```bash
psql $DATABASE_URL -f database/migrations/add-database-indexes.sql
```

**What it does:**
- Adds 20+ indexes across all tables (`users`, `listings`, `orders`, `scouts`, `payouts`, `messages`)
- Optimizes common query patterns
- Improves performance for scout earnings, admin panel, search, etc.

---

## 🔍 Verify Migrations

After applying migrations, verify they were successful:

### 1. Check pg_trgm Extension

```sql
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
```

**Expected output:**
```
 extname | extowner | extnamespace | extrelocatable | extversion 
---------+----------+--------------+----------------+------------
 pg_trgm |       10 |          2200 | t             | 1.6
```

### 2. Check Indexes

```sql
-- List all indexes
\di

-- Or query specific indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected:** You should see indexes like:
- `idx_users_recruiter_id`
- `idx_listings_seller_id`
- `idx_orders_buyer_id`
- `idx_orders_seller_status_completed`
- etc.

### 3. Check Index Usage

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 🐛 Troubleshooting

### Error: "extension pg_trgm does not exist"

**Solution:** Your PostgreSQL version might not have the extension. Check version:
```sql
SELECT version();
```

**Required:** PostgreSQL 9.1+ (most modern versions include it)

If missing, install the extension:
```bash
# On Ubuntu/Debian
sudo apt-get install postgresql-contrib

# On macOS (Homebrew)
brew install postgresql-contrib

# Then enable in database
CREATE EXTENSION pg_trgm;
```

---

### Error: "permission denied for schema public"

**Solution:** You need superuser or database owner privileges. Connect as a user with proper permissions:

```bash
psql -h <host> -U <superuser> -d <database>
```

Or grant permissions:
```sql
GRANT ALL ON SCHEMA public TO yawmiy_user;
```

---

### Error: "relation already exists" (for indexes)

**Solution:** This is normal if indexes already exist. The migration uses `CREATE INDEX IF NOT EXISTS`, so it's safe to run multiple times.

If you want to see which indexes already exist:
```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

---

### Error: "password authentication failed"

**Solution:** 
1. Check your password is correct
2. Use `PGPASSWORD` environment variable:
   ```bash
   export PGPASSWORD=your_password
   psql -h <host> -U <user> -d <database> -f database/migrations/enable-pg-trgm-extension.sql
   ```

3. Or use connection string with password:
   ```bash
   psql "postgresql://user:password@host:port/database" -f database/migrations/enable-pg-trgm-extension.sql
   ```

---

## 📊 Migration Details

### Migration 1: Enable pg_trgm Extension

**File:** `database/migrations/enable-pg-trgm-extension.sql`

**What it does:**
- Enables PostgreSQL trigram extension
- Required for fuzzy text matching on `listings.location`
- Creates GIN index for fast location searches

**Impact:**
- ✅ Faster location-based searches
- ✅ Better text similarity matching
- ⚠️ Small storage overhead (~few MB)

---

### Migration 2: Add Database Indexes

**File:** `database/migrations/add-database-indexes.sql`

**What it does:**
- Adds 20+ indexes across all tables
- Optimizes common query patterns:
  - User lookups (recruiter_id, role, banned)
  - Listing searches (seller_id, category, status, location)
  - Order queries (buyer_id, seller_id, status)
  - Scout earnings (seller_id + status + completed_at)
  - Payout queries (user_id, status, created_at)
  - Message queries (sender_id, recipient_id, status)

**Impact:**
- ✅ **Significantly faster queries** (10-100x improvement)
- ✅ **Better performance at scale**
- ⚠️ **Slightly slower writes** (minimal impact)
- ⚠️ **Additional storage** (~5-10% of table size)

---

## 📈 Performance Monitoring

After applying migrations, monitor performance:

### 1. Check Query Performance

```sql
-- Find slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 2. Check Index Usage

```sql
-- Indexes that are never used (consider removing)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public'
ORDER BY tablename;
```

### 3. Check Table Sizes

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## ✅ Success Checklist

After running migrations, verify:

- [ ] `pg_trgm` extension is enabled
- [ ] All indexes are created (check with `\di` in psql)
- [ ] No errors in migration output
- [ ] Application queries are faster
- [ ] Index usage is being tracked (check `pg_stat_user_indexes`)

---

## 🔄 Rollback (If Needed)

If you need to rollback migrations:

### Remove Indexes:
```sql
-- Remove all optimization indexes (be careful!)
DROP INDEX IF EXISTS idx_users_recruiter_id;
DROP INDEX IF EXISTS idx_users_role;
-- ... (repeat for all indexes)
```

### Disable Extension:
```sql
DROP EXTENSION IF EXISTS pg_trgm;
```

**⚠️ Warning:** Only rollback if absolutely necessary. Indexes significantly improve performance.

---

## 📚 Related Documentation

- `DATABASE_OPTIMIZATION_GUIDE.md` - Detailed optimization guide
- `DATABASE_OPTIMIZATION_SUMMARY.md` - Summary of optimizations
- `database/migrations/add-database-indexes.sql` - Index definitions
- `database/migrations/enable-pg-trgm-extension.sql` - Extension setup

---

## 🆘 Need Help?

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review PostgreSQL logs for detailed error messages
3. Verify database connection details
4. Ensure you have proper permissions
5. Check PostgreSQL version compatibility

---

## 🎯 Next Steps

After successful migration:

1. ✅ **Monitor Performance** - Use queries in `DATABASE_OPTIMIZATION_GUIDE.md`
2. ✅ **Test Application** - Verify all queries work correctly
3. ✅ **Check Index Usage** - Ensure indexes are being used
4. ✅ **Optimize Further** - Review slow queries and add more indexes if needed

**Your database is now optimized for production scale! 🚀**
