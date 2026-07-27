import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { X, LogOut } from "lucide-react"
import { useDispatch } from "react-redux"
import home from "../assets/home.svg"
import users from "../assets/users.svg"
import resturant from "../assets/resturant.svg"
import drivers from "../assets/drivers.svg"
import orders from "../assets/orders.svg"
import logo from "../assets/logo.png"
import { useAuth } from "../hooks/useAuth"
import { logout } from "../features/auth/authSlice"
import LogoutConfirmModal from "../components/common/LogoutConfirmModal"

const sidebarData = [
  { image: home, title: "Dashboard", path: "/dashboard" },
  { image: users, title: "Users", path: "/users" },
  { image: resturant, title: "Restaurants", path: "/restaurants" },
  { image: drivers, title: "Drivers", path: "/drivers" },
  { image: orders, title: "Orders", path: "/orders" },
]

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase() ?? "SA"

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const displayName = user?.name ?? user?.fullName ?? user?.email ?? "Super Admin"
  const displayEmail = user?.email ?? ""

  const handleLogoutConfirmed = () => {
    dispatch(logout())
    navigate("/", { replace: true })
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <div
        className={`fixed md:static top-0 left-0 z-50 flex flex-col w-[275px] h-full bg-white border-r border-[#EDEDED] py-6 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 text-[#8C8C8C] hover:text-[#000000] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <img
          src={logo}
          alt="Ding logo"
          className="w-28 sm:w-32 h-auto self-center mb-8"
        />

        <nav className="flex flex-col gap-1 px-4 flex-1">
          {sidebarData.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm sm:text-base transition-colors ${
                  isActive
                    ? "bg-[#765AB8] text-white font-semibold"
                    : "text-[#5C5C5C] hover:bg-[#F9F9F9]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={item.image}
                    alt=""
                    className={`w-5 h-5 ${isActive ? "brightness-0 invert" : ""}`}
                  />
                  <span>{item.title}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pt-4 border-t border-[#EDEDED] mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#765AB8] text-white text-xs font-semibold shrink-0">
              {getInitials(displayName)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-semibold text-[#000000] truncate">
                {displayName}
              </p>
              {displayEmail && (
                <p className="text-xs text-[#8C8C8C] truncate">{displayEmail}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
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

export default Sidebar
