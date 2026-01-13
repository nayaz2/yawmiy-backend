# Consolidated Payout System

## Overview

Payouts are now **consolidated and processed on the 1st and 16th of every month**. When a buyer's payment is successful, scout payouts and seller payouts are marked as **"payable"** and will be paid on the next scheduled payment date.

---

## Key Changes

### ✅ Consolidated Payments
- **Payment Dates:** 1st and 16th of every month
- **Automatic Processing:** All "payable" payouts are processed on these dates
- **User Consolidation:** Multiple payouts for the same user are grouped together

### ✅ Payable Status
- **New Status:** `PAYABLE` - Ready to be paid, waiting for scheduled payment date
- **When Created:** Scout bounties and seller payouts are created with `PAYABLE` status
- **Visibility:** Users can see their "payable" amount in their payout history

### ✅ Payment Flow

1. **Buyer Payment Successful** → Order status: `ESCROWED`
2. **Scout Bounty Triggered** → Payout created with status: `PAYABLE`
3. **Order Completed** → Seller payout created with status: `PAYABLE`
4. **1st or 16th of Month** → All `PAYABLE` payouts are processed
5. **Payment Processed** → Status updated to `COMPLETED` or `FAILED`

---

## Payout Statuses

| Status | Description | When |
|--------|-------------|------|
| `payable` | Ready to be paid, waiting for 1st/16th | Created when buyer payment succeeds |
| `pending` | Being processed | Moved from payable on payment date |
| `processing` | Currently being paid | During payment processing |
| `completed` | Successfully paid out | After successful payment |
| `failed` | Payment failed | If payment processing fails |
| `cancelled` | Cancelled by admin | Admin action |

---

## How It Works

### Scout Bounty Flow

1. **Recruit makes first sale:**
   - Order completed → Scout bounty triggered
   - Payout created: `status: PAYABLE`
   - Scout earnings show as "payable" (not yet deducted)

2. **On 1st or 16th:**
   - All `PAYABLE` scout payouts are processed
   - Status changes: `PAYABLE` → `PENDING` → `PROCESSING` → `COMPLETED`
   - Scout earnings are deducted when payout completes

### Seller Payout Flow

1. **Order completed:**
   - Buyer completes order → Seller payout created
   - Payout created: `status: PAYABLE`
   - Seller can see "payable" amount in payout history

2. **On 1st or 16th:**
   - All `PAYABLE` seller payouts are processed
   - Status changes: `PAYABLE` → `PENDING` → `PROCESSING` → `COMPLETED`
   - Payment sent to seller

---

## API Endpoints

### Get My Payouts

```
GET /payouts/my-payouts?limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "payouts": [
    {
      "payout_id": "uuid",
      "payout_type": "scout_bounty",
      "status": "payable",
      "amount_paise": 1000,
      "created_at": "2026-01-05T10:00:00Z"
    }
  ],
  "total": 5,
  "total_paid_paise": 5000,
  "payable_paise": 2000,  // ← Amount ready to be paid on next payment date
  "pending_paise": 0
}
```

**Key Fields:**
- `payable_paise`: Amount that will be paid on next 1st/16th
- `pending_paise`: Amount currently being processed
- `total_paid_paise`: Total amount already paid

---

## Scheduled Processing

### Cron Schedule

**Schedule:** `0 0 1,16 * *` (1st and 16th of every month at midnight)

**What happens:**
1. Finds all payouts with status `PAYABLE`
2. Groups by user (consolidation)
3. Processes each payout sequentially
4. Updates status to `COMPLETED` or `FAILED`

**Logs:**
```
🔄 Starting consolidated payout processing (1st/16th)...
📋 Found 15 payable payouts
👥 Processing payouts for 8 users
💰 User 1: 3 payouts, Total: ₹50.00
✅ Payout abc123 completed: ₹10.00 to user 1
✅ Consolidated payout processing completed
```

---

## Next Payment Date

### Calculation

- **Before 1st:** Next payment is 1st of current month
- **Between 1st-15th:** Next payment is 16th of current month
- **After 16th:** Next payment is 1st of next month

### Helper Method

```typescript
getNextPaymentDate(): Date
```

Returns the next scheduled payment date (1st or 16th).

---

## User Experience

### Scout View

**Before Payment Date:**
- Scout earnings show as "payable"
- Can see total payable amount
- Earnings are NOT deducted yet

**After Payment Date:**
- Payout status: `COMPLETED`
- Earnings deducted from scout account
- Payment reference available

### Seller View

**Before Payment Date:**
- Seller payout shows as "payable"
- Can see total payable amount
- Payment not yet sent

**After Payment Date:**
- Payout status: `COMPLETED`
- Payment sent to seller
- Payment reference available

---

## Admin Management

### View All Payouts

```
GET /payouts?status=payable
Authorization: Bearer <admin_token>
```

**Response includes summary:**
```json
{
  "payouts": [...],
  "summary": {
    "payable_paise": 50000,  // Total payable amount
    "pending_paise": 0,
    "completed_paise": 100000,
    "failed_paise": 0
  }
}
```

### Manually Process Payable Payouts

```
POST /payouts/process/:payout_id
Authorization: Bearer <admin_token>
```

**Note:** This processes individual payouts immediately (bypasses schedule).

---

## Database Schema

### Payout Status Enum

```typescript
enum PayoutStatus {
  PAYABLE = 'payable',      // NEW: Ready to be paid
  PENDING = 'pending',      // Being processed
  PROCESSING = 'processing', // Currently processing
  COMPLETED = 'completed',   // Successfully paid
  FAILED = 'failed',         // Payment failed
  CANCELLED = 'cancelled'    // Cancelled by admin
}
```

---

## Benefits

✅ **Consolidated Payments** - Fewer transactions, lower fees  
✅ **Predictable Schedule** - Users know when to expect payments  
✅ **Better Cash Flow** - Payments batched on fixed dates  
✅ **Transparency** - Users can see "payable" amount before payment  
✅ **Efficiency** - Automated processing on schedule  

---

## Testing

### Test Payable Status

1. **Complete an order:**
   ```
   PATCH /orders/:order_id/complete
   ```

2. **Check seller payout:**
   ```
   GET /payouts/my-payouts
   ```
   Should show payout with `status: "payable"`

3. **Check scout payout:**
   - Trigger scout bounty (recruit makes first sale)
   - Check scout earnings
   - Should show "payable" amount

### Test Payment Processing

**Option 1: Wait for 1st/16th**
- Payouts will process automatically

**Option 2: Manually Trigger (Admin)**
```
POST /payouts/process/:payout_id
Authorization: Bearer <admin_token>
```

---

## Migration Notes

### Existing Payouts

- Existing `PENDING` payouts remain as-is
- New payouts (scout bounties, seller payouts) are created as `PAYABLE`
- Manual payout requests can still be `PENDING` (processed immediately)

### Status Transitions

```
PAYABLE → PENDING → PROCESSING → COMPLETED
                              ↓
                           FAILED
```

---

## Configuration

### Change Payment Dates

Edit `src/payouts/payouts.service.ts`:

```typescript
@Cron('0 0 1,16 * *') // Change to your preferred dates
```

**Examples:**
- `'0 0 1,15 * *'` - 1st and 15th
- `'0 0 1 * *'` - Only 1st of month
- `'0 0 1,8,15,22 * *'` - Weekly (1st, 8th, 15th, 22nd)

---

## Related Files

- `src/payouts/payout.entity.ts` - Payout entity with PAYABLE status
- `src/payouts/payouts.service.ts` - Consolidated payment processing
- `src/payouts/payouts.controller.ts` - API endpoints
- `src/scouts/scouts.controller.ts` - Scout payout requests
- `src/orders/orders.controller.ts` - Seller payout creation

---

## Summary

✅ **Consolidated payments** on 1st and 16th of every month  
✅ **Payable status** for scout bounties and seller payouts  
✅ **Automatic processing** via scheduled cron job  
✅ **User visibility** of payable amounts  
✅ **Admin management** for manual processing  

The consolidated payout system is ready! 🚀





