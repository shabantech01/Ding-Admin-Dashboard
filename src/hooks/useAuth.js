import { useSelector } from "react-redux"
import { jwtDecode } from "jwt-decode"

export const useAuth = () => {
  const { accessToken, user, isAuthenticated, isInitializing } = useSelector(
    (state) => state.auth
  )

  const isTokenExpired = () => {
    if (!accessToken) return true
    try {
      const { exp } = jwtDecode(accessToken)
      return Date.now() >= exp * 1000
    } catch {
      return true
    }
  }

  const getTokenExpiresIn = () => {
    if (!accessToken) return 0
    try {
      const { exp } = jwtDecode(accessToken)
      return exp * 1000 - Date.now()
    } catch {
      return 0
    }
  }

  return { accessToken, user, isAuthenticated, isInitializing, isTokenExpired, getTokenExpiresIn }
}
