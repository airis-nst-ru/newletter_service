# Newsletter API Documentation

## Overview

The Newsletter API allows authenticated users to create, manage, and send newsletters. Each newsletter has:
- A main newsletter entry with metadata (due date, sent status, created by user)
- Newsletter content with HTML title and raw HTML content

## Database Schema

### Newsletter Model
```
- id: String (MongoDB ObjectId)
- dueDate: DateTime (when newsletter should be sent)
- sentDate: DateTime? (when it was actually sent)
- sent: Boolean (true if sent)
- supportingNewsSection: Boolean (flag for news section support)
- createdBy: User (who created it)
- createdAt: DateTime
- updatedAt: DateTime
- content: NewsletterContent (one-to-one relationship)
```

### NewsletterContent Model
```
- id: String (MongoDB ObjectId)
- title: String
- content: String (raw HTML)
- newsletter: Newsletter (parent)
- createdAt: DateTime
- updatedAt: DateTime
```

## Authentication

All newsletter endpoints require authentication. Include your access token in cookies or Authorization header:

```bash
Authorization: Bearer <accessToken>
# OR browser automatically includes: Cookie: accessToken=<token>
```

## API Endpoints

### 1. Create Newsletter
**POST** `/api/v1/newsletters`

Create a new newsletter with content.

**Request Body:**
```json
{
  "dueDate": "2026-05-20T10:00:00Z",
  "title": "May Newsletter",
  "content": "<h1>Welcome</h1><p>Newsletter content in HTML</p>",
  "supportingNewsSection": true
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Newsletter created successfully",
  "data": {
    "id": "newsletter-id",
    "dueDate": "2026-05-20T10:00:00.000Z",
    "sentDate": null,
    "sent": false,
    "supportingNewsSection": true,
    "createdById": "user-id",
    "createdAt": "2026-05-13T10:00:00.000Z",
    "updatedAt": "2026-05-13T10:00:00.000Z",
    "createdBy": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username"
    },
    "content": {
      "id": "content-id",
      "title": "May Newsletter",
      "content": "<h1>Welcome</h1><p>Newsletter content in HTML</p>",
      "newsletterId": "newsletter-id",
      "createdAt": "2026-05-13T10:00:00.000Z",
      "updatedAt": "2026-05-13T10:00:00.000Z"
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "dueDate, title, and content are required"
}
```

### 2. Get All Newsletters
**GET** `/api/v1/newsletters`

Retrieve all newsletters with their content, ordered by creation date (newest first).

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Newsletters retrieved successfully",
  "data": [
    {
      "id": "newsletter-id",
      "dueDate": "2026-05-20T10:00:00.000Z",
      "sentDate": null,
      "sent": false,
      "supportingNewsSection": true,
      "createdBy": {
        "id": "user-id",
        "email": "user@example.com",
        "username": "username"
      },
      "content": {
        "id": "content-id",
        "title": "May Newsletter",
        "content": "<h1>Welcome</h1><p>Newsletter content in HTML</p>",
        "newsletterId": "newsletter-id"
      }
    }
  ]
}
```

### 3. Get Newsletter by ID
**GET** `/api/v1/newsletters/:id`

Retrieve a specific newsletter with its content.

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Newsletter retrieved successfully",
  "data": {
    "id": "newsletter-id",
    "dueDate": "2026-05-20T10:00:00.000Z",
    "sentDate": null,
    "sent": false,
    "supportingNewsSection": true,
    "createdBy": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username"
    },
    "content": {
      "id": "content-id",
      "title": "May Newsletter",
      "content": "<h1>Welcome</h1><p>Newsletter content in HTML</p>"
    }
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Newsletter not found"
}
```

### 4. Update Newsletter
**PUT** `/api/v1/newsletters/:id`

Update newsletter metadata and/or content. Only the creator can update.

**Request Body (all optional):**
```json
{
  "dueDate": "2026-05-25T10:00:00Z",
  "title": "Updated May Newsletter",
  "content": "<h1>Updated</h1><p>New content</p>",
  "supportingNewsSection": false,
  "sent": false,
  "sentDate": null
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Newsletter updated successfully",
  "data": {
    "id": "newsletter-id",
    "dueDate": "2026-05-25T10:00:00.000Z",
    "sentDate": null,
    "sent": false,
    "supportingNewsSection": false,
    "createdBy": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username"
    },
    "content": {
      "id": "content-id",
      "title": "Updated May Newsletter",
      "content": "<h1>Updated</h1><p>New content</p>"
    }
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized to update this newsletter"
}
```

### 5. Mark Newsletter as Sent
**PATCH** `/api/v1/newsletters/:id/send`

Mark a newsletter as sent and set the sent date to current time. Only the creator can mark as sent.

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Newsletter marked as sent",
  "data": {
    "id": "newsletter-id",
    "dueDate": "2026-05-20T10:00:00.000Z",
    "sentDate": "2026-05-20T15:30:00.000Z",
    "sent": true,
    "supportingNewsSection": true,
    "createdBy": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username"
    },
    "content": {
      "id": "content-id",
      "title": "May Newsletter",
      "content": "<h1>Welcome</h1><p>Newsletter content in HTML</p>"
    }
  }
}
```

### 6. Delete Newsletter
**DELETE** `/api/v1/newsletters/:id`

Delete a newsletter and its content. Only the creator can delete.

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Newsletter deleted successfully"
}
```

**Error (403):**
```json
{
  "success": false,
  "message": "Unauthorized to delete this newsletter"
}
```

## Example Usage

### Create Newsletter (cURL)
```bash
curl -X POST http://localhost:5001/api/v1/newsletters \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=<token>" \
  -d '{
    "dueDate": "2026-05-20T10:00:00Z",
    "title": "May Newsletter",
    "content": "<h1>Welcome to May</h1><p>This month we have exciting updates</p>",
    "supportingNewsSection": true
  }'
```

### Get All Newsletters (cURL)
```bash
curl -X GET http://localhost:5001/api/v1/newsletters \
  -H "Cookie: accessToken=<token>"
```

### Mark as Sent (cURL)
```bash
curl -X PATCH http://localhost:5001/api/v1/newsletters/newsletter-id/send \
  -H "Cookie: accessToken=<token>"
```

### Frontend Integration (JavaScript)
```javascript
// Create newsletter
const response = await fetch('/api/v1/newsletters', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dueDate: new Date('2026-05-20').toISOString(),
    title: 'May Newsletter',
    content: '<h1>Welcome</h1><p>Content here</p>',
    supportingNewsSection: true
  })
});

// Get all newsletters
const newsletters = await fetch('/api/v1/newsletters', {
  credentials: 'include'
});

// Mark as sent
const sent = await fetch('/api/v1/newsletters/id/send', {
  method: 'PATCH',
  credentials: 'include'
});

// Update newsletter
const updated = await fetch('/api/v1/newsletters/id', {
  method: 'PUT',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Title',
    content: '<h1>Updated</h1>'
  })
});
```

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- **201**: Created successfully
- **200**: Success
- **400**: Bad request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (not creator)
- **404**: Not found
- **500**: Server error

## Authorization

- Only authenticated users can create newsletters
- Only the newsletter creator can update/delete their newsletters
- All users can view all newsletters (GET endpoints)

## Best Practices

1. **Always include credentials** in fetch requests:
   ```javascript
   credentials: 'include'
   ```

2. **Validate HTML content** before sending to avoid XSS:
   ```javascript
   // Use a library like DOMPurify
   const cleanContent = DOMPurify.sanitize(htmlContent);
   ```

3. **Store dueDate in ISO 8601 format**:
   ```javascript
   new Date().toISOString()
   ```

4. **Handle date fields properly** - they come back as strings, convert to Date if needed:
   ```javascript
   new Date(newsletter.dueDate)
   ```

5. **Check sent status** before allowing updates:
   ```javascript
   if (!newsletter.sent) {
     // Allow updates
   }
   ```
