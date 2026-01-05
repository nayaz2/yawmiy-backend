# Messaging System Guide

## Overview

A basic messaging system that allows users to communicate with each other, with optional links to listings and orders.

## Features

✅ **Send messages** between users  
✅ **Get conversations** with other users  
✅ **Link messages to listings** (for listing-related chats)  
✅ **Link messages to orders** (for order-related chats)  
✅ **Read/unread status** tracking  
✅ **Unread message count**  
✅ **Pagination** for conversation history  

---

## API Endpoints

### 1. Send Message

**POST** `/messages`

Send a message to another user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "recipient_id": "2",
  "content": "Hi! Is this item still available?",
  "listing_id": "uuid-optional",  // Optional: Link to listing
  "order_id": "uuid-optional"      // Optional: Link to order
}
```

**Response:**
```json
{
  "id": "message-uuid",
  "content": "Hi! Is this item still available?",
  "recipient_id": 2,
  "listing_id": "uuid-optional",
  "order_id": null,
  "status": "sent",
  "created_at": "2026-01-05T10:00:00Z"
}
```

---

### 2. Get All Conversations

**GET** `/messages/conversations`

Get list of all users you've messaged with, including last message and unread count.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
[
  {
    "user": {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane@university.edu"
    },
    "last_message": {
      "id": "message-uuid",
      "content": "Yes, it's still available!",
      "created_at": "2026-01-05T10:30:00Z",
      "is_sent_by_me": false
    },
    "unread_count": 2
  },
  {
    "user": {
      "id": 3,
      "name": "Bob Smith",
      "email": "bob@university.edu"
    },
    "last_message": {
      "id": "message-uuid-2",
      "content": "When can we meet?",
      "created_at": "2026-01-05T09:00:00Z",
      "is_sent_by_me": true
    },
    "unread_count": 0
  }
]
```

---

### 3. Get Conversation with Specific User

**GET** `/messages/conversations/:userId`

Get conversation history with a specific user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)
- `listing_id` (optional): Filter by listing
- `order_id` (optional): Filter by order

**Example:**
```
GET /messages/conversations/2?page=1&limit=50&listing_id=uuid-123
```

**Response:**
```json
{
  "messages": [
    {
      "id": "message-uuid-1",
      "sender_id": 1,
      "recipient_id": 2,
      "content": "Hi! Is this item still available?",
      "listing_id": "uuid-123",
      "order_id": null,
      "status": "read",
      "read_at": "2026-01-05T10:15:00Z",
      "created_at": "2026-01-05T10:00:00Z",
      "sender": {
        "id": 1,
        "name": "John Doe",
        "email": "john@university.edu"
      },
      "recipient": {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane@university.edu"
      }
    },
    {
      "id": "message-uuid-2",
      "sender_id": 2,
      "recipient_id": 1,
      "content": "Yes, it's still available!",
      "listing_id": "uuid-123",
      "order_id": null,
      "status": "read",
      "read_at": "2026-01-05T10:20:00Z",
      "created_at": "2026-01-05T10:05:00Z",
      "sender": {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane@university.edu"
      },
      "recipient": {
        "id": 1,
        "name": "John Doe",
        "email": "john@university.edu"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "other_user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@university.edu"
  }
}
```

**Note:** Messages are automatically marked as read when you fetch the conversation.

---

### 4. Get Unread Count

**GET** `/messages/unread-count`

Get total number of unread messages.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "unread_count": 5
}
```

---

### 5. Mark Messages as Read

**POST** `/messages/mark-read`

Manually mark specific messages as read.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "message_ids": ["message-uuid-1", "message-uuid-2"]
}
```

**Response:**
```json
{
  "message": "Messages marked as read"
}
```

---

## Usage Examples

### Example 1: Buyer asks about a listing

```bash
# Buyer sends message about a listing
curl -X POST https://yawmiy-backend.onrender.com/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "2",
    "content": "Hi! Is this laptop still available?",
    "listing_id": "listing-uuid-123"
  }'
```

### Example 2: Seller responds

```bash
# Seller responds
curl -X POST https://yawmiy-backend.onrender.com/messages \
  -H "Authorization: Bearer SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "1",
    "content": "Yes, it is! When would you like to meet?",
    "listing_id": "listing-uuid-123"
  }'
```

### Example 3: Get conversation

```bash
# Get conversation between buyer and seller
curl "https://yawmiy-backend.onrender.com/messages/conversations/2?listing_id=listing-uuid-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 4: Get all conversations

```bash
# Get all your conversations
curl "https://yawmiy-backend.onrender.com/messages/conversations" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 5: Check unread messages

```bash
# Get unread count
curl "https://yawmiy-backend.onrender.com/messages/unread-count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Schema

### Message Entity

```typescript
{
  id: string (UUID)
  sender_id: number
  recipient_id: number
  content: string (max 2000 chars)
  listing_id?: string (UUID, optional)
  order_id?: string (UUID, optional)
  status: 'sent' | 'delivered' | 'read'
  read_at?: Date
  created_at: Date
}
```

### Indexes

- `(sender_id, recipient_id)` - Fast conversation queries
- `listing_id` - Fast listing-related message queries
- `order_id` - Fast order-related message queries
- `created_at` - Fast chronological sorting

---

## Message Status Flow

1. **SENT** - Message sent (default)
2. **READ** - Message read by recipient (auto-updated when conversation is fetched)

---

## Security & Validation

✅ **Authentication required** - All endpoints require JWT token  
✅ **Cannot message yourself** - Validation prevents self-messaging  
✅ **Recipient validation** - Verifies recipient exists  
✅ **Order access control** - Only buyer/seller can message about an order  
✅ **Content length limit** - Max 2000 characters per message  
✅ **Input sanitization** - Content is trimmed  

---

## Frontend Integration Example

### React/Next.js

```typescript
// Send message
const sendMessage = async (recipientId: number, content: string, listingId?: string) => {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient_id: recipientId.toString(),
      content,
      listing_id: listingId,
    }),
  });
  return response.json();
};

// Get conversation
const getConversation = async (userId: number, page = 1) => {
  const response = await fetch(
    `/api/messages/conversations/${userId}?page=${page}&limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.json();
};

// Get all conversations
const getConversations = async () => {
  const response = await fetch('/api/messages/conversations', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

---

## Future Enhancements

Potential improvements:
- [ ] Real-time messaging with WebSockets
- [ ] Message attachments (images, files)
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Message search
- [ ] Block/unblock users
- [ ] Message deletion
- [ ] Group messages
- [ ] Push notifications

---

## Testing

### Test in Postman

1. **Send Message:**
   - Method: POST
   - URL: `https://yawmiy-backend.onrender.com/messages`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Body:
     ```json
     {
       "recipient_id": "2",
       "content": "Test message"
     }
     ```

2. **Get Conversations:**
   - Method: GET
   - URL: `https://yawmiy-backend.onrender.com/messages/conversations`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

3. **Get Conversation:**
   - Method: GET
   - URL: `https://yawmiy-backend.onrender.com/messages/conversations/2`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

---

## Related Files

- `src/messages/message.entity.ts` - Message entity definition
- `src/messages/messages.service.ts` - Business logic
- `src/messages/messages.controller.ts` - API endpoints
- `src/messages/messages.module.ts` - Module configuration
- `src/messages/dto/create-message.dto.ts` - Create message DTO
- `src/messages/dto/query-messages.dto.ts` - Query parameters DTO

