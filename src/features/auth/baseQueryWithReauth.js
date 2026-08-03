import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { tokenRefreshed, logout } from "./authSlice"
import { ADMIN_STORAGE_KEYS } from "../../constants/storageKeys"
import { BASE_URL } from "../../constants/api"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

// Module-level mutex: if multiple requests fail with 401 simultaneously,
// only one refresh call is made; the rest wait on the same promise.
let refreshPromise = null

// ── Sentinels returned by performRefresh ──────────────────────────────────────
// true           → refreshed successfully, caller should retry the original request
// false          → server rejected the token, logout already dispatched
// 'network_error'→ could not reach the server, session preserved, do NOT logout

const performRefresh = async (api, extraOptions) => {
  const refreshToken =
    localStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN) ??
    sessionStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN)

  if (!refreshToken) {
    api.dispatch(logout())
    return false
  }

  const result = await rawBaseQuery(
    { url: "/auth/refresh", method: "POST", body: { refreshToken } },
    api,
    extraOptions
  )

  // Network-level failure (no internet, DNS, timeout) — the refresh token is
  // still valid; we just could not reach the server. Return a sentinel so the
  // caller knows NOT to logout.
  if (result.error?.status === "FETCH_ERROR" || result.error?.status === "TIMEOUT_ERROR") {
    return "network_error"
  }

  // Any other error (4xx from the refresh endpoint) means the token is genuinely
  // invalid or revoked — end the session.
  if (result.error) {
    api.dispatch(logout())
    return false
  }

  if (result.data?.success) {
    const { accessToken, refreshToken: newRefreshToken } = result.data.data
    api.dispatch(tokenRefreshed({ accessToken, refreshToken: newRefreshToken }))
    return true
  }

  // Unexpected response shape — treat as genuine rejection.
  api.dispatch(logout())
  return false
}

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Fail fast — do not even attempt the network call when the browser is
  // offline. This gives every component a consistent, immediate error without
  // waiting for a TCP timeout.
  if (!navigator.onLine) {
    return {
      error: {
        status: "FETCH_ERROR",
        error: "No internet connection. Please check your network and try again.",
      },
    }
  }

  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    if (!refreshPromise) {
      refreshPromise = performRefresh(api, extraOptions).finally(() => {
        refreshPromise = null
      })
    }

    const refreshed = await refreshPromise

    if (refreshed === true) {
      // Token successfully rotated — retry the original request.
      result = await rawBaseQuery(args, api, extraOptions)
    } else if (refreshed === "network_error") {
      // Could not reach refresh endpoint — session is preserved but we cannot
      // complete this request right now. Surface the network error to the
      // component without touching auth state.
      result = {
        error: {
          status: "FETCH_ERROR",
          error: "No internet connection. Please check your network and try again.",
        },
      }
    }
    // refreshed === false → logout already dispatched in performRefresh, nothing more to do.
  }

  return result
}
