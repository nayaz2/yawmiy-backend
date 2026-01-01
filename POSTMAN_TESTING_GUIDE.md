# Postman Testing Guide for Student Marketplace Auth

## Prerequisites
1. Make sure your NestJS server is running: `npm run start:dev`
2. Server should be running on `http://localhost:3000`

## Step-by-Step Testing Instructions

### 1. Import the Postman Collection
1. Open Postman
2. Click **"Import"** button (top left)
3. Select the file: `Yawmiy-Backend.postman_collection.json`
4. The collection will appear in your left sidebar

### 2. Test Register Endpoint

**Endpoint:** `POST http://localhost:3000/auth/register`

**Steps:**
1. Select **"Register Student"** from the collection
2. Make sure the method is **POST**
3. URL should be: `http://localhost:3000/auth/register`
4. Go to **Body** tab
5. Select **raw** and **JSON** from dropdown
6. Use this example JSON:

```json
{
  "email": "student@university.edu",
  "password": "Password123!",
  "student_id": "12345678",
  "name": "John Doe"
}
```

**Valid Email Examples:**
- `student@university.edu` ✅
- `student@university.edu.in` ✅
- `student@university.ac` ✅
- `student@university.ac.in` ✅

**Invalid Email Examples:**
- `student@gmail.com` ❌
- `student@university.com` ❌

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

**Student ID Requirements:**
- Must be 8-10 digits only
- Examples: `12345678`, `123456789`, `1234567890`

7. Click **"Send"**

**Expected Response (201 Created):**
```json
{
  "message": "Registration successful"
}
```

**Error Examples:**
- If email doesn't end with .edu/.edu.in/.ac/.ac.in: `400 Bad Request`
- If password doesn't meet requirements: `400 Bad Request`
- If student_id is not 8-10 digits: `400 Bad Request`
- If email or student_id already exists: `409 Conflict`

### 3. Test Login Endpoint

**Endpoint:** `POST http://localhost:3000/auth/login`

**Steps:**
1. Select **"Login"** from the collection
2. Use the same email and password from registration:

```json
{
  "email": "student@university.edu",
  "password": "Password123!"
}
```

3. Click **"Send"**

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "student@university.edu",
    "student_id": "12345678",
    "name": "John Doe"
  }
}
```

**Important:** Copy the `token` value - you'll need it for the next step!

### 4. Test Validate Token Endpoint

**Endpoint:** `POST http://localhost:3000/auth/validate-token`

**Steps:**
1. Select **"Validate Token"** from the collection
2. Go to **Headers** tab
3. Add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE` (replace YOUR_TOKEN_HERE with the token from login)
   
   Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. Click **"Send"**

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "email": "student@university.edu",
  "student_id": "12345678",
  "name": "John Doe"
}
```

**Error Examples:**
- If token is missing: `401 Unauthorized`
- If token is invalid/expired: `401 Unauthorized`

## Quick Test Examples

### Valid Registration Examples:

**Example 1 (.edu):**
```json
{
  "email": "alice@mit.edu",
  "password": "SecurePass1!",
  "student_id": "87654321",
  "name": "Alice Smith"
}
```

**Example 2 (.edu.in):**
```json
{
  "email": "bob@iit.edu.in",
  "password": "MyPass123@",
  "student_id": "1122334455",
  "name": "Bob Johnson"
}
```

**Example 3 (.ac):**
```json
{
  "email": "charlie@oxford.ac",
  "password": "StrongP@ss1",
  "student_id": "99887766",
  "name": "Charlie Brown"
}
```

**Example 4 (.ac.in):**
```json
{
  "email": "diana@iisc.ac.in",
  "password": "Test1234!",
  "student_id": "55443322",
  "name": "Diana Prince"
}
```

## Troubleshooting

1. **Connection Error:** Make sure your server is running (`npm run start:dev`)
2. **Validation Errors:** Check that all fields meet the requirements
3. **401 Unauthorized:** Make sure you're using the correct email/password or valid token
4. **409 Conflict:** Email or student_id already exists - try different values

