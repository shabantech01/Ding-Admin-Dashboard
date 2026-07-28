import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Check } from "lucide-react"
import logo from "../assets/logo.png"
import { useLoginMutation } from "../features/auth/authApi"
import { setCredentials } from "../features/auth/authSlice"
import { useAuth } from "../hooks/useAuth"
import { InputField } from "../components/InputField"
import styles from "./styles.module.css"

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [loginRequest, { isLoading }] = useLoginMutation()
  const [rememberMe, setRememberMe] = useState(true)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true })
  }, [isAuthenticated])

  const onSubmit = async (data) => {
    try {
      const result = await loginRequest(data).unwrap()
      const accessToken = result?.data?.tokens?.accessToken
      const refreshToken = result?.data?.tokens?.refreshToken
      const user = result?.data?.user

      if (!accessToken || !refreshToken) {
        setError("root", {
          message: "Unexpected response from server. Please contact support.",
        })
        return
      }

      if (user?.role !== "SUPERADMIN") {
        setError("root", {
          message: "Access denied. This portal is restricted to Super Administrators only.",
        })
        return
      }

      dispatch(setCredentials({ accessToken, refreshToken, user, rememberMe }))
      navigate("/dashboard", { replace: true })
    } catch (err) {
      const message =
        err?.data?.message ??
        err?.data?.error ??
        err?.error ??
        "Invalid credentials. Please try again."
      setError("root", { message })
    }
  }

  return (
    <div className={styles.container}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <img src={logo} alt="Ding logo" className={styles.logo} />
      </div>

      {/* Form card */}
      <div className={styles.formContainer}>
        <div className={styles.headerWrapper}>
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Login to access your Ding account</p>
        </div>

        {errors.root && (
          <div className={styles.errorContainer}>
            <span>{errors.root.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <InputField
            label="Email"
            id="email"
            type="email"
            placeholder="Enter your email address"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />

          <InputField
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            className="mb-3"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          {/* Remember Me */}
          <div className={styles.rememberMeWrapper}>
            <button
              type="button"
              onClick={() => setRememberMe((prev) => !prev)}
              className={`${styles.rememberMeButton} group`}
            >
              <div className={`${styles.checkboxContainer} ${
                rememberMe ? styles.checkboxChecked : styles.checkboxUnchecked
              }`}>
                {rememberMe && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className={styles.rememberMeText}>Remember me</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Spacer to balance justify-between without a footer */}
      <div className="mb-4" />
    </div>
  )
}

export default Login
