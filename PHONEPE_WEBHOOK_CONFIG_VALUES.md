# PhonePe Webhook Configuration - Exact Values to Enter

## 📝 Fill These Values in PhonePe Dashboard

### 1. **Webhook URL**

**For Local Testing (with ngrok):**
```
https://YOUR-NGROK-URL.ngrok-free.app/orders/webhook
```

**How to get ngrok URL:**
1. Install ngrok from https://ngrok.com/download
2. Start your server: `npm run start:dev`
3. In a new terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL from the output (e.g., `https://abc123def456.ngrok-free.app`)
5. Add `/orders/webhook` to the end

**Example:**
```
https://abc123def456.ngrok-free.app/orders/webhook
```

**⚠️ Note:** ngrok URL changes each time you restart ngrok (free plan). Update PhonePe webhook URL if it changes.

**For Production:**
```
https://your-domain.com/orders/webhook
```

**Important:** 
- ✅ Must be HTTPS
- ✅ Must end with `/orders/webhook`
- ✅ Must be publicly accessible

---

### 2. **Username**

**Enter:**
```
yawmiy_webhook_2026
```

**⚠️ Save this value** - You'll need to add it to your `.env` file as:
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
```

---

### 3. **Password**

**Enter (alphanumeric only):**
```
YawmiyWebhook2026
```

**⚠️ Save this value** - You'll need to add it to your `.env` file as:
```env
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
```

**🔒 Security:** Never commit this to git! Keep it in `.env` only.

---

### 4. **Description**

**Enter:**
```
Yawmiy Marketplace - Payment Webhook
```

**This is optional but recommended for organization.**

---

### 5. **Active Events**

**Select these events:**

✅ **Payment Success** - When payment is successful  
✅ **Payment Failed** - When payment fails  
✅ **Payment Pending** - (Optional) When payment is pending

**Minimum Required:**
- ✅ Payment Success (required)
- ✅ Payment Failed (recommended)

---

## 🔧 After Entering in PhonePe Dashboard

### Step 1: Add to `.env` File

Add these two lines to your `.env` file:

```env
# PhonePe Webhook Credentials (set in PhonePe dashboard)
PHONEPE_WEBHOOK_USERNAME=your_username_from_dashboard
PHONEPE_WEBHOOK_PASSWORD=your_password_from_dashboard
```

**Example:**
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
APP_BASE_URL=https://abc123def456.ngrok-free.app
```

### Step 2: Restart Server

```bash
npm run start:dev
```

### Step 3: Test Webhook

PhonePe will send a test webhook after you create it. Check your server logs to verify it's received and validated.

---

## 📋 Complete Example

**In PhonePe Dashboard:**
```
Webhook URL:    https://YOUR-NGROK-URL.ngrok-free.app/orders/webhook
Username:       yawmiy_webhook_2026
Password:       YawmiyWebhook2026
Description:    Yawmiy Marketplace - Payment Webhook
Active Events:  ✅ Payment Success, ✅ Payment Failed
```

**In your `.env` file:**
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
APP_BASE_URL=https://YOUR-NGROK-URL.ngrok-free.app
```

**Replace `YOUR-NGROK-URL` with the actual ngrok URL you get from running `ngrok http 3000`**

---

## 🚨 Important Notes

1. **Username & Password:** These are credentials YOU set in PhonePe dashboard, NOT your PhonePe account credentials.

2. **Keep Them Secret:** Store username/password in `.env` file only. Never commit to git.

3. **HTTPS Required:** PhonePe requires HTTPS. Use ngrok for local testing.

4. **Webhook URL Format:** Must match exactly: `https://domain/orders/webhook`

5. **Code is Ready:** ✅ The webhook handler is already updated to use these credentials for validation.

---

## ✅ Verification

After setup, you should see in server logs:
```
✅ Webhook validated successfully using SDK
```

If you see:
```
❌ Webhook validation failed
```

Check:
- Username/password match what you set in PhonePe dashboard
- Environment variables are set correctly
- Server was restarted after adding env variables

---

**Ready to configure!** Enter these values in PhonePe dashboard and add the credentials to your `.env` file.

