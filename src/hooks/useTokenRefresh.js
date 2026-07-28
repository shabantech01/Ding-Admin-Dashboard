import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { tokenRefreshed, logout } from "../features/auth/authSlice"
import { ADMIN_STORAGE_KEYS } from "../constants/storageKeys"
import { BASE_URL } from "../constants/api"
const REFRESH_BUFFER_MS = 60_000 // refresh 60 s before expiry

export const useTokenRefresh = (accessToken) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    if (!accessToken) return

    let exp
    try {
      ;({ exp } = jwtDecode(accessToken))
    } catch {
      dispatch(logout())
      navigateRef.current("/", { replace: true })
      return
    }

    const expiresIn = exp * 1000 - Date.now()

    const doRefresh = async () => {
      const refreshToken =
        localStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN) ??
        sessionStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN)

      if (!refreshToken) {
        dispatch(logout())
        navigateRef.current("/", { replace: true })
        return
      }

      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
        const data = await res.json()

        if (data.success) {
          dispatch(
            tokenRefreshed({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            })
          )
        } else {
          dispatch(logout())
          navigateRef.current("/", { replace: true })
        }
      } catch {
        dispatch(logout())
        navigateRef.current("/", { replace: true })
      }
    }

    if (expiresIn <= 0) {
      doRefresh()
      return
    }

    const delay = Math.max(0, expiresIn - REFRESH_BUFFER_MS)
    const timer = setTimeout(doRefresh, delay)
    return () => clearTimeout(timer)
  }, [accessToken])
}
