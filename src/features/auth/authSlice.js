import { createSlice } from "@reduxjs/toolkit"
import { ADMIN_STORAGE_KEYS } from "../../constants/storageKeys"

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    isAuthenticated: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user, rememberMe = true } = action.payload
      state.token = token
      state.user = user
      state.isAuthenticated = true

      // Remember Me checked  → localStorage  (survives hard refresh & browser restart)
      // Remember Me unchecked → sessionStorage (dies on tab close / hard refresh)
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN, token)
      storage.setItem(ADMIN_STORAGE_KEYS.USER, JSON.stringify(user))
    },
    logout: (state) => {
      state.token = null
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

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
