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

  if (result.data?.success) {
    const { accessToken, refreshToken: newRefreshToken } = result.data.data
    api.dispatch(tokenRefreshed({ accessToken, refreshToken: newRefreshToken }))
    return true
  }

  api.dispatch(logout())
  return false
}

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    if (!refreshPromise) {
      refreshPromise = performRefresh(api, extraOptions).finally(() => {
        refreshPromise = null
      })
    }

    const refreshed = await refreshPromise
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions)
    }
  }

  return result
}
