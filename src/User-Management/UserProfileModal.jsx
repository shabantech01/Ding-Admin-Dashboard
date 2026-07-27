import { useState, useEffect } from "react"
import { X, User, Mail, Phone, Calendar, Clock, ShoppingBag, UserX } from "lucide-react"

const UserProfileModal = ({ user, onClose, onSuspend }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(onClose, 300)
    }

    if (!user) return null

    const isActive = user.status === "Active"

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-sm h-full bg-white rounded-l-2xl p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto transition-transform duration-300 ease-out [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isVisible ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col gap-3 pt-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#FEE2E2]">
                        <User className="w-6 h-6 sm:w-7 sm:h-7 text-[#EF4444]" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#000000]">
                            {user.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#8C8C8C]">ID: {user.id}</p>
                    </div>
                </div>

                <div className="border-t border-[#EDEDED]" />

                <div className="flex flex-col gap-3">
                    <p className="text-[11px] sm:text-xs font-bold text-[#765AB8] uppercase tracking-wide">
                        Profile Information
                    </p>

                    <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl bg-[#FAFAFA]">
                        <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-[#8C8C8C]">Email Address</p>
                                <p className="text-sm font-semibold text-[#000000] break-all">
                                    {user.email || "—"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-[#8C8C8C]">Contact Phone</p>
                                <p className="text-sm font-semibold text-[#000000]">
                                    {user.phone || "—"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-[#8C8C8C]">Joined Date</p>
                                <p className="text-sm font-semibold text-[#000000]">
                                    {user.joined}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-[#8C8C8C]">Last Seen</p>
                                <p className="text-sm font-semibold text-[#000000]">
                                    {user.lastActive}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <ShoppingBag className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-[#8C8C8C]">Order Made</p>
                                <p className="text-sm font-semibold text-[#000000]">
                                    {user.orders ?? 0} Orders
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <p className="text-[11px] sm:text-xs font-bold text-[#765AB8] uppercase tracking-wide">
                        Account Status
                    </p>

                    <div className="flex items-center justify-between p-4 border border-[#EDEDED] rounded-xl">
                        <span className="text-sm font-medium text-[#000000]">
                            Current Status:
                        </span>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive
                                ? "bg-[#FFF1E6] text-[#D97706]"
                                : "bg-[#FDE8E8] text-[#DC2626]"
                                }`}
                        >
                            {user.status}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                        onClick={() => onSuspend(user.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FEE2E2] text-[#EF4444] text-sm font-semibold hover:bg-[#FCA5A5] transition-colors cursor-pointer whitespace-nowrap"
                    >
                        <UserX className="w-4 h-4 shrink-0" />
                        Suspend Account
                    </button>
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-[#D9D9D9] text-[#000000] text-sm font-semibold hover:bg-[#F9F9F9] transition-colors cursor-pointer min-w-[120px]"
                    >
                        Close Detail
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserProfileModal
