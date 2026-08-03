import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { tokenRefreshed, initializationComplete, sessionPreservedOffline, logout } from "../features/auth/authSlice"
import { ADMIN_STORAGE_KEYS } from "../constants/storageKeys"
import { BASE_URL } from "../constants/api"

// Runs once on mount. If a refresh token is in storage, exchanges it for a
// fresh access token so the user stays logged in across page reloads.
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch()
  const didRun = useRef(false) // guard against React 18 StrictMode double-invoke

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const storedRefreshToken =
      localStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN) ??
      sessionStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN)

    if (!storedRefreshToken) {
      dispatch(initializationComplete())
      return
    }

    fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          dispatch(
            tokenRefreshed({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            })
          )
        } else {
          // Server explicitly rejected the refresh token — genuine session expiry.
          dispatch(logout())
        }
      })
      .catch(() => {
        // Network error (offline, DNS failure, timeout) — NOT a genuine logout.
        // Restore the user from storage so the app stays open. The access token
        // is null, so useTokenRefresh will re-exchange as soon as internet returns.
        const raw =
          localStorage.getItem(ADMIN_STORAGE_KEYS.USER) ??
          sessionStorage.getItem(ADMIN_STORAGE_KEYS.USER)
        const user = JSON.parse(raw || "null")

        if (user) {
          dispatch(sessionPreservedOffline({ user }))
        } else {
          dispatch(logout())
        }
      })
      .finally(() => {
        dispatch(initializationComplete())
      })
  }, [dispatch])

  return children
}

export default AuthInitializer
