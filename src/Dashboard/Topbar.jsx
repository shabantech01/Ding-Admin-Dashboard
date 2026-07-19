
import { useNavigate } from "react-router-dom"
import { Moon, ChevronLeft, Menu } from "lucide-react"

const Topbar = ({ title = "SYSTEM OVERSIGHT", userInitials = "DE", onMenuClick }) => {
    const navigate = useNavigate()

    return (
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

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <button className="text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer">
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#765AB8] text-white text-xs sm:text-sm font-semibold">
                    {userInitials}
                </div>
            </div>
        </div>
    )
}

export default Topbar