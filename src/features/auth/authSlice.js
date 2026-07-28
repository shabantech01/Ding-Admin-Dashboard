import { createSlice } from "@reduxjs/toolkit"
import { ADMIN_STORAGE_KEYS } from "../../constants/storageKeys"

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isInitializing: true,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, user, rememberMe = true } = action.payload
      state.accessToken = accessToken
      state.user = user
      state.isAuthenticated = true

      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      storage.setItem(ADMIN_STORAGE_KEYS.USER, JSON.stringify(user))
    },

    // Called on every silent refresh (proactive timer OR 401-intercept)
    tokenRefreshed: (state, action) => {
      const { accessToken, refreshToken } = action.payload
      state.accessToken = accessToken
      state.isAuthenticated = true

      // Rotate into whichever storage the original token was in
      const inLocal = !!localStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN)
      const storage = inLocal ? localStorage : sessionStorage
      storage.setItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    },

    // Called by AuthInitializer once the initial session check resolves
    initializationComplete: (state) => {
      state.isInitializing = false
    },

    logout: (state) => {
      state.accessToken = null
      state.user = null
      state.isAuthenticated = false
      ;[localStorage, sessionStorage].forEach((s) => {
        s.removeItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN)
        s.removeItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN)
        s.removeItem(ADMIN_STORAGE_KEYS.USER)
      })
    },
  },
})

export const { setCredentials, tokenRefreshed, initializationComplete, logout } = authSlice.actions
export default authSlice.reducer
