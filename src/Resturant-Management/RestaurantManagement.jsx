import { useState, useMemo } from "react"
import { Search, FileText, X, Check, MapPin } from "lucide-react"
import Topbar from "../Dashboard/Topbar"
import RestaurantApplicationModal from "./RestaurantModal"

const pendingApprovals = [
    {
        id: "REQ-001",
        category: "Chinese / Asian",
        name: "Wok & Roll",
        address: "502 Canal St, NY 10013",
        owner: "Lee Wei",
        phone: "+1 (555) 789-2234",
        email: "lee@wokroll.com",
        commission: "15%",
        menuSample: "Kung Pao Chicken, Spring Rolls, Beef Chow Mein, Bubble Milk Tea",
        licenseUrl: "#",
    },
    {
        id: "REQ-002",
        category: "Healthy / Salad",
        name: "The Green Salad Bar",
        address: "104 Hudson St, NY 10013",
        owner: "Diana Prince",
        phone: "+1 (555) 402-8871",
        email: "diana@greensaladbar.com",
        commission: "10%",
        menuSample: "Caesar Salad, Quinoa Bowl, Avocado Toast, Green Smoothie",
        licenseUrl: "#",
    },
    {
        id: "REQ-003",
        category: "Pizza",
        name: "Pizza Express",
        address: "344 Third Ave, NY 10010",
        owner: "Luigi Mario",
        phone: "+1 (555) 663-2290",
        email: "luigi@pizzaexpress.com",
        commission: "15%",
        menuSample: "Margherita, Pepperoni, Four Cheese, Garlic Bread",
        licenseUrl: "#",
    },
    {
        id: "REQ-004",
        category: "French / Cafe",
        name: "Le Croissant Café",
        address: "15 West 21st St, NY 10010",
        owner: "Jean Dupont",
        phone: "+1 (555) 219-4471",
        email: "jean@lecroissant.com",
        commission: "14%",
        menuSample: "Croissant, Café Au Lait, Quiche Lorraine, Macarons",
        licenseUrl: "#",
    },
]

const restaurantDirectory = [
    { id: "RST-001", name: "Burger & Co.", category: "Burgers", status: "Active", orders: 1450, revenue: "$36,250" },
    { id: "RST-002", name: "Tandoori Kitchen", category: "Indian", status: "Active", orders: 890, revenue: "$26,700" },
    { id: "RST-003", name: "Taco House", category: "Mexican", status: "Active", orders: 120, revenue: "$2,400" },
    { id: "RST-004", name: "Bella Italia", category: "Italian", status: "Active", orders: 0, revenue: "$0" },
]

const categoryFilters = ["All Categories", "Burgers", "Indian", "Mexican", "Italian", "Pizza"]

const StatusBadge = ({ status }) => (
    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF1E6] text-[#D97706]">
        {status}
    </span>
)

const CategoryTag = ({ category }) => (
    <span className="text-[10px] sm:text-xs font-semibold text-[#FF5A1F] uppercase tracking-wide">
        {category}
    </span>
)

const PendingCard = ({ item, onApprove, onReject, onViewApplication }) => (
    <div
        onClick={() => onViewApplication(item)}
        className="flex flex-col gap-4 py-7 px-5 border border-[#EDEDED] rounded-xl bg-white hover:shadow-md transition-shadow cursor-pointer"
    >
        <div className="flex items-start justify-between">
            <span className="text-[10px] sm:text-xs bg-[#FF63471A] py-0.5 px-2 rounded-sm font-bold text-[#FF5A1F] uppercase tracking-wide">
                {item.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs text-center font-semibold bg-[#FE9A001A] text-[#E17100] border border-[#FE9A0033]">
                Pending
            </span>
        </div>

        <div className="flex flex-col gap-1">
            <p className="text-base sm:text-lg font-bold text-[#0A0A0A]">{item.name}</p>
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#8C8C8C]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.address}</span>
            </p>
        </div>

        <div className="flex flex-col gap-2 border border-[#E5E5E5] bg-[#F5F5F533] p-3 rounded-sm text-xs sm:text-sm">
            <div className="flex items-center justify-between">
                <span className="text-[#737373]">Owner Contact:</span>
                <span className="font-semibold text-[#000000]">{item.owner}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[#737373]">Proposed Comm.:</span>
                <span className="font-semibold text-[#000000]">{item.commission}</span>
            </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E5E5] -mx-5 pt-3 px-5">
            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-[#5C5C5C]">
                <FileText className="w-4 h-4" />
                View Application
            </span>

            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onReject(item.id)
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FCA5A5] transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onApprove(item.id)
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors cursor-pointer"
                >
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    </div>
)

const RestaurantManagement = ({onMenuClick}) => {
    const [search, setSearch] = useState("")
    const [activeCategory, setActiveCategory] = useState("All Categories")
    const [approvals, setApprovals] = useState(pendingApprovals)
    const [selectedApplication, setSelectedApplication] = useState(null)

    const handleApprove = (id) => {
        setApprovals((prev) => prev.filter((item) => item.id !== id))
    }

    const handleReject = (id) => {
        setApprovals((prev) => prev.filter((item) => item.id !== id))
    }

    const filteredDirectory = useMemo(() => {
        return restaurantDirectory.filter((r) => {
            const matchesSearch =
                r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.id.toLowerCase().includes(search.toLowerCase())
            const matchesCategory =
                activeCategory === "All Categories" || r.category === activeCategory
            return matchesSearch && matchesCategory
        })
    }, [search, activeCategory])

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Topbar
                title="System Oversight"
                onMenuClick={onMenuClick}
            />

            <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">
                {/* Heading + search */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">
                            Restaurant Management
                        </h1>
                        <p className="text-xs sm:text-sm text-[#8C8C8C]">
                            Review onboarding submissions and manage active restaurant listings
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by restaurant name or ID..."
                            className="w-full h-10 pl-9 pr-3 bg-white border border-[#D9D9D9] rounded-md text-sm focus:outline-none focus:border-[#765AB8]"
                        />
                    </div>
                </div>

                {/* Stats pill */}
                <div className="flex justify-center w-full">
                    <div className="inline-flex items-center w-fit rounded-full border border-[#D9D9D9] bg-white overflow-hidden">
                        <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm text-[#000000]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] shrink-0" />
                            <span className="whitespace-nowrap">Pending Approval:</span>
                            <span className="font-bold">{approvals.length}</span>
                        </div>

                        <div className="w-px self-stretch bg-[#D9D9D9]" />

                        <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm text-[#000000]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] shrink-0" />
                            <span className="whitespace-nowrap">All Restaurants:</span>
                            <span className="font-bold">{restaurantDirectory.length}</span>
                        </div>
                    </div>
                </div>

                {/* Pending approvals */}
                {approvals.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-semibold text-[#000000]">
                                Pending Approvals
                            </h2>
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold">
                                {approvals.length}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {approvals.map((item) => (
                                <PendingCard
                                    key={item.id}
                                    item={item}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onViewApplication={setSelectedApplication}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Restaurant directory */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-sm sm:text-base font-semibold text-[#000000]">
                            Restaurant Directory
                        </h2>

                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-[#8C8C8C]">Category:</span>
                            <select
                                value={activeCategory}
                                onChange={(e) => setActiveCategory(e.target.value)}
                                className="h-9 px-3 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none"
                            >
                                {categoryFilters.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block border border-[#EDEDED] rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
                                    <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Restaurant</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Category</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Orders (Mo.)</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Revenue (Mo.)</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDirectory.map((r) => (
                                    <tr key={r.id} className="border-b border-[#EDEDED] last:border-0 hover:bg-[#F9F9F9]">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-[#000000]">{r.name}</p>
                                            <p className="text-xs text-[#8C8C8C]">{r.id}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#000000]">{r.category}</td>
                                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                        <td className="px-4 py-3 text-sm text-[#8C8C8C]">{r.orders}</td>
                                        <td className="px-4 py-3 text-sm text-[#8C8C8C]">{r.revenue}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button className="px-3 py-1.5 rounded-md border border-[#D9D9D9] text-xs font-medium text-[#000000] hover:bg-[#F9F9F9] transition-colors cursor-pointer whitespace-nowrap">
                                                    Change Status
                                                </button>
                                                <button className="px-3 py-1.5 rounded-md border border-[#FCD5D5] text-xs font-medium text-[#DC2626] hover:bg-[#FDE8E8] transition-colors cursor-pointer">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {filteredDirectory.map((r) => (
                            <div key={r.id} className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-[#000000]">{r.name}</p>
                                        <p className="text-xs text-[#8C8C8C]">{r.id}</p>
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>

                                <div className="flex items-center justify-between text-xs text-[#8C8C8C] pt-2 border-t border-[#EDEDED]">
                                    <span>{r.category}</span>
                                    <span>{r.orders} orders</span>
                                    <span className="font-medium text-[#000000]">{r.revenue}</span>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <button className="flex-1 px-3 py-2 rounded-md border border-[#D9D9D9] text-xs font-medium text-[#000000] cursor-pointer">
                                        Change Status
                                    </button>
                                    <button className="flex-1 px-3 py-2 rounded-md border border-[#FCD5D5] text-xs font-medium text-[#DC2626] cursor-pointer">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredDirectory.length === 0 && (
                        <p className="text-center text-sm text-[#8C8C8C] py-10">
                            No restaurants found matching your filters.
                        </p>
                    )}
                </div>
            </div>

            {/* Application detail modal */}
            {selectedApplication && (
                <RestaurantApplicationModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onApprove={(id) => {
                        handleApprove(id)
                        setSelectedApplication(null)
                    }}
                    onReject={(id) => {
                        handleReject(id)
                        setSelectedApplication(null)
                    }}
                />
            )}
        </div>
    )
}

export default RestaurantManagement