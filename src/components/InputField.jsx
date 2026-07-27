import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export const InputField = ({
  label,
  error,
  type = "text",
  id,
  className = "",
  placeholder,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  const borderClass = error
    ? "border-red-500 focus-within:border-red-500"
    : "border-gray-200 focus-within:border-[#765AB8]"

  return (
    <div className={`relative ${className.includes("mb-") ? "" : "mb-6"} w-full ${className}`}>
      <div className={`relative flex items-center rounded-lg border bg-white transition-all ${borderClass}`}>
        <input
          id={id}
          type={inputType}
          placeholder={placeholder || " "}
          className="peer w-full bg-transparent px-4 py-3.5 text-[14px] text-gray-800 placeholder:text-gray-400 placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:transition-opacity placeholder:duration-200 outline-none font-medium z-0 rounded-lg"
          {...props}
        />

        {/* Floating label — sits on the top border when filled/focused, drops to center when empty */}
        <label
          htmlFor={id}
          className={`absolute left-4 pointer-events-none select-none z-10 transition-all duration-200 ease-in-out leading-none
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[14px] peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0
            peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-[12px] peer-focus:font-semibold peer-focus:bg-white peer-focus:px-1.5 peer-focus:text-[#765AB8]
            -top-2.5 translate-y-0 text-[12px] font-semibold bg-white px-1.5
            ${error ? "text-red-500 peer-focus:text-red-500" : "text-gray-500"}`}
        >
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="flex items-center justify-center p-3 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none z-10 cursor-pointer shrink-0"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <span className="block mt-1.5 text-xs text-red-500 font-medium pl-1 text-left">
          {error}
        </span>
      )}
    </div>
  )
}

export default InputField
