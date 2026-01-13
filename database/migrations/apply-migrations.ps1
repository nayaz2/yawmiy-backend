# Database Migration Script for Windows PowerShell
# This script applies database optimization migrations

param(
    [string]$Host = "",
    [string]$User = "",
    [string]$Database = "",
    [string]$DatabaseUrl = ""
)

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Warning "🚀 Applying Database Optimizations...`n"

# Check if DATABASE_URL is provided or in environment
if ([string]::IsNullOrEmpty($DatabaseUrl)) {
    $DatabaseUrl = $env:DATABASE_URL
}

if ([string]::IsNullOrEmpty($DatabaseUrl) -and ([string]::IsNullOrEmpty($Host) -or [string]::IsNullOrEmpty($User) -or [string]::IsNullOrEmpty($Database))) {
    Write-Error "❌ Error: Database connection details not provided"
    Write-Host ""
    Write-Host "Usage options:"
    Write-Host "  1. Set DATABASE_URL environment variable:"
    Write-Host "     `$env:DATABASE_URL='postgresql://user:password@host:port/database'"
    Write-Host "     .\apply-migrations.ps1"
    Write-Host ""
    Write-Host "  2. Provide connection details:"
    Write-Host "     .\apply-migrations.ps1 -Host <host> -User <user> -Database <database>"
    Write-Host ""
    Write-Host "  3. Use DATABASE_URL parameter:"
    Write-Host "     .\apply-migrations.ps1 -DatabaseUrl 'postgresql://user:password@host:port/database'"
    exit 1
}

# Apply migrations
if (-not [string]::IsNullOrEmpty($DatabaseUrl)) {
    Write-Success "✓ Using DATABASE_URL"
    Write-Host "Applying migrations to database from DATABASE_URL...`n"
    
    # Apply pg_trgm extension
    Write-Warning "Step 1: Enabling pg_trgm extension..."
    $result1 = & psql $DatabaseUrl -f database/migrations/enable-pg-trgm-extension.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ pg_trgm extension enabled`n"
    } else {
        Write-Error "❌ Failed to enable pg_trgm extension"
        Write-Host $result1
        exit 1
    }
    
    # Apply database indexes
    Write-Warning "Step 2: Adding database indexes..."
    $result2 = & psql $DatabaseUrl -f database/migrations/add-database-indexes.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Database indexes added`n"
    } else {
        Write-Error "❌ Failed to add database indexes"
        Write-Host $result2
        exit 1
    }
} else {
    Write-Success "✓ Using provided connection details"
    Write-Host "Host: $Host"
    Write-Host "User: $User"
    Write-Host "Database: $Database`n"
    
    # Apply pg_trgm extension
    Write-Warning "Step 1: Enabling pg_trgm extension..."
    $result1 = & psql -h $Host -U $User -d $Database -f database/migrations/enable-pg-trgm-extension.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ pg_trgm extension enabled`n"
    } else {
        Write-Error "❌ Failed to enable pg_trgm extension"
        Write-Host $result1
        exit 1
    }
    
    # Apply database indexes
    Write-Warning "Step 2: Adding database indexes..."
    $result2 = & psql -h $Host -U $User -d $Database -f database/migrations/add-database-indexes.sql 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Database indexes added`n"
    } else {
        Write-Error "❌ Failed to add database indexes"
        Write-Host $result2
        exit 1
    }
}

Write-Success "✅ All migrations applied successfully!`n"
Write-Host "Next steps:"
Write-Host "1. Monitor query performance using the queries in DATABASE_OPTIMIZATION_GUIDE.md"
Write-Host "2. Check index usage with: SELECT * FROM pg_stat_user_indexes;"
Write-Host "3. Verify indexes exist with: \di in psql"
