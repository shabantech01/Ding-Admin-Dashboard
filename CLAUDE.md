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
| `src/store/index.js` | Redux store — includes `authApi` + `merchantsApi` + `ridersApi` middleware |
| `src/features/auth/authSlice.js` | `setCredentials`, `tokenRefreshed`, `initializationComplete`, `logout` |
| `src/features/auth/authApi.js` | RTK Query: `login`, `refresh` mutations |
| `src/features/auth/baseQueryWithReauth.js` | 401 → silent refresh → retry; module-level mutex |
| `src/features/merchants/merchantsApi.js` | RTK Query: `getMerchants`, `approveMerchant`, `rejectMerchant`, `suspendMerchant` |
| `src/components/AuthInitializer.jsx` | Exchanges stored refreshToken on page reload; StrictMode guarded |
| `src/hooks/useTokenRefresh.js` | Proactive refresh 60 s before `exp` |
| `src/hooks/useAuth.js` | Redux selector hook |
| `src/ProtectedRoutes.jsx` | Spinner during init, role + auth guard |
| `src/constants/storageKeys.js` | `ding_admin_auth_*` storage keys |
| `src/constants/api.js` | Exports `BASE_URL` from env |

## Restaurant / Merchant Management (Resturant-Management/)

### Files
| File | Role |
|---|---|
| `RestaurantManagement.jsx` | Fetches `/admin/merchants?status=ALL`; tabs (ALL/PENDING/ACTIVE/SUSPENDED/REJECTED); card grid for PENDING, table for others; status-conditional action buttons; toast feedback |
| `RestaurantModal.jsx` | Right slide-over; all API fields; sticky action bar conditional on `application.status` |
| `ApprovalConfirmModal.jsx` | Green confirm dialog before approve/reactivate; `Loader2` spinner during API call |
| `RejectionModal.jsx` | Red modal; reason textarea required; `Loader2` spinner during API call |
| `SuspendModal.jsx` | Amber modal; reason textarea required; `Loader2` spinner during API call |

### Action matrix (consistent across table, mobile cards, and slide-over)
| Status | Actions |
|---|---|
| `PENDING` | Reject (red) + Approve (purple) |
| `ACTIVE` | Suspend (amber) |
| `SUSPENDED` | Reactivate (green) — calls same `/verify` endpoint |
| `REJECTED` | No actions |

### Merchant API endpoints — all POST, not PATCH
- `GET /admin/merchants?status=ALL`
- `POST /admin/merchants/:id/verify` — approve PENDING **or** reactivate SUSPENDED
- `POST /admin/merchants/:id/reject` — body `{ reason }`
- `POST /admin/merchants/:id/suspend` — body `{ reason }`
- All mutations have `invalidatesTags: ["Merchants"]` → list auto-refetches after any action

## Drivers / Riders Management (Drivers-Management/)

### Files
| File | Role |
|---|---|
| `DriverManagement.jsx` | Fetches `GET /admin/riders?status=`; status tabs ALL/ACTIVE/PENDING/SUSPENDED; clickable rows open `RiderDetailModal`; toast on create/action success |
| `AddDriver.jsx` | Right slide-over; name/email/phone fields; 4 document upload rows; uploads each file to S3 via presigned URL on select, then `POST /admin/riders` on submit |
| `RiderDetailModal.jsx` | Right slide-over; loads rider by ID; **view mode** (info + docs + activate/suspend); **edit mode** (editable inputs + doc replacement with S3 upload); confirm overlay for activate/suspend |

### S3 presigned upload flow
1. `POST /files/upload-url { key, contentType }` → `{ uploadUrl, readUrl, key }`
2. `PUT uploadUrl` with raw file blob + `Content-Type` header (direct `fetch`, no auth token)
3. Use returned `key` as the doc URL field value in rider payloads

### S3 folder paths
| Document | S3 prefix |
|---|---|
| National ID / Passport | `rider/National-ID-Passport/{uuid}.{ext}` |
| Driver's License | `rider/Driver-License/{uuid}.{ext}` |
| Vehicle Registration | `rider/Vehicle-Registration/{uuid}.{ext}` |
| Profile Photo | `rider/Profile-Photo/{uuid}.{ext}` |

### Accepted file types
`image/jpeg`, `image/png`, `application/pdf`

### Rider API endpoints — `src/features/riders/ridersApi.js`
| Method | Path | Hook | Notes |
|---|---|---|---|
| GET | `/admin/riders?status=ALL` | `useGetRidersQuery(status)` | `providesTags: ["Riders"]` |
| GET | `/admin/riders/:id` | `useGetRiderByIdQuery(id)` | `providesTags: [{type:"Riders",id}]` |
| POST | `/admin/riders` | `useCreateRiderMutation` | `invalidatesTags: ["Riders"]` |
| PATCH | `/admin/riders/:id` | `useUpdateRiderMutation({id,...body})` | `invalidatesTags: ["Riders"]` |
| POST | `/admin/riders/:id/verify` | `useVerifyRiderMutation(id)` | Activates PENDING **or** SUSPENDED rider |
| POST | `/admin/riders/:id/suspend` | `useSuspendRiderMutation(id)` | Suspends ACTIVE rider |
| POST | `/files/upload-url` | `useGetUploadUrlMutation` | Returns `uploadUrl` + `key` |

### Rider action matrix
| `riderProfile.status` | Actions |
|---|---|
| `PENDING` | Activate (green) — calls `/verify` |
| `ACTIVE` | Suspend (amber) — calls `/suspend` |
| `SUSPENDED` | Activate (green) — calls `/verify` (same endpoint as PENDING) |

### Rider payload fields
- **Create** `POST /admin/riders`: `{ name, email, phone, nationalIdUrl, driversLicenseUrl, vehicleRegistrationUrl, profilePhotoUrl }`
- **Update** `PATCH /admin/riders/:id`: same fields — pass existing key for unchanged docs, new S3 key for replaced docs

## Dev helper
- Avatar initials button in `Topbar.jsx` — click to `console.log` the live `accessToken` (styled purple). For API testing during development only.

## Folder conventions
- Pages: `src/<FeatureName>/` (Dashboard, Drivers-Management, Orders-Oversight, Resturant-Management, User-Management, Login)
- Note: `Resturant-Management` folder name is a typo — do **not** rename it
- API slices: `src/features/<feature>/` — always use `baseQueryWithReauth` as baseQuery
- CSS Modules: `styles.module.css` alongside each page component

## API
- Base: `VITE_API_BASE_URL` (set in `.env`)
- Login: `POST /auth/login` → `{ data: { user, tokens: { accessToken, refreshToken } } }`
- Refresh: `POST /auth/refresh` → `{ data: { accessToken, refreshToken } }`

## Do not
- Store `accessToken` in `localStorage` or `sessionStorage`
- Hardcode the API base URL — always import from `src/constants/api.js`
- Skip the role check — non-SUPERADMIN must be blocked at login and route level
- Use PATCH for merchant actions — all are POST
- Add merchant action mutations without `invalidatesTags: ["Merchants"]`
