# Testing Admin Endpoints in Postman - Step by Step

## 🎯 Quick Start

### Step 1: Create an Admin User

#### ✅ Option A: Via Postman (EASIEST - NO DATABASE NEEDED!)

**Create First Admin Directly from Postman:**

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/admin/setup/first-admin`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "email": "admin@university.edu",
    "password": "Admin123!"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "message": "First admin user created successfully",
  "user": {
    "id": 1,
    "email": "admin@university.edu",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**⚠️ Important Notes:**
- This endpoint works **WITHOUT authentication** (no token needed)
- Can only be used **once** - if an admin already exists, it will fail
- If the email already exists, it will **promote that user to admin**
- After creating the first admin, use regular admin endpoints to create more

#### Option B: Via Database (If you prefer SQL)

1. **Register a user normally:**
   ```
   POST http://localhost:3000/auth/register
   Content-Type: application/json
   
   {
     "email": "admin@university.edu",
     "password": "Admin123!",
     "student_id": "99999999",
     "name": "Admin User"
   }
   ```

2. **Update role in database:**
   - Connect to your database
   - Run:
     ```sql
     UPDATE users 
     SET role = 'admin' 
     WHERE email = 'admin@university.edu';
     ```

---

### Step 2: Login as Admin

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/auth/login`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "email": "admin@university.edu",
    "password": "Admin123!"
  }
  ```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@university.edu",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value - you'll need it for all admin requests!

---

## Step 3: Test Admin Endpoints

### Test 1: List All Users ✅

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/admin/users`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  ```

**Replace `YOUR_ADMIN_TOKEN_HERE`** with the token from Step 2.

**Expected Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@university.edu",
      "name": "Admin User",
      "student_id": "99999999",
      "role": "admin",
      "banned": false,
      "banned_at": null,
      "banned_reason": null
    },
    {
      "id": 2,
      "email": "user1@university.edu",
      "name": "John Doe",
      "student_id": "12345678",
      "role": "user",
      "banned": false,
      "banned_at": null,
      "banned_reason": null
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### Test 2: List Users with Filters ✅

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/admin/users?search=john&banned=false&role=user&page=1&limit=10`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  ```

**Query Parameters:**
- `search=john` - Search in name or email
- `banned=false` - Only show non-banned users
- `role=user` - Only show regular users
- `page=1` - Page number
- `limit=10` - Users per page

**Expected:** Filtered list of users

---

### Test 3: Get User Details ✅

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/admin/users/2`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  ```

**Replace `2`** with an actual user ID from your database.

**Expected Response (200 OK):**
```json
{
  "id": 2,
  "email": "user1@university.edu",
  "name": "John Doe",
  "student_id": "12345678",
  "role": "user",
  "banned": false,
  "banned_at": null,
  "banned_reason": null,
  "recruiter_id": null
}
```

---

### Test 4: Ban User ✅

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/admin/users/2/ban`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "reason": "Violation of terms of service - spam listings"
  }
  ```

**Replace `2`** with the user ID you want to ban.

**Expected Response (200 OK):**
```json
{
  "id": 2,
  "email": "user1@university.edu",
  "name": "John Doe",
  "banned": true,
  "banned_at": "2026-01-05T10:00:00.000Z",
  "banned_reason": "Violation of terms of service - spam listings"
}
```

**Verify:** Try logging in as the banned user - should fail!

---

### Test 5: Verify Banned User Cannot Login ✅

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/auth/login`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "email": "user1@university.edu",
    "password": "Password123!"
  }
  ```

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Your account has been banned",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### Test 6: Unban User ✅

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/admin/users/2/unban`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  ```

**Expected Response (200 OK):**
```json
{
  "id": 2,
  "email": "user1@university.edu",
  "name": "John Doe",
  "banned": false,
  "banned_at": null,
  "banned_reason": null
}
```

**Verify:** Banned user can now login again!

---

### Test 7: Promote User to Admin ✅

**Request:**
- Method: `PATCH`
- URL: `http://localhost:3000/admin/users/3/role`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "role": "admin"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "id": 3,
  "email": "newadmin@university.edu",
  "role": "admin"
}
```

**Verify:** User 3 can now access admin endpoints!

---

### Test 8: List Only Banned Users ✅

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/admin/users?banned=true`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  ```

**Expected:** List of only banned users

---

### Test 9: List Only Admins ✅

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/admin/users?role=admin`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  ```

**Expected:** List of only admin users

---

## Error Testing

### Test 10: Access Without Admin Token (Should Fail) ❌

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/admin/users`
- Headers:
  ```
  Authorization: Bearer REGULAR_USER_TOKEN
  ```

**Expected Response (403 Forbidden):**
```json
{
  "message": "Admin access required",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

### Test 11: Access Without Token (Should Fail) ❌

**Request:**
- Method: `GET`
- URL: `http://localhost:3000/admin/users`
- Headers: (No Authorization header)

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### Test 12: Try to Ban Yourself (Should Fail) ❌

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/admin/users/1/ban` (where 1 is your admin ID)
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "reason": "Testing"
  }
  ```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Cannot ban yourself",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### Test 13: Try to Ban Another Admin (Should Fail) ❌

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/admin/users/3/ban` (where 3 is another admin)
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "reason": "Testing"
  }
  ```

**Expected Response (403 Forbidden):**
```json
{
  "message": "Cannot ban admin users",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

## Postman Collection Setup

### Option 1: Use Existing Collection

1. **Import Collection:**
   - Open Postman
   - Click **Import**
   - Select `Yawmiy-Backend.postman_collection.json`
   - The "Admin" folder is already included!

2. **Set Admin Token:**
   - Go to **Environments** → Create/Edit environment
   - Add variable: `admin_token` = `<your-admin-token>`
   - In requests, use: `{{admin_token}}`

### Option 2: Create New Request

1. **Create New Request:**
   - Click **+** (New Request)
   - Name it: "List Users (Admin)"

2. **Configure:**
   - Method: `GET`
   - URL: `http://localhost:3000/admin/users`
   - Headers tab:
     - Key: `Authorization`
     - Value: `Bearer YOUR_ADMIN_TOKEN_HERE`

3. **Save to Collection:**
   - Click **Save**
   - Create new collection: "Yawmiy Admin"
   - Save request

---

## Postman Environment Variables (Recommended)

### Create Environment

1. Click **Environments** → **+** (Create)
2. Name: `Yawmiy Local` or `Yawmiy Production`
3. Add variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `admin_token` | `<paste-your-token>` | `<paste-your-token>` |
| `user1_token` | `<paste-token>` | `<paste-token>` |
| `user2_token` | `<paste-token>` | `<paste-token>` |

4. **Select the environment** (top right dropdown)

### Use Variables in Requests

- URL: `{{base_url}}/admin/users`
- Authorization: `Bearer {{admin_token}}`

---

## Complete Test Flow

### Full Workflow

1. ✅ **Create Admin User**
   - Register user
   - Update role in database

2. ✅ **Login as Admin**
   - Get admin token
   - Save to environment variable

3. ✅ **List Users**
   - `GET /admin/users`
   - Verify you see all users

4. ✅ **Get User Details**
   - `GET /admin/users/2`
   - Verify user details

5. ✅ **Ban a User**
   - `POST /admin/users/2/ban`
   - Verify user is banned

6. ✅ **Verify Banned User Cannot Login**
   - Try login as banned user
   - Should fail

7. ✅ **List Banned Users**
   - `GET /admin/users?banned=true`
   - Verify banned user appears

8. ✅ **Unban User**
   - `POST /admin/users/2/unban`
   - Verify user is unbanned

9. ✅ **Verify Unbanned User Can Login**
   - Try login as unbanned user
   - Should succeed

10. ✅ **Promote User to Admin**
    - `PATCH /admin/users/3/role` with `{"role": "admin"}`
    - Verify user is now admin

11. ✅ **Test Error Cases**
    - Try accessing without admin token
    - Try banning yourself
    - Try banning another admin

---

## Quick Reference: All Endpoints

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/admin/users` | GET | List users | - |
| `/admin/users/:id` | GET | Get user details | - |
| `/admin/users/:id/ban` | POST | Ban user | `{"reason": "..."}` |
| `/admin/users/:id/unban` | POST | Unban user | - |
| `/admin/users/:id/role` | PATCH | Update role | `{"role": "admin"}` |

**All require:** `Authorization: Bearer <admin_token>`

---

## Troubleshooting

### Issue: "Admin access required" (403)

**Solutions:**
1. Verify user has `role: 'admin'` in database
2. Re-login to get fresh token with role
3. Check token is valid (not expired)

**Check in database:**
```sql
SELECT id, email, role, banned FROM users WHERE email = 'admin@university.edu';
```

### Issue: "Your account has been banned" (403)

**Solution:**
- Your admin account was banned
- Unban via database:
  ```sql
  UPDATE users SET banned = false WHERE id = <your_id>;
  ```

### Issue: Cannot find users

**Solutions:**
1. Check users exist: `SELECT * FROM users;`
2. Verify user IDs are correct
3. Check filters aren't excluding users

### Issue: Token not working

**Solutions:**
1. Re-login to get fresh token
2. Check token format: `Bearer <token>` (with space)
3. Verify token hasn't expired (24 hours)

---

## Production Testing

For production (Render), replace URLs:

- Local: `http://localhost:3000`
- Production: `https://yawmiy-backend.onrender.com`

**Example:**
```
GET https://yawmiy-backend.onrender.com/admin/users
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## Tips

1. **Save tokens** in Postman environment variables
2. **Test error cases** to verify security
3. **Verify in database** after operations
4. **Use Postman collection** for organized testing
5. **Create test users** for testing ban/unban

---

## Example: Complete Test Session

### 1. Setup
```bash
# Register admin user
POST /auth/register
{
  "email": "admin@university.edu",
  "password": "Admin123!",
  "student_id": "99999999",
  "name": "Admin User"
}

# Update role in database
UPDATE users SET role = 'admin' WHERE email = 'admin@university.edu';

# Login
POST /auth/login
{
  "email": "admin@university.edu",
  "password": "Admin123!"
}
# Save token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Test Admin Endpoints
```bash
# List users
GET /admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Ban user
POST /admin/users/2/ban
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "reason": "Spam"
}

# Verify banned
GET /admin/users?banned=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Unban user
POST /admin/users/2/unban
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Ready to Test! 🚀

All admin endpoints are ready. Follow the steps above to test them in Postman!

For more details, see:
- `ADMIN_ENDPOINTS_GUIDE.md` - Complete API documentation
- `POSTMAN_ADMIN_TEST_GUIDE.md` - Detailed testing guide

