# PhonePe SDK Setup Guide

## New SDK-Based Integration

The PhonePe integration now uses the official `pg-sdk-node` SDK instead of direct API calls.

## Environment Variables

Update your `.env` file with these new variables:

```env
# PhonePe SDK Configuration
PHONEPE_CLIENT_ID=your_client_id_here
PHONEPE_CLIENT_SECRET=your_client_secret_here
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX

# App Configuration
APP_BASE_URL=http://localhost:3000
```

### Credential Types

**Old Method (Deprecated):**
- `PHONEPE_MERCHANT_ID`
- `PHONEPE_SALT_KEY`
- `PHONEPE_SALT_INDEX`

**New Method (SDK):**
- `PHONEPE_CLIENT_ID` - Your unique client ID (Integer)
- `PHONEPE_CLIENT_SECRET` - Secret key provided by PhonePe (String)
- `PHONEPE_CLIENT_VERSION` - Client version (Integer, usually 1)
- `PHONEPE_ENV` - Environment: `SANDBOX` or `PRODUCTION`

## Getting Your Credentials

1. **Log in to PhonePe Merchant Dashboard**
2. **Navigate to API/SDK Settings**
3. **Find SDK Credentials:**
   - Client ID (Integer)
   - Client Secret (String)
   - Client Version (usually 1)

## Migration Steps

### Step 1: Get SDK Credentials

From your PhonePe dashboard, get:
- Client ID (e.g., `123456`)
- Client Secret (e.g., `abc123def456...`)
- Client Version (usually `1`)

### Step 2: Update .env File

Replace the old PhonePe configuration with:

```env
# Remove these old variables:
# PHONEPE_MERCHANT_ID=...
# PHONEPE_SALT_KEY=...
# PHONEPE_SALT_INDEX=...
# PHONEPE_BASE_URL=...

# Add these new variables:
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX
```

### Step 3: Restart Server

```bash
npm run start:dev
```

## SDK Benefits

✅ **Simplified Integration** - No manual signature generation  
✅ **Automatic Verification** - SDK handles webhook signature verification  
✅ **Better Error Handling** - SDK provides clearer error messages  
✅ **Official Support** - Maintained by PhonePe  

## Testing

After updating credentials:

1. **Create an order:**
   ```
   POST /orders
   ```

2. **Initiate payment:**
   ```
   POST /orders/:order_id/payment
   ```

3. **Check response** - Should return `payment_url` without errors

## Troubleshooting

### Error: "Client ID or Secret not set"
- Make sure `PHONEPE_CLIENT_ID` and `PHONEPE_CLIENT_SECRET` are in `.env`
- Restart server after updating `.env`

### Error: "Invalid credentials"
- Verify Client ID and Client Secret from PhonePe dashboard
- Make sure `PHONEPE_ENV` matches your credentials (SANDBOX vs PRODUCTION)

### Still Getting Errors
- Check server logs for detailed SDK error messages
- Verify credentials are correct in PhonePe dashboard
- Ensure you're using sandbox credentials for testing

