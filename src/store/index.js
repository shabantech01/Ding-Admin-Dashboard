import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import { authApi } from "../features/auth/authApi"
import { ADMIN_STORAGE_KEYS } from "../constants/storageKeys"

const loadAuthFromStorage = () => {
  try {
    // localStorage  → rememberMe was checked (persists across hard refresh)
    // sessionStorage → rememberMe was unchecked (cleared on hard refresh / tab close)
    const token =
      localStorage.getItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN) ??
      sessionStorage.getItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN)

    const raw =
      localStorage.getItem(ADMIN_STORAGE_KEYS.USER) ??
      sessionStorage.getItem(ADMIN_STORAGE_KEYS.USER)

    const user = JSON.parse(raw || "null")

    if (token && user) return { token, user, isAuthenticated: true }
  } catch {}
  return { token: null, user: null, isAuthenticated: false }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  preloadedState: {
    auth: loadAuthFromStorage(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
})
