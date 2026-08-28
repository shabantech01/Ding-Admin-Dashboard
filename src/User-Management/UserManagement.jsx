import { useState, useEffect, useCallback } from "react"
import { Search, Loader2, RefreshCw } from "lucide-react"
import Topbar from "../Dashboard/Topbar"
import UserProfileModal from "./UserProfileModal"
import { useGetUsersQuery, useToggleUserStatusMutation } from "../features/users/usersApi"

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_FILTERS = [
  { label: "All",      value: "ALL"      },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Merchant", value: "MERCHANT" },
  { label: "Rider",    value: "RIDER"    },
]

const STATUS_FILTERS = [
  { label: "All Statuses", value: "ALL"        },
  { label: "Active",       value: "ACTIVE"     },
  { label: "Suspended",    value: "NOT_ACTIVE" },
]

const ROLE_LABEL = {
  CUSTOMER:   "Customer",
  MERCHANT:   "Merchant",
  RIDER:      "Rider",
  SUPERADMIN: "Admin",
}

const PAGE_SIZE = 20

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const isActive = status === "ACTIVE"
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive ? "bg-[#FFF1E6] text-[#D97706]" : "bg-[#FDE8E8] text-[#DC2626]"
    }`}>
      {isActive ? "Active" : "Suspended"}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const UserManagement = ({ onMenuClick }) => {
  const [roleFilter, setRoleFilter]   = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [search, setSearch]           = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [cursor, setCursor]           = useState(undefined)
  const [allUsers, setAllUsers]       = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  // ── Debounce search input (400ms) ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(t)
  }, [search])

  // ── Reset pagination when filters or search change ─────────────────────────
  useEffect(() => {
    setCursor(undefined)
    setAllUsers([])
  }, [roleFilter, statusFilter, debouncedSearch])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data, isFetching, isError, refetch } = useGetUsersQuery({
    role:   roleFilter,
    status: statusFilter,
    search: debouncedSearch,
    cursor,
    take:   PAGE_SIZE,
  })

  // ── Accumulate pages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!data?.data?.users) return
    if (cursor === undefined) {
      setAllUsers(data.data.users)
    } else {
      setAllUsers((prev) => [...prev, ...data.data.users])
    }
  // cursor intentionally excluded — we only want to run on new data arrivals
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const hasMore    = data?.data?.hasMore ?? false
  const nextCursor = data?.data?.nextCursor

  const loadMore = useCallback(() => {
    if (nextCursor) setCursor(nextCursor)
  }, [nextCursor])

  const handleRefresh = () => {
    setAllUsers([])
    setCursor(undefined)
    refetch()
  }

  // ── Toggle status ──────────────────────────────────────────────────────────
  const [toggleStatus, { isLoading: isToggling }] = useToggleUserStatusMutation()

  const handleToggleStatus = useCallback(async (userId) => {
    await toggleStatus(userId)
    // Optimistically update the selected user in the modal
    setSelectedUser((prev) =>
      prev?.id === userId
        ? { ...prev, status: prev.status === "ACTIVE" ? "NOT_ACTIVE" : "ACTIVE" }
        : prev
    )
  }, [toggleStatus])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Topbar title="System Oversight" onMenuClick={onMenuClick} />

      <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h4 className="text-2xl font-bold text-[#000000]">User Management</h4>
          <p className="text-xs sm:text-sm text-[#8C8C8C]">
            Unified directory of customers, merchants, and riders
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between p-4 sm:p-5 border border-[#EDEDED] rounded-xl">

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#D9D9D9] rounded-md text-sm focus:outline-none focus:border-[#765AB8]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Role pill tabs */}
            <div className="flex items-center gap-1 bg-[#F9F9F9] p-1 rounded-md overflow-x-auto">
              {ROLE_FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setRoleFilter(value)}
                  className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    roleFilter === value
                      ? "bg-white text-[#000000] shadow-sm"
                      : "text-[#8C8C8C] hover:text-[#000000]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none"
            >
              {STATUS_FILTERS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              title="Refresh"
              className="h-9 w-9 flex items-center justify-center border border-[#D9D9D9] rounded-lg text-[#8C8C8C] hover:text-[#765AB8] hover:border-[#765AB8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Error state */}
        {isError && (
          <p className="text-center text-sm text-[#DC2626] py-6">
            Failed to load users. Please try again.
          </p>
        )}

        {/* Desktop table */}
        {!isError && (
          <div className="hidden md:block border border-[#EDEDED] rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
                  <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Joined</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase">Orders</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="border-b border-[#EDEDED] last:border-0 hover:bg-[#F9F9F9] cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.profilePhotoUrl ? (
                          <img
                            src={user.profilePhotoUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#F3F0FA] flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-[#765AB8]">
                              {user.name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#000000]">{user.name}</p>
                          <p className="text-xs text-[#8C8C8C]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#000000]">
                      {ROLE_LABEL[user.role] ?? user.role}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8C8C8C]">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8C8C8C]">
                      {user.role === "RIDER"
                        ? user._count?.deliveryOrders ?? 0
                        : user._count?.orders ?? 0}
                    </td>
                  </tr>
                ))}

                {/* First-load skeleton rows */}
                {isFetching && allUsers.length === 0 &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="border-b border-[#EDEDED]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F0F0F0] animate-pulse" />
                          <div className="flex flex-col gap-1.5">
                            <div className="h-3 w-28 bg-[#F0F0F0] rounded animate-pulse" />
                            <div className="h-2.5 w-36 bg-[#F0F0F0] rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      {[1,2,3,4].map((c) => (
                        <td key={c} className="px-4 py-3">
                          <div className="h-3 w-16 bg-[#F0F0F0] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {!isError && (
          <div className="flex flex-col gap-3 md:hidden">
            {allUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="flex flex-col gap-2 p-4 border border-[#EDEDED] rounded-lg cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.profilePhotoUrl ? (
                      <img src={user.profilePhotoUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#F3F0FA] flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-[#765AB8]">{user.name?.[0]?.toUpperCase() ?? "?"}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#000000] truncate">{user.name}</p>
                      <p className="text-xs text-[#8C8C8C] truncate">{user.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={user.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-[#8C8C8C] pt-2 border-t border-[#EDEDED]">
                  <span>{ROLE_LABEL[user.role] ?? user.role}</span>
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            ))}

            {/* Mobile skeleton */}
            {isFetching && allUsers.length === 0 &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`mskel-${i}`} className="p-4 border border-[#EDEDED] rounded-lg flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F0F0F0] animate-pulse shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-3 w-32 bg-[#F0F0F0] rounded animate-pulse" />
                      <div className="h-2.5 w-40 bg-[#F0F0F0] rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Empty state */}
        {!isFetching && !isError && allUsers.length === 0 && (
          <p className="text-center text-sm text-[#8C8C8C] py-10">
            No users found matching your filters.
          </p>
        )}

        {/* Load more */}
        {hasMore && !isError && (
          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              disabled={isFetching}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#D9D9D9] rounded-lg text-sm font-medium text-[#000000] hover:bg-[#F9F9F9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isFetching ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}

        {/* Inline loading spinner for subsequent pages */}
        {isFetching && allUsers.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#765AB8]" />
          </div>
        )}
      </div>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
          isToggling={isToggling}
        />
      )}
    </div>
  )
}

export default UserManagement
