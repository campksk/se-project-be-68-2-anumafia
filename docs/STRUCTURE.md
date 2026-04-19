# 📁 Project Structure

[← Back to README](../README.md)

```
se-project-be-68-2-anumafia/
│
├── config/                 # Database connection & app-level config
│   └── db.js               # MongoDB connection setup via Mongoose
│
├── controllers/            # Business logic for each resource
│   ├── auth.js             # Register, login, logout, get current user
│   └── ...                 # Additional resource controllers
│
├── middleware/             # Custom Express middleware
│   ├── auth.js             # JWT verification & role-based access
│   └── error.js            # Centralized error handler
│
├── models/                 # Mongoose schemas & models
│   ├── User.js             # User schema (name, email, password, role)
│   └── ...                 # Additional data models
│
├── routes/                 # Route definitions (thin layer — delegates to controllers)
│   ├── auth.js             # /api/v1/auth
│   └── ...                 # Additional resource routes
│
├── .gitignore
├── package.json
├── server.js               # Entry point — initialises Express, middleware, routes
└── README.md
```

---

## Architecture

This project follows the classic **MVC-inspired layered architecture** for REST APIs:

```
Request → Router → Controller → Model → MongoDB
                      ↑
                  Middleware
              (auth, sanitize, rate-limit…)
```

- **Routes** map HTTP verbs + paths to controller functions.
- **Controllers** contain all business logic and call Models.
- **Models** define the shape of data and interact with MongoDB.
- **Middleware** runs before controllers for auth, security, and error handling.
- **Config** holds shared setup like the DB connection.
