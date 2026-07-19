import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import Topbar from "../Dashboard/Topbar"
import UserProfileModal from "./UserProfileModal"

const usersData = [
    {
        id: "USR-001",
        name: "Alexander Wright",
        email: "alex.wright@gmail.com",
        phone: "+1 (555) 019-2834",
        type: "Customer",
        status: "Active",
        joined: "9 May 2026",
        lastActive: "23 Jun 2026, 03:12",
        orders: 24,
    },
    {
        id: "USR-002",
        name: "Sophia Chen",
        email: "sophia.chen@gmail.com",
        phone: "+1 (555) 214-7729",
        type: "Customer",
        status: "Active",
        joined: "24 May 2026",
        lastActive: "23 Jun 2026, 01:24",
        orders: 18,
    },
    {
        id: "USR-003",
        name: "Marcus Bennett",
        email: "marcus.bennett@gmail.com",
        phone: "+1 (555) 330-5561",
        type: "Customer",
        status: "Suspended",
        joined: "24 Apr 2026",
        lastActive: "20 Jun 2026, 03:24",
        orders: 7,
    },
    {
        id: "USR-004",
        name: "Isabella Rodriguez",
        email: "isabella.rodriguez@gmail.com",
        phone: "+1 (555) 442-8890",
        type: "Customer",
        status: "Active",
        joined: "11 Jun 2026",
        lastActive: "22 Jun 2026, 04:24",
        orders: 12,
    },
    {
        id: "USR-005",
        name: "John Doe",
        email: "john.doe@gmail.com",
        phone: "+1 (555) 019-3345",
        type: "Customer",
        status: "Active",
        joined: "18 Jun 2026",
        lastActive: "23 Jun 2026, 02:39",
        orders: 5,
    },
    {
        id: "USR-006",
        name: "Emily Watson",
        email: "emily.watson@dingmail.com",
        phone: "+1 (555) 771-2204",
        type: "Restaurant",
        status: "Active",
        joined: "25 Mar 2026",
        lastActive: "23 Jun 2026, 03:19",
        orders: 156,
    },
    {
        id: "USR-007",
        name: "Raj Patel",
        email: "raj.patel@dingmail.com",
        phone: "+1 (555) 662-9981",
        type: "Restaurant",
        status: "Active",
        joined: "4 Apr 2026",
        lastActive: "23 Jun 2026, 03:22",
        orders: 89,
    },
    {
        id: "USR-008",
        name: "Carlos Gomez",
        email: "carlos.gomez@dingmail.com",
        phone: "+1 (555) 508-4471",
        type: "Restaurant",
        status: "Active",
        joined: "8 Jun 2026",
        lastActive: "22 Jun 2026, 23:24",
        orders: 43,
    },
]

const typeFilters = ["All Types", "Customers", "Restaurants", "Drivers"]
const statusFilters = ["All Statuses", "Active", "Suspended"]

const StatusBadge = ({ status }) => {
    const isActive = status === "Active"
    return (
        <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${isActive
                ? "bg-[#FFF1E6] text-[#D97706]"
                : "bg-[#FDE8E8] text-[#DC2626]"
                }`}
        >
            {status}
        </span>
    )
}

const UserManagement = ({onMenuClick}) => {
    const [search, setSearch] = useState("")
    const [activeType, setActiveType] = useState("All Types")
    const [activeStatus, setActiveStatus] = useState("All Statuses")
    const [selectedUser, setSelectedUser] = useState(null)

    const filteredUsers = useMemo(() => {
        return usersData.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.id.toLowerCase().includes(search.toLowerCase())

            const matchesType =
                activeType === "All Types" ||
                user.type.toLowerCase() === activeType.toLowerCase().slice(0, -1) // "Customers" -> "customer"

            const matchesStatus =
                activeStatus === "All Statuses" || user.status === activeStatus

            return matchesSearch && matchesType && matchesStatus
        })
    }, [search, activeType, activeStatus])

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Topbar
                title="System Oversight"
                userInitials="DE"
                onMenuClick={onMenuClick}
            />

            <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
                {/* Heading */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">
                        User Management
                    </h1>
                    <p className="text-xs sm:text-sm text-[#8C8C8C]">
                        Unified directory of customers, restaurant owners, and drivers
                    </p>
                </div>

                {/* Search + filters */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between p-4 sm:p-5 border border-[#EDEDED] rounded-xl">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, email, or ID..."
                            className="w-full h-10 pl-9 pr-3 bg-white border border-[#D9D9D9] rounded-md text-sm focus:outline-none focus:border-[#765AB8]"
                        />
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#F9F9F9] p-1 rounded-md overflow-x-auto">
                            {typeFilters.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveType(type)}
                                    className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${activeType === type
                                        ? "bg-white text-[#000000] shadow-sm"
                                        : "text-[#8C8C8C] hover:text-[#000000]"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <select
                            value={activeStatus}
                            onChange={(e) => setActiveStatus(e.target.value)}
                            className="h-9 px-3 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none"
                        >
                            {statusFilters.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Desktop table*/}
                <div className="hidden md:block border border-[#EDEDED] rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
                                <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">User</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Type</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Joined Date</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} onClick={() => setSelectedUser(user)} className="border-b cursor-pointer border-[#EDEDED] last:border-0 hover:bg-[#F9F9F9]">
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-semibold text-[#000000]">{user.name}</p>
                                        <p className="text-xs text-[#8C8C8C]">{user.id}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#000000]">{user.type}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={user.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#8C8C8C]">{user.joined}</td>
                                    <td className="px-4 py-3 text-sm text-[#8C8C8C]">{user.lastActive}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards*/}
                <div className="flex flex-col gap-3 md:hidden">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className="flex flex-col gap-2 p-4 border border-[#EDEDED] rounded-lg"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-[#000000]">{user.name}</p>
                                    <p className="text-xs text-[#8C8C8C]">{user.id}</p>
                                </div>
                                <StatusBadge status={user.status} />
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#8C8C8C] pt-2 border-t border-[#EDEDED]">
                                <span>{user.type}</span>
                                <span>Joined {user.joined}</span>
                            </div>
                            <p className="text-xs text-[#8C8C8C]">Last active: {user.lastActive}</p>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <p className="text-center text-sm text-[#8C8C8C] py-10">
                        No users found matching your filters.
                    </p>
                )}
            </div>
            {selectedUser && (
                <UserProfileModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onSuspend={(id) => {
                        console.log("Suspend user:", id)
                        setSelectedUser(null)
                    }}
                />
            )}
        </div>
    )
}

export default UserManagement