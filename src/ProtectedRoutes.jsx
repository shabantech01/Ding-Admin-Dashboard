import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import { useTokenRefresh } from "./hooks/useTokenRefresh"

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const { accessToken, isAuthenticated, isInitializing, user } = useAuth()

  // Proactively refresh accessToken before it expires
  useTokenRefresh(accessToken)

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "SUPERADMIN") {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
