# Testing Messaging System in Postman

## Prerequisites

1. **Postman installed** - Download from [postman.com](https://www.postman.com/downloads/)
2. **Two user accounts** - You'll need to register/login as two different users to test messaging
3. **JWT tokens** - Get authentication tokens for both users

---

## Step 1: Setup Authentication

### 1.1 Register/Login User 1

**Request:**
- Method: `POST`
- URL: `https://yawmiy-backend.onrender.com/auth/register`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "email": "user1@university.edu",
    "password": "Test123!",
    "student_id": "12345678",
    "name": "User One"
  }
  ```

**Then Login:**
- Method: `POST`
- URL: `https://yawmiy-backend.onrender.com/auth/login`
- Body:
  ```json
  {
    "email": "user1@university.edu",
    "password": "Test123!"
  }
  ```

**Save the token** from the response (you'll need it for all messaging requests).

### 1.2 Register/Login User 2

Repeat the same process for User 2:
- Email: `user2@university.edu`
- Student ID: `87654321`
- Name: `User Two`

**Save User 2's token** as well.

---

## Step 2: Create Postman Environment (Optional but Recommended)

1. Click **Environments** → **+** (Create new)
2. Name it: `Yawmiy Messaging`
3. Add variables:
   - `base_url`: `https://yawmiy-backend.onrender.com`
   - `user1_token`: `<paste User 1 token>`
   - `user2_token`: `<paste User 2 token>`
   - `user1_id`: `1` (or the actual user ID)
   - `user2_id`: `2` (or the actual user ID)
4. Click **Save**

Now you can use `{{base_url}}` and `{{user1_token}}` in your requests!

---

## Step 3: Test Messaging Endpoints

### Test 1: Send Message (User 1 → User 2)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/messages`
  - Or: `https://yawmiy-backend.onrender.com/messages`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "recipient_id": "2",
    "content": "Hi! Is this item still available?"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "id": "message-uuid-123",
  "content": "Hi! Is this item still available?",
  "recipient_id": 2,
  "listing_id": null,
  "order_id": null,
  "status": "sent",
  "created_at": "2026-01-05T10:00:00.000Z"
}
```

**Save the message ID** for later tests.

---

### Test 2: Send Message with Listing Link (User 1 → User 2)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/messages`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "recipient_id": "2",
    "content": "I'm interested in your laptop listing. When can we meet?",
    "listing_id": "your-listing-uuid-here"
  }
  ```

**Note:** Replace `your-listing-uuid-here` with an actual listing ID from your database.

---

### Test 3: Get All Conversations (User 1)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/messages/conversations`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  ```

**Expected Response (200 OK):**
```json
[
  {
    "user": {
      "id": 2,
      "name": "User Two",
      "email": "user2@university.edu"
    },
    "last_message": {
      "id": "message-uuid-123",
      "content": "Hi! Is this item still available?",
      "created_at": "2026-01-05T10:00:00.000Z",
      "is_sent_by_me": true
    },
    "unread_count": 0
  }
]
```

---

### Test 4: Get Conversation with User 2 (User 1's perspective)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/messages/conversations/2`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  ```

**Expected Response (200 OK):**
```json
{
  "messages": [
    {
      "id": "message-uuid-123",
      "sender_id": 1,
      "recipient_id": 2,
      "content": "Hi! Is this item still available?",
      "listing_id": null,
      "order_id": null,
      "status": "read",
      "read_at": "2026-01-05T10:05:00.000Z",
      "created_at": "2026-01-05T10:00:00.000Z",
      "sender": {
        "id": 1,
        "name": "User One",
        "email": "user1@university.edu"
      },
      "recipient": {
        "id": 2,
        "name": "User Two",
        "email": "user2@university.edu"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "other_user": {
    "id": 2,
    "name": "User Two",
    "email": "user2@university.edu"
  }
}
```

**Note:** Messages are automatically marked as read when you fetch the conversation.

---

### Test 5: Send Reply (User 2 → User 1)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/messages`
- Headers:
  ```
  Authorization: Bearer {{user2_token}}
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "recipient_id": "1",
    "content": "Yes, it's still available! When would you like to meet?"
  }
  ```

---

### Test 6: Get Conversation with User 1 (User 2's perspective)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/messages/conversations/1`
- Headers:
  ```
  Authorization: Bearer {{user2_token}}
  ```

**Expected Response:** Should show both messages in the conversation.

---

### Test 7: Get Unread Count (User 1)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/messages/unread-count`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  ```

**Expected Response (200 OK):**
```json
{
  "unread_count": 1
}
```

---

### Test 8: Get Conversation with Pagination

**Request:**
- Method: `GET`
- URL: `{{base_url}}/messages/conversations/2?page=1&limit=10`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  ```

**Query Parameters:**
- `page`: 1
- `limit`: 10

---

### Test 9: Get Conversation Filtered by Listing

**Request:**
- Method: `GET`
- URL: `{{base_url}}/messages/conversations/2?listing_id=your-listing-uuid`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  ```

**Query Parameters:**
- `listing_id`: `<your-listing-uuid>`

---

### Test 10: Mark Single Message as Read

**Request:**
- Method: `POST`
- URL: `{{base_url}}/messages/mark-read`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "message_ids": ["message-uuid-1"]
  }
  ```

**Expected Response (200 OK):**
```json
{
  "message": "Messages marked as read",
  "marked_count": 1,
  "requested_count": 1
}
```

---

### Test 11: Mark Multiple Messages as Read

**Request:**
- Method: `POST`
- URL: `{{base_url}}/messages/mark-read`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "message_ids": ["message-uuid-1", "message-uuid-2", "message-uuid-3"]
  }
  ```

**Expected Response (200 OK):**
```json
{
  "message": "Messages marked as read",
  "marked_count": 3,
  "requested_count": 3
}
```

**Note:** 
- `marked_count` = Number of messages actually marked as read (only unread messages are updated)
- `requested_count` = Number of message IDs you sent
- If some messages are already read, `marked_count` may be less than `requested_count`

---

## Step 4: Error Testing

### Test 11: Send Message to Yourself (Should Fail)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/messages`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "recipient_id": "1",
    "content": "Trying to message myself"
  }
  ```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Cannot send message to yourself",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### Test 12: Send Message Without Authentication (Should Fail)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/messages`
- Headers:
  ```
  Content-Type: application/json
  ```
  (No Authorization header)

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### Test 13: Send Message to Non-Existent User (Should Fail)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/messages`
- Headers:
  ```
  Authorization: Bearer {{user1_token}}
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "recipient_id": "99999",
    "content": "Message to non-existent user"
  }
  ```

**Expected Response (404 Not Found):**
```json
{
  "message": "Recipient not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Step 5: Create Postman Collection (Optional)

1. Click **Collections** → **+** (New Collection)
2. Name it: `Yawmiy Messaging API`
3. Add all the requests above as items in the collection
4. Set collection variables:
   - `base_url`: `https://yawmiy-backend.onrender.com`
   - `user1_token`: `<your token>`
   - `user2_token`: `<your token>`

---

## Quick Test Flow

Here's a quick flow to test the entire messaging system:

1. ✅ **User 1 sends message to User 2**
   - POST `/messages` (User 1 token)
   - Body: `{"recipient_id": "2", "content": "Hello!"}`

2. ✅ **User 1 checks conversations**
   - GET `/messages/conversations` (User 1 token)
   - Should see User 2 in the list

3. ✅ **User 2 checks unread count**
   - GET `/messages/unread-count` (User 2 token)
   - Should show `unread_count: 1`

4. ✅ **User 2 gets conversation**
   - GET `/messages/conversations/1` (User 2 token)
   - Should see the message from User 1

5. ✅ **User 2 replies**
   - POST `/messages` (User 2 token)
   - Body: `{"recipient_id": "1", "content": "Hi there!"}`

6. ✅ **User 1 checks conversation again**
   - GET `/messages/conversations/2` (User 1 token)
   - Should see both messages

---

## Tips

1. **Save tokens in environment variables** - Don't hardcode them
2. **Use Pre-request Scripts** - Auto-refresh tokens if needed
3. **Use Tests tab** - Add assertions to verify responses
4. **Export collection** - Share with your team

---

## Example Postman Collection JSON

You can import this into Postman:

```json
{
  "info": {
    "name": "Yawmiy Messaging API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Send Message",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{user1_token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"recipient_id\": \"2\",\n  \"content\": \"Hi! Is this item still available?\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/messages",
          "host": ["{{base_url}}"],
          "path": ["messages"]
        }
      }
    },
    {
      "name": "Get Conversations",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{user1_token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/messages/conversations",
          "host": ["{{base_url}}"],
          "path": ["messages", "conversations"]
        }
      }
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Unauthorized" (401)
- **Solution:** Check that your Authorization header has `Bearer ` prefix
- Format: `Authorization: Bearer YOUR_TOKEN_HERE`

### Issue: "Recipient not found" (404)
- **Solution:** Verify the recipient_id exists in your database
- Make sure you're using the correct user ID (number, not email)

### Issue: "Cannot send message to yourself" (400)
- **Solution:** Use different user IDs for sender and recipient

### Issue: Empty conversations list
- **Solution:** Make sure you've sent at least one message first

---

## Next Steps

After testing in Postman:
1. ✅ Verify all endpoints work correctly
2. ✅ Test error cases
3. ✅ Integrate with your frontend
4. ✅ Add real-time features (WebSockets) if needed

Happy testing! 🚀

