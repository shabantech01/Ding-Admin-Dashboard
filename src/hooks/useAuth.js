import { useSelector } from "react-redux"
import { jwtDecode } from "jwt-decode"

export const useAuth = () => {
  const { token, user, isAuthenticated } = useSelector((state) => state.auth)

  const isTokenExpired = () => {
    if (!token) return true
    try {
      const { exp } = jwtDecode(token)
      return Date.now() >= exp * 1000
    } catch {
      return true
    }
  }

  const getTokenExpiresIn = () => {
    if (!token) return 0
    try {
      const { exp } = jwtDecode(token)
      return exp * 1000 - Date.now()
    } catch {
      return 0
    }
  }

  return { token, user, isAuthenticated, isTokenExpired, getTokenExpiresIn }
}
