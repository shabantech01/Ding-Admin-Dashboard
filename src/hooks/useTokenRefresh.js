import { useEffect, useRef, useCallback } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { tokenRefreshed, logout } from "../features/auth/authSlice"
import { useNetworkStatus } from "./useNetworkStatus"
import { ADMIN_STORAGE_KEYS } from "../constants/storageKeys"
import { BASE_URL } from "../constants/api"

const REFRESH_BUFFER_MS = 60_000  // refresh 60 s before expiry
const NETWORK_RETRY_MS  = 30_000  // retry interval when offline

export const useTokenRefresh = (accessToken) => {
  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const navigateRef    = useRef(navigate)
  const retryTimerRef  = useRef(null)
  const { connectionRestored } = useNetworkStatus()

  useEffect(() => { navigateRef.current = navigate }, [navigate])

  // ── Core refresh function ─────────────────────────────────────────────────
  // Extracted so it can be called from both the proactive timer AND the
  // reconnect effect without duplicating logic.

  const doRefresh = useCallback(async () => {
    clearTimeout(retryTimerRef.current)

    const refreshToken =
      localStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN) ??
      sessionStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN)

    if (!refreshToken) {
      dispatch(logout())
      navigateRef.current("/", { replace: true })
      return
    }

    try {
      const res  = await fetch(`${BASE_URL}/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      })
      const data = await res.json()

      if (data.success) {
        dispatch(tokenRefreshed({
          accessToken:  data.data.accessToken,
          refreshToken: data.data.refreshToken,
        }))
      } else {
        // Server explicitly rejected the refresh token (expired rotation window,
        // revoked token, etc.) — this is a genuine session end.
        dispatch(logout())
        navigateRef.current("/", { replace: true })
      }
    } catch {
      // Network error (no internet, DNS failure, timeout).
      // Do NOT logout — the refresh token is still valid; we just can't reach
      // the server right now. Schedule a retry and let the reconnect effect
      // also trigger an immediate retry when the connection comes back.
      retryTimerRef.current = setTimeout(doRefresh, NETWORK_RETRY_MS)
    }
  }, [dispatch])

  // ── Proactive timer: schedule refresh before access token expires ─────────

  useEffect(() => {
    if (!accessToken) return

    let exp
    try {
      ;({ exp } = jwtDecode(accessToken))
    } catch {
      // Malformed token — treat as genuine failure.
      dispatch(logout())
      navigateRef.current("/", { replace: true })
      return
    }

    const expiresIn = exp * 1000 - Date.now()

    if (expiresIn <= 0) {
      doRefresh()
      return
    }

    const delay = Math.max(0, expiresIn - REFRESH_BUFFER_MS)
    const timer = setTimeout(doRefresh, delay)
    return () => {
      clearTimeout(timer)
      clearTimeout(retryTimerRef.current)
    }
  }, [accessToken, doRefresh, dispatch])

  // ── Reconnect effect: re-exchange immediately when internet returns ────────
  // Fires when connectionRestored flips true. If the access token is null
  // (expired/missing during offline period) and a refresh token exists in
  // storage, this immediately re-authenticates without waiting for the retry
  // timer — so the user gets their full session back the moment wifi reconnects.

  useEffect(() => {
    if (!connectionRestored) return
    if (accessToken) return // token still valid, nothing to do

    const hasRefreshToken =
      !!localStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN) ||
      !!sessionStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN)

    if (hasRefreshToken) doRefresh()
  }, [connectionRestored, accessToken, doRefresh])
}
