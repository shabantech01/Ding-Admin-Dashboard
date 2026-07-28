# Ding Admin Dashboard

React 19 + Vite + Tailwind v4 + Redux Toolkit (RTK Query). JavaScript (not TypeScript).

## Stack
- **State / API:** Redux Toolkit, RTK Query (`@reduxjs/toolkit`, `react-redux`)
- **Auth tokens:** `jwt-decode`
- **Routing:** `react-router-dom` v7 (createBrowserRouter)
- **Forms:** `react-hook-form`
- **Icons:** `lucide-react`
- **Styles:** Tailwind v4 + CSS Modules per page

## Auth — access + refresh token pattern
- `accessToken` → Redux memory only, **never** written to storage
- `refreshToken` → `localStorage` (rememberMe) or `sessionStorage` (no rememberMe)
- Storage keys: `src/constants/storageKeys.js` → `ADMIN_STORAGE_KEYS.*`
- API base URL: `import.meta.env.VITE_API_BASE_URL` via `src/constants/api.js`
- Allowed role: **SUPERADMIN** only — enforced in `Login.jsx` and `ProtectedRoute.jsx`

## Key files
| File | Role |
|---|---|
| `src/store/index.js` | Redux store, preloads from refreshToken on reload |
| `src/features/auth/authSlice.js` | `setCredentials`, `tokenRefreshed`, `initializationComplete`, `logout` |
| `src/features/auth/authApi.js` | RTK Query: `login`, `refresh` mutations |
| `src/features/auth/baseQueryWithReauth.js` | 401 → silent refresh → retry; module-level mutex |
| `src/components/AuthInitializer.jsx` | Exchanges stored refreshToken on page reload; StrictMode guarded |
| `src/hooks/useTokenRefresh.js` | Proactive refresh 60 s before `exp` |
| `src/hooks/useAuth.js` | Redux selector hook |
| `src/ProtectedRoutes.jsx` | Spinner during init, role + auth guard |
| `src/constants/storageKeys.js` | `ding_admin_auth_*` storage keys |
| `src/constants/api.js` | Exports `BASE_URL` from env |

## Folder conventions
- Pages: `src/<FeatureName>/` (Dashboard, Drivers-Management, Orders-Oversight, Resturant-Management, User-Management, Login)
- Future API slices: `src/features/<feature>/` — use `baseQueryWithReauth` as baseQuery
- CSS Modules: `styles.module.css` alongside each page component

## API
- Base: `VITE_API_BASE_URL` (set in `.env`)
- Login: `POST /auth/login` → `{ data: { user, tokens: { accessToken, refreshToken } } }`
- Refresh: `POST /auth/refresh` → `{ data: { accessToken, refreshToken } }`

## Do not
- Store `accessToken` in `localStorage` or `sessionStorage`
- Hardcode the API base URL — always import from `src/constants/api.js`
- Skip the role check — non-SUPERADMIN must be blocked at login and route level
