import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, ShoppingBag, DollarSign, RefreshCw, ChevronDown } from "lucide-react"
import Topbar from "../Dashboard/Topbar"
import OrderDetailModal from "./OrderDetail"
import { useLazyGetAdminOrdersQuery } from "../features/orders/ordersApi"

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { value: "ALL",              label: "All Orders" },
  { value: "PLACED",          label: "Placed" },
  { value: "CONFIRMED",       label: "Confirmed" },
  { value: "PREPARING",       label: "Preparing" },
  { value: "READY_FOR_PICKUP",label: "Ready for Pickup" },
  { value: "ASSIGNED",        label: "Assigned" },
  { value: "PICKED_UP",       label: "Picked Up" },
  { value: "ON_THE_WAY",      label: "On the Way" },
  { value: "DELIVERED",       label: "Delivered" },
  { value: "CANCELLED",       label: "Cancelled" },
]

const DATE_FILTERS = ["All Dates", "Today", "This Week", "This Month"]

const STATUS_STYLES = {
  PLACED:           "bg-[#FEF3C7] text-[#D97706]",
  CONFIRMED:        "bg-[#DBEAFE] text-[#2563EB]",
  PREPARING:        "bg-[#EDE9FE] text-[#7C3AED]",
  READY_FOR_PICKUP: "bg-[#FEF9C3] text-[#CA8A04]",
  ASSIGNED:         "bg-[#F0FDF4] text-[#15803D]",
  PICKED_UP:        "bg-[#E0E7FF] text-[#4F46E5]",
  ON_THE_WAY:       "bg-[#FFF7ED] text-[#EA580C]",
  DELIVERED:        "bg-[#DCFCE7] text-[#16A34A]",
  CANCELLED:        "bg-[#FEE2E2] text-[#DC2626]",
}

const PAYMENT_STYLES = {
  PENDING: "bg-[#FEF3C7] text-[#D97706]",
  PAID:    "bg-[#DCFCE7] text-[#16A34A]",
  FAILED:  "bg-[#FEE2E2] text-[#DC2626]",
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }) + ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

const fmtShortId = (id) => id.slice(0, 8).toUpperCase()

// Map API row → shape the existing OrderDetail panel expects
const toDetailShape = (o) => ({
  id:            o.id,
  customer:      o.customerName,
  restaurant:    o.branchName,
  driver:        o.riderName,
  status:        STATUS_OPTIONS.find(s => s.value === o.status)?.label ?? o.status,
  total:         Number(o.totalAmount),
  placed:        fmtDate(o.placedAt),
  delivered:     fmtDate(o.deliveredAt),
  paymentStatus: o.paymentStatus,
  itemCount:     o.itemCount,
})

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${STATUS_STYLES[status] ?? "bg-[#F5F5F5] text-[#737373]"}`}
  >
    {STATUS_OPTIONS.find(s => s.value === status)?.label ?? status}
  </span>
)

const PaymentBadge = ({ status }) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${PAYMENT_STYLES[status] ?? "bg-[#F5F5F5] text-[#737373]"}`}
  >
    {status ?? "—"}
  </span>
)

// Animated skeleton row
const SkeletonRow = () => (
  <tr className="border-b border-[#EDEDED] animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-[#F0F0F0] rounded-full w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
)

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-lg">
    <div className="flex justify-between">
      <div className="h-3 bg-[#F0F0F0] rounded-full w-24" />
      <div className="h-5 bg-[#F0F0F0] rounded-full w-20" />
    </div>
    <div className="h-3 bg-[#F0F0F0] rounded-full w-40" />
    <div className="h-3 bg-[#F0F0F0] rounded-full w-32" />
  </div>
)

// ── Main component ─────────────────────────────────────────────────────────────

const OrderManagement = ({ onMenuClick }) => {
  // ── Filters ──
  const [status, setStatus]         = useState("ALL")
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeDate, setActiveDate] = useState("All Dates")

  // ── Pagination ──
  const [allOrders, setAllOrders]   = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [hasMore, setHasMore]       = useState(false)

  // ── Loading / error ──
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore]       = useState(false)
  const [fetchError, setFetchError]             = useState(false)

  // ── Detail panel ──
  const [selectedOrder, setSelectedOrder] = useState(null)

  const [fetchOrders] = useLazyGetAdminOrdersQuery()

  // ── Debounce search input 400ms ────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // ── Core fetch function ────────────────────────────────────────────────────
  const doFetch = useCallback(
    async (cursor, currentStatus, currentSearch) => {
      const isInitial = !cursor

      if (isInitial) {
        setIsInitialLoading(true)
        setFetchError(false)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const result = await fetchOrders(
          { status: currentStatus, cursor: cursor ?? undefined, take: PAGE_SIZE, search: currentSearch },
          /* preferCacheValue */ false,
        ).unwrap()

        const { data: orders, nextCursor: nc } = result.data
        setAllOrders(prev => (isInitial ? orders : [...prev, ...orders]))
        setNextCursor(nc)
        setHasMore(nc !== null)
      } catch {
        if (isInitial) setFetchError(true)
      } finally {
        if (isInitial) setIsInitialLoading(false)
        else setIsLoadingMore(false)
      }
    },
    [fetchOrders],
  )

  // ── Reset + refetch when status or debounced search changes ───────────────
  useEffect(() => {
    setAllOrders([])
    setNextCursor(null)
    setHasMore(false)
    doFetch(null, status, debouncedSearch)
  }, [status, debouncedSearch, doFetch])

  // ── Manual refresh ─────────────────────────────────────────────────────────
  const handleRefresh = () => {
    setAllOrders([])
    setNextCursor(null)
    setHasMore(false)
    doFetch(null, status, debouncedSearch)
  }

  // ── Load more ──────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      doFetch(nextCursor, status, debouncedSearch)
    }
  }

  // ── Client-side date filter (keeps existing UI, applied on loaded data) ───
  const displayedOrders = useMemo(() => {
    if (activeDate === "All Dates") return allOrders
    const now = new Date()
    return allOrders.filter(o => {
      const placed = new Date(o.placedAt)
      if (activeDate === "Today") {
        return placed.toDateString() === now.toDateString()
      }
      if (activeDate === "This Week") {
        const cutoff = new Date(now)
        cutoff.setDate(now.getDate() - 7)
        return placed >= cutoff
      }
      if (activeDate === "This Month") {
        return (
          placed.getMonth()    === now.getMonth() &&
          placed.getFullYear() === now.getFullYear()
        )
      }
      return true
    })
  }, [allOrders, activeDate])

  // ── Stat cards — derived from currently loaded + filtered data ─────────────
  const totalLoaded  = displayedOrders.length
  const totalRevenue = displayedOrders.reduce((s, o) => s + Number(o.totalAmount), 0)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Topbar title="System Oversight" onMenuClick={onMenuClick} />

      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Heading ── */}
        <div className="flex flex-col gap-1">
          <h4 className="text-2xl font-bold text-[#000000]!">Order Oversight</h4>
          <p className="text-xs sm:text-sm text-[#8C8C8C]">
            View active deliveries, placement history, and courier tracking details
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                Orders Shown
              </span>
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#DBEAFE]">
                <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
            </div>
            {isInitialLoading ? (
              <div className="h-8 bg-[#F0F0F0] rounded-lg animate-pulse w-16" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-[#000000]">{totalLoaded}</p>
            )}
          </div>

          <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                Revenue Shown
              </span>
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#DCFCE7]">
                <DollarSign className="w-3.5 h-3.5 text-[#16A34A]" />
              </div>
            </div>
            {isInitialLoading ? (
              <div className="h-8 bg-[#F0F0F0] rounded-lg animate-pulse w-28" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-[#000000]">
                R {totalRevenue.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}
              </p>
            )}
          </div>
        </div>

        {/* ── Search + filters toolbar ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 border border-[#EDEDED] rounded-xl">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search order ID, customer, or branch…"
              className="w-full h-10 pl-9 pr-3 bg-white border border-[#D9D9D9] rounded-md text-sm focus:outline-none focus:border-[#765AB8] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[#8C8C8C] whitespace-nowrap">Status:</span>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-8 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none focus:border-[#765AB8] transition-colors"
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C8C8C]" />
              </div>
            </div>

            {/* Date filter — client-side on loaded data */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[#8C8C8C] whitespace-nowrap">Date:</span>
              <div className="relative">
                <select
                  value={activeDate}
                  onChange={(e) => setActiveDate(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-8 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none focus:border-[#765AB8] transition-colors"
                >
                  {DATE_FILTERS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C8C8C]" />
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isInitialLoading}
              className="flex items-center gap-1.5 h-9 px-3 border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#8C8C8C] hover:border-[#765AB8] hover:text-[#765AB8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInitialLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Error state ── */}
        {fetchError && !isInitialLoading && (
          <div className="flex flex-col items-center gap-3 py-12 border border-[#EDEDED] rounded-xl">
            <p className="text-sm font-semibold text-[#EF4444]">Failed to load orders</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-lg bg-[#765AB8] text-white text-sm font-semibold hover:bg-[#6B46C1] transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Desktop table ── */}
        {!fetchError && (
          <div className="hidden lg:block border border-[#EDEDED] rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
                  {["Order ID", "Customer", "Branch", "Rider", "Placed / Delivered", "Items", "Payment", "Status", "Total"].map(h => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold text-[#000000] whitespace-nowrap ${h === "Total" ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isInitialLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : displayedOrders.map(o => (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrder(toDetailShape(o))}
                      className="border-b border-[#EDEDED] last:border-0 hover:bg-[#FAFAFA] cursor-pointer transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-[#765AB8] font-mono bg-[#F5F3FF] px-2 py-0.5 rounded">
                          #{fmtShortId(o.id)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3 text-sm font-semibold text-[#000000] whitespace-nowrap max-w-[160px] truncate">
                        {o.customerName}
                      </td>

                      {/* Branch */}
                      <td className="px-4 py-3 text-sm text-[#000000] whitespace-nowrap max-w-[140px] truncate">
                        {o.branchName}
                      </td>

                      {/* Rider */}
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {o.riderName ? (
                          <span className="text-[#8C8C8C]">{o.riderName}</span>
                        ) : (
                          <span className="italic font-medium text-[#F97316]">Unassigned</span>
                        )}
                      </td>

                      {/* Placed / Delivered */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs text-[#8C8C8C]">{fmtDate(o.placedAt)}</p>
                        {o.deliveredAt && (
                          <p className="text-xs text-[#16A34A] mt-0.5">{fmtDate(o.deliveredAt)}</p>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3 text-sm text-[#8C8C8C] text-center">
                        {o.itemCount}
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PaymentBadge status={o.paymentStatus} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={o.status} />
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-sm font-bold text-[#000000] text-right whitespace-nowrap">
                        R {Number(o.totalAmount).toLocaleString("en-ZA")}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>

            {/* Empty state inside table */}
            {!isInitialLoading && displayedOrders.length === 0 && !fetchError && (
              <div className="flex flex-col items-center gap-2 py-14">
                <ShoppingBag className="w-8 h-8 text-[#D9D9D9]" />
                <p className="text-sm font-semibold text-[#8C8C8C]">No orders found</p>
                <p className="text-xs text-[#BFBFBF]">Try adjusting the status or search filters</p>
              </div>
            )}
          </div>
        )}

        {/* ── Mobile / tablet cards ── */}
        {!fetchError && (
          <div className="flex flex-col gap-3 lg:hidden">
            {isInitialLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : displayedOrders.map(o => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(toDetailShape(o))}
                  className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-xl cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#765AB8] font-mono bg-[#F5F3FF] px-2 py-0.5 rounded">
                        #{fmtShortId(o.id)}
                      </span>
                      <p className="text-sm font-semibold text-[#000000] mt-1.5 truncate">
                        {o.customerName}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>

                  {/* Branch + total */}
                  <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
                    <span>{o.branchName}</span>
                    <span className="text-sm font-bold text-[#000000]">
                      R {Number(o.totalAmount).toLocaleString("en-ZA")}
                    </span>
                  </div>

                  {/* Rider + payment */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#EDEDED] text-xs">
                    <span className="text-[#8C8C8C]">
                      Rider:{" "}
                      {o.riderName ? (
                        <span className="text-[#000000] font-medium">{o.riderName}</span>
                      ) : (
                        <span className="italic font-medium text-[#F97316]">Unassigned</span>
                      )}
                    </span>
                    <PaymentBadge status={o.paymentStatus} />
                  </div>

                  {/* Dates + items */}
                  <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
                    <span>{fmtDate(o.placedAt)}</span>
                    <span>{o.itemCount} {o.itemCount === 1 ? "item" : "items"}</span>
                  </div>
                </div>
              ))
            }

            {!isInitialLoading && displayedOrders.length === 0 && !fetchError && (
              <div className="flex flex-col items-center gap-2 py-12">
                <ShoppingBag className="w-8 h-8 text-[#D9D9D9]" />
                <p className="text-sm font-semibold text-[#8C8C8C]">No orders found</p>
                <p className="text-xs text-[#BFBFBF]">Try adjusting the status or search filters</p>
              </div>
            )}
          </div>
        )}

        {/* ── Load More ── */}
        {hasMore && !fetchError && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-6 py-2.5 border border-[#D9D9D9] rounded-lg text-sm font-semibold text-[#000000] hover:border-[#765AB8] hover:text-[#765AB8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  Load more orders
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* End-of-list note when all loaded */}
        {!hasMore && allOrders.length > 0 && !isInitialLoading && !fetchError && (
          <p className="text-center text-xs text-[#BFBFBF] pt-2">
            All {allOrders.length} orders loaded
          </p>
        )}

      </div>

      {/* ── Order detail side panel (untouched) ── */}
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
