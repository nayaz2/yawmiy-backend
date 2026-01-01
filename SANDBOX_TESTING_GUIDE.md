# PhonePe Sandbox Testing Guide

## Current Sandbox Configuration

Your `.env` file is configured for PhonePe Sandbox:

```env
PHONEPE_MERCHANT_ID=M232G4O6KU7K2_2601012107
PHONEPE_SALT_KEY=OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
APP_BASE_URL=http://localhost:3000
```

## Sandbox Testing Notes

### 1. Merchant ID Format
PhonePe sandbox sometimes requires the full merchant ID with suffix. I've set it back to:
- `M232G4O6KU7K2_2601012107` (with suffix)

If this doesn't work, try:
- `M232G4O6KU7K2` (without suffix)

### 2. Sandbox API Endpoint
✅ Correct: `https://api-preprod.phonepe.com/apis/pg-sandbox`

### 3. Test Payment Flow
1. Create an order
2. Initiate payment → Get `payment_url`
3. Open `payment_url` in browser
4. Use PhonePe sandbox test credentials to complete payment
5. Webhook will be called automatically

### 4. Common Sandbox Issues

**"Key not found for the merchant" Error:**

This usually means:
- Merchant ID and Salt Key don't match
- Wrong merchant ID format
- Credentials are for production, not sandbox

**Solutions to try:**

1. **Verify in PhonePe Dashboard:**
   - Log in to PhonePe Sandbox/Test Merchant Dashboard
   - Check the exact Merchant ID shown (with or without suffix)
   - Verify Salt Key matches exactly

2. **Try both Merchant ID formats:**
   ```env
   # Option 1: With suffix
   PHONEPE_MERCHANT_ID=M232G4O6KU7K2_2601012107
   
   # Option 2: Without suffix
   PHONEPE_MERCHANT_ID=M232G4O6KU7K2
   ```

3. **Check Salt Key:**
   - No extra spaces
   - No quotes
   - Exact match from dashboard

### 5. Sandbox Test Credentials

When testing payment on PhonePe sandbox:
- Use test phone numbers
- Use test UPI IDs
- No real money is charged
- Payments are simulated

### 6. Webhook Testing for Sandbox

For local webhook testing:
1. Use **ngrok** to expose local server:
   ```bash
   ngrok http 3000
   ```

2. Update `APP_BASE_URL` in `.env`:
   ```env
   APP_BASE_URL=https://your-ngrok-url.ngrok.io
   ```

3. Configure webhook URL in PhonePe dashboard:
   ```
   https://your-ngrok-url.ngrok.io/orders/webhook
   ```

## Troubleshooting Steps

### Step 1: Restart Server
After any `.env` changes:
```bash
npm run start:dev
```

### Step 2: Check Server Logs
Look for:
- PhonePe API response details
- Error messages
- Configuration warnings

### Step 3: Verify Credentials
1. Log in to PhonePe Sandbox Dashboard
2. Go to API Credentials
3. Compare with your `.env` values:
   - Merchant ID (exact match)
   - Salt Key (exact match)
   - Salt Index (usually `1`)

### Step 4: Test API Directly
You can test PhonePe API directly using Postman or curl to verify credentials work.

## Current Status

✅ Sandbox URL configured correctly  
✅ Salt Key set  
⚠️ Merchant ID: Currently using full format with suffix  
⚠️ If error persists, try without suffix or contact PhonePe support

## Next Steps

1. **Restart your server** to load updated config
2. **Test payment initiation** again
3. **Check server logs** for detailed error messages
4. **If still failing**, try merchant ID without suffix or contact PhonePe support

