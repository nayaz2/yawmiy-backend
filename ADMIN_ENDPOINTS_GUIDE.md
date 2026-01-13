# Admin Endpoints Guide

## Overview

Admin endpoints for managing users, including listing users and banning/unbanning users.

## Prerequisites

1. **Admin Account Required** - You need a user account with `role: 'admin'`
2. **JWT Authentication** - All endpoints require a valid JWT token
3. **Admin Role** - The token must belong to a user with admin role

---

## How to Create an Admin User

### Option 1: Direct Database Update (Quick)

Run this SQL in your database:

```sql
-- Update existing user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin-email@university.edu';

-- Or create a new admin user (after registration)
-- First register normally, then:
UPDATE users 
SET role = 'admin' 
WHERE id = <user_id>;
```

### Option 2: Via Code (For First Admin)

You can manually set the first admin in the database, then use the admin endpoints to promote others.

---

## API Endpoints

### 1. List Users

**GET** `/admin/users`

List all users with filters and pagination.

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Query Parameters:**
- `search` (optional): Search in name or email
- `banned` (optional): Filter by banned status (`true`/`false`)
- `role` (optional): Filter by role (`user`/`admin`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 20)

**Example:**
```
GET /admin/users?search=john&banned=false&role=user&page=1&limit=20
```

**Response:**
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
    },
    {
      "id": 2,
      "email": "user2@university.edu",
      "name": "Jane Smith",
      "student_id": "87654321",
      "role": "user",
      "banned": true,
      "banned_at": "2026-01-05T10:00:00Z",
      "banned_reason": "Violation of terms of service"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### 2. Get User Details

**GET** `/admin/users/:id`

Get detailed information about a specific user.

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response:**
```json
{
  "id": 1,
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

### 3. Ban User

**POST** `/admin/users/:id/ban`

Ban a user with a reason.

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Violation of terms of service - spam listings"
}
```

**Response:**
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

**Restrictions:**
- ❌ Cannot ban yourself
- ❌ Cannot ban other admins
- ❌ Cannot ban already banned users

---

### 4. Unban User

**POST** `/admin/users/:id/unban`

Unban a previously banned user.

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**Response:**
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

---

### 5. Update User Role

**PATCH** `/admin/users/:id/role`

Promote user to admin or demote admin to user.

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "role": "admin"
}
```
or
```json
{
  "role": "user"
}
```

**Response:**
```json
{
  "id": 3,
  "email": "newadmin@university.edu",
  "role": "admin"
}
```

**Restrictions:**
- ❌ Cannot change your own role

---

## Postman Testing Guide

### Step 1: Create/Login as Admin

1. **Register a user** (or use existing)
2. **Update role to admin** in database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@university.edu';
   ```
3. **Login** to get admin JWT token

### Step 2: Test Admin Endpoints

#### Test 1: List All Users

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users`
- Headers: `Authorization: Bearer {{admin_token}}`

#### Test 2: List Banned Users

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users?banned=true`
- Headers: `Authorization: Bearer {{admin_token}}`

#### Test 3: Search Users

**Request:**
- Method: `GET`
- URL: `{{base_url}}/admin/users?search=john`
- Headers: `Authorization: Bearer {{admin_token}}`

#### Test 4: Ban User

**Request:**
- Method: `POST`
- URL: `{{base_url}}/admin/users/2/ban`
- Headers: 
  - `Authorization: Bearer {{admin_token}}`
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "reason": "Spam listings"
  }
  ```

#### Test 5: Unban User

**Request:**
- Method: `POST`
- URL: `{{base_url}}/admin/users/2/unban`
- Headers: `Authorization: Bearer {{admin_token}}`

#### Test 6: Promote User to Admin

**Request:**
- Method: `PATCH`
- URL: `{{base_url}}/admin/users/3/role`
- Headers: 
  - `Authorization: Bearer {{admin_token}}`
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "role": "admin"
  }
  ```

---

## Security Features

✅ **Admin Guard** - Only users with `role: 'admin'` can access  
✅ **Banned Check** - Banned users cannot access admin endpoints  
✅ **Self-Protection** - Cannot ban yourself or change your own role  
✅ **Admin Protection** - Cannot ban other admins  
✅ **JWT Required** - All endpoints require authentication  

---

## Banned User Behavior

When a user is banned:
- ❌ **Cannot login** - Login will fail with "Your account has been banned"
- ❌ **Cannot access admin endpoints** - Even if they were admin
- ✅ **Banned reason stored** - For audit purposes
- ✅ **Can be unbanned** - Admin can unban later

---

## Database Schema Changes

### User Entity Updates

```typescript
{
  role: 'user' | 'admin',        // Default: 'user'
  banned: boolean,               // Default: false
  banned_at: Date | null,        // When banned
  banned_reason: string | null   // Why banned
}
```

**Note:** These fields will be automatically added to the database when you start the app (via `synchronize: true`).

---

## Error Responses

### 403 Forbidden - Not Admin
```json
{
  "message": "Admin access required",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 403 Forbidden - Banned
```json
{
  "message": "Your account has been banned",
  "error": "Forbidden",
  "statusCode": 403
}
```

### 400 Bad Request - Cannot Ban Yourself
```json
{
  "message": "Cannot ban yourself",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 403 Forbidden - Cannot Ban Admin
```json
{
  "message": "Cannot ban admin users",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

## Usage Examples

### Example 1: List All Users

```bash
curl -X GET "https://yawmiy-backend.onrender.com/admin/users" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Example 2: Ban User

```bash
curl -X POST "https://yawmiy-backend.onrender.com/admin/users/2/ban" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Spam listings"}'
```

### Example 3: Search and Filter

```bash
curl -X GET "https://yawmiy-backend.onrender.com/admin/users?search=john&banned=false&role=user" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Quick Setup: Create First Admin

### Step 1: Register a User

```bash
POST /auth/register
{
  "email": "admin@university.edu",
  "password": "Admin123!",
  "student_id": "99999999",
  "name": "Admin User"
}
```

### Step 2: Update Role in Database

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@university.edu';
```

### Step 3: Login and Get Token

```bash
POST /auth/login
{
  "email": "admin@university.edu",
  "password": "Admin123!"
}
```

### Step 4: Use Admin Token

Now you can use the token from Step 3 to access all admin endpoints!

---

## Related Files

- `src/admin/admin.service.ts` - Business logic
- `src/admin/admin.controller.ts` - API endpoints
- `src/admin/admin.guard.ts` - Admin authorization guard
- `src/admin/admin.module.ts` - Module configuration
- `src/users/user.entity.ts` - User entity with role and banned fields

---

## Future Enhancements

Potential improvements:
- [ ] Ban expiration dates
- [ ] Temporary bans
- [ ] Ban history/audit log
- [ ] Admin activity logging
- [ ] User statistics dashboard
- [ ] Bulk ban/unban operations

---

The admin endpoints are ready to use! 🎉





