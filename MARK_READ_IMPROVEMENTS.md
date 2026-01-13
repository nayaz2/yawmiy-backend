# Mark Messages as Read - Improvements

## ✅ Feature: Support Single and Multiple Message IDs

The `POST /messages/mark-read` endpoint now properly supports marking **both single and multiple messages** as read.

---

## Changes Made

### 1. Enhanced Service Method

**File:** `src/messages/messages.service.ts`

**Improvements:**
- ✅ Uses `In()` operator which works for both single and multiple IDs
- ✅ Returns count of messages actually marked as read
- ✅ Validates and filters out invalid/empty IDs
- ✅ Better error handling

**Code:**
```typescript
async markAsRead(userId: number, messageIds: string[]): Promise<number> {
  // Validation
  if (!messageIds || messageIds.length === 0) {
    throw new BadRequestException('message_ids array is required and cannot be empty');
  }

  // Filter valid IDs
  const validMessageIds = messageIds.filter((id) => id && id.trim().length > 0);
  if (validMessageIds.length === 0) {
    throw new BadRequestException('At least one valid message ID is required');
  }

  // Update (works for both single and multiple IDs)
  const updateResult = await this.messagesRepository.update(
    {
      id: In(validMessageIds),  // ✅ Works for 1 or many
      recipient_id: userId,
      status: MessageStatus.SENT,
    },
    {
      status: MessageStatus.READ,
      read_at: new Date(),
    },
  );

  return updateResult.affected || 0;  // Return count
}
```

### 2. Enhanced Controller Response

**File:** `src/messages/messages.controller.ts`

**Improvements:**
- ✅ Returns count of messages marked
- ✅ Shows requested vs actual count
- ✅ Better DTO validation

**Response:**
```json
{
  "message": "Messages marked as read",
  "marked_count": 2,
  "requested_count": 3
}
```

### 3. Added DTO Validation

**File:** `src/messages/dto/mark-read.dto.ts` (NEW)

**Features:**
- ✅ Validates array format
- ✅ Ensures at least one message ID
- ✅ Validates each ID is a valid UUID
- ✅ Type-safe validation

---

## Usage Examples

### Example 1: Mark Single Message as Read

**Request:**
```bash
POST /messages/mark-read
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "message_ids": ["message-uuid-123"]
}
```

**Response:**
```json
{
  "message": "Messages marked as read",
  "marked_count": 1,
  "requested_count": 1
}
```

---

### Example 2: Mark Multiple Messages as Read

**Request:**
```bash
POST /messages/mark-read
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "message_ids": [
    "message-uuid-123",
    "message-uuid-456",
    "message-uuid-789"
  ]
}
```

**Response:**
```json
{
  "message": "Messages marked as read",
  "marked_count": 3,
  "requested_count": 3
}
```

---

### Example 3: Partial Success (Some Already Read)

If you request to mark 3 messages as read, but 1 is already read:

**Request:**
```json
{
  "message_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:**
```json
{
  "message": "Messages marked as read",
  "marked_count": 2,  // Only 2 were unread
  "requested_count": 3
}
```

---

## Postman Testing

### Test Single Message

1. **Request:**
   - Method: `POST`
   - URL: `{{base_url}}/messages/mark-read`
   - Headers: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
       "message_ids": ["your-message-uuid"]
     }
     ```

2. **Expected:** ✅ Success with `marked_count: 1`

### Test Multiple Messages

1. **Request:**
   - Method: `POST`
   - URL: `{{base_url}}/messages/mark-read`
   - Headers: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
       "message_ids": ["uuid-1", "uuid-2", "uuid-3"]
     }
     ```

2. **Expected:** ✅ Success with `marked_count: 3` (or less if some already read)

---

## Validation Rules

✅ **Array Required:** `message_ids` must be an array  
✅ **At Least One:** Array must have at least 1 item  
✅ **Valid UUIDs:** Each message ID must be a valid UUID  
✅ **Empty IDs Filtered:** Empty or whitespace-only IDs are automatically filtered out  
✅ **User Ownership:** Only messages sent TO you can be marked as read  
✅ **Unread Only:** Only messages with status `SENT` (unread) are updated  

---

## Error Cases

### Empty Array
```json
{
  "message_ids": []
}
```
**Response:** `400 Bad Request` - "At least one valid message ID is required"

### Invalid UUID
```json
{
  "message_ids": ["invalid-id"]
}
```
**Response:** `400 Bad Request` - Validation error for invalid UUID

### Not Your Messages
```json
{
  "message_ids": ["message-you-didnt-receive"]
}
```
**Response:** `200 OK` but `marked_count: 0` (no messages updated)

---

## Response Fields Explained

| Field | Description |
|-------|-------------|
| `message` | Success message |
| `marked_count` | Number of messages actually marked as read |
| `requested_count` | Number of message IDs you sent in the request |

**Note:** `marked_count` may be less than `requested_count` if:
- Some messages are already read
- Some message IDs don't exist
- Some messages weren't sent to you

---

## Status

- ✅ Single message ID: **Supported**
- ✅ Multiple message IDs: **Supported**
- ✅ Validation: **Added**
- ✅ Response with counts: **Added**
- ✅ Error handling: **Improved**
- ✅ Build: **Successful**

---

## Testing Checklist

- [ ] Mark single message as read
- [ ] Mark multiple messages as read
- [ ] Verify unread count decreases
- [ ] Test with already-read messages
- [ ] Test with invalid UUIDs
- [ ] Test with empty array
- [ ] Test with messages not sent to you

---

## Related Files

- `src/messages/messages.service.ts` - Service implementation
- `src/messages/messages.controller.ts` - Controller endpoint
- `src/messages/dto/mark-read.dto.ts` - DTO validation
- `POSTMAN_MESSAGING_TEST_GUIDE.md` - Updated testing guide

---

The feature now fully supports both single and multiple message IDs! 🎉





