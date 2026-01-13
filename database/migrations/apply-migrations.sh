#!/bin/bash
# Database Migration Script
# This script applies database optimization migrations

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Applying Database Optimizations...${NC}\n"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL or provide connection details manually"
    echo ""
    echo "Usage:"
    echo "  export DATABASE_URL='postgresql://user:password@host:port/database'"
    echo "  ./apply-migrations.sh"
    echo ""
    echo "OR provide connection details:"
    echo "  ./apply-migrations.sh <host> <user> <database>"
    exit 1
fi

# Parse DATABASE_URL if provided
if [ -n "$DATABASE_URL" ]; then
    # Extract connection details from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    DB_URL=$DATABASE_URL
    
    echo -e "${GREEN}✓ Using DATABASE_URL${NC}"
    echo "Applying migrations to database from DATABASE_URL..."
    echo ""
    
    # Apply pg_trgm extension
    echo -e "${YELLOW}Step 1: Enabling pg_trgm extension...${NC}"
    psql "$DB_URL" -f database/migrations/enable-pg-trgm-extension.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ pg_trgm extension enabled${NC}\n"
    else
        echo -e "${RED}❌ Failed to enable pg_trgm extension${NC}"
        exit 1
    fi
    
    # Apply database indexes
    echo -e "${YELLOW}Step 2: Adding database indexes...${NC}"
    psql "$DB_URL" -f database/migrations/add-database-indexes.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database indexes added${NC}\n"
    else
        echo -e "${RED}❌ Failed to add database indexes${NC}"
        exit 1
    fi
    
else
    # Use provided connection details
    if [ $# -lt 3 ]; then
        echo -e "${RED}❌ Error: Insufficient arguments${NC}"
        echo "Usage: ./apply-migrations.sh <host> <user> <database>"
        echo "   OR: export DATABASE_URL and run without arguments"
        exit 1
    fi
    
    DB_HOST=$1
    DB_USER=$2
    DB_NAME=$3
    
    echo -e "${GREEN}✓ Using provided connection details${NC}"
    echo "Host: $DB_HOST"
    echo "User: $DB_USER"
    echo "Database: $DB_NAME"
    echo ""
    
    # Apply pg_trgm extension
    echo -e "${YELLOW}Step 1: Enabling pg_trgm extension...${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/enable-pg-trgm-extension.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ pg_trgm extension enabled${NC}\n"
    else
        echo -e "${RED}❌ Failed to enable pg_trgm extension${NC}"
        exit 1
    fi
    
    # Apply database indexes
    echo -e "${YELLOW}Step 2: Adding database indexes...${NC}"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/add-database-indexes.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database indexes added${NC}\n"
    else
        echo -e "${RED}❌ Failed to add database indexes${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ All migrations applied successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Monitor query performance using the queries in DATABASE_OPTIMIZATION_GUIDE.md"
echo "2. Check index usage with: SELECT * FROM pg_stat_user_indexes;"
echo "3. Verify indexes exist with: \\di in psql"
