import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Menu, LogOut } from "lucide-react"
import { useDispatch } from "react-redux"
import { useAuth } from "../hooks/useAuth"
import { logout } from "../features/auth/authSlice"
import LogoutConfirmModal from "../components/common/LogoutConfirmModal"

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() ?? "SA"

const Topbar = ({ title = "SYSTEM OVERSIGHT", onMenuClick }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, accessToken } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const displayName = user?.name ?? user?.fullName ?? user?.email ?? "Super Admin"

  const handleLogoutConfirmed = () => {
    dispatch(logout())
    navigate("/", { replace: true })
  }

  return (
    <>
      <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 border-b border-[#EDEDED] bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden text-[#000000] hover:text-[#5C5C5C] transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 sm:gap-2 text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer min-w-0"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase truncate">
              {title}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Avatar with version tooltip */}
          <div className="relative inline-flex group">
            <button
              onClick={() => {
                console.log("%c[DEV] Admin Access Token", "color:#765AB8;font-weight:bold;font-size:13px")
                console.log(accessToken)
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#765AB8] text-white text-xs sm:text-sm font-semibold hover:bg-[#654A9F] active:scale-95 transition-all cursor-pointer"
              aria-label={`${displayName} — v${__APP_VERSION__} (${__APP_BUILD__})`}
            >
              {getInitials(displayName)}
            </button>

            <div className="pointer-events-none absolute right-0 top-[calc(100%+10px)] z-9100 whitespace-nowrap rounded-[10px] border border-[#374151] bg-[#111827] px-[13px] py-[9px] shadow-[0_8px_28px_rgba(0,0,0,0.22)] opacity-0 invisible -translate-y-1.5 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
              {/* Up-pointing arrow */}
              <span className="absolute top-[-5px] right-[14px] h-[9px] w-[9px] rotate-45 border-l border-t border-[#374151] bg-[#111827]" />
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#6B7280]">Build</span>
                <span className="font-mono text-[11px] text-[#A78BFA]">
                  v{__APP_VERSION__}({__APP_BUILD__})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            title="Sign out"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[#8C8C8C] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogoutConfirmed}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  )
}

export default Topbar
