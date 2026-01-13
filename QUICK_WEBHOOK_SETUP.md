# Quick Webhook Setup - Step by Step

## Your Configuration Values

Based on your requirements:

- **Username:** `yawmiy_webhook_2026`
- **Password:** `YawmiyWebhook2026` (alphanumeric)
- **Description:** `Yawmiy Marketplace - Payment Webhook`

---

## Step 1: Get ngrok URL

### Install ngrok (if not installed)
1. Download from: https://ngrok.com/download
2. Extract `ngrok.exe` to a folder

### Get Your HTTPS URL

1. **Start your NestJS server:**
   ```bash
   npm run start:dev
   ```
   Server should be running on `http://localhost:3000`

2. **Open a NEW terminal/PowerShell window**

3. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```
   Or if ngrok is not in PATH:
   ```bash
   C:\path\to\ngrok.exe http 3000
   ```

4. **Copy the HTTPS URL:**
   
   You'll see output like:
   ```
   Forwarding    https://abc123def456.ngrok-free.app -> http://localhost:3000
   ```
   
   **Your ngrok URL is:** `https://abc123def456.ngrok-free.app`
   
   **Copy this URL!** (It will be different each time you restart ngrok)

---

## Step 2: Enter in PhonePe Dashboard

### Webhook URL:
```
https://YOUR-NGROK-URL.ngrok-free.app/orders/webhook
```

**Replace `YOUR-NGROK-URL` with your actual ngrok URL**

**Example:**
```
https://abc123def456.ngrok-free.app/orders/webhook
```

### Username:
```
yawmiy_webhook_2026
```

### Password:
```
YawmiyWebhook2026
```

### Description:
```
Yawmiy Marketplace - Payment Webhook
```

### Active Events:
- ✅ **Payment Success**
- ✅ **Payment Failed**

---

## Step 3: Update .env File

Add these lines to your `.env` file:

```env
# PhonePe Webhook Credentials
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026

# App Base URL (update with your ngrok URL)
APP_BASE_URL=https://YOUR-NGROK-URL.ngrok-free.app
```

**Replace `YOUR-NGROK-URL` with your actual ngrok URL**

**Example:**
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
APP_BASE_URL=https://abc123def456.ngrok-free.app
```

---

## Step 4: Restart Server

After updating `.env`:

```bash
npm run start:dev
```

---

## Step 5: Verify Setup

### Check ngrok is Working
Visit in browser:
```
https://YOUR-NGROK-URL.ngrok-free.app
```
Should show your NestJS app

### Check Webhook Endpoint
Visit:
```
https://YOUR-NGROK-URL.ngrok-free.app/orders/webhook
```
Should return an error (expected - needs POST request)

### View ngrok Requests
Visit: `http://127.0.0.1:4040`
- See all incoming requests
- Useful for debugging webhook calls

---

## Complete Example

**After running `ngrok http 3000`, you get:**
```
https://abc123def456.ngrok-free.app
```

**Enter in PhonePe Dashboard:**
- **Webhook URL:** `https://abc123def456.ngrok-free.app/orders/webhook`
- **Username:** `yawmiy_webhook_2026`
- **Password:** `YawmiyWebhook2026`
- **Description:** `Yawmiy Marketplace - Payment Webhook`

**Add to `.env`:**
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
APP_BASE_URL=https://abc123def456.ngrok-free.app
```

---

## Important Notes

1. **Keep ngrok running** - If you close ngrok, the URL stops working
2. **URL changes** - Free ngrok URLs change each time you restart. Update PhonePe webhook URL if it changes
3. **HTTPS required** - PhonePe requires HTTPS, which ngrok provides
4. **Test webhook** - PhonePe will send a test webhook after creation. Check server logs for validation

---

## Troubleshooting

**"ngrok: command not found"**
- Use full path: `C:\path\to\ngrok.exe http 3000`
- Or add ngrok folder to Windows PATH

**"Port 3000 already in use"**
- Change port in `.env`: `PORT=3001`
- Run: `ngrok http 3001`

**Webhook not received**
- Check ngrok is running
- Check URL in PhonePe matches ngrok URL
- Check server is running
- Visit `http://127.0.0.1:4040` to see incoming requests

---

**That's it!** Follow these steps to get your ngrok URL and configure the webhook.






