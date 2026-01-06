# Quick Guide: Test Webhook in Postman

## 🚀 Quick Test Steps

### Step 1: Create a Test Order

First, create an order to get an `order_id`:

```http
POST http://localhost:3000/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "listing_id": "your-listing-uuid",
  "meeting_location": "Test Location"
}
```

**Save the `order_id` from the response!**

---

### Step 2: Test Webhook in Postman

#### Option A: Use Postman Collection

1. **Import the collection** (if not already imported)
2. **Find:** `Orders` → `Test PhonePe Webhook (Success)`
3. **Update the body:**
   - Replace `YOUR_ORDER_ID_HERE` with your actual `order_id`
4. **Click Send**

#### Option B: Create New Request

**Method:** `POST`

**URL:**
```
http://localhost:3000/orders/webhook
```

**Headers:**
```
Content-Type: application/json
x-verify: test_signature_123###1
authorization: test_auth_header
```

**Body (raw JSON):**
```json
{
  "code": "PAYMENT_SUCCESS",
  "message": "Payment successful",
  "data": {
    "merchantId": "M232G4O6KU7K2_2601012107",
    "merchantTransactionId": "YOUR_ORDER_ID_HERE",
    "transactionId": "TXN123456789",
    "amount": 55825,
    "state": "COMPLETED",
    "responseCode": "PAYMENT_SUCCESS",
    "paymentInstrument": {
      "type": "UPI"
    }
  }
}
```

**⚠️ Important:** Replace `YOUR_ORDER_ID_HERE` with your actual order_id!

---

### Step 3: Expected Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "order_id": "your-order-id-here"
}
```

**What Happened:**
- ✅ Webhook validated
- ✅ Order status changed from `pending` to `escrowed`
- ✅ `payment_id` set to `TXN123456789`

---

### Step 4: Verify Order Status Changed

Check the order to confirm status changed:

```http
GET http://localhost:3000/orders/{order_id}
Authorization: Bearer YOUR_TOKEN
```

**Expected Response:**
```json
{
  "order_id": "...",
  "status": "escrowed",  // ✅ Changed!
  "payment_id": "TXN123456789",  // ✅ Set!
  ...
}
```

---

## 📋 Complete Example

### 1. Create Order
```http
POST http://localhost:3000/orders
Authorization: Bearer YOUR_TOKEN
Body: {
  "listing_id": "abc-123-def-456",
  "meeting_location": "Campus"
}
```
**Response:** `{ "order_id": "550e8400-e29b-41d4-a716-446655440000", ... }`

### 2. Send Webhook
```http
POST http://localhost:3000/orders/webhook
Headers:
  Content-Type: application/json
  x-verify: test_signature_123###1
  authorization: test_auth_header
Body:
{
  "code": "PAYMENT_SUCCESS",
  "message": "Payment successful",
  "data": {
    "merchantId": "M232G4O6KU7K2_2601012107",
    "merchantTransactionId": "550e8400-e29b-41d4-a716-446655440000",
    "transactionId": "TXN123456789",
    "amount": 55825,
    "state": "COMPLETED",
    "responseCode": "PAYMENT_SUCCESS",
    "paymentInstrument": { "type": "UPI" }
  }
}
```
**Response:** `{ "success": true, "order_id": "550e8400-e29b-41d4-a716-446655440000" }`

### 3. Verify Order
```http
GET http://localhost:3000/orders/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_TOKEN
```
**Response:** `{ "status": "escrowed", "payment_id": "TXN123456789", ... }`

---

## 🧪 Test Scenarios

### Scenario 1: Successful Payment
- **State:** `"COMPLETED"`
- **Response Code:** `"PAYMENT_SUCCESS"`
- **Result:** Order status → `escrowed` ✅

### Scenario 2: Failed Payment
- **State:** `"FAILED"`
- **Response Code:** `"PAYMENT_FAILED"`
- **Result:** Order status → `pending` (unchanged)

---

## 📝 Postman Collection Updated

The Postman collection now includes:
- ✅ `Test PhonePe Webhook (Success)` - Test successful payment
- ✅ `Test PhonePe Webhook (Failed)` - Test failed payment

Both are in the **Orders** folder.

---

## ⚠️ Important Notes

1. **Order ID Required:** You must use a real `order_id` from an actual order
2. **Headers:** The `x-verify` and `authorization` headers are placeholders for testing
3. **Real Webhooks:** PhonePe will send real headers when they call your webhook
4. **Validation:** The webhook handler will validate using your credentials from `.env`

---

## 🔍 Check Server Logs

After sending the webhook, check your server console for:

**Success:**
```
✅ Webhook validated successfully using SDK
```

**If credentials not set:**
```
⚠️  Webhook username/password not set. Using basic signature verification.
```

**If validation fails:**
```
❌ Webhook validation failed: [error]
```

---

## ✅ Quick Checklist

- [ ] Order created (have `order_id`)
- [ ] Webhook request created in Postman
- [ ] `merchantTransactionId` in body matches `order_id`
- [ ] Headers added (`x-verify`, `authorization`)
- [ ] Body includes `state: "COMPLETED"` and `responseCode: "PAYMENT_SUCCESS"`
- [ ] Webhook sent successfully
- [ ] Order status changed to `escrowed`
- [ ] Server logs show validation success

---

**Ready to test!** Follow the steps above to test the webhook in Postman.




