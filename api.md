# AIRIS Newsletter API Documentation

## Base URL

```
http://localhost:5001
```

---

## Authentication

All protected endpoints require the `x-api-key` header:

```
x-api-key: your-secret-key-here
```

The value must match the `NEWSLETTER_SECRET_KEY` in your `.env`.

---

## Endpoints

### 1. Send Newsletter

**`POST /api/v1/email/send`** — Sends the newsletter to a list of email addresses.

**Headers:**

| Header       | Required | Description              |
|--------------|----------|--------------------------|
| Content-Type | Yes      | `application/json`       |
| x-api-key    | Yes      | Your `NEWSLETTER_SECRET_KEY` |

**Body (JSON):**

| Field   | Type   | Required | Description                                      |
|---------|--------|----------|--------------------------------------------------|
| emails  | string | Yes      | Space-separated list of recipient email addresses |
| subject | string | No       | Custom subject line (default: `The AIRIS Chronicle`) |

**cURL:**

```bash
curl -X POST http://localhost:5001/api/v1/email/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key-here" \
  -d '{
    "emails": "user1@example.com user2@example.com",
    "subject": "The AIRIS Chronicle"
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Sent to 2 recipient(s), 0 failed",
  "total": 2,
  "succeeded": 2,
  "failed": 0,
  "results": [
    { "email": "user1@example.com", "success": true },
    { "email": "user2@example.com", "success": true }
  ]
}
```

**Error Responses:**

| Status | Cause                          |
|--------|--------------------------------|
| 401    | Missing or invalid `x-api-key` |
| 400    | Missing or invalid `emails`    |
| 500    | Email sending failure          |

---

### 2. Unsubscribe

**`GET /api/v1/email/unsubscribe`** — Displays the unsubscribe confirmation page.

**Query Parameters:**

| Param | Type   | Required | Description                  |
|-------|--------|----------|------------------------------|
| email | string | Yes      | The email to unsubscribe     |

**cURL:**

```bash
curl "http://localhost:5001/api/v1/email/unsubscribe?email=user@example.com"
```

---

### 3. Submit Feedback

**`POST /api/v1/email/feedback`** — Submits feedback after unsubscribing.

**cURL:**

```bash
curl -X POST http://localhost:5001/api/v1/email/feedback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=user@example.com&reason=No longer interested"
```

---

### 4. Health Check

**`GET /healthcheck`** — Returns server health status.

```bash
curl http://localhost:5001/healthcheck
```
