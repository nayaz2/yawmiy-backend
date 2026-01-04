# ngrok Setup Guide for Local Webhook Testing

## What is ngrok?

ngrok creates a secure tunnel from a public URL to your local server. This allows PhonePe to send webhooks to your local development server.

---

## Step 1: Install ngrok

### Option A: Download from Website
1. Go to: https://ngrok.com/download
2. Download for Windows
3. Extract the `ngrok.exe` file
4. Place it in a folder (e.g., `C:\ngrok\`)

### Option B: Using Package Manager
```powershell
# Using Chocolatey (if installed)
choco install ngrok

# Using Scoop (if installed)
scoop install ngrok
```

---

## Step 2: Get Your ngrok URL

### Step 2.1: Start Your NestJS Server
```bash
npm run start:dev
```
Your server should be running on `http://localhost:3000`

### Step 2.2: Start ngrok
Open a **new terminal/PowerShell window** and run:

```bash
ngrok http 3000
```

**Or if ngrok is not in PATH:**
```bash
C:\path\to\ngrok.exe http 3000
```

### Step 2.3: Get Your HTTPS URL

After running ngrok, you'll see output like this:

```
ngrok                                                                            

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Your HTTPS URL is:**
```
https://abc123def456.ngrok-free.app
```

**Copy this URL!** It will be different each time you restart ngrok (unless you have a paid plan with a fixed domain).

---

## Step 3: Complete Webhook URL

Your complete webhook URL will be:

```
https://abc123def456.ngrok-free.app/orders/webhook
```

**Replace `abc123def456.ngrok-free.app` with YOUR ngrok URL!**

---

## Step 4: Enter in PhonePe Dashboard

### Webhook URL:
```
https://YOUR-NGROK-URL.ngrok-free.app/orders/webhook
```

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
- ✅ Payment Success
- ✅ Payment Failed

---

## Step 5: Update Your .env File

Add these lines to your `.env` file:

```env
# PhonePe Webhook Credentials
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026

# App Base URL (update with your ngrok URL)
APP_BASE_URL=https://YOUR-NGROK-URL.ngrok-free.app
```

**Example:**
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
APP_BASE_URL=https://abc123def456.ngrok-free.app
```

---

## Step 6: Restart Your Server

After updating `.env`:

```bash
npm run start:dev
```

---

## Important Notes

### 1. ngrok URL Changes
- **Free plan:** URL changes every time you restart ngrok
- **Solution:** Update PhonePe webhook URL each time, OR get a paid ngrok plan for a fixed domain

### 2. Keep ngrok Running
- **Keep ngrok running** while testing webhooks
- If you close ngrok, the URL stops working
- PhonePe won't be able to send webhooks if ngrok is stopped

### 3. ngrok Web Interface
- Visit `http://127.0.0.1:4040` in your browser
- See all requests coming through ngrok
- Useful for debugging webhook calls

### 4. ngrok Warning Page
- First-time visitors may see an ngrok warning page
- PhonePe webhooks should work, but you may need to click "Visit Site" first
- Consider upgrading to ngrok paid plan to remove warning

---

## Testing the Webhook

### 1. Check ngrok is Forwarding
Visit in browser:
```
https://YOUR-NGROK-URL.ngrok-free.app
```
Should show your NestJS app (or 404 if no root route)

### 2. Test Webhook Endpoint
Visit:
```
https://YOUR-NGROK-URL.ngrok-free.app/orders/webhook
```
Should return an error (expected - needs POST request with payload)

### 3. Check ngrok Web Interface
Visit: `http://127.0.0.1:4040`
- See all incoming requests
- View request/response details
- Useful for debugging

### 4. Test Payment Flow
1. Create an order
2. Initiate payment
3. Complete payment on PhonePe
4. Check ngrok interface for webhook call
5. Check server logs for validation message

---

## Troubleshooting

### "ngrok: command not found"
- ngrok is not in your PATH
- Use full path: `C:\path\to\ngrok.exe http 3000`
- Or add ngrok folder to Windows PATH

### "Port 3000 already in use"
- Another process is using port 3000
- Change NestJS port in `.env`: `PORT=3001`
- Then run: `ngrok http 3001`

### "Webhook not received"
- Check ngrok is running
- Check ngrok URL is correct in PhonePe dashboard
- Check server is running on correct port
- Check ngrok web interface for incoming requests

### "Invalid webhook credentials"
- Verify username/password in `.env` match PhonePe dashboard
- Restart server after updating `.env`
- Check server logs for validation errors

---

## Quick Start Commands

```bash
# Terminal 1: Start your server
npm run start:dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the HTTPS URL from ngrok output
# Enter in PhonePe dashboard: https://YOUR-URL.ngrok-free.app/orders/webhook
# Add credentials to .env file
# Restart server
```

---

## Your Specific Configuration

Based on your values:

**PhonePe Dashboard:**
- **Webhook URL:** `https://YOUR-NGROK-URL.ngrok-free.app/orders/webhook`
- **Username:** `yawmiy_webhook_2026`
- **Password:** `YawmiyWebhook2026`
- **Description:** `Yawmiy Marketplace - Payment Webhook`

**Your `.env` file:**
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
APP_BASE_URL=https://YOUR-NGROK-URL.ngrok-free.app
```

---

**Ready to test!** Follow the steps above to get your ngrok URL and configure the webhook.

