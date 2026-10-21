import { useState, useEffect, useRef } from "react"
import {
  Star,
  RefreshCw,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Topbar from "../Dashboard/Topbar"
import { useGetAdminReviewsQuery, useDeleteAdminReviewMutation } from "../features/reviews/reviewsApi"
import { useNetworkStatus } from "../hooks/useNetworkStatus"

const STAR_PATH =
  "M6.77583 0.778828C6.81662 0.652375 6.99553 0.652375 7.03631 0.778829L8.40366 5.0186C8.42192 5.07524 8.47469 5.11357 8.53419 5.11344L12.989 5.10371C13.1219 5.10342 13.1771 5.27357 13.0695 5.35143L9.45975 7.96202C9.41153 7.99689 9.39138 8.05892 9.40989 8.11547L10.7958 12.3492C10.8371 12.4755 10.6924 12.5807 10.585 12.5023L6.98675 9.87599C6.93868 9.84091 6.87346 9.84091 6.82539 9.87599L3.22711 12.5023C3.11979 12.5807 2.97505 12.4755 3.01638 12.3492L4.40225 8.11547C4.42076 8.05892 4.40061 7.99689 4.35239 7.96202L0.74266 5.35143C0.634997 5.27357 0.690284 5.10342 0.82315 5.10371L5.27795 5.11344C5.33745 5.11357 5.39022 5.07524 5.40849 5.0186L6.77583 0.778828Z"

const StarRow = ({ value, size = 13 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 14 14" fill="none">
        <path
          d={STAR_PATH}
          fill={i < value ? "#F4622A" : "transparent"}
          stroke={i < value ? "#F4622A" : "#D1D5DB"}
          strokeWidth="1.36842"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
)

const RATING_LABEL = { 1: "Awful", 2: "Poor", 3: "Okay", 4: "Good", 5: "Excellent" }
const RATING_COLOR = {
  1: "bg-red-50 text-red-600 border-red-200",
  2: "bg-orange-50 text-orange-600 border-orange-200",
  3: "bg-yellow-50 text-yellow-700 border-yellow-200",
  4: "bg-green-50 text-green-700 border-green-200",
  5: "bg-purple-50 text-purple-700 border-purple-200",
}

const PAGE_SIZE = 10

const formatDate = (iso) => {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

const timeAgo = (iso) => {
  if (!iso) return "—"
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 30) return `${diff}d ago`
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`
  return `${Math.floor(diff / 365)}y ago`
}

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?"

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({ review, isDeleting, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#000000]">Delete this review?</h3>
          <p className="text-sm text-[#8C8C8C] mt-1 leading-relaxed">
            This is permanent and cannot be undone. The customer will not be notified.
          </p>
        </div>
      </div>

      {/* Review preview */}
      <div className="mx-6 mb-5 p-4 bg-[#F9F9F9] rounded-xl border border-[#EDEDED]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#765AB8] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {getInitials(review.userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#000000]!">{review.userName ?? "Unknown"}</p>
            {review.branchName && (
              <p className="text-xs text-[#8C8C8C] mt-0.5">{review.branchName}</p>
            )}
            <div className="mt-2">
              <StarRow value={review.rating} size={11} />
            </div>
            {review.comment ? (
              <p className="text-sm text-[#5C5C5C] mt-2 leading-relaxed italic">
                "{review.comment}"
              </p>
            ) : (
              <p className="text-xs text-[#8C8C8C] mt-2 italic">No comment left</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#D9D9D9] text-sm font-semibold text-[#5C5C5C] hover:bg-[#F9F9F9] transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:active:scale-100"
        >
          {isDeleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Deleting…</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Delete Review</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)

// ── Main page ─────────────────────────────────────────────────────────────────
const ReviewsManagement = ({ onMenuClick }) => {
  const { isOnline } = useNetworkStatus()

  // Cursor-based pagination — null = first page
  const [cursor, setCursor] = useState(null)
  const [cursorHistory, setCursorHistory] = useState([]) // stack of prev cursors

  const [ratingFilter, setRatingFilter] = useState(null)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [toast, setToast] = useState(null)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const debounceRef = useRef(null)

  // 400 ms debounce on search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput])

  const handleRatingFilter = (r) => {
    setRatingFilter(r)
  }

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAdminReviewsQuery({
    take: PAGE_SIZE,
    cursor: cursor ?? undefined,
  })

  const [deleteReview, { isLoading: isDeleting }] = useDeleteAdminReviewMutation()

  // ── Parse cursor-based response ──
  const allReviews = response?.data?.data ?? []
  const nextCursor = response?.data?.nextCursor ?? null
  const hasMore = response?.data?.hasMore ?? false
  const currentPage = cursorHistory.length + 1

  // ── Client-side filtering (API only supports take + cursor) ──
  const reviews = allReviews.filter((r) => {
    if (ratingFilter !== null && r.rating !== ratingFilter) return false
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      const hit =
        r.userName?.toLowerCase().includes(q) ||
        r.userEmail?.toLowerCase().includes(q) ||
        r.branchName?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      if (!hit) return false
    }
    return true
  })

  // Stats derived from filtered set
  const displayAvg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null
  const lowRatingCount = reviews.filter((r) => r.rating <= 2).length

  const goNext = () => {
    if (!hasMore || !nextCursor) return
    setCursorHistory((h) => [...h, cursor])
    setCursor(nextCursor)
  }

  const goPrev = () => {
    if (cursorHistory.length === 0) return
    const prevCursor = cursorHistory[cursorHistory.length - 1]
    setCursorHistory((h) => h.slice(0, -1))
    setCursor(prevCursor)
  }

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return
    try {
      await deleteReview(reviewToDelete.id).unwrap()
      setReviewToDelete(null)
      showToast("success", "Review deleted successfully")
    } catch (err) {
      setReviewToDelete(null)
      showToast("error", err?.data?.message ?? "Failed to delete review. Please try again.")
    }
  }

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const clearFilters = () => {
    setRatingFilter(null)
    setSearchInput("")
    setDebouncedSearch("")
  }

  const hasActiveFilters = ratingFilter !== null || debouncedSearch !== ""

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Topbar title="System Oversight" onMenuClick={onMenuClick} />

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium bg-white border-[#EDEDED] animate-in fade-in slide-in-from-top-2 duration-200">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span className="text-[#000000]!">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Page heading ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h4 className="text-2xl font-bold text-[#000000]!">Customer Reviews</h4>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F1FA] text-[#765AB8] border border-[#E9E4F5]">
                Moderation
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8C8C8C]">
              View, search, and moderate customer reviews submitted across all branches
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
            className="self-start sm:self-auto h-10 px-3 flex items-center justify-center gap-2 border border-[#D9D9D9] rounded-lg text-[#8C8C8C] hover:text-[#765AB8] hover:border-[#765AB8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ── Stats row ── */}
        {!isError && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl border border-[#EDEDED] bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4F1FA] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-[#765AB8]" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8C8C8C] uppercase tracking-wide">
                  This Page
                </p>
                <p className="text-xl font-bold text-[#000000]!">
                  {isLoading ? "—" : reviews.length}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#EDEDED] bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-[#F4622A]" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8C8C8C] uppercase tracking-wide">
                  Avg Rating
                </p>
                <p className="text-xl font-bold text-[#000000]!">
                  {isLoading ? "—" : displayAvg ? `${displayAvg} ★` : "—"}
                </p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-[#EDEDED] bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#8C8C8C] uppercase tracking-wide">
                  Low Ratings (≤ 2★)
                </p>
                <p className="text-xl font-bold text-[#000000]!">
                  {isLoading ? "—" : lowRatingCount}
                  {!isLoading && lowRatingCount > 0 && (
                    <span className="text-xs font-medium text-red-500 ml-1">on this page</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Search + filter bar ── */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by customer name or comment keyword…"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#EDEDED] text-sm text-[#000000]! placeholder:text-[#8C8C8C] focus:outline-none focus:ring-2 focus:ring-[#765AB8]/20 focus:border-[#765AB8] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[#8C8C8C] shrink-0">Filter by rating:</span>
            {[null, 5, 4, 3, 2, 1].map((r) => (
              <button
                key={r ?? "all"}
                onClick={() => handleRatingFilter(r)}
                className={`px-3 h-7 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  ratingFilter === r
                    ? "bg-[#765AB8] text-white border-[#765AB8]"
                    : "bg-white text-[#5C5C5C] border-[#D9D9D9] hover:border-[#765AB8] hover:text-[#765AB8]"
                }`}
              >
                {r === null ? "All" : `${r} ★`}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 h-7 rounded-full text-xs font-semibold border border-dashed border-[#D9D9D9] text-[#8C8C8C] hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="w-full bg-white rounded-xl border border-[#EDEDED] p-12 flex flex-col items-center justify-center gap-3 min-h-[280px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#765AB8]" />
            <p className="text-sm font-semibold text-[#000000]!">Loading reviews…</p>
            <p className="text-xs text-[#8C8C8C]">Fetching customer feedback from the platform</p>
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && isError && (
          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 flex flex-col items-center text-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h4 className="text-base font-bold text-red-900!">Failed to load reviews</h4>
            <p className="text-xs sm:text-sm text-red-700 max-w-md">
              {error?.data?.message ?? error?.error ?? "An error occurred while fetching reviews from the server."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && !isError && reviews.length === 0 && (
          <div className="w-full bg-white rounded-xl border border-dashed border-[#D9D9D9] p-8 sm:p-12 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F4F1FA] text-[#765AB8] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#000000]!">
                {hasActiveFilters ? "No reviews match your filters" : "No reviews yet"}
              </h4>
              <p className="text-xs sm:text-sm text-[#8C8C8C] max-w-md mt-1">
                {hasActiveFilters
                  ? "Try adjusting the rating filter or clearing your search."
                  : "Customer reviews will appear here once customers start rating their orders."}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-[#765AB8] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Reviews list ── */}
        {!isLoading && !isError && reviews.length > 0 && (
          <div className="flex flex-col gap-3">
            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-[#8C8C8C] pb-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Updating…</span>
              </div>
            )}

            {reviews.map((review) => {
              const isExpanded = expandedIds.has(review.id)
              const isLong = (review.comment?.length ?? 0) > 160
              const displayComment = isLong && !isExpanded
                ? review.comment.slice(0, 160).trimEnd() + "…"
                : review.comment

              return (
                <div
                  key={review.id}
                  className="border border-[#EDEDED] rounded-xl p-4 sm:p-5 bg-white flex flex-col gap-3 transition-shadow hover:shadow-sm"
                >
                  {/* Top row: avatar + meta + date + delete */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#765AB8] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {getInitials(review.userName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-bold text-[#000000]! leading-tight">
                            {review.userName ?? "Anonymous"}
                          </p>
                          {review.userEmail && (
                            <p className="text-xs text-[#8C8C8C]">{review.userEmail}</p>
                          )}
                          {review.branchName && (
                            <p className="text-xs text-[#8C8C8C] font-medium">{review.branchName}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-[#8C8C8C] hidden sm:inline">
                            {formatDate(review.createdAt)}
                          </span>
                          <span className="text-[11px] text-[#8C8C8C] sm:hidden">
                            {timeAgo(review.createdAt)}
                          </span>
                          <button
                            onClick={() => setReviewToDelete(review)}
                            disabled={!isOnline}
                            title="Delete review"
                            className="p-1.5 rounded-lg text-[#8C8C8C] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stars + rating label */}
                      <div className="flex items-center gap-2 mt-2">
                        <StarRow value={review.rating} size={13} />
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            RATING_COLOR[review.rating] ?? "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {RATING_LABEL[review.rating] ?? review.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment ? (
                    <div className="pl-[52px]">
                      <p className="text-sm text-[#4A4A4A] leading-relaxed">
                        {displayComment}
                      </p>
                      {isLong && (
                        <button
                          onClick={() => toggleExpand(review.id)}
                          className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-[#765AB8] hover:underline cursor-pointer"
                        >
                          {isExpanded ? (
                            <>Show less <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>Show more <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="pl-[52px]">
                      <p className="text-xs text-[#8C8C8C] italic">No comment left</p>
                    </div>
                  )}
                </div>
              )
            })}

            {/* ── Cursor pagination ── */}
            {(cursorHistory.length > 0 || hasMore) && (
              <div className="flex items-center justify-between pt-2 border-t border-[#EDEDED] mt-2">
                <p className="text-xs text-[#8C8C8C]">
                  Page {currentPage}{hasMore ? "" : " · last page"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    disabled={cursorHistory.length === 0 || isFetching}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9D9D9] text-xs font-semibold text-[#5C5C5C] hover:border-[#765AB8] hover:text-[#765AB8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!hasMore || isFetching}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D9D9D9] text-xs font-semibold text-[#5C5C5C] hover:border-[#765AB8] hover:text-[#765AB8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {reviewToDelete && (
        <DeleteConfirmModal
          review={reviewToDelete}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setReviewToDelete(null)}
        />
      )}
    </div>
  )
}

export default ReviewsManagement
