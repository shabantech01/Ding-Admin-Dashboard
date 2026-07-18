// Dashboard.jsx
import { useState } from "react"
import {
    Home,
    ShoppingBag,
    DollarSign,
    Users,
    Truck,
    Clock,
    ArrowUp,
    ArrowDown,
    Activity,
    Award,
} from "lucide-react"
import Sidebar from "../Dashboard/Sidebar"
import Topbar from "../Dashboard/Topbar"

const statCards = [
    {
        label: "Total Orders",
        value: "38",
        change: "5.6%",
        direction: "up",
        sublabel: "vs prev",
        icon: ShoppingBag,
        iconBg: "bg-[#DBEAFE]",
        iconColor: "text-[#2563EB]",
    },
    {
        label: "Revenue",
        value: "$2,237.65",
        change: "3.2%",
        direction: "down",
        sublabel: "vs prev",
        icon: DollarSign,
        iconBg: "bg-[#DCFCE7]",
        iconColor: "text-[#16A34A]",
    },
    {
        label: "Active Users",
        value: "6",
        change: "20%",
        direction: "up",
        sublabel: "vs prev",
        icon: Users,
        iconBg: "bg-[#F3E8FF]",
        iconColor: "text-[#9333EA]",
    },
    {
        label: "Active Drivers",
        value: "1",
        change: "100%",
        direction: "up",
        sublabel: "vs prev",
        icon: Truck,
        iconBg: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
    },
    {
        label: "Avg Delivery Time",
        value: "28 mins",
        change: "6.7%",
        direction: "up",
        sublabel: "speed",
        icon: Clock,
        iconBg: "bg-[#FEE2E2]",
        iconColor: "text-[#EF4444]",
    },
]

const topRestaurants = [
    { rank: 1, name: "Burger & Co.", rating: 4.6, revenue: "$36,250", orders: 1450, badgeBg: "bg-[#FEF3C7]", badgeText: "text-[#D97706]" },
    { rank: 2, name: "Tandoori Kitchen", rating: 4.8, revenue: "$26,700", orders: 890, badgeBg: "bg-[#DBEAFE]", badgeText: "text-[#2563EB]" },
    { rank: 3, name: "Taco House", rating: 4.2, revenue: "$2,400", orders: 120, badgeBg: "bg-[#FED7AA]", badgeText: "text-[#C2410C]" },
    { rank: 4, name: "Bella Italia", rating: 0, revenue: "$0", orders: 0, badgeBg: "bg-[#FEE2E2]", badgeText: "text-[#EF4444]" },
    { rank: 5, name: "Sushi Zen", rating: 0, revenue: "$0", orders: 0, badgeBg: "bg-[#F5F5F5]", badgeText: "text-[#737373]" },
]

const StatCard = ({ stat }) => {
    const Icon = stat.icon
    const isUp = stat.direction === "up"

    return (
        <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                    {stat.label}
                </span>
                <div className={`w-7 h-7 flex items-center justify-center rounded-full shrink-0 ${stat.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                </div>
            </div>

            <p className="text-xl sm:text-2xl font-bold text-[#000000]">{stat.value}</p>

            <div className="flex items-center gap-1 text-xs">
                {isUp ? (
                    <ArrowUp className="w-3 h-3 text-[#16A34A]" />
                ) : (
                    <ArrowDown className="w-3 h-3 text-[#EF4444]" />
                )}
                <span className={`font-semibold ${isUp ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
                    {stat.change}
                </span>
                <span className="text-[#8C8C8C]">{stat.sublabel}</span>
            </div>
        </div>
    )
}

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex w-full h-screen overflow-hidden">
            {/* <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}

            <div className="flex flex-col flex-1 h-full overflow-y-auto">
                <Topbar
                    title="System Oversight"
                    userInitials="DE"
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">
                    {/* Heading */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                {/* <Home className="w-5 h-5 sm:w-6 sm:h-6 text-[#F97316]" /> */}
                                <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">
                                    Dashboard
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-[#8C8C8C]">
                                Basic Reporting — platform metrics and performance summary
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-[#8C8C8C] whitespace-nowrap">Period:</span>
                            <select
                                defaultValue="Last 7 Days"
                                className="h-9 px-3 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none"
                            >
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Month</option>
                            </select>
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {statCards.map((stat) => (
                            <StatCard key={stat.label} stat={stat} />
                        ))}
                    </div>

                    {/* Live Ops Monitor + Top Restaurants */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Live Ops Monitor */}
                        <div className="border border-[#EDEDED] rounded-xl overflow-hidden">
                            <div className="flex flex-col gap-1 p-4 sm:p-5 bg-[#F0FDF4]">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                                    <h2 className="text-sm sm:text-base font-bold text-[#000000]">
                                        Live Ops Monitor
                                    </h2>
                                </div>
                                <p className="text-xs sm:text-sm text-[#8C8C8C]">
                                    Real-time platform activity indicators
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 p-4 sm:p-5">
                                <div className="flex items-center justify-between p-4 border border-[#EDEDED] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-[#16A34A]" />
                                        <div>
                                            <p className="text-sm font-bold text-[#000000]">Active Deliveries</p>
                                            <p className="text-xs text-[#8C8C8C]">Orders currently in flight</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-[#000000]">3</span>
                                </div>

                                <div className="flex flex-col gap-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#8C8C8C]">Server Connection:</span>
                                        <span className="font-semibold text-[#16A34A]">Connected</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#8C8C8C]">Last Updated:</span>
                                        <span className="font-semibold text-[#000000]">Just now</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#8C8C8C]">Active Drivers (Online):</span>
                                        <span className="font-semibold text-[#000000]">1</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Restaurants */}
                        <div className="border border-[#EDEDED] rounded-xl overflow-hidden">
                            <div className="flex flex-col gap-1 p-4 sm:p-5 bg-[#FFF7ED]">
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-[#D97706]" />
                                    <h2 className="text-sm sm:text-base font-bold text-[#000000]">
                                        Top Restaurants
                                    </h2>
                                </div>
                                <p className="text-xs sm:text-sm text-[#8C8C8C]">
                                    Ranked by order volume & revenue
                                </p>
                            </div>

                            <div className="flex flex-col">
                                {topRestaurants.map((r) => (
                                    <div
                                        key={r.rank}
                                        className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#EDEDED] last:border-0"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${r.badgeBg} ${r.badgeText}`}>
                                                #{r.rank}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-[#000000] truncate">
                                                    {r.name}
                                                </p>
                                                <p className="flex items-center gap-1 text-xs text-[#D97706]">
                                                    ★ {r.rating}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-[#000000]">{r.revenue}</p>
                                            <p className="text-xs text-[#8C8C8C]">{r.orders} orders</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard