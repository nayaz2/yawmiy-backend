# Orders API Testing Guide for Postman

## Prerequisites
1. Make sure your NestJS server is running: `npm run start:dev`
2. You need to be logged in (have a JWT token) for most endpoints
3. You need at least one active listing to create an order
4. PhonePe credentials configured in `.env` (see `ORDERS_SETUP.md`)

## Quick Start

### Step 1: Import Updated Postman Collection
1. Open Postman
2. Click **"Import"**
3. Select `Yawmiy-Backend.postman_collection.json`
4. The collection now includes an **"Orders"** folder with all endpoints

### Step 2: Get Authentication Token
1. Use **"Login"** request to get your JWT token
2. Copy the `token` from the response
3. Use this token in the `Authorization` header for protected endpoints

---

## Complete Order Flow

### Step 1: Create a Listing (if you don't have one)
```
POST /listings
Authorization: Bearer YOUR_TOKEN
Body: {
  "title": "Calculus Textbook",
  "category": "Textbooks",
  "price": 50000,
  "condition": "new",
  "description": "Great book",
  "location": "Campus"
}
```
**Copy the `id` from response** - you'll need it for creating an order.

### Step 2: Create an Order

**Endpoint:** `POST http://localhost:3000/orders`

**Requires JWT Authentication**

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`

**Body (raw JSON):**
```json
{
  "listing_id": "abc-123-def-456",
  "meeting_location": "Main Campus - Building A"
}
```

**Important:**
- `listing_id` must be a valid UUID of an active listing
- You cannot create an order for your own listing
- The listing must be active (not sold or delisted)

**Expected Response (201 Created):**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_paise": 55825,
  "total_display": "₹558.25"
}
```

**Fee Breakdown:**
- Item Price: ₹500.00 (50,000 paise)
- Platform Fee (10%): ₹50.00 (5,000 paise)
- PhonePe Fee (1.5%): ₹8.25 (825 paise)
- **Total: ₹558.25** (55,825 paise)

**Copy the `order_id`** - you'll need it for payment and completion.

---

### Step 3: Initiate PhonePe Payment

**Endpoint:** `POST http://localhost:3000/orders/:order_id/payment`

**Requires JWT Authentication (buyer only)**

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`

**URL:**
```
POST http://localhost:3000/orders/550e8400-e29b-41d4-a716-446655440000/payment
```

**Expected Response (200 OK):**
```json
{
  "payment_url": "https://mercury-uat.phonepe.com/v4/payment/page/..."
}
```

**What to do:**
1. Copy the `payment_url`
2. Open it in a browser
3. Complete the payment on PhonePe (use test credentials)
4. PhonePe will call the webhook automatically

**Note:** For local testing, you'll need ngrok to expose your webhook endpoint.

---

### Step 4: Check Order Status

**Endpoint:** `GET http://localhost:3000/orders/:order_id`

**Requires JWT Authentication (buyer or seller)**

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`

**URL:**
```
GET http://localhost:3000/orders/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response (200 OK):**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "listing_id": "abc-123-def-456",
  "buyer_id": 1,
  "seller_id": 2,
  "item_price_paise": 50000,
  "item_price_display": "₹500.00",
  "platform_fee_paise": 5000,
  "platform_fee_display": "₹50.00",
  "phonepe_fee_paise": 825,
  "phonepe_fee_display": "₹8.25",
  "total_paise": 55825,
  "total_display": "₹558.25",
  "status": "escrowed",
  "payment_id": "T123456789",
  "meeting_location": "Main Campus - Building A",
  "created_at": "2026-01-01T...",
  "completed_at": null
}
```

**Status Values:**
- `pending`: Order created, payment not initiated
- `escrowed`: Payment successful, money held in escrow
- `completed`: Order completed, seller payout queued
- `refunded`: Order refunded

---

### Step 5: Complete Order

**Endpoint:** `PATCH http://localhost:3000/orders/:order_id/complete`

**Requires JWT Authentication (buyer only)**

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: application/json`

**Body (raw JSON):**
```json
{
  "meeting_time": "2026-01-15T10:00:00Z"
}
```

**Note:** `meeting_time` is optional. If not provided, it will be set to current time.

**Expected Response (200 OK):**
```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "seller_payout_paise": 50000,
  "seller_payout_display": "₹500.00"
}
```

**Seller Payout:**
- Seller receives: `item_price_paise` (₹500.00)
- Platform fee (₹50.00) is already deducted
- PhonePe fee (₹8.25) is paid by buyer

---

## Additional Endpoints

### Get All User Orders

**Endpoint:** `GET http://localhost:3000/orders`

**Requires JWT Authentication**

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected Response:**
```json
[
  {
    "order_id": "...",
    "listing_id": "...",
    "status": "escrowed",
    "total_display": "₹558.25",
    ...
  },
  ...
]
```

Returns all orders where you are either the buyer or seller.

---

## Complete Testing Workflow

### As a Buyer:

1. **Login** → Get token
   ```
   POST /auth/login
   ```

2. **Browse Listings** → Find a listing to buy
   ```
   GET /listings?category=Textbooks
   ```
   Copy a `listing_id` (must not be your own listing)

3. **Create Order**
   ```
   POST /orders
   Authorization: Bearer YOUR_TOKEN
   Body: { listing_id, meeting_location }
   ```
   Copy the `order_id`

4. **Initiate Payment**
   ```
   POST /orders/:order_id/payment
   Authorization: Bearer YOUR_TOKEN
   ```
   Copy `payment_url` and complete payment

5. **Check Order Status**
   ```
   GET /orders/:order_id
   Authorization: Bearer YOUR_TOKEN
   ```
   Status should be `escrowed` after successful payment

6. **Complete Order**
   ```
   PATCH /orders/:order_id/complete
   Authorization: Bearer YOUR_TOKEN
   Body: { meeting_time (optional) }
   ```
   Status changes to `completed`

---

## PhonePe Webhook Testing

**Note:** The webhook endpoint is called by PhonePe automatically. For local testing:

1. **Install ngrok:**
   ```bash
   ngrok http 3000
   ```

2. **Update `.env`:**
   ```env
   APP_BASE_URL=https://your-ngrok-url.ngrok.io
   ```

3. **Configure PhonePe webhook URL:**
   ```
   https://your-ngrok-url.ngrok.io/orders/webhook
   ```

4. **Webhook Endpoint:**
   ```
   POST /orders/webhook
   Headers: X-VERIFY: signature
   Body: PhonePe webhook payload
   ```

The webhook is automatically called by PhonePe after payment. You don't need to test it manually in Postman.

---

## Common Errors

### 401 Unauthorized
- **Problem:** Missing or invalid JWT token
- **Fix:** Login again and get a fresh token

### 404 Not Found
- **Problem:** Invalid listing_id or order_id
- **Fix:** Check the UUID is correct

### 400 Bad Request
- **Problem:** Listing not available or trying to buy your own listing
- **Fix:** Use a different listing that's active and not yours

### 403 Forbidden
- **Problem:** Trying to access someone else's order
- **Fix:** You can only view/complete your own orders

### Payment Failed
- **Problem:** PhonePe API error or invalid credentials
- **Fix:** Check PhonePe credentials in `.env` file

---

## Price Examples

| Item Price (₹) | Item Price (Paise) | Platform Fee (10%) | PhonePe Fee (1.5%) | Total (₹) | Total (Paise) |
|----------------|-------------------|-------------------|-------------------|-----------|---------------|
| ₹100           | 10,000            | ₹10 (1,000)       | ₹1.65 (165)       | ₹111.65   | 11,165        |
| ₹500           | 50,000            | ₹50 (5,000)       | ₹8.25 (825)       | ₹558.25   | 55,825        |
| ₹1000          | 100,000           | ₹100 (10,000)     | ₹16.50 (1,650)    | ₹1,116.50 | 111,650       |

**Formula:**
- Platform Fee = Item Price × 0.1
- PhonePe Fee = (Item Price + Platform Fee) × 0.015
- Total = Item Price + Platform Fee + PhonePe Fee

---

## Tips

1. **Save Token:** Use Postman's environment variables to store your token
2. **Save IDs:** Copy and save `listing_id` and `order_id` for easy testing
3. **Test Flow:** Follow the complete workflow from listing → order → payment → completion
4. **Check Status:** Always check order status after payment to verify it's `escrowed`
5. **Seller View:** Login as seller to see orders where you're the seller

---

## Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/orders` | POST | ✅ | Create order |
| `/orders` | GET | ✅ | Get user's orders |
| `/orders/:id` | GET | ✅ | Get order details |
| `/orders/:id/payment` | POST | ✅ | Initiate payment |
| `/orders/:id/complete` | PATCH | ✅ | Complete order |
| `/orders/webhook` | POST | ❌ | PhonePe webhook |

✅ = Requires JWT token  
❌ = No authentication required

