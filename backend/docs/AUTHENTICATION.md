# JWT Authentication Documentation

## Overview
This authentication system uses JWT (JSON Web Tokens) with access tokens and refresh tokens. Tokens are automatically stored in **HTTP-only cookies** for maximum security.

- **Access Token**: Short-lived token (15 minutes) used for authenticated API requests, stored in `accessToken` cookie
- **Refresh Token**: Long-lived token (7 days) stored in the database and browser cookie for generating new access tokens

## Setup

### 1. Install Dependencies
```bash
npm install
```

This will install `jsonwebtoken`, `cookie-parser`, and their TypeScript types.

### 2. Update Environment Variables
Add the following to your `.env` file:
```env
ACCESS_TOKEN_SECRET="your-secure-access-token-secret-min-32-chars"
REFRESH_TOKEN_SECRET="your-secure-refresh-token-secret-min-32-chars"
```

### 3. Update Database Schema
Run the schema migration:
```bash
npx prisma db push
```

## API Endpoints

### 1. Sign In
**POST** `/api/v1/auth/signin`

Create a user session and set token cookies.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "username": "username",
      "createdAt": "2026-05-13T10:00:00.000Z",
      "updatedAt": "2026-05-13T10:00:00.000Z"
    }
  }
}
```

**Cookies Set** (Automatic):
- `accessToken`: HTTP-only, expires in 15 minutes
- `refreshToken`: HTTP-only, expires in 7 days

### 2. Refresh Access Token
**POST** `/api/v1/auth/refresh`

Get a new access token using the refresh token from cookies.

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/refresh \
  -H "Cookie: refreshToken=<refreshToken>"
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully"
}
```

**Cookies Updated** (Automatic):
- `accessToken`: New token with 15-minute expiration
- `refreshToken`: New token with 7-day expiration

### 3. Logout
**POST** `/api/v1/auth/logout`

End the user session and invalidate refresh token.

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/logout \
  -H "Cookie: accessToken=<accessToken>"
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Cookies Cleared** (Automatic):
- `accessToken`: Cleared
- `refreshToken`: Cleared

## Using Protected Routes

The browser automatically includes cookies with requests. Just call the endpoint:

```bash
curl http://localhost:5001/api/v1/protected-route
# Cookies are automatically sent by the browser
```

For protected routes with JavaScript/frontend:

```javascript
// Cookies are automatically included in requests
fetch('/api/v1/protected-route', {
  method: 'GET',
  credentials: 'include' // Important: include credentials for cookies
})
```

## Create a User

Use the seed script to create users:

```bash
npm run seed -- user@example.com username password
```

This creates or updates a user without deleting existing ones.

## Token Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  1. Sign In (email + password)                              │
│  ↓                                                           │
│  2. Set Cookies: accessToken (15m) + refreshToken (7d)      │
│  ↓                                                           │
│  3. Make API requests - cookies sent automatically           │
│  ↓                                                           │
│  4. When accessToken expires, call POST /auth/refresh       │
│     refreshToken cookie is used automatically               │
│  ↓                                                           │
│  5. New tokens set in cookies automatically                 │
│  ↓                                                           │
│  6. Logout: POST /auth/logout - cookies cleared             │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

✅ **Built-in Security:**

1. **HTTP-only Cookies**: Cannot be accessed by JavaScript, preventing XSS attacks
2. **Secure Flag**: In production, cookies are only sent over HTTPS
3. **SameSite Strict**: Prevents CSRF attacks
4. **Short Token Expiration**: Access tokens expire in 15 minutes
5. **Refresh Token Rotation**: New refresh token generated on each refresh
6. **Database Validation**: Refresh token verified against stored value

## Security Notes for Production

⚠️ **Additional Recommendations:**

1. **Use bcrypt for password hashing:**
   ```bash
   npm install bcryptjs
   npm install -D @types/bcryptjs
   ```
   Update `auth.controller.ts` to use bcrypt instead of plain comparison.

2. **Use strong secrets** (minimum 32 characters):
   ```env
   ACCESS_TOKEN_SECRET="use-a-very-strong-random-string-here-min-32-chars"
   REFRESH_TOKEN_SECRET="use-another-strong-random-string-here-min-32-chars"
   ```

3. **Enable HTTPS** - Required for `secure` cookie flag to work

4. **Monitor Refresh Token Rotation**: Keep track of refresh token updates for security

5. **Add Rate Limiting**: Prevent brute force attacks on auth endpoints

6. **Use CORS Carefully**: Only allow trusted domains:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

## Middleware Usage

Protect routes using the `verifyToken` middleware:

```typescript
import { verifyToken } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

// Protected route
router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});

export default router;
```

## Error Handling

Common error responses:

- **400**: Missing email/password or invalid format
- **401**: Invalid credentials or expired token
- **500**: Server error

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Frontend Integration Example

```javascript
// Sign In
const response = await fetch('/api/v1/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Make authenticated request
const data = await fetch('/api/v1/protected-route', {
  credentials: 'include' // Cookies sent automatically
});

// Refresh token (manual)
await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  credentials: 'include' // refreshToken cookie sent automatically
});

// Logout
await fetch('/api/v1/auth/logout', {
  method: 'POST',
  credentials: 'include' // accessToken cookie sent automatically
});
```
