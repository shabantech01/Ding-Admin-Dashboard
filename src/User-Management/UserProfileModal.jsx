import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Calendar, ShoppingBag, UserX, UserCheck, Store, Bike } from "lucide-react"

const ROLE_LABEL = {
  CUSTOMER:   "Customer",
  MERCHANT:   "Merchant",
  RIDER:      "Rider",
  SUPERADMIN: "Admin",
}

const formatDate = (iso) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

const UserProfileModal = ({ user, onClose, onToggleStatus, isToggling }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!user) return null

  const isActive    = user.status === "ACTIVE"
  const isSuperAdmin = user.role === "SUPERADMIN"

  const ordersCount =
    user.role === "RIDER"
      ? user._count?.deliveryOrders ?? 0
      : user._count?.orders ?? 0

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm h-full bg-white rounded-l-2xl p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto transition-transform duration-300 ease-out [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Avatar + name */}
        <div className="flex flex-col gap-3 pt-1">
          {user.profilePhotoUrl ? (
            <img
              src={user.profilePhotoUrl}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#F3F0FA]">
              <User className="w-6 h-6 sm:w-7 sm:h-7 text-[#765AB8]" />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#000000]">{user.name}</h2>
            <p className="text-xs sm:text-sm text-[#8C8C8C]">
              {ROLE_LABEL[user.role] ?? user.role}
            </p>
          </div>
        </div>

        <div className="border-t border-[#EDEDED]" />

        {/* Profile info */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] sm:text-xs font-bold text-[#765AB8] uppercase tracking-wide">
            Profile Information
          </p>
          <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl bg-[#FAFAFA]">

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-[#8C8C8C]">Email Address</p>
                <p className="text-sm font-semibold text-[#000000] break-all">{user.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-[#8C8C8C]">Phone</p>
                <p className="text-sm font-semibold text-[#000000]">{user.phone || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-[#8C8C8C]">Joined</p>
                <p className="text-sm font-semibold text-[#000000]">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShoppingBag className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-[#8C8C8C]">
                  {user.role === "RIDER" ? "Deliveries" : "Orders"}
                </p>
                <p className="text-sm font-semibold text-[#000000]">{ordersCount}</p>
              </div>
            </div>

            {/* Merchant: business name */}
            {user.role === "MERCHANT" && user.merchant && (
              <div className="flex items-start gap-3">
                <Store className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#8C8C8C]">Business</p>
                  <p className="text-sm font-semibold text-[#000000]">{user.merchant.businessName}</p>
                  <p className="text-xs text-[#8C8C8C] mt-0.5">
                    Merchant status: {user.merchant.status}
                  </p>
                </div>
              </div>
            )}

            {/* Rider: online status */}
            {user.role === "RIDER" && user.riderProfile && (
              <div className="flex items-start gap-3">
                <Bike className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#8C8C8C]">Rider Status</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${
                      user.riderProfile.onlineStatus === "ONLINE"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`} />
                    <p className="text-sm font-semibold text-[#000000]">
                      {user.riderProfile.onlineStatus}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account status */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] sm:text-xs font-bold text-[#765AB8] uppercase tracking-wide">
            Account Status
          </p>
          <div className="flex items-center justify-between p-4 border border-[#EDEDED] rounded-xl">
            <span className="text-sm font-medium text-[#000000]">Current Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-[#FFF1E6] text-[#D97706]"
                : "bg-[#FDE8E8] text-[#DC2626]"
            }`}>
              {isActive ? "Active" : "Suspended"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          {/* Disable toggle for SUPERADMIN to prevent accidental lockout */}
          {!isSuperAdmin && (
            <button
              onClick={() => onToggleStatus(user.id)}
              disabled={isToggling}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap ${
                isActive
                  ? "bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FCA5A5]"
                  : "bg-[#F0FDF4] text-[#16A34A] hover:bg-[#BBF7D0]"
              }`}
            >
              {isActive ? (
                <><UserX className="w-4 h-4 shrink-0" /> Suspend Account</>
              ) : (
                <><UserCheck className="w-4 h-4 shrink-0" /> Activate Account</>
              )}
            </button>
          )}

          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#D9D9D9] text-[#000000] text-sm font-semibold hover:bg-[#F9F9F9] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfileModal
