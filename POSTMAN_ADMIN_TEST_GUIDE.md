# Testing Admin Endpoints in Postman

## Prerequisites

1. **Create an Admin User** - You need a user with `role: 'admin'`
2. **Get Admin Token** - Login as admin to get JWT token

---

## Step 1: Create Admin User

### Option A: Via Database (Recommended)

1. **Register a user normally:**
   ```
   POST /auth/register
   {
     "email": "admin@university.edu",
     "password": "Admin123!",
     "student_id": "99999999",
     "name": "Admin User"
   }
   ```

2. **Update role in database:**
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'admin@university.edu';
   ```

### Option B: Direct SQL (If user already exists)

```sql
UPDATE users 
SET role = 'admin' 
WHERE id = <user_id>;
```

---

## Step 2: Login as Admin

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/login`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "email": "admin@university.edu",
    "password": "Admin123!"
  }
  ```

**Save the token** from the response - this is your admin token!

---

## Step 3: Test Admin Endpoints

### Test 1: List All Users

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
  ```

**Expected Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user1@university.edu",
      "name": "John Doe",
      "student_id": "12345678",
      "role": "user",
      "banned": false,
      "banned_at": null,
      "banned_reason": null
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### Test 2: List Users with Filters

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users?search=john&banned=false&role=user&page=1&limit=20`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
  ```

**Query Parameters:**
- `search`: Search in name or email
- `banned`: Filter by banned status (`true`/`false`)
- `role`: Filter by role (`user`/`admin`)
- `page`: Page number
- `limit`: Users per page

---

### Test 3: Get User Details

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users/2`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
  ```

**Expected Response:**
```json
{
  "id": 2,
  "email": "user2@university.edu",
  "name": "Jane Smith",
  "student_id": "87654321",
  "role": "user",
  "banned": false,
  "banned_at": null,
  "banned_reason": null,
  "recruiter_id": null
}
```

---

### Test 4: Ban User

**Request:**
- Method: `POST`
- URL: `{{base_url}}/admin/users/2/ban`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "reason": "Violation of terms of service - spam listings"
  }
  ```

**Expected Response:**
```json
{
  "id": 2,
  "email": "user2@university.edu",
  "name": "Jane Smith",
  "banned": true,
  "banned_at": "2026-01-05T10:00:00Z",
  "banned_reason": "Violation of terms of service - spam listings"
}
```

**Verify:** Try logging in as the banned user - should fail with "Your account has been banned"

---

### Test 5: Unban User

**Request:**
- Method: `POST`
- URL: `{{base_url}}/admin/users/2/unban`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
  ```

**Expected Response:**
```json
{
  "id": 2,
  "email": "user2@university.edu",
  "name": "Jane Smith",
  "banned": false,
  "banned_at": null,
  "banned_reason": null
}
```

**Verify:** Banned user can now login again

---

### Test 6: Promote User to Admin

**Request:**
- Method: `PATCH`
- URL: `{{base_url}}/admin/users/3/role`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "role": "admin"
  }
  ```

**Expected Response:**
```json
{
  "id": 3,
  "email": "newadmin@university.edu",
  "role": "admin"
}
```

**Verify:** User 3 can now access admin endpoints

---

### Test 7: Demote Admin to User

**Request:**
- Method: `PATCH`
- URL: `{{base_url}}/admin/users/3/role`
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "role": "user"
  }
  ```

**Expected Response:**
```json
{
  "id": 3,
  "email": "newadmin@university.edu",
  "role": "user"
}
```

---

## Error Testing

### Test 8: Access Admin Endpoint Without Admin Role (Should Fail)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users`
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

### Test 9: Try to Ban Yourself (Should Fail)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/admin/users/1/ban` (where 1 is your admin user ID)
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
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

### Test 10: Try to Ban Another Admin (Should Fail)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/admin/users/3/ban` (where 3 is another admin)
- Headers:
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN
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

## Quick Test Flow

1. ✅ **Create admin user** (register + update role in DB)
2. ✅ **Login as admin** (get admin token)
3. ✅ **List users** (`GET /admin/users`)
4. ✅ **Ban a user** (`POST /admin/users/2/ban`)
5. ✅ **Verify banned user cannot login**
6. ✅ **Unban user** (`POST /admin/users/2/unban`)
7. ✅ **Verify user can login again**

---

## Postman Collection

The admin endpoints are already added to `Yawmiy-Backend.postman_collection.json` in the "Admin" folder.

**To use:**
1. Import the collection into Postman
2. Set `YOUR_ADMIN_TOKEN_HERE` in the Authorization header
3. Or create an environment variable `admin_token` and use `{{admin_token}}`

---

## Tips

1. **Save admin token** in Postman environment variables
2. **Test error cases** to verify security
3. **Verify banned users** cannot login
4. **Check database** to see role and banned fields

---

## Troubleshooting

### Issue: "Admin access required" (403)

**Solution:** 
- Verify user has `role: 'admin'` in database
- Make sure you're using the correct admin token
- Re-login to get a fresh token with role

### Issue: "Your account has been banned" (403)

**Solution:**
- Your admin account was banned
- Unban yourself via database: `UPDATE users SET banned = false WHERE id = <your_id>;`

### Issue: Cannot find users

**Solution:**
- Check if users exist in database
- Verify you're using correct user IDs
- Check filters (banned, role) aren't excluding users

---

Happy testing! 🚀

