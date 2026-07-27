import { useState, useEffect } from "react"
import { LogOut } from "lucide-react"

const LogoutConfirmModal = ({ onConfirm, onCancel }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleCancel = () => {
    setIsVisible(false)
    setTimeout(onCancel, 200)
  }

  const handleConfirm = () => {
    setIsVisible(false)
    setTimeout(onConfirm, 200)
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-5 shadow-xl transition-all duration-200 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-[#000000]">Sign Out</h3>
            <p className="text-sm text-[#5C5C5C] leading-relaxed">
              Are you sure you want to sign out of your admin session?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-xl border border-[#D9D9D9] text-sm font-semibold text-[#5C5C5C] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmModal
