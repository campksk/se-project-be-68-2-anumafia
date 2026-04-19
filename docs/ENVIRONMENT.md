# ⚙️ Environment Variables

[← Back to README](../README.md)

Create a `.env` file in the **project root** with the following variables:

```env
# App
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

---

## Variable Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | ✅ | `development` | App environment (`development` / `production`) |
| `PORT` | ✅ | `5000` | Port the server listens on |
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Secret key used to sign JWT tokens |
| `JWT_EXPIRE` | ✅ | `30d` | JWT token lifespan (e.g. `30d`, `1h`) |
| `JWT_COOKIE_EXPIRE` | ✅ | `30` | Cookie expiry in **days** |

---

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.
