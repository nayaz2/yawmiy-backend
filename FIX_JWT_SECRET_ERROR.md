# Fix: JWT_SECRET Error on Render Deployment

## Error Message
```
TypeError: JwtStrategy requires a secret or key
```

## Cause
The `JWT_SECRET` environment variable is not set in Render's environment variables.

## Solution

### Step 1: Add JWT_SECRET in Render Dashboard

1. Go to your **Render Dashboard**
2. Select your **Web Service** (`yawmiy-backend`)
3. Click on **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `JWT_SECRET`
   - **Value**: Generate a secure random secret (see below)

### Step 2: Generate JWT Secret

**Option 1: Using Node.js (Local)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using Online Tool**
- Visit: https://www.random.org/strings/
- Generate a random string (32+ characters)
- Or use: https://generate-secret.vercel.app/32

**Option 3: Using OpenSSL**
```bash
openssl rand -hex 32
```

### Step 3: Add to Render

1. Copy the generated secret
2. In Render Dashboard → Environment → Add:
   ```
   JWT_SECRET=<your-generated-secret>
   ```
3. **Save** the environment variable
4. **Redeploy** your service

### Step 4: Verify

After redeployment, check the logs. You should see:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
...
[Nest] LOG [NestFactory] Nest application successfully started
```

## Code Changes Made

The code has been updated to provide better error messages if `JWT_SECRET` is missing:

1. **`src/auth/jwt.strategy.ts`** - Added validation with clear error message
2. **`src/auth/auth.module.ts`** - Added validation in JWT module configuration

If `JWT_SECRET` is missing, you'll now see:
```
Error: JWT_SECRET is not defined. Please set JWT_SECRET environment variable.
```

## Required Environment Variables Checklist

Make sure these are set in Render:

- [x] `JWT_SECRET` ← **This was missing!**
- [ ] `DATABASE_URL` (auto-filled by Render)
- [ ] `NODE_ENV=production`
- [ ] `PHONEPE_CLIENT_ID`
- [ ] `PHONEPE_CLIENT_SECRET`
- [ ] `PHONEPE_ENV=SANDBOX` (or `PRODUCTION`)
- [ ] `APP_BASE_URL` (your Render service URL)
- [ ] All other PhonePe variables

## Quick Fix Command

If you have access to Render CLI or want to set it via API:

```bash
# Generate secret
SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Add to Render (if using Render CLI)
render env:set JWT_SECRET=$SECRET
```

## After Fixing

1. ✅ Add `JWT_SECRET` to Render environment variables
2. ✅ Redeploy the service
3. ✅ Verify logs show successful startup
4. ✅ Test an API endpoint to confirm JWT authentication works

## Testing

After deployment, test the registration endpoint:

```bash
curl -X POST https://your-app.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "Test123!",
    "student_id": "12345678",
    "name": "Test User"
  }'
```

If successful, you should get:
```json
{
  "message": "Registration successful"
}
```

## Related Files

- `RENDER_ENV_VALUES.md` - Complete list of environment variables
- `RENDER_DEPLOYMENT_GUIDE.md` - Full deployment guide





