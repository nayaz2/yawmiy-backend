# PhonePe Webhook Configuration Guide

## 📋 What to Enter in PhonePe Dashboard

Based on your current implementation, here's what to enter in each field:

### 1. **Webhook URL**

**For Local Testing (using ngrok):**
```
https://your-ngrok-url.ngrok.io/orders/webhook
```

**For Production:**
```
https://your-domain.com/orders/webhook
```

**Important:**
- Must be publicly accessible (use ngrok for local testing)
- Must use HTTPS (PhonePe requires HTTPS)
- Must end with `/orders/webhook` (your endpoint path)

---

### 2. **Username**

**Enter:** A username you choose (e.g., `yawmiy_webhook_user`)

**Note:** This is a username you set in the PhonePe dashboard. You'll need to store this in your `.env` file as `PHONEPE_WEBHOOK_USERNAME`.

**Recommendation:** Use a strong, unique username like:
- `yawmiy_webhook_2026`
- `yawmiy_merchant_webhook`
- Or any secure username you prefer

---

### 3. **Password**

**Enter:** A strong password you choose (e.g., `SecurePass123!@#`)

**Note:** This is a password you set in the PhonePe dashboard. You'll need to store this in your `.env` file as `PHONEPE_WEBHOOK_PASSWORD`.

**Recommendation:** Use a strong password with:
- At least 12 characters
- Mix of uppercase, lowercase, numbers, special characters
- Example: `YawmiyWebhook2026!@#`

**⚠️ Security:** Store this securely in `.env` file, never commit to git!

---

### 4. **Description**

**Enter:** A description for your reference (optional but recommended)

**Examples:**
- `Yawmiy Marketplace - Payment Webhook`
- `Production Webhook - Order Status Updates`
- `Sandbox Webhook - Testing`

---

### 5. **Active Events**

**Select:** Payment status events

**Recommended Events:**
- ✅ **Payment Success** (when payment is successful)
- ✅ **Payment Failed** (when payment fails)
- ✅ **Payment Pending** (optional)

**Note:** Select events that you want PhonePe to notify you about.

---

## 🔧 Next Steps: Update Your Code

After setting up the webhook in PhonePe dashboard, you need to:

1. **Add environment variables** to `.env`:
   ```env
   PHONEPE_WEBHOOK_USERNAME=your_username_here
   PHONEPE_WEBHOOK_PASSWORD=your_password_here
   ```

2. **Code is already updated!** ✅ The webhook handler now uses PhonePe SDK's `validateCallback()` method

---

## 📝 Example Configuration

**In PhonePe Dashboard:**
- **Webhook URL:** `https://abc123.ngrok.io/orders/webhook`
- **Username:** `yawmiy_webhook_user`
- **Password:** `SecurePass123!@#`
- **Description:** `Yawmiy Marketplace - Sandbox Webhook`
- **Active Events:** Payment Success, Payment Failed

**In your `.env` file:**
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_user
PHONEPE_WEBHOOK_PASSWORD=SecurePass123!@#
```

---

## 🚨 Important Notes

1. **HTTPS Required:** PhonePe requires HTTPS for webhooks. Use ngrok for local testing.

2. **Username/Password:** These are credentials you set in PhonePe dashboard, not your PhonePe account credentials.

3. **Keep Credentials Secure:** Never commit webhook username/password to git. Use `.env` file and add to `.gitignore`.

4. **Test Webhook:** After setup, PhonePe will send a test webhook. Check your server logs to verify it's received.

5. **Webhook URL Format:** Must match exactly: `https://your-domain/orders/webhook`

---

## 🔄 For Local Testing with ngrok

1. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

2. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

3. **Enter in PhonePe Dashboard:**
   ```
   https://abc123.ngrok.io/orders/webhook
   ```

4. **Update `.env`:**
   ```env
   APP_BASE_URL=https://abc123.ngrok.io
   ```

---

**After you enter these details in PhonePe dashboard, let me know and I'll update the code to properly validate the webhook using username/password!**

