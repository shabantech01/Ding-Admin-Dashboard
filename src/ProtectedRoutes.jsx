import { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useAuth } from "./hooks/useAuth"
import { logout } from "./features/auth/authSlice"
import { useSessionExpiry } from "./hooks/useSessionExpiry"

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, isTokenExpired, user } = useAuth()

  useSessionExpiry()

  useEffect(() => {
    if (isAuthenticated && (isTokenExpired() || user?.role !== "SUPERADMIN")) {
      dispatch(logout())
    }
  }, [location.pathname])

  if (!isAuthenticated || isTokenExpired() || user?.role !== "SUPERADMIN") {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
