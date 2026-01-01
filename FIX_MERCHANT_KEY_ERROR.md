# Fix "Key not found for the merchant" Error

## Error Message
```
{
    "message": "PhonePe API error (400): Key not found for the merchant",
    "error": "Bad Request",
    "statusCode": 400
}
```

## Cause
This error means your **Merchant ID** and **Salt Key** don't match. PhonePe cannot find a salt key associated with your merchant ID.

## Solutions

### Solution 1: Verify Merchant ID Format

Your Merchant ID is: `M232G4O6KU7K2_2601012107`

The part after the underscore (`_2601012107`) might be a timestamp or version identifier. Try using **only the part before the underscore**:

**Option A: Use only the base merchant ID**
```env
PHONEPE_MERCHANT_ID=M232G4O6KU7K2
```

**Option B: Keep the full merchant ID** (if PhonePe requires it)
```env
PHONEPE_MERCHANT_ID=M232G4O6KU7K2_2601012107
```

### Solution 2: Verify Salt Key Matches Merchant ID

1. **Check PhonePe Dashboard:**
   - Log in to PhonePe Merchant Dashboard
   - Go to API Credentials
   - Verify that the Merchant ID shown matches exactly what you're using
   - Verify that the Salt Key shown matches what you have in `.env`

2. **Common Issues:**
   - Salt Key copied with extra spaces
   - Merchant ID has different format in dashboard
   - Using production credentials with sandbox URL (or vice versa)

### Solution 3: Check Sandbox vs Production

Make sure you're using:
- **Sandbox credentials** with **sandbox URL**
- **Production credentials** with **production URL**

**Sandbox:**
```env
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_MERCHANT_ID=M232G4O6KU7K2_2601012107  # or just M232G4O6KU7K2
```

**Production:**
```env
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg-sandbox
PHONEPE_MERCHANT_ID=your_production_merchant_id
```

### Solution 4: Try Different Merchant ID Format

The merchant ID might need to be used differently. Try these variations:

1. **Without underscore suffix:**
   ```env
   PHONEPE_MERCHANT_ID=M232G4O6KU7K2
   ```

2. **With underscore (current):**
   ```env
   PHONEPE_MERCHANT_ID=M232G4O6KU7K2_2601012107
   ```

3. **Check PhonePe Dashboard** for the exact format they show

### Solution 5: Verify Salt Key

1. **Check for extra characters:**
   - No leading/trailing spaces
   - No quotes around the value
   - Copy exactly as shown in dashboard

2. **Current Salt Key:**
   ```
   OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5
   ```

3. **Verify it matches** what's shown in PhonePe dashboard exactly

## Debugging Steps

### Step 1: Check Current Configuration

Run this to see your current config:
```bash
# In your terminal
cat .env | grep PHONEPE
```

### Step 2: Test with Base Merchant ID

Try updating `.env` to use only the base merchant ID:
```env
PHONEPE_MERCHANT_ID=M232G4O6KU7K2
```

Then restart server and test again.

### Step 3: Contact PhonePe Support

If the issue persists:
1. Contact PhonePe merchant support
2. Provide your Merchant ID: `M232G4O6KU7K2_2601012107`
3. Ask them to verify:
   - The correct Merchant ID format to use
   - That your Salt Key matches your Merchant ID
   - Whether you should use sandbox or production credentials

## Quick Fix to Try

1. **Update `.env` to try base merchant ID:**
   ```env
   PHONEPE_MERCHANT_ID=M232G4O6KU7K2
   ```

2. **Restart server:**
   ```bash
   npm run start:dev
   ```

3. **Test payment again**

If that doesn't work, try the full merchant ID again and contact PhonePe support to verify the credentials match.

