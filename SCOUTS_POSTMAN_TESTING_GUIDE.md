# Scouts Module - Postman Testing Guide

## Prerequisites

Before testing the Scouts module, you need:

1. **At least 2 registered users** (one will be the scout, one will be the recruit)
2. **At least 1 completed transaction** for the scout user (as buyer or seller)
3. **JWT tokens** for authenticated endpoints

---

## Step-by-Step Testing Guide

### Step 1: Setup - Create Users and Complete Transaction

#### 1.1 Register Scout User
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "scout@university.edu",
  "password": "Scout123!@#",
  "student_id": "12345678",
  "name": "Alice Scout"
}
```

**Save the response** - you'll need the user ID or login to get a token.

#### 1.2 Register Recruit User (with recruiter_id)
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "recruit@university.edu",
  "password": "Recruit123!@#",
  "student_id": "87654321",
  "name": "Bob Recruit"
}
```

**Note:** The `recruiter_id` will be set when the recruit user is created. For now, you'll need to manually set it in the database or we'll need to add an endpoint to set it. For testing, you can:

**Option A:** Update the database directly:
```sql
UPDATE "user" SET recruiter_id = 1 WHERE id = 2;
```
(Replace `1` with scout's user_id and `2` with recruit's user_id)

**Option B:** We can add an endpoint to set recruiter_id (let me know if needed)

#### 1.3 Complete a Transaction for Scout

The scout needs at least 1 completed transaction. You can:

**Option A:** Scout buys something:
1. Create a listing (as another user)
2. Scout creates an order
3. Scout initiates payment
4. Complete payment
5. Complete the order

**Option B:** Scout sells something:
1. Scout creates a listing
2. Another user creates an order
3. Complete payment
4. Complete the order

---

### Step 2: Register as Scout

```http
POST http://localhost:3000/scouts/register
Authorization: Bearer YOUR_SCOUT_JWT_TOKEN
Content-Type: application/json

{}
```

**Expected Response (201 Created):**
```json
{
  "scout_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Successfully registered as scout"
}
```

**Save the `scout_id`** - you'll need it for other endpoints.

**Possible Errors:**
- `409 Conflict` - User already registered as scout
- `400 Bad Request` - User doesn't have required transactions
- `401 Unauthorized` - Missing or invalid JWT token

---

### Step 3: Get Scout Earnings

```http
GET http://localhost:3000/scouts/{scout_id}/earnings
Authorization: Bearer YOUR_SCOUT_JWT_TOKEN
```

**Replace `{scout_id}`** with the scout_id from Step 2.

**Expected Response (200 OK):**
```json
{
  "scout_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_earnings_paise": 0,
  "total_earnings_display": "₹0.00",
  "recruits_count": 0,
  "bounty_per_recruit_paise": 1000,
  "bounty_per_recruit_display": "₹10.00",
  "breakdown": []
}
```

**After recruit makes first sale:**
```json
{
  "scout_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_earnings_paise": 1000,
  "total_earnings_display": "₹10.00",
  "recruits_count": 1,
  "bounty_per_recruit_paise": 1000,
  "bounty_per_recruit_display": "₹10.00",
  "breakdown": [
    {
      "recruit_id": 2,
      "recruit_name": "Bob Recruit",
      "recruit_email": "recruit@university.edu",
      "first_sale_amount_paise": 50000,
      "first_sale_amount_display": "₹500.00",
      "bounty_earned_paise": 1000,
      "bounty_earned_display": "₹10.00"
    }
  ]
}
```

---

### Step 4: View Leaderboard

```http
GET http://localhost:3000/scouts/leaderboard?limit=10
```

**No authentication required** - this is a public endpoint.

**Query Parameters:**
- `limit` (optional, default: 10) - Number of top scouts

**Expected Response (200 OK):**
```json
[
  {
    "rank": 1,
    "scout_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": 1,
    "user_name": "Alice Scout",
    "user_email": "scout@university.edu",
    "recruits_count": 1,
    "earnings_paise": 1000,
    "earnings_display": "₹10.00"
  }
]
```

---

### Step 5: Request Payout

```http
POST http://localhost:3000/scouts/{scout_id}/request-payout
Authorization: Bearer YOUR_SCOUT_JWT_TOKEN
Content-Type: application/json

{
  "amount_paise": 1000
}
```

**Replace `{scout_id}`** with your scout_id.

**Body Options:**
- With specific amount: `{ "amount_paise": 1000 }` (₹10)
- All earnings: `{}` (empty body or omit amount_paise)

**Expected Response (200 OK):**
```json
{
  "scout_id": "550e8400-e29b-41d4-a716-446655440000",
  "requested_amount_paise": 1000,
  "requested_amount_display": "₹10.00",
  "message": "Payout request received. Processing will begin shortly."
}
```

**Possible Errors:**
- `400 Bad Request` - Requested amount exceeds available earnings
- `404 Not Found` - Scout not found

---

## Complete Testing Flow

### Full End-to-End Test

1. **Register Scout User**
   ```http
   POST /auth/register
   Body: { "email": "scout@university.edu", ... }
   ```

2. **Complete a Transaction** (scout must buy or sell something)

3. **Register as Scout**
   ```http
   POST /scouts/register
   Authorization: Bearer SCOUT_TOKEN
   ```

4. **Register Recruit User** (set recruiter_id in database)
   ```http
   POST /auth/register
   Body: { "email": "recruit@university.edu", ... }
   ```
   Then update database: `UPDATE "user" SET recruiter_id = SCOUT_USER_ID WHERE id = RECRUIT_USER_ID;`

5. **Recruit Creates Listing**
   ```http
   POST /listings
   Authorization: Bearer RECRUIT_TOKEN
   Body: { "title": "Test Item", ... }
   ```

6. **Buyer Creates Order**
   ```http
   POST /orders
   Authorization: Bearer BUYER_TOKEN
   Body: { "listing_id": "...", "meeting_location": "Campus" }
   ```

7. **Complete Payment** (via PhonePe)

8. **Complete Order** (this triggers the bounty!)
   ```http
   PATCH /orders/{order_id}/complete
   Authorization: Bearer BUYER_TOKEN
   ```

9. **Check Scout Earnings** (should show ₹10 bounty)
   ```http
   GET /scouts/{scout_id}/earnings
   Authorization: Bearer SCOUT_TOKEN
   ```

10. **View Leaderboard**
    ```http
    GET /scouts/leaderboard
    ```

---

## Postman Collection Setup

### Environment Variables

Create a Postman environment with:
- `base_url`: `http://localhost:3000`
- `scout_token`: JWT token for scout user
- `recruit_token`: JWT token for recruit user
- `scout_id`: Scout ID from registration
- `scout_user_id`: Scout's user ID

### Collection Structure

```
Scouts Module
├── Register as Scout
│   POST {{base_url}}/scouts/register
│   Headers: Authorization: Bearer {{scout_token}}
│
├── Get Scout Earnings
│   GET {{base_url}}/scouts/{{scout_id}}/earnings
│   Headers: Authorization: Bearer {{scout_token}}
│
├── Get Leaderboard
│   GET {{base_url}}/scouts/leaderboard?limit=10
│
└── Request Payout
    POST {{base_url}}/scouts/{{scout_id}}/request-payout
    Headers: Authorization: Bearer {{scout_token}}
    Body: { "amount_paise": 1000 }
```

---

## Quick Test Checklist

- [ ] Scout user registered
- [ ] Scout has 1+ completed transaction
- [ ] Scout registered via `POST /scouts/register`
- [ ] Recruit user registered with `recruiter_id` set
- [ ] Recruit made first sale (order completed)
- [ ] Scout earnings show ₹10 bounty
- [ ] Leaderboard shows scout
- [ ] Payout request works

---

## Troubleshooting

### "User doesn't have required transactions"
- Make sure scout has at least 1 completed order (as buyer or seller)
- Check order status is `COMPLETED`, not just `ESCROWED`

### "User already registered as scout"
- User is already a scout
- Use existing `scout_id` for other endpoints

### "Scout not found"
- Check `scout_id` is correct
- Make sure scout is registered first

### Bounty not triggered
- Check recruit has `recruiter_id` set in database
- Verify this is recruit's **first** completed sale (as seller)
- Check server logs for bounty trigger messages

### Earnings show ₹0.00
- Recruit hasn't made first sale yet
- Or recruit doesn't have `recruiter_id` set
- Or this isn't recruit's first sale

---

## Example Postman Requests

### 1. Register as Scout
```json
POST http://localhost:3000/scouts/register
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
Body: {}
```

### 2. Get Earnings
```json
GET http://localhost:3000/scouts/550e8400-e29b-41d4-a716-446655440000/earnings
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Leaderboard
```json
GET http://localhost:3000/scouts/leaderboard?limit=10
```

### 4. Request Payout
```json
POST http://localhost:3000/scouts/550e8400-e29b-41d4-a716-446655440000/request-payout
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
Body:
{
  "amount_paise": 1000
}
```

---

**Ready to test!** Start with Step 1 and work through each step sequentially.

