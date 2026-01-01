# Orders and PhonePe Payment System Setup

## Environment Variables

Add these to your `.env` file:

```env
# PhonePe Configuration
PHONEPE_MERCHANT_ID=MERCHANTUAT
PHONEPE_SALT_KEY=YOUR_SALT_KEY
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

# App Configuration
APP_BASE_URL=http://localhost:3000
```

### PhonePe Configuration

- **PHONEPE_MERCHANT_ID**: Your PhonePe merchant ID (use `MERCHANTUAT` for sandbox)
- **PHONEPE_SALT_KEY**: Your PhonePe salt key (get from PhonePe dashboard)
- **PHONEPE_SALT_INDEX**: Salt index (usually `1`)
- **PHONEPE_BASE_URL**: 
  - Sandbox: `https://api-preprod.phonepe.com/apis/pg-sandbox`
  - Production: `https://api.phonepe.com/apis/pg-sandbox`

- **APP_BASE_URL**: Your application base URL (for callbacks and webhooks)

## Fee Structure

All amounts are stored in **paise** (integers):

- **Item Price**: Price from listing (in paise)
- **Platform Fee**: 10% of item price
- **PhonePe Fee**: 1.5% of (item price + platform fee)
- **Total**: Item price + Platform fee + PhonePe fee

### Example Calculation

Item Price: ₹500 (50,000 paise)
- Platform Fee (10%): ₹50 (5,000 paise)
- Subtotal: ₹550 (55,000 paise)
- PhonePe Fee (1.5%): ₹8.25 (825 paise)
- **Total**: ₹558.25 (55,825 paise)

## Order Status Flow

1. **PENDING**: Order created, payment not initiated
2. **ESCROWED**: Payment successful, money held in escrow
3. **COMPLETED**: Order completed, seller payout queued
4. **REFUNDED**: Order refunded

## API Endpoints

### 1. Create Order
```
POST /orders
Authorization: Bearer YOUR_TOKEN
Body: {
  "listing_id": "uuid",
  "meeting_location": "Main Campus"
}
```

### 2. Initiate Payment
```
POST /orders/:order_id/payment
Authorization: Bearer YOUR_TOKEN
```

### 3. Payment Webhook (PhonePe calls this)
```
POST /orders/webhook
Headers: X-VERIFY: signature
Body: PhonePe webhook payload
```

### 4. Complete Order
```
PATCH /orders/:order_id/complete
Authorization: Bearer YOUR_TOKEN
Body: {
  "meeting_time": "2026-01-15T10:00:00Z" (optional)
}
```

### 5. Get Order Details
```
GET /orders/:order_id
Authorization: Bearer YOUR_TOKEN
```

### 6. Get User Orders
```
GET /orders
Authorization: Bearer YOUR_TOKEN
```

## PhonePe Integration Notes

1. **Sandbox Testing**: Use PhonePe sandbox credentials for testing
2. **Webhook URL**: Must be publicly accessible (use ngrok for local testing)
3. **Signature Verification**: All webhooks are verified using SHA256
4. **Payment Flow**:
   - User creates order → Order status: PENDING
   - User initiates payment → Redirect to PhonePe
   - PhonePe processes payment → Webhook called
   - If successful → Order status: ESCROWED
   - User completes order → Order status: COMPLETED

## Testing Locally

For local testing with PhonePe webhooks:

1. Use **ngrok** to expose your local server:
   ```bash
   ngrok http 3000
   ```

2. Update `APP_BASE_URL` in `.env` to your ngrok URL:
   ```env
   APP_BASE_URL=https://your-ngrok-url.ngrok.io
   ```

3. Configure PhonePe webhook URL in PhonePe dashboard:
   ```
   https://your-ngrok-url.ngrok.io/orders/webhook
   ```

## Seller Payout

When an order is completed:
- Seller receives: `item_price_paise` (platform fee already deducted)
- Payout is calculated but not automatically processed (queue system to be implemented)

## Security

- All webhook requests are verified using SHA256 signature
- Only buyers can create orders for listings
- Only buyers can complete their own orders
- Only buyer/seller can view their orders

