# Render Deployment Guide

## Overview

This guide explains how to deploy the Yawmiy Backend to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare all required environment variables

---

## Step 1: Prepare Your Repository

### 1.1 Ensure `render.yaml` is in root

The `render.yaml` file should be in the root of your repository:
```
yawmiy-backend/
├── render.yaml
├── package.json
├── src/
└── ...
```

### 1.2 Update `package.json` Scripts

Ensure these scripts exist:
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main"
  }
}
```

---

## Step 2: Create Database on Render

### 2.1 Create PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Configure:
   - **Name**: `yawmiy-db`
   - **Database**: `yawmiy`
   - **User**: `yawmiy_user`
   - **Plan**: Starter (or higher for production)
3. Click **Create Database**
4. **Save the connection string** (Internal Database URL)

---

## Step 3: Deploy Web Service

### 3.1 Connect Repository

1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Select the `yawmiy-backend` repository

### 3.2 Configure Service

**Basic Settings:**
- **Name**: `yawmiy-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your production branch)
- **Root Directory**: Leave empty (root)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

**Or use `render.yaml` (Recommended):**
- Render will auto-detect `render.yaml` and use those settings

---

## Step 4: Configure Environment Variables

### 4.1 Required Environment Variables

Go to your Web Service → **Environment** tab and add:

#### Database
```
DATABASE_URL=<Internal Database URL from Render>
```

#### JWT
```
JWT_SECRET=<Generate a strong random secret>
NODE_ENV=production
```

#### PhonePe Configuration

**For Sandbox/Testing:**
```
PHONEPE_MERCHANT_ID=M232G4O6KU7K2_2601012107
PHONEPE_SALT_KEY=OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
APP_BASE_URL=https://yawmiy-backend-xxx.onrender.com
```

**For Production:**
```
PHONEPE_MERCHANT_ID=<Get from PhonePe Production Dashboard>
PHONEPE_SALT_KEY=<Get from PhonePe Production Dashboard>
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg-sandbox
APP_BASE_URL=https://yawmiy-backend-xxx.onrender.com
```

**Note:** Replace `yawmiy-backend-xxx.onrender.com` with your actual Render service URL after deployment.

#### PhonePe SDK

**For Sandbox/Testing:**
```
PHONEPE_CLIENT_ID=M232G4O6KU7K2_2601012107
PHONEPE_CLIENT_SECRET=OWJjZmE2NTItMDA4Yi00YTUxLWJiMjItZmQ2ZjA3MDE5NDI5
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX
```

**For Production:**
```
PHONEPE_CLIENT_ID=<Get from PhonePe Production Dashboard>
PHONEPE_CLIENT_SECRET=<Get from PhonePe Production Dashboard>
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=PRODUCTION
```

#### PhonePe Webhook
```
PHONEPE_WEBHOOK_USERNAME=yawmiy_webhook_2026
PHONEPE_WEBHOOK_PASSWORD=YawmiyWebhook2026
```

**Note:** These are the credentials you set in the PhonePe dashboard. Use the same values in both sandbox and production.

### 4.2 Generate JWT Secret

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.3 Update APP_BASE_URL

After deployment, update `APP_BASE_URL` to your Render service URL:
```
APP_BASE_URL=https://yawmiy-backend.onrender.com
```

---

## Step 5: Deploy

### 5.1 Manual Deploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for build to complete
3. Check logs for any errors

### 5.2 Automatic Deploy

- Render automatically deploys on every push to the selected branch
- Enable **Auto-Deploy** in service settings

---

## Step 6: Verify Deployment

### 6.1 Check Health

```bash
curl https://yawmiy-backend.onrender.com
```

### 6.2 Test Endpoints

```bash
# Test registration
curl -X POST https://yawmiy-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "Test123!",
    "student_id": "12345678",
    "name": "Test User"
  }'
```
or on Powershell
```bash
# Test registration
Invoke-WebRequest `
  -Uri "https://yawmiy-backend.onrender.com/auth/register" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"test@university.edu","password":"Test123!","student_id":"12345678","name":"Test User"}'
```

```bash
# Test Login
Invoke-WebRequest `
  -Uri "https://yawmiy-backend.onrender.com/auth/login" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"test@university.edu","password":"Test123!"}'
```

---

## Step 7: Update PhonePe Webhook URL

### 7.1 Get Your Webhook URL

Your webhook URL will be:
```
https://yawmiy-backend.onrender.com/orders/webhook
```

### 7.2 Update in PhonePe Dashboard

1. Go to PhonePe Merchant Dashboard
2. Navigate to **Webhooks** section
3. Update webhook URL to your Render service URL
4. Save credentials (username/password)

---

## Step 8: Database Migrations

### 8.1 TypeORM Synchronize

**⚠️ WARNING**: `synchronize: true` is for development only!

For production:
1. **Disable** `synchronize: true` in `app.module.ts`
2. Use **migrations** instead

### 8.2 Create Migrations

```bash
npm run typeorm migration:generate -- -n InitialMigration
npm run typeorm migration:run
```

---

## Troubleshooting

### Build Fails

**Error**: `Cannot find module`
- **Solution**: Ensure all dependencies are in `package.json`

**Error**: `TypeScript compilation errors`
- **Solution**: Fix TypeScript errors locally first
- Run `npm run build` locally to verify

### Runtime Errors

**Error**: `Database connection failed`
- **Solution**: Check `DATABASE_URL` is correct
- Use **Internal Database URL** (not public)

**Error**: `JWT_SECRET not set`
- **Solution**: Add `JWT_SECRET` environment variable

**Error**: `PhonePe API errors`
- **Solution**: Verify all PhonePe credentials are set
- Check `PHONEPE_ENV` is set to `PRODUCTION` for production

### Service Won't Start

1. Check **Logs** tab in Render dashboard
2. Verify `startCommand` is correct
3. Ensure `dist/main.js` exists after build

---

## Environment Variables Checklist

- [ ] `DATABASE_URL` (from Render database)
- [ ] `JWT_SECRET` (generate secure random)
- [ ] `NODE_ENV=production`
- [ ] `PHONEPE_MERCHANT_ID`
- [ ] `PHONEPE_SALT_KEY`
- [ ] `PHONEPE_SALT_INDEX=1`
- [ ] `PHONEPE_BASE_URL`
- [ ] `APP_BASE_URL` (your Render service URL)
- [ ] `PHONEPE_CLIENT_ID`
- [ ] `PHONEPE_CLIENT_SECRET`
- [ ] `PHONEPE_CLIENT_VERSION=1`
- [ ] `PHONEPE_ENV=PRODUCTION`
- [ ] `PHONEPE_WEBHOOK_USERNAME`
- [ ] `PHONEPE_WEBHOOK_PASSWORD`

---

## Production Checklist

Before going live:

- [ ] Disable `synchronize: true` in TypeORM config
- [ ] Set up database migrations
- [ ] Use strong `JWT_SECRET`
- [ ] Set `PHONEPE_ENV=PRODUCTION`
- [ ] Update `APP_BASE_URL` to production URL
- [ ] Update PhonePe webhook URL
- [ ] Enable HTTPS (Render does this automatically)
- [ ] Set up monitoring/logging
- [ ] Test all endpoints
- [ ] Review `PRODUCTION_READINESS_CHECKLIST.md`

---

## Render Service URLs

After deployment, your service will be available at:
```
https://yawmiy-backend.onrender.com
```

**Note**: Free tier services spin down after 15 minutes of inactivity. Consider upgrading to a paid plan for production.

---

## Next Steps

1. Set up **custom domain** (optional)
2. Configure **SSL certificates** (automatic on Render)
3. Set up **monitoring** and **alerts**
4. Configure **backup strategy** for database
5. Review security settings

---

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Render Support: support@render.com


