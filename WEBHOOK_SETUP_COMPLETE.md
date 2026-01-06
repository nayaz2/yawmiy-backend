# ✅ Webhook Setup Complete

## Configuration Summary

### PhonePe Dashboard Configuration
- **Webhook URL:** `https://degradable-precedented-joya.ngrok-free.dev/orders/webhook`
  - ⚠️ **Important:** Make sure the URL in PhonePe dashboard includes `/orders/webhook` at the end!
- **Username:** `yawmiy_webhook_2026`
- **Password:** `YawmiyWebhook2026`
- **Description:** `Yawmiy Marketplace - Payment Webhook`
- **Active Events:**
  - ✅ `paylink.order.completed` (Payment Success)
  - ✅ `paylink.order.failed` (Payment Failed)

### .env File Updated
```env
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
APP_BASE_URL=https://degradable-precedented-joya.ngrok-free.dev
```

---

## ⚠️ Important: Verify Webhook URL in PhonePe

**Make sure your PhonePe webhook URL is:**
```
https://degradable-precedented-joya.ngrok-free.dev/orders/webhook
```

**NOT just:**
```
https://degradable-precedented-joya.ngrok-free.dev
```

The `/orders/webhook` path is required for the webhook to reach your endpoint!

---

## Next Steps

### 1. Restart Your Server
```bash
npm run start:dev
```

### 2. Verify Webhook is Working

#### Check ngrok is Running
- Keep the terminal with `ngrok http 3000` running
- If you close it, the URL will stop working

#### Test Webhook Endpoint
Visit in browser:
```
https://degradable-precedented-joya.ngrok-free.dev/orders/webhook
```
Should return an error (expected - needs POST request with payload)

#### Monitor ngrok Requests
Visit: `http://127.0.0.1:4040`
- See all incoming requests
- View webhook calls from PhonePe

### 3. Test Payment Flow

1. **Create an order:**
   ```http
   POST /orders
   Authorization: Bearer YOUR_TOKEN
   Body: { "listing_id": "...", "meeting_location": "Campus" }
   ```

2. **Initiate payment:**
   ```http
   POST /orders/{order_id}/payment
   Authorization: Bearer YOUR_TOKEN
   ```

3. **Complete payment on PhonePe:**
   - Open the `payment_url` from response
   - Complete payment on PhonePe

4. **Check webhook received:**
   - Check ngrok interface: `http://127.0.0.1:4040`
   - Check server logs for: `✅ Webhook validated successfully using SDK`
   - Check order status should be `escrowed`

---

## Expected Server Logs

### When Webhook is Received:
```
✅ Webhook validated successfully using SDK
```

### If Validation Fails:
```
❌ Webhook validation failed: [error details]
```

### If Credentials Not Set:
```
⚠️  Webhook username/password not set. Using basic signature verification.
```

---

## Troubleshooting

### Webhook Not Received
1. **Check ngrok is running:**
   - Terminal with `ngrok http 3000` must be open
   - If closed, restart and update PhonePe webhook URL

2. **Check webhook URL in PhonePe:**
   - Must be: `https://degradable-precedented-joya.ngrok-free.dev/orders/webhook`
   - Must include `/orders/webhook` at the end

3. **Check server is running:**
   - Server should be on `http://localhost:3000`
   - Check server logs for errors

4. **Check ngrok web interface:**
   - Visit: `http://127.0.0.1:4040`
   - See if webhook requests are coming through

### "Invalid webhook credentials"
1. **Verify username/password in `.env`:**
   ```env
   PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
   PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
   ```

2. **Verify they match PhonePe dashboard:**
   - Username: `yawmiy_webhook_2026`
   - Password: `YawmiyWebhook2026`

3. **Restart server** after updating `.env`

### ngrok URL Changed
- If you restart ngrok, you'll get a new URL
- Update PhonePe webhook URL with the new ngrok URL
- Update `APP_BASE_URL` in `.env` file

---

## Current Configuration

**ngrok URL:**
```
https://degradable-precedented-joya.ngrok-free.dev
```

**Complete Webhook URL:**
```
https://degradable-precedented-joya.ngrok-free.dev/orders/webhook
```

**Webhook Credentials:**
- Username: `yawmiy_webhook_2026`
- Password: `YawmiyWebhook2026`

**Environment Variables:**
- ✅ `PHONEPE_WEBHOOK_USERNAME` - Set
- ✅ `PHONEPE_WEBHOOK_PASSWORD` - Set
- ✅ `APP_BASE_URL` - Updated to ngrok URL

---

## ✅ Setup Complete!

Your webhook is configured and ready to receive payment notifications from PhonePe.

**Remember:**
- Keep ngrok running while testing
- Webhook URL in PhonePe must include `/orders/webhook`
- Restart server after updating `.env`

**Ready to test!** Try creating an order and completing a payment to see the webhook in action.




