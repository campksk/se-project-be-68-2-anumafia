# 🚀 Getting Started

[← Back to README](../README.md)

## Prerequisites

- **Node.js** `>= 18.x`
- **npm** `>= 9.x`
- A **MongoDB** instance (MongoDB Atlas recommended)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/2110503-CEDT68/se-project-be-68-2-anumafia.git
cd se-project-be-68-2-anumafia
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example below and create a `.env` file in the project root.  
See [Environment Variables](ENV.md) for full details.

```bash
cp .env.example .env   # if provided, otherwise create manually
```

### 4. Start the server

**Development** (auto-restarts on file changes):

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The server will be available at `http://localhost:5000` by default (or the `PORT` set in `.env`).

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Run in production mode |
| `npm run dev` | Run with Nodemon (watch mode) |
| `npm test` | Run API tests via Newman |
