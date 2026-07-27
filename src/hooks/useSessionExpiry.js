import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../features/auth/authSlice"
import { useAuth } from "./useAuth"

export const useSessionExpiry = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, getTokenExpiresIn } = useAuth()
  const timerRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) return

    const expiresIn = getTokenExpiresIn()

    if (expiresIn <= 0) {
      dispatch(logout())
      navigate("/", { replace: true })
      return
    }

    timerRef.current = setTimeout(() => {
      dispatch(logout())
      navigate("/", { replace: true })
    }, expiresIn)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAuthenticated])
}
