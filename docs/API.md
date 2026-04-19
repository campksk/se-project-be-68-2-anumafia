# 🔌 API Endpoints

[← Back to README](../README.md)

**Base URL:** `https://se-project-be-68-2-anumafia.vercel.app/api/v1`  
**Local URL:** `http://localhost:5000/api/v1`

All protected routes require a `Bearer` token in the `Authorization` header, or a valid `token` cookie.

---

## Authentication · `/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | Public |
| `POST` | `/auth/login` | Login and receive JWT | Public |
| `GET` | `/auth/logout` | Clear auth cookie | Private |
| `GET` | `/auth/me` | Get current logged-in user | Private |

### POST `/auth/register`

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response `201`:**
```json
{
  "success": true,
  "token": "<jwt_token>"
}
```

---

### POST `/auth/login`

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "token": "<jwt_token>"
}
```

---

## Users · `/users`

> Admin access required for all user management endpoints.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/users` | Get all users | Admin |
| `GET` | `/users/:id` | Get a single user by ID | Admin |
| `PUT` | `/users/:id` | Update a user | Admin |
| `DELETE` | `/users/:id` | Delete a user | Admin |

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

| Status Code | Meaning |
|---|---|
| `400` | Bad Request — invalid input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found |
| `429` | Too Many Requests — rate limit hit |
| `500` | Internal Server Error |

---

> ℹ️ Additional resource-specific routes (based on the `routes/` and `controllers/` folders) should be documented here as the project grows.
