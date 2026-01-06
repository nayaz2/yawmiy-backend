# Search & Filtering Enhancements Guide

## Overview

The listings API now supports advanced search and filtering capabilities with pagination.

## New Features

### 1. **Text Search** 🔍
Search across listing titles and descriptions.

### 2. **Location Filtering** 📍
Filter listings by location (partial match, case-insensitive).

### 3. **Multiple Category/Condition Filters** 🏷️
Filter by multiple categories or conditions at once.

### 4. **Pagination** 📄
Efficient pagination with metadata.

### 5. **Relevance Sorting** ⭐
Sort search results by relevance (title matches prioritized).

---

## API Endpoint

```
GET /listings
```

## Query Parameters

### Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in title and description (case-insensitive) | `?search=laptop` |
| `location` | string | Filter by location (partial match) | `?location=campus` |

### Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | enum | Single category filter | `?category=Electronics` |
| `categories` | string/array | Multiple categories (comma-separated) | `?categories=Electronics,Textbooks` |
| `condition` | enum | Single condition filter | `?condition=new` |
| `conditions` | string/array | Multiple conditions (comma-separated) | `?conditions=new,like_new` |
| `price_min` | number | Minimum price in paise | `?price_min=10000` (₹100) |
| `price_max` | number | Maximum price in paise | `?price_max=50000` (₹500) |

### Sorting Parameters

| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| `sort` | enum | `price_asc`, `price_desc`, `date_asc`, `date_desc`, `relevance` | Sort order |

### Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number (starts at 1) |
| `limit` | number | `20` | Items per page (max: 100) |

---

## Examples

### 1. Basic Search

```bash
GET /listings?search=laptop
```

**Response:**
```json
{
  "listings": [
    {
      "id": "uuid-1",
      "title": "Gaming Laptop",
      "description": "High-performance laptop...",
      "price": 50000,
      "price_display": "₹500.00",
      ...
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 2. Search with Filters

```bash
GET /listings?search=laptop&category=Electronics&price_max=50000&condition=new
```

### 3. Multiple Categories

```bash
GET /listings?categories=Electronics,Textbooks,Stationery
```

Or as array:
```bash
GET /listings?categories[]=Electronics&categories[]=Textbooks
```

### 4. Location Filter

```bash
GET /listings?location=main%20campus
```

### 5. Pagination

```bash
GET /listings?page=2&limit=10
```

**Response:**
```json
{
  "listings": [...],
  "total": 45,
  "page": 2,
  "limit": 10,
  "totalPages": 5
}
```

### 6. Relevance Sorting (for search)

```bash
GET /listings?search=laptop&sort=relevance
```

This prioritizes listings where the search term appears in the title over those where it only appears in the description.

### 7. Combined Filters

```bash
GET /listings?search=book&categories=Textbooks,Stationery&price_min=1000&price_max=5000&location=library&sort=price_asc&page=1&limit=20
```

---

## Response Format

### Success Response

```json
{
  "listings": [
    {
      "id": "uuid",
      "title": "Listing Title",
      "description": "Description...",
      "category": "Electronics",
      "price": 50000,
      "price_display": "₹500.00",
      "condition": "new",
      "location": "Main Campus",
      "photos": ["url1", "url2"],
      "status": "active",
      "seller": {
        "id": 1,
        "name": "John Doe",
        "email": "john@university.edu"
      },
      "created_at": "2026-01-05T10:00:00Z",
      "updated_at": "2026-01-05T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### Response Fields

- **`listings`**: Array of listing objects
- **`total`**: Total number of listings matching filters
- **`page`**: Current page number
- **`limit`**: Items per page
- **`totalPages`**: Total number of pages

---

## Category Values

- `Textbooks`
- `Electronics`
- `Furniture`
- `Clothing`
- `Sports`
- `Stationery`
- `Snacks`
- `Beverages`
- `Other`

## Condition Values

- `new`
- `like_new`
- `good`
- `fair`

## Sort Options

- `price_asc` - Price: Low to High
- `price_desc` - Price: High to Low
- `date_asc` - Date: Oldest First
- `date_desc` - Date: Newest First (default)
- `relevance` - Relevance (for search results)

---

## Frontend Integration Examples

### React/Next.js

```typescript
const [listings, setListings] = useState([]);
const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

const searchListings = async (searchTerm: string, filters: any) => {
  const params = new URLSearchParams({
    search: searchTerm,
    page: pagination.page.toString(),
    limit: pagination.limit.toString(),
    ...filters,
  });

  const response = await fetch(`/api/listings?${params}`);
  const data = await response.json();
  
  setListings(data.listings);
  setPagination({
    page: data.page,
    limit: data.limit,
    total: data.total,
  });
};
```

### Vue.js

```javascript
async searchListings(searchTerm, filters) {
  const params = new URLSearchParams({
    search: searchTerm,
    page: this.pagination.page.toString(),
    limit: this.pagination.limit.toString(),
    ...filters,
  });

  const response = await fetch(`/api/listings?${params}`);
  const data = await response.json();
  
  this.listings = data.listings;
  this.pagination = {
    page: data.page,
    limit: data.limit,
    total: data.total,
  };
}
```

---

## Performance Notes

1. **Pagination**: Always use pagination for large result sets (default limit: 20)
2. **Indexing**: The database should have indexes on:
   - `status` (for active listings filter)
   - `category` (for category filtering)
   - `price` (for price range filtering)
   - `created_at` (for date sorting)
   - Full-text search indexes on `title` and `description` (if available)

3. **Search Performance**: 
   - Text search uses `LIKE` queries (case-insensitive)
   - For better performance with large datasets, consider implementing full-text search (PostgreSQL `tsvector`)

---

## Migration Notes

### Breaking Changes

The response format has changed from:
```json
[
  { "id": "...", "title": "..." }
]
```

To:
```json
{
  "listings": [...],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

**Update your frontend code** to access `response.listings` instead of `response` directly.

---

## Testing

### Test Search

```bash
curl "https://yawmiy-backend.onrender.com/listings?search=laptop"
```

### Test Filters

```bash
curl "https://yawmiy-backend.onrender.com/listings?category=Electronics&price_max=50000"
```

### Test Pagination

```bash
curl "https://yawmiy-backend.onrender.com/listings?page=2&limit=10"
```

---

## Future Enhancements

Potential improvements:
- [ ] Full-text search with PostgreSQL `tsvector`
- [ ] Search in seller name
- [ ] Distance-based location filtering
- [ ] Saved searches
- [ ] Search suggestions/autocomplete
- [ ] Advanced filters (date range, seller rating, etc.)



