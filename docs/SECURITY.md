# 🔒 Security

[← Back to README](../README.md)

This API applies multiple layers of defence-in-depth security.

---

## Middleware Stack

| Package | Purpose |
|---|---|
| [`helmet`](https://helmetjs.github.io/) | Sets secure HTTP response headers (XSS protection, HSTS, content-type sniffing, etc.) |
| [`express-rate-limit`](https://github.com/express-rate-limit/express-rate-limit) | Limits repeated requests per IP to prevent brute-force and DoS attacks |
| [`express-mongo-sanitize`](https://github.com/fiznool/express-mongo-sanitize) | Strips `$` and `.` from user input to prevent NoSQL injection |
| [`express-xss-sanitizer`](https://github.com/ahmedRamadan68/express-xss-sanitizer) | Sanitizes request body, query, and params against XSS attacks |
| [`hpp`](https://github.com/analog-nico/hpp) | Prevents HTTP Parameter Pollution by whitelisting duplicate query params |
| [`cors`](https://github.com/expressjs/cors) | Configured cross-origin resource sharing |
| [`cookie-parser`](https://github.com/expressjs/cookie-parser) | Parses cookies; JWT is stored in an HTTP-only cookie |

---

## Authentication & Authorisation

- Passwords are hashed with **bcryptjs** before storage — plaintext passwords are never persisted.
- On login, a signed **JWT** is issued and sent as an **HTTP-only cookie**, protecting against XSS token theft.
- Protected routes verify the token via the `auth` middleware before any controller logic runs.
- Role-based access control (e.g. `user` vs `admin`) is enforced at the route level using the `authorize` middleware.

---

## Best Practices

- `.env` secrets are never committed (enforced via `.gitignore`).
- `NODE_ENV=production` disables verbose error stack traces in responses.
- Rate limiting is applied globally to prevent abuse.
