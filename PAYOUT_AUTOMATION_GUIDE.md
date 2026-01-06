# Payout Automation System

## Overview

Automated payout system that processes scout bounties and seller payouts automatically using scheduled jobs (cron).

---

## Features

✅ **Automatic Processing** - Payouts are processed hourly via cron job  
✅ **Scout Bounties** - Automatic payout requests when scouts request earnings  
✅ **Seller Payouts** - Automatic payout creation when orders are completed  
✅ **Status Tracking** - Full payout lifecycle tracking (pending → processing → completed/failed)  
✅ **Retry Mechanism** - Failed payouts can be retried  
✅ **Admin Management** - Admin endpoints for payout management  

---

## How It Works

### 1. Scout Payout Flow

1. **Scout requests payout:**
   ```
   POST /scouts/:id/request-payout
   Body: { "amount_paise": 1000 } // Optional, defaults to all earnings
   ```

2. **Payout request created:**
   - Status: `PENDING`
   - Type: `scout_bounty`
   - Linked to scout

3. **Automated processing (hourly cron):**
   - Processes pending payouts
   - Updates status to `PROCESSING`
   - Simulates payment (in production, integrate with payment gateway)
   - Updates status to `COMPLETED` or `FAILED`
   - Deducts from scout earnings if successful

### 2. Seller Payout Flow

1. **Order completed:**
   ```
   PATCH /orders/:order_id/complete
   ```

2. **Payout automatically created:**
   - Status: `PENDING`
   - Type: `seller_payout`
   - Linked to order
   - Amount: Item price (platform fee already deducted)

3. **Automated processing (hourly cron):**
   - Processes pending payouts
   - Updates status to `PROCESSING`
   - Simulates payment
   - Updates status to `COMPLETED` or `FAILED`

---

## API Endpoints

### User Endpoints

#### Get My Payouts
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
      "status": "completed",
      "amount_paise": 1000,
      "created_at": "2026-01-05T10:00:00Z",
      "completed_at": "2026-01-05T11:00:00Z",
      "payment_reference": "PAY-1234567890-abc12345"
    }
  ],
  "total": 5,
  "total_paid_paise": 5000,
  "pending_paise": 1000
}
```

### Admin Endpoints

#### Get All Payouts
```
GET /payouts?status=pending&page=1&limit=50
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `processing`, `completed`, `failed`, `cancelled`)
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Process Payout Manually
```
POST /payouts/process/:payout_id
Authorization: Bearer <admin_token>
```

#### Retry Failed Payout
```
POST /payouts/:payout_id/retry
Authorization: Bearer <admin_token>
```

#### Cancel Payout
```
POST /payouts/:payout_id/cancel
Authorization: Bearer <admin_token>
```

---

## Payout Statuses

| Status | Description |
|--------|-------------|
| `pending` | Requested, waiting to process |
| `processing` | Currently being processed |
| `completed` | Successfully paid out |
| `failed` | Payment failed |
| `cancelled` | Cancelled by admin |

---

## Scheduled Jobs

### Automatic Payout Processing

**Schedule:** Every hour (`@Cron(CronExpression.EVERY_HOUR)`)

**What it does:**
1. Finds all pending payouts (up to 10 at a time)
2. Processes each payout sequentially
3. Updates status based on payment result
4. Logs all activities

**Logs:**
```
🔄 Starting automated payout processing...
📋 Found 3 pending payouts
✅ Payout abc123 completed: ₹10.00 to user 1
❌ Payout def456 failed
✅ Automated payout processing completed
```

---

## Database Schema

### Payout Entity

```typescript
{
  payout_id: string (UUID)
  user_id: number
  payout_type: 'scout_bounty' | 'seller_payout'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount_paise: number
  scout_id?: string (for scout bounties)
  order_id?: string (for seller payouts)
  payment_reference?: string
  failure_reason?: string
  processed_at?: Date
  completed_at?: Date
  created_at: Date
  updated_at: Date
}
```

---

## Integration Points

### 1. Scout Payout Request

**File:** `src/scouts/scouts.controller.ts`

When scout requests payout:
- Creates payout request via `PayoutsService.createPayoutRequest()`
- Type: `PayoutType.SCOUT_BOUNTY`
- Linked to scout

### 2. Seller Payout on Order Completion

**File:** `src/orders/orders.controller.ts`

When order is completed:
- Creates payout request via `PayoutsService.createPayoutRequest()`
- Type: `PayoutType.SELLER_PAYOUT`
- Linked to order
- Amount: Seller payout (item price)

### 3. Scout Earnings Deduction

**File:** `src/payouts/payouts.service.ts`

When scout payout is completed:
- Deducts amount from scout's `earnings_paise`
- Updates scout record

---

## Payment Gateway Integration

### Current Implementation

Currently uses **simulated payment processing**:
- 95% success rate (for testing)
- 1 second delay to simulate API call
- Returns success/failure randomly

### Production Integration

To integrate with actual payment gateway (PhonePe, Razorpay, etc.):

1. **Replace `simulatePayment()` method:**
   ```typescript
   private async simulatePayment(payout: Payout): Promise<boolean> {
     // Replace with actual payment gateway API call
     const response = await paymentGateway.transfer({
       amount: payout.amount_paise,
       recipient: payout.user.bank_account,
       // ... other details
     });
     
     if (response.success) {
       payout.payment_reference = response.transaction_id;
       return true;
     }
     
     payout.failure_reason = response.error_message;
     return false;
   }
   ```

2. **Add payment gateway configuration:**
   - Add credentials to `.env`
   - Add to `render.yaml` for production

---

## Testing

### Test Scout Payout

1. **Register as scout** (if not already)
2. **Earn some bounties** (recruit users who make sales)
3. **Request payout:**
   ```
   POST /scouts/:scout_id/request-payout
   Authorization: Bearer <token>
   Body: { "amount_paise": 1000 }
   ```
4. **Check payout status:**
   ```
   GET /payouts/my-payouts
   Authorization: Bearer <token>
   ```
5. **Wait for cron job** (or manually trigger via admin endpoint)

### Test Seller Payout

1. **Complete an order:**
   ```
   PATCH /orders/:order_id/complete
   Authorization: Bearer <token>
   ```
2. **Payout is automatically created**
3. **Check payout status:**
   ```
   GET /payouts/my-payouts
   Authorization: Bearer <token>
   ```

### Test Admin Endpoints

1. **Get all payouts:**
   ```
   GET /payouts?status=pending
   Authorization: Bearer <admin_token>
   ```

2. **Manually process payout:**
   ```
   POST /payouts/process/:payout_id
   Authorization: Bearer <admin_token>
   ```

3. **Retry failed payout:**
   ```
   POST /payouts/:payout_id/retry
   Authorization: Bearer <admin_token>
   ```

---

## Configuration

### Cron Schedule

**Current:** Every hour

**To change:** Edit `src/payouts/payouts.service.ts`:
```typescript
@Cron(CronExpression.EVERY_HOUR) // Change this
```

**Options:**
- `EVERY_HOUR` - Every hour
- `EVERY_30_MINUTES` - Every 30 minutes
- `EVERY_DAY_AT_MIDNIGHT` - Daily at midnight
- Custom: `@Cron('0 */6 * * *')` - Every 6 hours

### Batch Size

**Current:** 10 payouts per run

**To change:** Edit `take: 10` in `processPendingPayouts()` method

---

## Monitoring

### Logs

The system logs all payout activities:

```
🔄 Starting automated payout processing...
📋 Found 3 pending payouts
✅ Payout abc123 completed: ₹10.00 to user 1
❌ Payout def456 failed
✅ Automated payout processing completed
```

### Database Queries

**Check pending payouts:**
```sql
SELECT * FROM payouts WHERE status = 'pending' ORDER BY created_at ASC;
```

**Check failed payouts:**
```sql
SELECT * FROM payouts WHERE status = 'failed' ORDER BY created_at DESC;
```

**Check payout statistics:**
```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount_paise) as total_paise
FROM payouts
GROUP BY status;
```

---

## Troubleshooting

### Issue: Payouts not processing

**Solutions:**
1. Check cron job is running (check logs)
2. Verify `ScheduleModule` is imported in `PayoutsModule`
3. Check for errors in logs
4. Manually trigger via admin endpoint

### Issue: Payouts failing

**Solutions:**
1. Check `failure_reason` in payout record
2. Verify payment gateway integration (if using real gateway)
3. Retry failed payouts via admin endpoint
4. Check user's payment details are correct

### Issue: Scout earnings not deducted

**Solutions:**
1. Verify payout status is `completed`
2. Check scout record for earnings deduction
3. Check logs for errors during processing

---

## Future Enhancements

- [ ] Real payment gateway integration (PhonePe, Razorpay)
- [ ] Email notifications for payout status
- [ ] Payout limits (minimum/maximum amounts)
- [ ] Payout schedules (daily, weekly, monthly)
- [ ] Bulk payout processing
- [ ] Payout analytics dashboard
- [ ] Webhook support for payment gateway callbacks

---

## Related Files

- `src/payouts/payout.entity.ts` - Payout entity
- `src/payouts/payouts.service.ts` - Payout business logic
- `src/payouts/payouts.controller.ts` - API endpoints
- `src/payouts/payouts.module.ts` - Module configuration
- `src/scouts/scouts.controller.ts` - Scout payout requests
- `src/orders/orders.controller.ts` - Seller payout creation

---

The payout automation system is ready! Payouts will be processed automatically every hour. 🚀



