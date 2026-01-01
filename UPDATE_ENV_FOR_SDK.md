# Update .env File for PhonePe SDK

## Current .env (Old Method)
```env
PHONEPE_MERCHANT_ID=M232G4O6KU7K2_2601012107
PHONEPE_SALT_KEY=OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

## New .env (SDK Method)
Replace the old PhonePe configuration with:

```env
# PhonePe SDK Configuration
PHONEPE_CLIENT_ID=your_client_id_here
PHONEPE_CLIENT_SECRET=your_client_secret_here
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX

# Keep these
APP_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:admin@localhost:5432/yawmiy
JWT_SECRET=supersecretkey123
NODE_ENV=development
```

## How to Get SDK Credentials

1. **Log in to PhonePe Merchant Dashboard**
2. **Go to SDK/API Settings**
3. **Find:**
   - **Client ID** (Integer, e.g., `123456`)
   - **Client Secret** (String, long random string)
   - **Client Version** (usually `1`)

## Quick Update Command

You can manually update your `.env` file or use this as a reference:

```env
# Remove these lines:
# PHONEPE_MERCHANT_ID=...
# PHONEPE_SALT_KEY=...
# PHONEPE_SALT_INDEX=...
# PHONEPE_BASE_URL=...

# Add these lines:
PHONEPE_CLIENT_ID=your_client_id_from_dashboard
PHONEPE_CLIENT_SECRET=your_client_secret_from_dashboard
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX
```

## After Updating

1. **Restart your server:**
   ```bash
   npm run start:dev
   ```

2. **Test payment initiation:**
   ```
   POST /orders/:order_id/payment
   ```

The SDK will handle all the signature generation and API calls automatically!

