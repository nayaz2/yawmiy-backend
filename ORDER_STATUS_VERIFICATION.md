# Order Status & Payment ID Verification

## ✅ **WORKING - Status Flow**

### 1. **PENDING** Status
- **Location:** `src/orders/orders.service.ts:97`
- **When:** Order is created
- **Status:** ✅ **WORKING**
```typescript
status: OrderStatus.PENDING,  // Set on order creation
```

### 2. **ESCROWED** Status  
- **Location:** `src/orders/orders.service.ts:207`
- **When:** PhonePe webhook confirms successful payment
- **Status:** ✅ **WORKING**
```typescript
if (state === 'COMPLETED' && responseCode === 'PAYMENT_SUCCESS') {
  order.status = OrderStatus.ESCROWED;
  await this.ordersRepository.save(order);
}
```

### 3. **COMPLETED** Status
- **Location:** `src/orders/orders.service.ts:265`
- **When:** Buyer completes the order (after meeting/exchange)
- **Status:** ✅ **WORKING**
```typescript
order.status = OrderStatus.COMPLETED;
order.completed_at = new Date();
await this.ordersRepository.save(order);
```

### 4. **REFUNDED** Status
- **Location:** Enum exists in `src/orders/order.entity.ts:16`
- **When:** Order is refunded
- **Status:** ❌ **NOT IMPLEMENTED** (enum exists but no method to set it)

---

## ✅ **WORKING - Payment ID Storage**

### Payment ID from PhonePe
- **Location:** `src/orders/orders.service.ts:200-203`
- **When:** PhonePe webhook is received
- **Status:** ✅ **WORKING**
```typescript
// Update payment_id from PhonePe transactionId
if (transactionId) {
  order.payment_id = transactionId;
  await this.ordersRepository.save(order);
}
```

**Entity Field:**
- **Location:** `src/orders/order.entity.ts:64-65`
- **Type:** `string | null` (nullable)
- **Status:** ✅ **DEFINED**

---

## 📊 **Status Flow Summary**

```
1. CREATE ORDER
   └─> status = PENDING ✅

2. INITIATE PAYMENT
   └─> status remains PENDING ✅

3. PHONEPE WEBHOOK (Payment Success)
   └─> payment_id = transactionId ✅
   └─> status = ESCROWED ✅

4. COMPLETE ORDER
   └─> status = COMPLETED ✅
   └─> completed_at = current timestamp ✅

5. REFUND (Not Implemented)
   └─> status = REFUNDED ❌
```

---

## 🔍 **Testing Verification**

To verify everything is working:

### 1. **Test Order Creation**
```bash
POST /orders
# Check response: status should be "pending"
```

### 2. **Test Payment Webhook**
After successful payment, PhonePe webhook should:
- Update `payment_id` with PhonePe transaction ID ✅
- Update `status` to "escrowed" ✅

### 3. **Test Order Completion**
```bash
PATCH /orders/:order_id/complete
# Check response: status should be "completed"
```

### 4. **Check Order Details**
```bash
GET /orders/:order_id
# Response should include:
# - status: "pending" | "escrowed" | "completed"
# - payment_id: "T123456789" (from PhonePe)
```

---

## ⚠️ **Missing: Refund Functionality**

The `REFUNDED` status exists in the enum but there's no method to:
1. Initiate a refund via PhonePe SDK
2. Update order status to `REFUNDED`
3. Process refund webhook from PhonePe

**Would you like me to implement refund functionality?**

---

## ✅ **Summary**

| Feature | Status | Location |
|---------|--------|----------|
| Status: PENDING | ✅ Working | `orders.service.ts:97` |
| Status: ESCROWED | ✅ Working | `orders.service.ts:207` |
| Status: COMPLETED | ✅ Working | `orders.service.ts:265` |
| Status: REFUNDED | ❌ Not Implemented | Enum exists only |
| payment_id Storage | ✅ Working | `orders.service.ts:201-203` |

**Overall:** ✅ **3 out of 4 statuses working** + ✅ **payment_id working**

