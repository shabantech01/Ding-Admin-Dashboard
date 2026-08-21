import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import authReducer from "../features/auth/authSlice"
import { authApi } from "../features/auth/authApi"
import { merchantsApi } from "../features/merchants/merchantsApi"
import { ridersApi } from "../features/riders/ridersApi"
import { ordersApi } from "../features/orders/ordersApi"
import { ADMIN_STORAGE_KEYS } from "../constants/storageKeys"

const loadAuthFromStorage = () => {
  try {
    const refreshToken =
      localStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN) ??
      sessionStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN)

    const raw =
      localStorage.getItem(ADMIN_STORAGE_KEYS.USER) ??
      sessionStorage.getItem(ADMIN_STORAGE_KEYS.USER)

    const user = JSON.parse(raw || "null")

    if (refreshToken && user) {
      // Session may exist — AuthInitializer will exchange the refresh token.
      // accessToken stays null until that succeeds.
      return { accessToken: null, user, isAuthenticated: false, isInitializing: true }
    }
  } catch {}

  return { accessToken: null, user: null, isAuthenticated: false, isInitializing: false }
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [merchantsApi.reducerPath]: merchantsApi.reducer,
    [ridersApi.reducerPath]: ridersApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  preloadedState: {
    auth: loadAuthFromStorage(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, merchantsApi.middleware, ridersApi.middleware, ordersApi.middleware),
})

// Enables refetchOnFocus / refetchOnReconnect for all RTK Query subscriptions.
setupListeners(store.dispatch)
