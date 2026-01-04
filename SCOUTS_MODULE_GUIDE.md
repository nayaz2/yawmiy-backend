# Scouts Module - Recruitment Bounties Guide

## Overview

The Scouts module implements a recruitment bounty system where users can earn ₹10 for each recruit's first sale. Scouts must have at least 1 completed transaction to register.

---

## Database Schema

### Scout Entity (`src/scouts/scout.entity.ts`)
- `scout_id` (UUID) - Primary key
- `user_id` (FK to User) - The scout user
- `status` (enum: active, inactive) - Scout status
- `recruits_count` - Number of recruits
- `earnings_paise` - Total bounties earned (in paise)
- `created_at` - Registration timestamp

### User Entity Update
- Added `recruiter_id` (nullable) - ID of the scout who recruited this user

---

## API Endpoints

### 1. Register as Scout
```
POST /scouts/register
Authorization: Bearer YOUR_TOKEN
```

**Requirements:**
- User must be authenticated (JWT)
- User must have at least 1 completed transaction (as buyer or seller)

**Response:**
```json
{
  "scout_id": "uuid",
  "message": "Successfully registered as scout"
}
```

**Errors:**
- `409 Conflict` - User already registered as scout
- `400 Bad Request` - User doesn't have required transactions

---

### 2. Get Scout Earnings
```
GET /scouts/:id/earnings
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "scout_id": "uuid",
  "total_earnings_paise": 10000,
  "total_earnings_display": "₹100.00",
  "recruits_count": 5,
  "bounty_per_recruit_paise": 1000,
  "bounty_per_recruit_display": "₹10.00",
  "breakdown": [
    {
      "recruit_id": 123,
      "recruit_name": "John Doe",
      "recruit_email": "john@university.edu",
      "first_sale_amount_paise": 50000,
      "first_sale_amount_display": "₹500.00",
      "bounty_earned_paise": 1000,
      "bounty_earned_display": "₹10.00"
    }
  ]
}
```

---

### 3. Get Leaderboard
```
GET /scouts/leaderboard?limit=10
```

**Query Parameters:**
- `limit` (optional, default: 10) - Number of top scouts to return

**Response:**
```json
[
  {
    "rank": 1,
    "scout_id": "uuid",
    "user_id": 123,
    "user_name": "Jane Doe",
    "user_email": "jane@university.edu",
    "recruits_count": 15,
    "earnings_paise": 15000,
    "earnings_display": "₹150.00"
  }
]
```

---

### 4. Request Payout
```
POST /scouts/:id/request-payout
Authorization: Bearer YOUR_TOKEN
Body: {
  "amount_paise": 5000  // Optional: specific amount, otherwise all earnings
}
```

**Response:**
```json
{
  "scout_id": "uuid",
  "requested_amount_paise": 5000,
  "requested_amount_display": "₹50.00",
  "message": "Payout request received. Processing will begin shortly."
}
```

**Note:** Payout queue system is a placeholder (TODO) - similar to seller payouts.

---

## How It Works

### 1. Registration Flow
1. User completes at least 1 transaction (buy or sell)
2. User registers as scout via `POST /scouts/register`
3. Scout record created with `earnings_paise = 0`, `recruits_count = 0`

### 2. Recruitment Flow
1. Scout shares referral link/code (to be implemented in frontend)
2. New user registers with `recruiter_id` set to scout's `user_id`
3. When recruit makes their **first sale** (order completed):
   - System checks if seller has `recruiter_id`
   - If yes, adds ₹10 (1000 paise) to scout's `earnings_paise`
   - Increments scout's `recruits_count`
   - Logs bounty notification

### 3. Bounty Trigger
- **When:** Order status changes to `COMPLETED`
- **Condition:** Seller must have `recruiter_id` set
- **Amount:** ₹10 (1000 paise) per first sale
- **Automatic:** Triggered in `OrdersService.completeOrder()`

---

## Integration with Orders Module

The bounty is automatically triggered when an order is completed:

```typescript
// In OrdersService.completeOrder()
await this.scoutsService.triggerBountyOnFirstSale(
  order.seller_id,
  order.item_price_paise,
);
```

**Important:** The bounty is only triggered on the **first completed sale** of a recruit (as seller).

---

## Example Flow

1. **Alice** (scout) registers: `POST /scouts/register`
2. **Bob** registers with `recruiter_id = Alice's user_id`
3. **Bob** creates a listing and sells it
4. **Buyer** completes the order: `PATCH /orders/:id/complete`
5. **System automatically:**
   - Checks if this is Bob's first sale ✅
   - Checks if Bob has `recruiter_id` ✅
   - Adds ₹10 to Alice's earnings ✅
   - Increments Alice's `recruits_count` ✅

---

## Testing

### 1. Register as Scout
```bash
POST http://localhost:3000/scouts/register
Authorization: Bearer YOUR_TOKEN
```

### 2. Check Earnings
```bash
GET http://localhost:3000/scouts/{scout_id}/earnings
Authorization: Bearer YOUR_TOKEN
```

### 3. View Leaderboard
```bash
GET http://localhost:3000/scouts/leaderboard?limit=10
```

### 4. Request Payout
```bash
POST http://localhost:3000/scouts/{scout_id}/request-payout
Authorization: Bearer YOUR_TOKEN
Body: { "amount_paise": 5000 }
```

---

## Notes

1. **Bounty Amount:** Fixed at ₹10 (1000 paise) per first sale
2. **First Sale Only:** Bounty is only paid on the recruit's first completed sale
3. **Automatic Triggering:** Bounties are triggered automatically when orders are completed
4. **Payout Queue:** Payout requests are logged but not automatically processed (TODO)
5. **Recruiter Tracking:** Users must have `recruiter_id` set during registration to be tracked

---

## Future Enhancements

- [ ] Referral link/code generation for scouts
- [ ] Payout queue system (similar to seller payouts)
- [ ] Email/notification system for bounty alerts
- [ ] Analytics dashboard for scouts
- [ ] Multi-level referral system (optional)

---

## Files Created

- `src/scouts/scout.entity.ts` - Scout database entity
- `src/scouts/scouts.service.ts` - Business logic
- `src/scouts/scouts.controller.ts` - API endpoints
- `src/scouts/scouts.module.ts` - Module configuration
- `src/scouts/dto/register-scout.dto.ts` - Registration DTO
- `src/scouts/dto/request-payout.dto.ts` - Payout request DTO

## Files Modified

- `src/users/user.entity.ts` - Added `recruiter_id` field
- `src/orders/orders.service.ts` - Integrated bounty trigger
- `src/orders/orders.module.ts` - Imported ScoutsModule
- `src/app.module.ts` - Imported ScoutsModule

---

**Status:** ✅ **Fully Implemented and Ready to Use**

