# How to Fix 401 Unauthorized Error

## Problem
You're getting this error when creating a listing:
```json
{
    "message": "Unauthorized",
    "statusCode": 401
}
```

## Solution: Add JWT Token to Authorization Header

### Step-by-Step Instructions

#### 1. Login First (Get Your Token)

1. In Postman, select the **"Login"** request
2. Make sure the body has your credentials:
   ```json
   {
     "email": "student@university.edu",
     "password": "Password123!"
   }
   ```
3. Click **"Send"**
4. Look at the response - you'll see:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ← COPY THIS!
     "user": { ... }
   }
   ```
5. **Copy the entire `token` value** (it's a long string)

#### 2. Add Authorization Header to Create Listing

1. Select the **"Create Listing"** request
2. Go to the **"Headers"** tab (below the URL)
3. You should see a table with Key and Value columns
4. Click **"Add Header"** or find the existing Authorization row
5. Set:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_TOKEN_HERE`
   
   Replace `YOUR_TOKEN_HERE` with the token you copied from step 1

6. **Important:** Make sure you include:
   - The word `Bearer` (with capital B)
   - A **space** after `Bearer`
   - Then your token (no spaces)

**Correct Format:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0dWRlbnRAdW5pdmVyc2l0eS5lZHUiLCJzdWIiOjEsImlhdCI6MTczNTc0MjQwMCwiZXhwIjoxNzM1ODI4ODAwfQ.abc123...
```

**Wrong Formats:**
```
BearerYOUR_TOKEN_HERE          ❌ (no space)
bearer YOUR_TOKEN_HERE         ❌ (lowercase)
YOUR_TOKEN_HERE                ❌ (missing Bearer)
Bearer YOUR_TOKEN_HERE         ✅ (correct!)
```

#### 3. Verify Your Request

Your "Create Listing" request should have:

**Headers Tab:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body Tab (raw JSON):**
```json
{
  "title": "Calculus Textbook",
  "category": "Textbooks",
  "price": 50000,
  "condition": "like_new",
  "description": "Great book",
  "location": "Campus"
}
```

#### 4. Send the Request

Click **"Send"** - it should work now!

---

## Visual Guide

```
┌─────────────────────────────────────────────┐
│ STEP 1: Login                               │
│ POST /auth/login                            │
│                                             │
│ Response:                                   │
│ {                                           │
│   "token": "abc123..."  ← COPY THIS        │
│ }                                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ STEP 2: Create Listing                      │
│ POST /listings                              │
│                                             │
│ Headers:                                    │
│ Authorization: Bearer abc123...  ← PASTE    │
│                                             │
│ Body:                                       │
│ { title, category, price, ... }            │
└─────────────────────────────────────────────┘
```

---

## Common Mistakes

### ❌ Mistake 1: No Authorization Header
**Problem:** Headers tab is empty or missing Authorization
**Fix:** Add `Authorization: Bearer YOUR_TOKEN`

### ❌ Mistake 2: Missing "Bearer" Prefix
**Problem:** Header value is just the token
**Fix:** Use `Bearer YOUR_TOKEN` (with space)

### ❌ Mistake 3: Expired Token
**Problem:** Token was created more than 24 hours ago
**Fix:** Login again to get a fresh token

### ❌ Mistake 4: Wrong Token
**Problem:** Using token from a different user or old session
**Fix:** Make sure you're using the token from your most recent login

### ❌ Mistake 5: Extra Spaces or Characters
**Problem:** Token has extra spaces or line breaks
**Fix:** Copy the token exactly, no extra characters

---

## Quick Checklist

Before sending "Create Listing" request, verify:

- [ ] You've logged in and copied the token
- [ ] Headers tab has `Authorization` key
- [ ] Value is `Bearer YOUR_TOKEN` (with space)
- [ ] Token is the full string (no truncation)
- [ ] Token is from your current login session
- [ ] Body has all required fields (title, category, price, condition, description, location)

---

## Still Getting 401?

1. **Check token expiration:** Tokens expire after 24 hours. Login again.

2. **Verify token format:** 
   - Should start with `eyJ`
   - Should be very long (hundreds of characters)
   - Should have dots (.) separating parts

3. **Test token:** Use the "Validate Token" endpoint to check if your token is valid

4. **Check server logs:** Make sure your NestJS server is running and JWT_SECRET is set in .env

---

## Example: Complete Working Request

**URL:**
```
POST http://localhost:3000/listings
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0dWRlbnRAdW5pdmVyc2l0eS5lZHUiLCJzdWIiOjEsImlhdCI6MTczNTc0MjQwMCwiZXhwIjoxNzM1ODI4ODAwfQ.example_signature
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Calculus Textbook - 3rd Edition",
  "category": "Textbooks",
  "price": 50000,
  "condition": "like_new",
  "description": "Excellent condition calculus textbook.",
  "photos": ["https://example.com/photo1.jpg"],
  "location": "Main Campus - Building A"
}
```

This should work! ✅

