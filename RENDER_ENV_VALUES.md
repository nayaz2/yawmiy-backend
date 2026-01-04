# Render Environment Variables - Exact Values to Enter

## 📋 Quick Reference for Render Dashboard

When setting up environment variables in Render, use these values:

---

## 🔵 For Sandbox/Testing (Current Setup)

### PhonePe Configuration
```
PHONEPE_MERCHANT_ID=M232G4O6KU7K2_2601012107
PHONEPE_SALT_KEY=OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

### PhonePe SDK
```
PHONEPE_CLIENT_ID=M232G4O6KU7K2_2601012107
PHONEPE_CLIENT_SECRET=OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX
```

### PhonePe Webhook
```
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
```

### App Configuration
```
APP_BASE_URL=https://yawmiy-backend-xxx.onrender.com
```
**⚠️ Important:** Replace `yawmiy-backend-xxx.onrender.com` with your actual Render service URL after deployment.

---

## 🟢 For Production (After Getting Production Credentials)

### PhonePe Configuration
```
PHONEPE_MERCHANT_ID=<Get from PhonePe Production Dashboard>
PHONEPE_SALT_KEY=<Get from PhonePe Production Dashboard>
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg-sandbox
```

### PhonePe SDK
```
PHONEPE_CLIENT_ID=<Get from PhonePe Production Dashboard>
PHONEPE_CLIENT_SECRET=<Get from PhonePe Production Dashboard>
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=PRODUCTION
```

### PhonePe Webhook
```
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
```

### App Configuration
```
APP_BASE_URL=https://yawmiy-backend-xxx.onrender.com
```

---

## 📝 Other Required Variables

### ⚠️ CRITICAL: JWT Secret (Required for App to Start)

**This is REQUIRED - the app will fail to start without it!**

```
JWT_SECRET=<Generate a strong random secret>
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

Copy the entire output and use it as the value for `JWT_SECRET`.

### Database
```
DATABASE_URL=<Auto-filled by Render when you connect the database>
```
**Note:** Render automatically provides this when you connect a PostgreSQL database.

### Environment
```
NODE_ENV=production
```

---

## 🔄 Step-by-Step: Adding Variables in Render

1. **Go to your Web Service** in Render Dashboard
2. Click on **Environment** tab
3. Click **Add Environment Variable**
4. Enter each variable one by one:

   | Variable Name | Value |
   |--------------|-------|
   | `PHONEPE_MERCHANT_ID` | `M232G4O6KU7K2_2601012107` |
   | `PHONEPE_SALT_KEY` | `OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5` |
   | `PHONEPE_SALT_INDEX` | `1` |
   | `PHONEPE_BASE_URL` | `https://api-preprod.phonepe.com/apis/pg-sandbox` |
   | `PHONEPE_CLIENT_ID` | `M232G4O6KU7K2_2601012107` |
   | `PHONEPE_CLIENT_SECRET` | `OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5` |
   | `PHONEPE_CLIENT_VERSION` | `1` |
   | `PHONEPE_ENV` | `SANDBOX` (or `PRODUCTION` for production) |
   | `PHONEPE_WEBHOOK_USERNAME` | `yawmiy_webhook_2026` |
   | `PHONEPE_WEBHOOK_PASSWORD` | `YawmiyWebhook2026` |
   | `APP_BASE_URL` | `https://yawmiy-backend-xxx.onrender.com` (your actual URL) |
   | **`JWT_SECRET`** | **`<Generate using command above>`** ⚠️ **REQUIRED** |
   | `NODE_ENV` | `production` |

5. **After deployment**, update `APP_BASE_URL` with your actual Render URL
6. **Save** and **Redeploy** if needed

---

## ⚠️ Important Notes

1. **APP_BASE_URL**: Update this AFTER deployment with your actual Render service URL
2. **For Production**: You'll need to get production credentials from PhonePe Merchant Dashboard
3. **Webhook URL**: After deployment, update PhonePe webhook URL to:
   ```
   https://yawmiy-backend-xxx.onrender.com/orders/webhook
   ```
4. **Database URL**: Render automatically provides this when you connect the database
5. **Never commit secrets**: These values should only be in Render's environment variables, never in code

---

## ✅ Verification Checklist

After adding all variables:

- [ ] All PhonePe variables added
- [ ] `APP_BASE_URL` updated with actual Render URL
- [ ] `JWT_SECRET` generated and added
- [ ] `NODE_ENV` set to `production`
- [ ] `DATABASE_URL` auto-filled by Render
- [ ] PhonePe webhook URL updated in PhonePe dashboard
- [ ] Service redeployed after adding variables

---

## 🔗 Related Files

- `RENDER_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `render.yaml` - Infrastructure as code (auto-configures some settings)

