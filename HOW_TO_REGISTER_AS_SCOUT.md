# How to Register as a Scout - Step by Step

## Prerequisites

You need **at least 1 completed transaction** (as buyer or seller) before you can register as a scout.

A "completed transaction" means:
- An order with status = `COMPLETED`
- You were either the **buyer** OR the **seller** of that order

---

## Step-by-Step Guide

### Step 1: Complete a Transaction

You have two options:

#### Option A: Buy Something (You are the Buyer)

1. **Find a listing:**
   ```http
   GET http://localhost:3000/listings
   ```
   Find a listing you want to buy (note the `id`)

2. **Create an order:**
   ```http
   POST http://localhost:3000/orders
   Authorization: Bearer YOUR_TOKEN
   Body: {
     "listing_id": "listing-uuid-here",
     "meeting_location": "Campus"
   }
   ```
   Save the `order_id` from response

3. **Initiate payment:**
   ```http
   POST http://localhost:3000/orders/{order_id}/payment
   Authorization: Bearer YOUR_TOKEN
   ```
   Complete payment on PhonePe

4. **Complete the order:**
   ```http
   PATCH http://localhost:3000/orders/{order_id}/complete
   Authorization: Bearer YOUR_TOKEN
   Body: {
     "meeting_time": "2026-01-15T10:00:00Z"  // Optional
   }
   ```
   ✅ Order status becomes `COMPLETED`

#### Option B: Sell Something (You are the Seller)

1. **Create a listing:**
   ```http
   POST http://localhost:3000/listings
   Authorization: Bearer YOUR_TOKEN
   Body: {
     "title": "Test Item",
     "category": "Textbooks",
     "price": 50000,
     "condition": "new",
     "description": "Test item for sale",
     "photos": [],
     "location": "Campus"
   }
   ```
   Save the `id` from response

2. **Have someone else buy it:**
   - Another user creates an order for your listing
   - They complete payment
   - They complete the order

3. **Verify order is completed:**
   ```http
   GET http://localhost:3000/orders/{order_id}
   Authorization: Bearer YOUR_TOKEN
   ```
   Check: `status` should be `"completed"`

---

### Step 2: Verify Transaction Count

Check if you have completed transactions:

```http
GET http://localhost:3000/orders
Authorization: Bearer YOUR_TOKEN
```

Look for orders where:
- `status` = `"completed"`
- You are either `buyer_id` or `seller_id`

**You need at least 1 such order.**

---

### Step 3: Register as Scout

Once you have at least 1 completed transaction:

```http
POST http://localhost:3000/scouts/register
Authorization: Bearer YOUR_TOKEN
Body: {}
```

**Expected Response (201 Created):**
```json
{
  "scout_id": "uuid-here",
  "message": "Successfully registered as scout"
}
```

---

## Quick Test Flow

### For Testing (Complete Order Quickly)

1. **Create order** (as buyer)
2. **Initiate payment** → Get `payment_url`
3. **Complete payment** on PhonePe (sandbox)
4. **Wait for webhook** → Order status becomes `escrowed`
5. **Complete order:**
   ```http
   PATCH http://localhost:3000/orders/{order_id}/complete
   Authorization: Bearer YOUR_TOKEN
   ```
6. **Verify order is completed:**
   ```http
   GET http://localhost:3000/orders/{order_id}
   Authorization: Bearer YOUR_TOKEN
   ```
   Check: `status` = `"completed"`

7. **Now register as scout:**
   ```http
   POST http://localhost:3000/scouts/register
   Authorization: Bearer YOUR_TOKEN
   ```

---

## Troubleshooting

### "You need at least 1 completed transaction"

**Possible causes:**
1. ❌ No orders created yet
2. ❌ Orders exist but status is not `COMPLETED`
   - Status might be `pending` or `escrowed`
   - You need to complete the order after payment

**Solution:**
- Make sure order status is `COMPLETED`, not just `ESCROWED`
- Complete the order using `PATCH /orders/:id/complete`

### "Order must be in escrowed status to complete"

- Payment hasn't been completed yet
- Complete payment first, then complete the order
- See: `FIX_ORDER_COMPLETION_ERROR.md`

### How to Check Your Transaction Count

The system checks for orders where:
- `status` = `COMPLETED`
- You are the `buyer_id` OR `seller_id`

**Check your orders:**
```http
GET http://localhost:3000/orders
Authorization: Bearer YOUR_TOKEN
```

Count how many have `status: "completed"`.

---

## Complete Example Flow

### 1. Create Order
```http
POST /orders
Authorization: Bearer TOKEN
Body: { "listing_id": "...", "meeting_location": "Campus" }
```
**Response:** `{ "order_id": "abc-123", ... }`

### 2. Initiate Payment
```http
POST /orders/abc-123/payment
Authorization: Bearer TOKEN
```
**Response:** `{ "payment_url": "https://..." }`

### 3. Complete Payment
- Open `payment_url` in browser
- Complete payment on PhonePe
- Webhook updates order to `escrowed`

### 4. Complete Order
```http
PATCH /orders/abc-123/complete
Authorization: Bearer TOKEN
```
**Response:** `{ "order_id": "abc-123", "seller_payout_paise": 50000, ... }`

### 5. Verify Order Status
```http
GET /orders/abc-123
Authorization: Bearer TOKEN
```
**Response:** `{ "status": "completed", ... }` ✅

### 6. Register as Scout
```http
POST /scouts/register
Authorization: Bearer TOKEN
Body: {}
```
**Response:** `{ "scout_id": "xyz-789", "message": "Successfully registered as scout" }` ✅

---

## Status Flow Reminder

```
PENDING → ESCROWED → COMPLETED
   ↓         ↓          ↓
Created   Payment    Order
         Successful  Done
```

**For scout registration, you need status = `COMPLETED`!**

---

## Quick Checklist

- [ ] Order created
- [ ] Payment initiated
- [ ] Payment completed (webhook received)
- [ ] Order status = `escrowed`
- [ ] Order completed (`PATCH /orders/:id/complete`)
- [ ] Order status = `completed` ✅
- [ ] Register as scout (`POST /scouts/register`)

---

**Follow these steps to complete a transaction, then register as a scout!**

