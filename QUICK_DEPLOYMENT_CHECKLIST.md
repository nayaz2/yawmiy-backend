# Quick Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Test Files Status
- ✅ `src/auth/auth.service.spec.ts` - Created with all test cases
- ✅ `src/listings/listings.service.spec.ts` - Created
- ✅ `src/orders/orders.service.spec.ts` - Created
- ✅ `src/scouts/scouts.service.spec.ts` - Created

### 2. Run Tests
```bash
npm test
```
**Expected**: All tests should pass ✅

### 3. Build Verification
```bash
npm run build
```
**Expected**: Build succeeds, creates `dist/` folder ✅

---

## 🚀 Render Deployment Steps

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up for free account
3. Verify email

### Step 2: Connect GitHub Repository
1. In Render Dashboard, click **New** → **Web Service**
2. Click **Connect GitHub**
3. Authorize Render to access your repositories
4. Select repository: `yawmiy-backend`
5. Click **Connect**

### Step 3: Configure Service (Auto-detected from render.yaml)

**Render will auto-detect `render.yaml` and use these settings:**

- **Name**: `yawmiy-backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build` ✅
- **Start Command**: `npm run start:prod` ✅
- **Plan**: Starter (Free tier)

**OR manually configure:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`
- **Environment**: `Node`

### Step 4: Create Database

1. In Render Dashboard, click **New** → **PostgreSQL**
2. Configure:
   - **Name**: `yawmiy-db`
   - **Database**: `yawmiy`
   - **User**: `yawmiy_user`
   - **Plan**: Starter (Free tier)
3. Click **Create Database**
4. **Copy the Internal Database URL** (you'll need this)

### Step 5: Add Environment Variables

Go to your Web Service → **Environment** tab → Add these variables:

#### Database
```
DATABASE_URL=<Internal Database URL from Render>
```

#### JWT
```
JWT_SECRET=<Generate a strong random secret>
NODE_ENV=production
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### PhonePe Configuration
```
PHONEPE_MERCHANT_ID=<Your merchant ID>
PHONEPE_SALT_KEY=<Your salt key>
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg-sandbox
APP_BASE_URL=<Will be your Render URL - update after deployment>
```

#### PhonePe SDK
```
PHONEPE_CLIENT_ID=<Your client ID>
PHONEPE_CLIENT_SECRET=<Your client secret>
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=PRODUCTION
```

#### PhonePe Webhook
```
PHONEPE_WEBHOOK_USERNAME=<Your webhook username>
PHONEPE_WEBHOOK_PASSWORD=<Your webhook password>
```

### Step 6: Deploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for build to complete (2-5 minutes)
3. Check **Logs** tab for any errors
4. Service will be available at: `https://yawmiy-backend-xxx.onrender.com`

### Step 7: Update APP_BASE_URL

After deployment, update `APP_BASE_URL` environment variable:
```
APP_BASE_URL=https://yawmiy-backend-xxx.onrender.com
```
Then **Redeploy** the service.

### Step 8: Update PhonePe Webhook

1. Go to PhonePe Merchant Dashboard
2. Navigate to **Webhooks** section
3. Update webhook URL to:
   ```
   https://yawmiy-backend-xxx.onrender.com/orders/webhook
   ```
4. Save credentials

### Step 9: Test Production API

```bash
# Test health endpoint
curl https://yawmiy-backend-xxx.onrender.com

# Test registration
curl -X POST https://yawmiy-backend-xxx.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "Test123!",
    "student_id": "12345678",
    "name": "Test User"
  }'
```

---

## 📋 Environment Variables Checklist

Copy this list and check off as you add:

- [ ] `DATABASE_URL` (from Render database)
- [ ] `JWT_SECRET` (generate random)
- [ ] `NODE_ENV=production`
- [ ] `PHONEPE_MERCHANT_ID`
- [ ] `PHONEPE_SALT_KEY`
- [ ] `PHONEPE_SALT_INDEX=1`
- [ ] `PHONEPE_BASE_URL`
- [ ] `APP_BASE_URL` (update after deployment)
- [ ] `PHONEPE_CLIENT_ID`
- [ ] `PHONEPE_CLIENT_SECRET`
- [ ] `PHONEPE_CLIENT_VERSION=1`
- [ ] `PHONEPE_ENV=PRODUCTION`
- [ ] `PHONEPE_WEBHOOK_USERNAME`
- [ ] `PHONEPE_WEBHOOK_PASSWORD`

---

## 🔍 Troubleshooting

### Build Fails
- Check **Logs** tab in Render
- Verify `package.json` has all dependencies
- Run `npm run build` locally first

### Service Won't Start
- Check **Logs** tab
- Verify `DATABASE_URL` is correct
- Verify all environment variables are set
- Check `dist/main.js` exists after build

### Database Connection Error
- Use **Internal Database URL** (not public)
- Verify database is created and running
- Check `DATABASE_URL` format is correct

### 401/403 Errors
- Verify `JWT_SECRET` is set
- Check token is being sent in Authorization header

---

## 📝 Post-Deployment

1. ✅ Test all endpoints
2. ✅ Update PhonePe webhook URL
3. ✅ Monitor logs for errors
4. ✅ Set up monitoring/alerts (optional)
5. ✅ Configure custom domain (optional)

---

## 🎯 Quick Commands

```bash
# Run tests locally
npm test

# Build locally
npm run build

# Test production API
curl https://yawmiy-backend-xxx.onrender.com
```

---

## 📚 Additional Resources

- **Full Deployment Guide**: `RENDER_DEPLOYMENT_GUIDE.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **Production Checklist**: `PRODUCTION_READINESS_CHECKLIST.md`

---

**Your service will be live at: `https://yawmiy-backend-xxx.onrender.com`** 🚀






