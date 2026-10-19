import { useState } from "react"
import {
  BadgePercent,
  RefreshCw,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Info,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  Plus,
} from "lucide-react"
import Topbar from "../Dashboard/Topbar"
import { useGetDeliveryFeeQuery } from "../features/deliveryFees/deliveryFeesApi"
import { useNetworkStatus } from "../hooks/useNetworkStatus"
import EditDeliveryFeeModal from "./EditDeliveryFeeModal"

const formatCurrency = (val) => {
  const num = Number(val)
  if (isNaN(num)) return "R 0.00"
  return `R ${num.toFixed(2)}`
}

const formatDateTime = (iso) => {
  if (!iso) return "—"
  try {
    const d = new Date(iso)
    return d.toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

const DeliveryFeeManagement = ({ onMenuClick }) => {
  const { isOnline } = useNetworkStatus()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [copiedId, setCopiedId] = useState(false)

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetDeliveryFeeQuery()

  const fee =
    response?.data && typeof response.data === "object"
      ? response.data
      : response && typeof response === "object" && "amount" in response
      ? response
      : null

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
    showToast("success", "Fee ID copied to clipboard")
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Topbar title="System Oversight" onMenuClick={onMenuClick} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 duration-200 bg-white border-[#EDEDED]">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span className="text-[#000000]!">{toast.message}</span>
        </div>
      )}

      {/* Main Page Layout */}
      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">
        {/* Heading + Action button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h4 className="text-2xl font-bold text-[#000000]!">Custom Delivery Fee</h4>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F1FA] text-[#765AB8] border border-[#E9E4F5]">
                Global Setting
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8C8C8C]">
              Configure and manage the global delivery fee imposed across customer checkout orders
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              className="h-10 px-3 flex items-center justify-center gap-2 border border-[#D9D9D9] rounded-lg text-[#8C8C8C] hover:text-[#765AB8] hover:border-[#765AB8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {fee ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                disabled={!isOnline}
                className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-[#765AB8] text-white text-sm font-semibold hover:bg-[#654A9F] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Delivery Fee</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditModalOpen(true)}
                disabled={!isOnline}
                className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-[#765AB8] text-white text-sm font-semibold hover:bg-[#654A9F] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add Delivery Fee</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full bg-white rounded-xl border border-[#EDEDED] p-12 flex flex-col items-center justify-center gap-3 min-h-[280px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#765AB8]" />
            <p className="text-sm font-semibold text-[#000000]!">
              Loading delivery fee configuration...
            </p>
            <p className="text-xs text-[#8C8C8C]">
              Syncing with Ding backend services
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="w-full bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 flex flex-col items-center text-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h4 className="text-base font-bold text-red-900!">
              Failed to load delivery fee
            </h4>
            <p className="text-xs sm:text-sm text-red-700 max-w-md">
              {error?.data?.message || error?.error || "An error occurred while fetching the delivery fee from the server."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !fee && (
          <div className="w-full bg-white rounded-xl border border-dashed border-[#D9D9D9] p-8 sm:p-12 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F4F1FA] text-[#765AB8] flex items-center justify-center">
              <BadgePercent className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#000000]!">
                No Delivery Fee Configured Yet
              </h4>
              <p className="text-xs sm:text-sm text-[#8C8C8C] max-w-md mt-1">
                There is currently no active custom delivery fee imposed on the system. Click below to add the baseline delivery fee.
              </p>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              disabled={!isOnline}
              className="mt-1 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#765AB8] hover:bg-[#654A9F] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Delivery Fee</span>
            </button>
          </div>
        )}

        {/* Data Loaded: Content View */}
        {!isLoading && !isError && fee && (
          <div className="flex flex-col gap-6">
            {/* Delivery Fee Configuration Card */}
            <div className="border border-[#EDEDED] rounded-xl p-5 sm:p-6 bg-white flex flex-col gap-6">
              {/* Card Header: Policy Name + Status Badge + Description */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-[#EDEDED]">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1FA] text-[#765AB8] flex items-center justify-center shrink-0 mt-0.5">
                    <BadgePercent className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-xl font-bold text-[#000000]!">
                        {fee.name || "Standard Delivery Fee"}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          fee.isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            fee.isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        {fee.isActive ? "Active (Imposed)" : "Paused"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#8C8C8C]">
                      {fee.description || "Applied to all customer orders at checkout across the platform."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prominent Fee Amount Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#F9F8FD] border border-[#EDE9F9]">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-[#8C8C8C] uppercase tracking-wider">
                    Imposed Delivery Fee
                  </span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-[#765AB8]!">
                      {formatCurrency(fee.amount)}
                    </p>
                    <span className="text-xs text-[#8C8C8C] font-medium">/ order</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#5C5C5C] bg-white px-3.5 py-2 rounded-lg border border-[#EDE9F9] self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Enforced globally across customer checkouts</span>
                </div>
              </div>

              {/* Metadata Parameters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Created */}
                <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-[#F9F9F9] border border-[#EDEDED]">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#8C8C8C] uppercase tracking-wide">
                    <Calendar className="w-3 h-3 text-[#765AB8]" />
                    <span>Created At</span>
                  </div>
                  <p className="text-xs font-semibold text-[#000000]!">
                    {formatDateTime(fee.createdAt)}
                  </p>
                </div>

                {/* Updated */}
                <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-[#F9F9F9] border border-[#EDEDED]">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#8C8C8C] uppercase tracking-wide">
                    <Clock className="w-3 h-3 text-[#765AB8]" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-xs font-semibold text-[#000000]!">
                    {formatDateTime(fee.updatedAt)}
                  </p>
                </div>

                {/* System ID */}
                <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-[#F9F9F9] border border-[#EDEDED]">
                  <span className="text-[11px] font-medium text-[#8C8C8C] uppercase tracking-wide">
                    System Identifier (ID)
                  </span>
                  <button
                    onClick={() => handleCopyId(fee.id)}
                    className="flex items-center justify-between p-1.5 px-2.5 rounded bg-white border border-[#EDEDED] text-xs font-mono text-[#000000]! hover:border-[#765AB8] transition-colors cursor-pointer text-left"
                    title={fee.id}
                  >
                    <span className="truncate">{fee.id?.slice(0, 16)}...</span>
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0 ml-1" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#8C8C8C] shrink-0 ml-1" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Informational Hint Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-[#EDEDED] rounded-xl flex items-start gap-3 bg-white">
                <div className="w-8 h-8 rounded-lg bg-[#F4F1FA] text-[#765AB8] flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-[#000000]!">
                    Customer Checkout Application
                  </p>
                  <p className="text-xs text-[#8C8C8C] leading-relaxed">
                    When active, this fee is automatically calculated into customer order totals under{" "}
                    <span className="font-mono text-[#765AB8]">totals.deliveryFee</span>.
                  </p>
                </div>
              </div>

              <div className="p-4 border border-[#EDEDED] rounded-xl flex items-start gap-3 bg-white">
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-[#000000]!">
                    Instant Policy Reflection
                  </p>
                  <p className="text-xs text-[#8C8C8C] leading-relaxed">
                    Changes made here immediately invalidate the delivery fee cache, updating customer carts on their next quote.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Modal */}
      <EditDeliveryFeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentFee={fee}
        onSuccess={(msg) => showToast("success", msg)}
      />
    </div>
  )
}

export default DeliveryFeeManagement
