# How to Fix PhonePe Payment Error

## Error Message
```
{
    "message": "PhonePe API error: Unknown error",
    "error": "Bad Request",
    "statusCode": 400
}
```

## Common Causes and Solutions

### 1. Missing Environment Variables

**Problem:** PhonePe credentials not configured in `.env`

**Solution:** Add these to your `.env` file:

```env
PHONEPE_MERCHANT_ID=MERCHANTUAT
PHONEPE_SALT_KEY=YOUR_SALT_KEY_HERE
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
APP_BASE_URL=http://localhost:3000
```

**Important:**
- `PHONEPE_SALT_KEY` must be your actual PhonePe salt key from the dashboard
- For sandbox/testing, use `MERCHANTUAT` as merchant ID
- Make sure there are no extra spaces or quotes in the values

### 2. Invalid PhonePe Credentials

**Problem:** Wrong merchant ID or salt key

**Solution:**
1. Log in to PhonePe Merchant Dashboard
2. Go to API Credentials section
3. Copy the correct:
   - Merchant ID
   - Salt Key
   - Salt Index (usually `1`)

### 3. Wrong API Endpoint

**Problem:** Using production URL for sandbox or vice versa

**Solution:** Use the correct base URL:
- **Sandbox/Testing:** `https://api-preprod.phonepe.com/apis/pg-sandbox`
- **Production:** `https://api.phonepe.com/apis/pg-sandbox`

### 4. Network/Connection Issues

**Problem:** Cannot reach PhonePe API

**Solution:**
1. Check your internet connection
2. Verify PhonePe API is accessible
3. Check firewall/proxy settings

### 5. Invalid Request Format

**Problem:** PhonePe API doesn't accept the request format

**Solution:** The code has been updated with better error handling. Check the server logs for detailed error messages.

## Debugging Steps

### Step 1: Check Environment Variables

Verify your `.env` file has all required variables:

```bash
# In your terminal, check if variables are loaded
echo $PHONEPE_MERCHANT_ID
echo $PHONEPE_SALT_KEY
```

Or check in your code by adding temporary logging in `orders.service.ts`.

### Step 2: Check Server Logs

After the error, check your NestJS server console. You should now see:
- PhonePe API Response (if successful)
- Detailed error information (if failed)

### Step 3: Test with PhonePe Sandbox

For testing, make sure you're using:
- Merchant ID: `MERCHANTUAT`
- Sandbox URL: `https://api-preprod.phonepe.com/apis/pg-sandbox`
- Valid sandbox salt key

### Step 4: Verify Order Amount

Make sure the order amount is valid:
- Must be in paise (integers)
- Minimum amount: Usually ₹1 (100 paise)
- Maximum amount: Check PhonePe limits

## Quick Fix Checklist

- [ ] `.env` file exists in project root
- [ ] `PHONEPE_MERCHANT_ID` is set
- [ ] `PHONEPE_SALT_KEY` is set (not empty, no quotes)
- [ ] `PHONEPE_SALT_INDEX` is set (usually `1`)
- [ ] `PHONEPE_BASE_URL` is correct for your environment
- [ ] `APP_BASE_URL` is set
- [ ] Server restarted after adding `.env` variables
- [ ] PhonePe credentials are correct from dashboard

## Testing Without PhonePe (Mock Mode)

If you want to test the order flow without actual PhonePe integration, you can temporarily modify the service to return a mock payment URL:

```typescript
// In orders.service.ts, temporarily replace initiatePhonePayment method
async initiatePhonePayment(order_id: string): Promise<{ payment_url: string }> {
  const order = await this.ordersRepository.findOne({
    where: { order_id },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new BadRequestException('Order is not in pending status');
  }

  // Mock payment URL for testing
  return {
    payment_url: `https://mock-payment.phonepe.com/pay?order=${order_id}`,
  };
}
```

## Getting PhonePe Credentials

1. **Sign up for PhonePe Merchant Account:**
   - Go to PhonePe Business website
   - Register as a merchant

2. **Access Sandbox/Test Environment:**
   - Log in to PhonePe Merchant Dashboard
   - Navigate to API/Settings section
   - Find "API Credentials" or "Integration Details"

3. **Copy Credentials:**
   - Merchant ID
   - Salt Key
   - Salt Index

4. **For Testing:**
   - Use sandbox/test credentials
   - Don't use production credentials for development

## Updated Error Handling

The code has been updated to show more detailed error messages. After restarting your server, you should see:

- Actual error message from PhonePe API
- HTTP status code
- Full error response for debugging

Check your server console logs for detailed error information.

## Still Having Issues?

1. **Check server logs** - Look for detailed error messages
2. **Verify credentials** - Double-check PhonePe dashboard
3. **Test API directly** - Use Postman to test PhonePe API directly
4. **Contact PhonePe Support** - If credentials are correct but API fails

