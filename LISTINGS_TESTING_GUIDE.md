# Listings API Testing Guide

## Prerequisites
1. Make sure your NestJS server is running: `npm run start:dev`
2. You need to be logged in (have a JWT token) for creating/updating/deleting listings
3. Get your JWT token by logging in first (see Auth testing guide)

## Quick Start

### Step 1: Import Updated Postman Collection
1. Open Postman
2. Click **"Import"**
3. Select `Yawmiy-Backend.postman_collection.json`
4. The collection now includes all Listings endpoints

### Step 2: Get Authentication Token
1. Use **"Login"** request to get your JWT token
2. Copy the `token` from the response
3. Use this token in the `Authorization` header for protected endpoints

---

## Endpoint Details

### 1. Browse Listings (GET /listings)

**Endpoint:** `GET http://localhost:3000/listings`

**No authentication required**

**Query Parameters:**
- `category` (optional): Textbooks, Electronics, Furniture, Clothing, Sports, Stationery, Snacks, Beverages, Other
- `price_min` (optional): Minimum price in **paise** (e.g., 0 = ₹0, 50000 = ₹500)
- `price_max` (optional): Maximum price in **paise** (e.g., 100000 = ₹1000)
- `condition` (optional): new, like_new, good, fair
- `sort` (optional): price_asc, price_desc, date_desc, date_asc

**Example Requests:**

**Get all active listings:**
```
GET http://localhost:3000/listings
```

**Filter by category:**
```
GET http://localhost:3000/listings?category=Textbooks
```

**Filter by price range (₹100 to ₹500):**
```
GET http://localhost:3000/listings?price_min=10000&price_max=50000
```

**Filter and sort:**
```
GET http://localhost:3000/listings?category=Electronics&price_max=200000&sort=price_asc
```

**Expected Response:**
```json
[
  {
    "id": "uuid-here",
    "title": "Calculus Textbook",
    "category": "Textbooks",
    "price": 50000,
    "price_display": "₹500.00",
    "condition": "like_new",
    "description": "...",
    "photos": ["url1", "url2"],
    "location": "Main Campus",
    "status": "active",
    "seller_id": 1,
    "created_at": "2026-01-01T...",
    "updated_at": "2026-01-01T..."
  }
]
```

---

### 2. Get Listing Details (GET /listings/:id)

**Endpoint:** `GET http://localhost:3000/listings/:id`

**No authentication required**

**Example:**
```
GET http://localhost:3000/listings/123e4567-e89b-12d3-a456-426614174000
```

**Expected Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Calculus Textbook",
  "category": "Textbooks",
  "price": 50000,
  "price_display": "₹500.00",
  "condition": "like_new",
  "description": "Excellent condition...",
  "photos": ["url1"],
  "location": "Main Campus",
  "status": "active",
  "seller": {
    "id": 1,
    "email": "student@university.edu",
    "name": "John Doe"
  },
  "created_at": "2026-01-01T...",
  "updated_at": "2026-01-01T..."
}
```

---

### 3. Create Listing (POST /listings)

**Endpoint:** `POST http://localhost:3000/listings`

**Requires JWT Authentication**

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Calculus Textbook - 3rd Edition",
  "category": "Textbooks",
  "price": 50000,
  "condition": "like_new",
  "description": "Excellent condition calculus textbook. Barely used, no highlights or notes.",
  "photos": ["https://example.com/photo1.jpg"],
  "location": "Main Campus - Building A"
}
```

**Important Notes:**
- `price` must be in **paise** (integers)
  - ₹100 = 10000 paise
  - ₹500 = 50000 paise
  - ₹1000 = 100000 paise
- `title`: Max 100 characters
- `description`: Max 500 characters
- `category`: Must be one of the enum values
- `condition`: Must be: new, like_new, good, or fair
- `photos`: Array of strings (URLs), optional

**Category Options:**
- Textbooks
- Electronics
- Furniture
- Clothing
- Sports
- Stationery
- Snacks
- Beverages
- Other

**Condition Options:**
- new
- like_new
- good
- fair

**Expected Response (201 Created):**
```json
{
  "id": "uuid-here",
  "title": "Calculus Textbook - 3rd Edition",
  "category": "Textbooks",
  "price": 50000,
  "price_display": "₹500.00",
  "condition": "like_new",
  "description": "Excellent condition...",
  "photos": ["https://example.com/photo1.jpg"],
  "location": "Main Campus - Building A",
  "status": "active",
  "seller_id": 1,
  "created_at": "2026-01-01T...",
  "updated_at": "2026-01-01T..."
}
```

---

### 4. Update Listing (PATCH /listings/:id)

**Endpoint:** `PATCH http://localhost:3000/listings/:id`

**Requires JWT Authentication + Must be the seller**

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`

**Request Body (all fields optional):**
```json
{
  "price": 45000,
  "description": "Updated description - Price reduced!"
}
```

You can update any of these fields:
- `title`
- `category`
- `price` (in paise)
- `condition`
- `description`
- `photos`
- `location`
- `status` (active, sold, delisted)

**Example:**
```
PATCH http://localhost:3000/listings/123e4567-e89b-12d3-a456-426614174000
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "title": "Calculus Textbook - 3rd Edition",
  "price": 45000,
  "price_display": "₹450.00",
  ...
}
```

**Error (403 Forbidden):**
If you try to update someone else's listing:
```json
{
  "statusCode": 403,
  "message": "You can only edit your own listings"
}
```

---

### 5. Delete Listing (DELETE /listings/:id)

**Endpoint:** `DELETE http://localhost:3000/listings/:id`

**Requires JWT Authentication + Must be the seller**

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Example:**
```
DELETE http://localhost:3000/listings/123e4567-e89b-12d3-a456-426614174000
```

**Expected Response (200 OK):**
```json
{
  "message": "Listing deleted successfully"
}
```

**Error (403 Forbidden):**
If you try to delete someone else's listing:
```json
{
  "statusCode": 403,
  "message": "You can only delete your own listings"
}
```

---

## Complete Testing Workflow

### 1. Register and Login
```
POST /auth/register
POST /auth/login (copy the token)
```

### 2. Create a Listing
```
POST /listings
Headers: Authorization: Bearer YOUR_TOKEN
Body: { title, category, price (in paise), condition, description, location }
```

### 3. Browse Listings
```
GET /listings?category=Textbooks&sort=price_asc
```

### 4. Get Listing Details
```
GET /listings/:id (use the id from step 2)
```

### 5. Update Your Listing
```
PATCH /listings/:id
Headers: Authorization: Bearer YOUR_TOKEN
Body: { price: 45000 }
```

### 6. Delete Your Listing
```
DELETE /listings/:id
Headers: Authorization: Bearer YOUR_TOKEN
```

---

## Price Conversion Examples

| Rupees (₹) | Paise (in API) |
|------------|----------------|
| ₹1         | 100            |
| ₹10        | 1000           |
| ₹100       | 10000          |
| ₹500       | 50000          |
| ₹1000      | 100000         |
| ₹5000      | 500000         |

**Formula:** `paise = rupees × 100`

---

## Common Errors

1. **401 Unauthorized**: Missing or invalid JWT token
   - Solution: Login again and get a fresh token

2. **403 Forbidden**: Trying to edit/delete someone else's listing
   - Solution: You can only modify your own listings

3. **404 Not Found**: Listing ID doesn't exist
   - Solution: Check the listing ID is correct

4. **400 Bad Request**: Validation error
   - Check: title max 100 chars, description max 500 chars, price in paise, valid category/condition

---

## Tips

1. **Save Token**: Use Postman's environment variables to store your token
2. **Test Filters**: Try different combinations of query parameters
3. **Price Testing**: Remember prices are in paise (multiply by 100)
4. **Seller Check**: Only the seller who created the listing can edit/delete it

