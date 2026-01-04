# Fix: "Order must be in escrowed status to complete"

## Problem

You're getting this error because the order status is still `pending`, but it needs to be `escrowed` before you can complete it.

## Order Status Flow

```
1. PENDING    → Order created, payment not initiated
2. ESCROWED   → Payment successful (webhook updates this)
3. COMPLETED  → Order completed by buyer
```

## Solution: Check Order Status First

### Step 1: Check Current Order Status

```http
GET http://localhost:3000/orders/{order_id}
Authorization: Bearer YOUR_TOKEN
```

**Expected Response:**
```json
{
  "order_id": "uuid",
  "status": "pending",  // ← This is the problem!
  ...
}
```

### Step 2: If Status is "pending"

The order needs payment to be completed first. Follow these steps:

#### Option A: Complete Payment Flow

1. **Initiate Payment** (if not done):
   ```http
   POST http://localhost:3000/orders/{order_id}/payment
   Authorization: Bearer YOUR_TOKEN
   ```

2. **Complete Payment on PhonePe:**
   - Open the `payment_url` from response
   - Complete payment on PhonePe
   - PhonePe will call webhook automatically

3. **Wait for Webhook** (or manually trigger if testing):
   - Webhook updates status to `escrowed`
   - Check order status again

4. **Then Complete Order:**
   ```http
   PATCH http://localhost:3000/orders/{order_id}/complete
   Authorization: Bearer YOUR_TOKEN
   ```

#### Option B: Manual Status Update (For Testing Only)

If you're testing and the webhook didn't fire, you can manually update the status:

**Using Database:**
```sql
UPDATE orders SET status = 'escrowed' WHERE order_id = 'YOUR_ORDER_ID';
```

**Or use a database tool** (pgAdmin, DBeaver, etc.)

---

## Complete Order Flow Checklist

- [ ] Order created (status: `pending`)
- [ ] Payment initiated (`POST /orders/:id/payment`)
- [ ] Payment completed on PhonePe
- [ ] Webhook received (status: `escrowed`) ← **You are here**
- [ ] Order completed (`PATCH /orders/:id/complete`)

---

## How to Verify Order Status

### Method 1: Get Order Details
```http
GET /orders/{order_id}
Authorization: Bearer YOUR_TOKEN
```

Look for:
```json
{
  "status": "escrowed"  // ✅ Ready to complete
}
```

### Method 2: Check All Orders
```http
GET /orders
Authorization: Bearer YOUR_TOKEN
```

Find your order and check its status.

---

## Common Scenarios

### Scenario 1: Payment Not Initiated
**Status:** `pending`  
**Solution:** Initiate payment first
```http
POST /orders/{order_id}/payment
```

### Scenario 2: Payment Initiated But Not Completed
**Status:** `pending`  
**Solution:** Complete payment on PhonePe, wait for webhook

### Scenario 3: Payment Completed But Webhook Not Received
**Status:** `pending` (should be `escrowed`)  
**Solution:** 
- Check webhook endpoint is accessible
- For local testing, use ngrok
- Or manually update status in database

### Scenario 4: Payment Failed
**Status:** `pending`  
**Solution:** Initiate payment again or create new order

---

## Testing Locally

### For Local Testing Without Webhook:

1. **Complete payment on PhonePe** (sandbox)
2. **Manually update status:**
   ```sql
   UPDATE orders 
   SET status = 'escrowed', 
       payment_id = 'TEST_PAYMENT_ID'
   WHERE order_id = 'YOUR_ORDER_ID';
   ```
3. **Then complete order:**
   ```http
   PATCH /orders/{order_id}/complete
   ```

---

## Quick Fix Commands

### Check Order Status:
```bash
# In Postman
GET http://localhost:3000/orders/{order_id}
Headers: Authorization: Bearer YOUR_TOKEN
```

### Update Status Manually (PostgreSQL):
```sql
-- Connect to database
psql -U postgres -d yawmiy

-- Update order status
UPDATE orders 
SET status = 'escrowed' 
WHERE order_id = 'YOUR_ORDER_ID_HERE';

-- Verify
SELECT order_id, status, payment_id FROM orders WHERE order_id = 'YOUR_ORDER_ID_HERE';
```

---

## Expected Status Values

| Status | Meaning | Can Complete? |
|--------|---------|---------------|
| `pending` | Payment not completed | ❌ No |
| `escrowed` | Payment successful | ✅ Yes |
| `completed` | Order completed | ❌ Already done |
| `refunded` | Order refunded | ❌ No |

---

## Next Steps

1. **Check your order status** using `GET /orders/{order_id}`
2. **If `pending`:** Complete payment flow first
3. **If `escrowed`:** You can complete the order ✅
4. **If still having issues:** Check server logs for webhook errors

---

**The order must be in `escrowed` status before you can complete it!**

