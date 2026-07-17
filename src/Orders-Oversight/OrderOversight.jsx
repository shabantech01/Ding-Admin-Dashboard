import { useState, useMemo } from "react"
import { Search, ShoppingBag, DollarSign } from "lucide-react"
import Topbar from "../Dashboard/Topbar"
import OrderDetailModal from "./OrderDetail"

const ordersData = [
    { id: "ORD-9844", customer: "Isabella Rodriguez", restaurant: "Taco House", driver: null, placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Placed", total: 22.54 },
    { id: "ORD-9843", customer: "Sophia Chen", restaurant: "Tandoori Kitchen", driver: "Liam Davies", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Preparing", total: 52.84 },
    { id: "ORD-9845", customer: "John Doe", restaurant: "Burger & Co.", driver: "Liam Davies", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Picked Up", total: 35.99 },
    { id: "ORD-9842", customer: "Alexander Wright", restaurant: "Burger & Co.", driver: "Liam Davies", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 39.29 },
    { id: "ORD-9840", customer: "Emma Wilson", restaurant: "Tandoori Kitchen", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 42.99 },
    { id: "ORD-9790", customer: "Alexander Wright", restaurant: "Burger & Co.", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 25.75 },
    { id: "ORD-9789", customer: "Sophia Chen", restaurant: "Tandoori Kitchen", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 38.81 },
    { id: "ORD-9788", customer: "Marcus Bennett", restaurant: "Taco House", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 51.86 },
    { id: "ORD-9787", customer: "Isabella Rodriguez", restaurant: "Burger & Co.", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 64.92 },
    { id: "ORD-9780", customer: "Alexander Wright", restaurant: "Burger & Co.", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 42.07 },
    { id: "ORD-9779", customer: "Sophia Chen", restaurant: "Tandoori Kitchen", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 55.13 },
    { id: "ORD-9778", customer: "Marcus Bennett", restaurant: "Taco House", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 68.18 },
    { id: "ORD-9777", customer: "Isabella Rodriguez", restaurant: "Burger & Co.", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 81.24 },
    { id: "ORD-9776", customer: "John Doe", restaurant: "Tandoori Kitchen", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 94.29 },
    { id: "ORD-9775", customer: "Alexander Wright", restaurant: "Taco House", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 107.35 },
    { id: "ORD-9774", customer: "Sophia Chen", restaurant: "Burger & Co.", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 120.41 },
    { id: "ORD-9773", customer: "Marcus Bennett", restaurant: "Tandoori Kitchen", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 133.46 },
    { id: "ORD-9770", customer: "Alexander Wright", restaurant: "Burger & Co.", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 42.07 },
    { id: "ORD-9769", customer: "Sophia Chen", restaurant: "Tandoori Kitchen", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 55.13 },
    { id: "ORD-9768", customer: "Marcus Bennett", restaurant: "Taco House", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 68.18 },
    { id: "ORD-9767", customer: "Isabella Rodriguez", restaurant: "Burger & Co.", driver: "Olivia Martinez", placed: "23 Jun 03:19", delivered: "23 Jun 03:40", status: "Delivered", total: 81.24 },
]

const statusFilters = ["All Orders", "Placed", "Preparing", "Picked Up", "Delivered"]
const dateFilters = ["All Dates", "Today", "This Week", "This Month"]

const OrderStatus = ({ status }) => {
    const styles = {
        "Placed": "bg-[#FFF1E6] text-[#D97706]",
        "Preparing": "bg-[#DBEAFE] text-[#2563EB]",
        "Picked Up": "bg-[#E0E7FF] text-[#4F46E5]",
        "Delivered": "bg-[#DCFCE7] text-[#16A34A]",
    }

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-[#F5F5F5] text-[#737373]"}`}>
            {status}
        </span>
    )
}

const OrderManagement = () => {
    const [search, setSearch] = useState("")
    const [activeStatus, setActiveStatus] = useState("All Orders")
    const [activeDate, setActiveDate] = useState("All Dates")
    const [selectedOrder, setSelectedOrder] = useState(null)

    const totalOrders = ordersData.length
    const totalRevenue = ordersData.reduce((sum, o) => sum + o.total, 0)

    const filteredOrders = useMemo(() => {
        return ordersData.filter((o) => {
            const matchesSearch =
                o.id.toLowerCase().includes(search.toLowerCase()) ||
                o.customer.toLowerCase().includes(search.toLowerCase())
            const matchesStatus =
                activeStatus === "All Orders" || o.status === activeStatus
            return matchesSearch && matchesStatus
        })
    }, [search, activeStatus])

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Topbar title="System Oversight" userInitials="DE" />

            <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">
                {/* Heading */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">
                        Order Oversight
                    </h1>
                    <p className="text-xs sm:text-sm text-[#8C8C8C]">
                        View active deliveries, placement history, and courier tracking details
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                    <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                                Total Orders
                            </span>
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#DBEAFE]">
                                <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB]" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-[#000000]">{totalOrders}</p>
                    </div>

                    <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                                Total Made So Far
                            </span>
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#DCFCE7]">
                                <DollarSign className="w-3.5 h-3.5 text-[#16A34A]" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-[#000000]">
                            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Search + filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 border border-[#EDEDED] rounded-xl">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search order ID, client, diner..."
                            className="w-full h-10 pl-9 pr-3 bg-white border border-[#D9D9D9] rounded-md text-sm focus:outline-none focus:border-[#765AB8]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-[#8C8C8C] whitespace-nowrap">Status:</span>
                            <select
                                value={activeStatus}
                                onChange={(e) => setActiveStatus(e.target.value)}
                                className="h-9 px-3 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none"
                            >
                                {statusFilters.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-[#8C8C8C] whitespace-nowrap">Date:</span>
                            <select
                                value={activeDate}
                                onChange={(e) => setActiveDate(e.target.value)}
                                className="h-9 px-3 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none"
                            >
                                {dateFilters.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block border border-[#EDEDED] rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
                                <th className="px-4 py-3 text-xs font-semibold text-[#000000]">Order ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#000000]">Customer</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#000000]">Restaurant</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#000000]">Driver</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#000000]">Placed Date / Delivered Date &amp; Time</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#000000]">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#000000] text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((o) => (
                                <tr key={o.id} onClick={() => setSelectedOrder(o)} className="border-b cursor-pointer border-[#EDEDED] last:border-0 hover:bg-[#F9F9F9]">
                                    <td className="px-4 py-3 text-sm font-bold text-[#000000] whitespace-nowrap">{o.id}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-[#000000] whitespace-nowrap">{o.customer}</td>
                                    <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap">{o.restaurant}</td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                                        {o.driver ? (
                                            <span className="text-[#8C8C8C]">{o.driver}</span>
                                        ) : (
                                            <span className="italic font-medium text-[#F97316]">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#8C8C8C] whitespace-nowrap">
                                        {o.placed} / {o.delivered}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <OrderStatus status={o.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-[#000000] text-right whitespace-nowrap">
                                        ${o.total.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile / tablet cards */}
                <div className="flex flex-col gap-3 lg:hidden">
                    {filteredOrders.map((o) => (
                        <div key={o.id} onClick={() => setSelectedOrder(o)} className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-lg">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-[#000000]">{o.id}</p>
                                    <p className="text-xs text-[#8C8C8C] mt-0.5">{o.customer}</p>
                                </div>
                                <OrderStatus status={o.status} />
                            </div>

                            <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
                                <span>{o.restaurant}</span>
                                <span className="text-sm font-bold text-[#000000]">${o.total.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#EDEDED] text-xs">
                                <span className="text-[#8C8C8C]">
                                    Driver:{" "}
                                    {o.driver ? (
                                        <span className="text-[#000000] font-medium">{o.driver}</span>
                                    ) : (
                                        <span className="italic font-medium text-[#F97316]">Unassigned</span>
                                    )}
                                </span>
                            </div>

                            <p className="text-xs text-[#8C8C8C]">
                                {o.placed} / {o.delivered}
                            </p>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <p className="text-center text-sm text-[#8C8C8C] py-10">
                        No orders found matching your filters.
                    </p>
                )}
            </div>
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    )
}

export default OrderManagement