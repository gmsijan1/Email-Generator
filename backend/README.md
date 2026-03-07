# Backend Template

Future-proof Node.js backend with Firebase (Firestore + Auth) for MVP. Designed for easy migration to PostgreSQL, MongoDB, or Supabase.

## Structure

```
backend/
├── index.js                 # Entry point
├── package.json
├── .env.example
├── src/
│   ├── config/
│   │   └── firebase.js      # Firebase client config (DAL only)
│   ├── db/                  # Data Access Layer
│   │   ├── interfaces.js   # DAL contracts
│   │   ├── userRepository.js
│   │   ├── index.js        # Wire adapter
│   │   └── adapters/
│   │       └── firestoreAdapter.js
│   ├── auth/                # AuthService (wraps Firebase Auth)
│   │   └── AuthService.js
│   ├── controllers/         # API logic (no Firebase imports)
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── routes/
│       ├── index.js
│       ├── authRoutes.js
│       └── userRoutes.js
└── scripts/
    ├── addUserViaDAL.js
    └── updateUserViaDAL.js
```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register (email, password, displayName) |
| POST | /api/auth/verify | No | Verify idToken, return uid/email |
| GET | /api/users/:id | Bearer | Get user profile |
| PATCH | /api/users/:id | Bearer | Update user profile |

## Migration

- **Database**: Replace `firestoreAdapter.js` with `postgresAdapter.js` (or similar), implement same interface, update `db/index.js`.
- **Auth**: Replace `AuthService.js` implementation; keep the same exported functions.
