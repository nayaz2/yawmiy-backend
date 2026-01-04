# Quick Start: Testing Scouts Module in Postman

## 🚀 Quick Test Steps

### 1. Import Postman Collection
1. Open Postman
2. Click **Import** → Select `Yawmiy-Backend.postman_collection.json`
3. Collection appears in sidebar with new **"Scouts"** folder

---

### 2. Prerequisites Setup

#### Step A: Register Scout User
```
POST /auth/register
Body:
{
  "email": "scout@university.edu",
  "password": "Scout123!@#",
  "student_id": "12345678",
  "name": "Alice Scout"
}
```
**Save:** User ID and login to get token

#### Step B: Complete a Transaction
Scout needs 1+ completed transaction. Quick way:
1. Scout creates a listing
2. Another user buys it
3. Complete payment & order

OR

1. Another user creates listing
2. Scout buys it
3. Complete payment & order

#### Step C: Get Scout Token
```
POST /auth/login
Body:
{
  "email": "scout@university.edu",
  "password": "Scout123!@#"
}
```
**Save:** Token from response

---

### 3. Test Scouts Endpoints

#### ✅ Test 1: Register as Scout
```
POST /scouts/register
Headers:
  Authorization: Bearer YOUR_SCOUT_TOKEN
Body: {}
```

**Expected:** `201 Created`
```json
{
  "scout_id": "uuid-here",
  "message": "Successfully registered as scout"
}
```

**Save:** `scout_id` for next tests

---

#### ✅ Test 2: Get Earnings (Initially Empty)
```
GET /scouts/{scout_id}/earnings
Headers:
  Authorization: Bearer YOUR_SCOUT_TOKEN
```

**Expected:** `200 OK`
```json
{
  "scout_id": "uuid",
  "total_earnings_paise": 0,
  "total_earnings_display": "₹0.00",
  "recruits_count": 0,
  "bounty_per_recruit_paise": 1000,
  "bounty_per_recruit_display": "₹10.00",
  "breakdown": []
}
```

---

#### ✅ Test 3: View Leaderboard
```
GET /scouts/leaderboard?limit=10
```

**Expected:** `200 OK` - Array of scouts (may be empty if no scouts registered)

---

#### ✅ Test 4: Request Payout
```
POST /scouts/{scout_id}/request-payout
Headers:
  Authorization: Bearer YOUR_SCOUT_TOKEN
Body:
{
  "amount_paise": 1000
}
```

**Expected:** `200 OK`
```json
{
  "scout_id": "uuid",
  "requested_amount_paise": 1000,
  "requested_amount_display": "₹10.00",
  "message": "Payout request received. Processing will begin shortly."
}
```

---

## 🎯 Full Flow Test (Bounty Trigger)

### Setup Recruit with Recruiter

**Option 1: Manual Database Update** (Quick for testing)
```sql
-- After registering recruit user, update recruiter_id
UPDATE "user" SET recruiter_id = 1 WHERE id = 2;
-- Replace 1 with scout's user_id, 2 with recruit's user_id
```

**Option 2: Use Database Tool**
- Use pgAdmin, DBeaver, or psql
- Update `recruiter_id` column in `user` table

### Trigger Bounty

1. **Recruit creates listing**
2. **Buyer creates order**
3. **Complete payment** (via PhonePe)
4. **Complete order** → This triggers ₹10 bounty automatically!

### Verify Bounty

```
GET /scouts/{scout_id}/earnings
```

**Expected:** Now shows ₹10 earnings
```json
{
  "total_earnings_paise": 1000,
  "total_earnings_display": "₹10.00",
  "recruits_count": 1,
  "breakdown": [
    {
      "recruit_id": 2,
      "recruit_name": "Bob Recruit",
      "first_sale_amount_paise": 50000,
      "bounty_earned_paise": 1000,
      "bounty_earned_display": "₹10.00"
    }
  ]
}
```

---

## 📝 Postman Collection Variables

Set these in Postman environment:

- `base_url`: `http://localhost:3000`
- `scout_token`: Token from scout login
- `scout_id`: Scout ID from registration
- `scout_user_id`: Scout's user ID (for database updates)

---

## ⚠️ Common Issues

### "User doesn't have required transactions"
- Scout needs at least 1 **completed** order (status = COMPLETED)
- Not just ESCROWED, must be COMPLETED

### "User already registered as scout"
- User is already a scout
- Use existing `scout_id`

### Bounty not showing
- Check recruit has `recruiter_id` set in database
- Verify this is recruit's **first** completed sale (as seller)
- Check server logs for bounty messages

---

## 🎉 Success Checklist

- [ ] Scout registered successfully
- [ ] Earnings endpoint works (shows ₹0.00 initially)
- [ ] Leaderboard works
- [ ] Payout request works
- [ ] Recruit has `recruiter_id` set
- [ ] Recruit's first sale completed
- [ ] Earnings show ₹10 bounty
- [ ] Leaderboard shows scout with earnings

---

**Ready to test!** Start with the Quick Test Steps above. 🚀

