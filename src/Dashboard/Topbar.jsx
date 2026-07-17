import { useNavigate } from "react-router-dom"

const Topbar = () => {
    const navigate = useNavigate()

    return (
        <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 border-b border-[#EDEDED] bg-white">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 sm:gap-2 text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer"
            >
                {/* <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase truncate">
                    SYSTEM OVERSIGHT
                </span> */}
            </button>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <button className="text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer">
                </button>
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#765AB8] text-white text-xs sm:text-sm font-semibold">
                    DE
                </div>
            </div>
        </div>
    )
}

export default Topbar
