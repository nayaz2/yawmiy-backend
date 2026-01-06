# Updated Payout System - 2-Week Hold & Consolidated Payments

## Overview

Payouts are now **held for 2 weeks** to check for returns/refunds, then **consolidated and processed on the 1st and 16th of every month**. All amounts are displayed in **rounded rupees** (not paise).

---

## Key Features

### ✅ 2-Week Hold Period
- **Buyer Payment Succeeds** → Payout created as `PAYABLE`
- **2-Week Wait** → Check for returns/refunds
- **Payment Date** → Process on 1st/16th (2 weeks after transaction)

### ✅ Payment Schedule
- **Transactions 1st-15th of month** → Paid on **1st of next month**
- **Transactions 16th-31st of month** → Paid on **16th of next month**

**Examples:**
- Transaction on **Jan 5** → Paid on **Feb 1**
- Transaction on **Jan 20** → Paid on **Feb 16**

### ✅ Return/Refund Protection
- Payouts are **not created** if order is refunded
- Existing payouts are **cancelled** if order is refunded before payment
- System checks for refunds before processing

### ✅ Simplified Status
- **User-facing statuses:** `PAYABLE` → `PROCESSING` → `COMPLETED`
- **No PENDING status** shown to users (internal only)

### ✅ Currency Display
- **All amounts in rounded rupees** (not paise)
- Format: `₹232` (not `₹232.00`)
- Example: `₹232` instead of `₹23200` paise

---

## Payment Flow

### 1. Buyer Payment Succeeds
```
Order Status: ESCROWED
↓
Scout Bounty: Created as PAYABLE (if applicable)
Seller Payout: Created as PAYABLE
```

### 2. 2-Week Hold Period
```
Status: PAYABLE
- Waiting for 2 weeks
- Checking for returns/refunds
- User can see "payable" amount
```

### 3. Payment Date (1st/16th)
```
If 2+ weeks old AND no refund:
  Status: PAYABLE → PROCESSING → COMPLETED
Else if refunded:
  Status: PAYABLE → CANCELLED
```

---

## Payout Statuses

| Status | Description | User Visible |
|--------|-------------|--------------|
| `payable` | Ready to be paid, waiting for 2 weeks + payment date | ✅ Yes |
| `processing` | Currently being paid | ✅ Yes |
| `completed` | Successfully paid out | ✅ Yes |
| `pending` | Internal only (not shown to users) | ❌ No |
| `failed` | Payment failed | ✅ Yes |
| `cancelled` | Cancelled (e.g., order refunded) | ✅ Yes |

---

## API Response Examples

### Get My Payouts

**Request:**
```
GET /payouts/my-payouts
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
      "amount": 10,  // ← In rupees (rounded)
      "amount_display": "₹10",  // ← Format as "₹10"
      "created_at": "2026-01-05T10:00:00Z"
    },
    {
      "payout_id": "uuid-2",
      "payout_type": "seller_payout",
      "status": "completed",
      "amount": 232,  // ← In rupees (rounded)
      "amount_display": "₹232",  // ← Format as "₹232"
      "completed_at": "2026-02-01T00:00:00Z",
      "payment_reference": "PAY-1234567890-abc12345"
    }
  ],
  "total": 2,
  "total_paid": 232,  // ← In rupees (rounded)
  "total_paid_display": "₹232",
  "payable": 10,  // ← In rupees (rounded)
  "payable_display": "₹10",
  "processing": 0,
  "processing_display": "₹0"
}
```

---

## Currency Display Updates

### All Amounts Now Show Rounded Rupees

**Before:**
```json
{
  "amount_paise": 23200,
  "amount_display": "₹232.00"
}
```

**After:**
```json
{
  "amount": 232,  // ← In rupees (rounded)
  "amount_display": "₹232"  // ← No decimals
}
```

### Updated Endpoints

✅ **Listings** - `price_display: "₹232"`  
✅ **Orders** - `item_price_display: "₹232"`  
✅ **Scout Earnings** - `total_earnings: 10, total_earnings_display: "₹10"`  
✅ **Payouts** - `amount: 232, amount_display: "₹232"`  

---

## Payment Schedule Logic

### Calculation

**For transactions 1st-15th:**
- Transaction date: Jan 1-15
- Payment date: Feb 1 (1st of next month)
- Hold period: ~2-4 weeks

**For transactions 16th-31st:**
- Transaction date: Jan 16-31
- Payment date: Feb 16 (16th of next month)
- Hold period: ~2-4 weeks

### Helper Method

```typescript
getPaymentDateForTransaction(transactionDate: Date): Date
```

Returns the scheduled payment date based on transaction date.

---

## Refund Protection

### Automatic Checks

1. **Before Creating Payout:**
   - Check if order is refunded
   - If refunded, don't create payout

2. **Before Processing Payout:**
   - Check if order is refunded
   - If refunded, cancel payout

3. **During Processing:**
   - Double-check order status
   - Skip if refunded

### Example Flow

```
Order Completed → Payout Created (PAYABLE)
↓
Order Refunded → Payout Cancelled
↓
Payment Date Arrives → Payout Skipped (already cancelled)
```

---

## Scheduled Processing

### Cron Schedule

**Schedule:** `0 0 1,16 * *` (1st and 16th of every month at midnight)

**What happens:**
1. Finds all `PAYABLE` payouts that are **2+ weeks old**
2. Filters out payouts where order is **refunded**
3. Groups by user (consolidation)
4. Processes each payout: `PAYABLE` → `PROCESSING` → `COMPLETED`
5. Updates scout earnings (deducts when payout completes)

**Logs:**
```
🔄 Starting consolidated payout processing (1st/16th)...
📋 Found 15 payable payouts (2+ weeks old, no refunds)
👥 Processing payouts for 8 users
💰 User 1: 3 payouts, Total: ₹50
✅ Payout abc123 completed: ₹10 to user 1
✅ Consolidated payout processing completed
```

---

## User Experience

### Scout View

**Before Payment Date:**
- Scout earnings show as "payable"
- Amount: `₹10` (rounded)
- Status: `payable`
- Earnings NOT deducted yet

**After Payment Date:**
- Payout status: `completed`
- Amount: `₹10` (rounded)
- Earnings deducted from scout account
- Payment reference available

### Seller View

**Before Payment Date:**
- Seller payout shows as "payable"
- Amount: `₹232` (rounded)
- Status: `payable`
- Payment not yet sent

**After Payment Date:**
- Payout status: `completed`
- Amount: `₹232` (rounded)
- Payment sent to seller
- Payment reference available

---

## Testing

### Test 2-Week Hold

1. **Complete an order:**
   ```
   PATCH /orders/:order_id/complete
   ```

2. **Check seller payout:**
   ```
   GET /payouts/my-payouts
   ```
   Should show payout with `status: "payable"`

3. **Wait 2 weeks** (or manually adjust date in database)

4. **On 1st/16th:**
   - Payout should be processed automatically
   - Status: `completed`

### Test Refund Protection

1. **Complete an order** → Payout created as `PAYABLE`

2. **Refund the order** (update order status to `refunded`)

3. **On payment date:**
   - Payout should be skipped/cancelled
   - Status: `cancelled`

### Test Currency Display

1. **Check scout earnings:**
   ```
   GET /scouts/:id/earnings
   ```
   Should show: `"total_earnings": 10, "total_earnings_display": "₹10"`

2. **Check payouts:**
   ```
   GET /payouts/my-payouts
   ```
   Should show: `"amount": 232, "amount_display": "₹232"`

---

## Database Queries

### Check Payable Payouts (2+ weeks old)

```sql
SELECT * FROM payouts 
WHERE status = 'payable' 
AND created_at <= NOW() - INTERVAL '14 days'
ORDER BY created_at ASC;
```

### Check Refunded Orders

```sql
SELECT * FROM orders 
WHERE status = 'refunded';
```

### Check Payouts for Refunded Orders

```sql
SELECT p.*, o.status as order_status
FROM payouts p
LEFT JOIN orders o ON p.order_id = o.order_id
WHERE o.status = 'refunded'
AND p.status = 'payable';
```

---

## Configuration

### Change Hold Period

Edit `src/payouts/payouts.service.ts`:

```typescript
const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
// Change 14 to your preferred days
```

### Change Payment Dates

Edit cron schedule:

```typescript
@Cron('0 0 1,16 * *') // Change to your preferred dates
```

---

## Summary of Changes

✅ **2-Week Hold Period** - Payouts held for 2 weeks to check for returns  
✅ **Payment Schedule** - 1st-15th → 1st next month, 16th-31st → 16th next month  
✅ **Refund Protection** - Automatic checks and cancellation  
✅ **Simplified Status** - PAYABLE → PROCESSING → COMPLETED (no PENDING)  
✅ **Rounded Rupees** - All amounts shown as `₹232` (not `₹232.00` or paise)  

---

## Related Files

- `src/payouts/payout.entity.ts` - Payout entity with PAYABLE status
- `src/payouts/payouts.service.ts` - 2-week hold and payment processing
- `src/payouts/payouts.controller.ts` - API endpoints
- `src/scouts/scouts.service.ts` - Scout earnings (rounded rupees)
- `src/orders/orders.controller.ts` - Seller payouts (rounded rupees)
- `src/listings/listings.controller.ts` - Listing prices (rounded rupees)

---

The updated payout system is ready! 🚀



