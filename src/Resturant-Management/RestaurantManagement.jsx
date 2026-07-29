import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  FileText,
  X,
  Check,
  Clock,
  RefreshCw,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from "lucide-react";
import Topbar from "../Dashboard/Topbar";
import RestaurantApplicationModal from "./RestaurantModal";
import RejectionModal from "./RejectionModal";
import ApprovalConfirmModal from "./ApprovalConfirmModal";
import SuspendModal from "./SuspendModal";
import {
  useGetMerchantsQuery,
  useApproveMerchantMutation,
  useRejectMerchantMutation,
  useSuspendMerchantMutation,
} from "../features/merchants/merchantsApi";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  ACTIVE: {
    label: "Active",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border border-green-200",
  },
  SUSPENDED: {
    label: "Suspended",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-600 border border-red-200",
  },
  REJECTED: {
    label: "Rejected",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-600 border border-red-200",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    dot: "bg-gray-400",
    badge: "bg-gray-50 text-gray-600 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const PendingCard = ({ merchant, onApprove, onReject, onView }) => (
  <div
    onClick={() => onView(merchant)}
    className="flex flex-col gap-4 py-6 px-5 border border-[#EDEDED] rounded-xl bg-white hover:shadow-md hover:border-[#D4CAEE] transition-all cursor-pointer"
  >
    <div className="flex items-start justify-between gap-2">
      <span className="text-[10px] bg-[#FF63471A] py-0.5 px-2 rounded-sm font-bold text-[#FF5A1F] uppercase tracking-wide shrink-0">
        {merchant.restaurantType}
      </span>
      <StatusBadge status={merchant.status} />
    </div>

    <div className="flex flex-col gap-1">
      <p className="text-base font-bold text-[#0A0A0A] leading-tight">
        {merchant.businessName}
      </p>
      <p className="text-xs text-[#8C8C8C]">
        {merchant.user?.name} · {merchant.user?.email}
      </p>
      <p className="flex items-center gap-1.5 text-xs text-[#8C8C8C] mt-0.5">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">
          {merchant.physicalStreetAddress || "Address not provided"}
        </span>
      </p>
    </div>

    <div className="flex flex-col gap-2 border border-[#E5E5E5] bg-[#FAFAFA] p-3 rounded-lg text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[#737373]">Reg. Number:</span>
        <span className="font-bold text-[#0A0A0A] font-mono tracking-wider">
          {merchant.verifyNumber || "—"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#737373]">Submitted:</span>
        <span className="font-semibold text-[#0A0A0A]">
          {new Date(merchant.createdAt).toLocaleDateString("en-ZA", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>

    <div className="flex items-center justify-between border-t border-[#E5E5E5] -mx-5 pt-3 px-5">
      <span className="flex items-center gap-1.5 text-xs text-[#5C5C5C]">
        <FileText className="w-3.5 h-3.5" />
        View Details
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReject(merchant);
          }}
          title="Reject"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FCA5A5] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApprove(merchant);
          }}
          title="Approve"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#765AB8] text-white hover:bg-[#654A9F] transition-colors cursor-pointer"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const STATUS_TABS = ["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"];

const RestaurantManagement = ({ onMenuClick }) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const [pendingApprove, setPendingApprove] = useState(null)
  const [pendingReject, setPendingReject] = useState(null)
  const [pendingSuspend, setPendingSuspend] = useState(null)
  const [toast, setToast] = useState(null)

  const { data, isLoading, isError, refetch } = useGetMerchantsQuery("ALL");
  const [approveMerchant, { isLoading: isApproving }] =
    useApproveMerchantMutation();
  const [rejectMerchant, { isLoading: isRejecting }] = useRejectMerchantMutation()
  const [suspendMerchant, { isLoading: isSuspending }] = useSuspendMerchantMutation()
  const merchants = data?.data ?? [];

  // Client-side filter by tab + search
  const filtered = useMemo(() => {
    return merchants.filter((m) => {
      const matchesTab = activeTab === "ALL" || m.status === activeTab;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        m.businessName?.toLowerCase().includes(q) ||
        m.user?.name?.toLowerCase().includes(q) ||
        m.user?.email?.toLowerCase().includes(q) ||
        m.restaurantType?.toLowerCase().includes(q) ||
        m.verifyNumber?.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [merchants, activeTab, search]);

  const counts = useMemo(
    () => ({
      ALL: merchants.length,
      PENDING: merchants.filter((m) => m.status === "PENDING").length,
      ACTIVE: merchants.filter((m) => m.status === "ACTIVE").length,
      SUSPENDED: merchants.filter((m) => m.status === "SUSPENDED").length,
      REJECTED: merchants.filter((m) => m.status === "REJECTED").length,
    }),
    [merchants],
  );

  // ── Toast helper ──────────────────────────────────────────────────────────

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Action handlers ───────────────────────────────────────────────────────

  const initiateApprove = (merchant) => {
    setSelectedMerchant(null); // close detail panel if open
    setPendingApprove(merchant);
  };

  const handleApproveConfirm = async () => {
    try {
      await approveMerchant(pendingApprove.id).unwrap();
      showToast("success", `${pendingApprove.businessName} has been approved.`);
      setPendingApprove(null);
    } catch (err) {
      const msg =
        err?.data?.message ??
        err?.error ??
        "Approval failed. Please try again.";
      showToast("error", msg);
    }
  };

  const initiateSuspend = (merchant) => {
    setSelectedMerchant(null)
    setPendingSuspend(merchant)
  }

  const handleSuspendConfirm = async (reason) => {
    try {
      await suspendMerchant({ merchantId: pendingSuspend.id, reason }).unwrap()
      showToast("success", `${pendingSuspend.businessName} has been suspended.`)
      setPendingSuspend(null)
    } catch (err) {
      const msg = err?.data?.message ?? err?.error ?? "Suspension failed. Please try again."
      showToast("error", msg)
    }
  }

  const initiateReject = (merchant) => {
    setSelectedMerchant(null);
    setPendingReject(merchant);
  };

  const handleRejectConfirm = async (reason) => {
    try {
      await rejectMerchant({ merchantId: pendingReject.id, reason }).unwrap();
      showToast("success", `${pendingReject.businessName} has been rejected.`);
      setPendingReject(null);
    } catch (err) {
      const msg =
        err?.data?.message ??
        err?.error ??
        "Rejection failed. Please try again.";
      showToast("error", msg);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Topbar title="Restaurant Management" onMenuClick={onMenuClick} />

      <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 sm:py-8">
        {/* Page header + search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="text-2xl sm:text-normal font-bold text-[#0A0A0A]!">
              Merchant Applications
            </h4>
            <p className="text-xs sm:text-sm text-[#8C8C8C] mt-0.5">
              Review onboarding submissions and manage merchant accounts
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, type…"
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#D9D9D9] rounded-lg text-sm focus:outline-none focus:border-[#765AB8]"
              />
            </div>
            <button
              onClick={refetch}
              title="Refresh"
              className="h-10 w-10 flex items-center justify-center border border-[#D9D9D9] rounded-lg text-[#8C8C8C] hover:text-[#765AB8] hover:border-[#765AB8] transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeTab === tab && activeTab === "REJECTED"
                  ? "bg-red-500 text-white border-red-500"
                  : activeTab === tab
                    ? "bg-[#765AB8] text-white border-[#765AB8]"
                    : "bg-white text-[#5C5C5C] border-[#D9D9D9] hover:border-[#765AB8] hover:text-[#765AB8]"
              }`}
            >
              {tab === "ALL"
                ? "All"
                : tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab
                    ? "bg-white/20 text-white"
                    : "bg-[#F0F0F0] text-[#5C5C5C]"
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-[#765AB8] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#8C8C8C]">Loading merchants…</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-red-500 font-medium">
              Failed to load merchants.
            </p>
            <button
              onClick={refetch}
              className="text-xs font-semibold text-[#765AB8] hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8C8C8C]">
                <UtensilsCrossed className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">No merchants found</p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs text-[#765AB8] hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : activeTab === "PENDING" ||
              (activeTab === "ALL" && counts.PENDING > 0 && !search) ? (
              // ── Card grid for pending ──
              <>
                {activeTab === "ALL" && (
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-sm font-semibold text-[rgba(0,0,0,.4)]!">
                      Pending Approvals
                    </h2>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold">
                      {counts.PENDING}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(activeTab === "ALL"
                    ? filtered.filter((m) => m.status === "PENDING")
                    : filtered
                  ).map((m) => (
                    <PendingCard
                      key={m.id}
                      merchant={m}
                      onApprove={initiateApprove}
                      onReject={initiateReject}
                      onView={setSelectedMerchant}
                    />
                  ))}
                </div>

                {/* Active/Suspended below in ALL view */}
                {activeTab === "ALL" &&
                  filtered.filter((m) => m.status !== "PENDING").length > 0 && (
                    <DirectoryTable
                      merchants={filtered.filter((m) => m.status !== "PENDING")}
                      onView={setSelectedMerchant}
                      onApprove={initiateApprove}
                      onReject={initiateReject}
                      onSuspend={initiateSuspend}
                    />
                  )}
              </>
            ) : (
              // ── Table for non-pending tabs ──
              <DirectoryTable
                merchants={filtered}
                onView={setSelectedMerchant}
                onApprove={initiateApprove}
                onReject={initiateReject}
                onSuspend={initiateSuspend}
              />
            )}
          </>
        )}
      </div>

      {/* Detail slide-over */}
      {selectedMerchant && (
        <RestaurantApplicationModal
          application={selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
          onApprove={initiateApprove}
          onReject={initiateReject}
          onSuspend={initiateSuspend}
        />
      )}

      {pendingReject && (
        <RejectionModal
          businessName={pendingReject.businessName}
          isLoading={isRejecting}
          onConfirm={handleRejectConfirm}
          onCancel={() => setPendingReject(null)}
        />
      )}

      {pendingSuspend && (
        <SuspendModal
          businessName={pendingSuspend.businessName}
          isLoading={isSuspending}
          onConfirm={handleSuspendConfirm}
          onCancel={() => setPendingSuspend(null)}
        />
      )}

      {/* Approval confirmation modal */}
      {pendingApprove && (
        <ApprovalConfirmModal
          businessName={pendingApprove.businessName}
          isLoading={isApproving}
          onConfirm={handleApproveConfirm}
          onCancel={() => setPendingApprove(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

// ─── Directory Table ─────────────────────────────────────────────────────────

const DirectoryTable = ({ merchants, onView, onApprove, onReject, onSuspend }) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-sm font-semibold text-[rgba(0,0,0,.4)]!">
      Merchant Directory
    </h2>

    {/* Desktop */}
    <div className="hidden md:block border border-[#EDEDED] rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
            {[
              "Merchant",
              "Type",
              "Owner",
              "Reg. Number",
              "Status",
              "Submitted",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-xs font-semibold text-[#8C8C8C] uppercase whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {merchants.map((m) => (
            <tr
              key={m.id}
              onClick={() => onView(m)}
              className="border-b border-[#EDEDED] last:border-0 hover:bg-[#F9F9F9] cursor-pointer"
            >
              <td className="px-4 py-3">
                <p className="text-sm font-semibold text-[#0A0A0A]">
                  {m.businessName}
                </p>
                <p className="text-xs text-[#8C8C8C] font-mono">
                  {m.id.slice(0, 8)}…
                </p>
              </td>
              <td className="px-4 py-3 text-sm text-[#5C5C5C]">
                {m.restaurantType}
              </td>
              <td className="px-4 py-3">
                <p className="text-sm text-[#0A0A0A]">{m.user?.name}</p>
                <p className="text-xs text-[#8C8C8C]">{m.user?.email}</p>
              </td>
              <td className="px-4 py-3 text-xs font-mono font-semibold text-[#5C5C5C] tracking-wider">
                {m.verifyNumber || "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={m.status} />
              </td>
              <td className="px-4 py-3 text-xs text-[#8C8C8C] whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(m.createdAt).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </td>
              <td className="px-4 py-3">
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {m.status === "ACTIVE" && (
                    <button
                      onClick={() => onSuspend(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Suspend merchant"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  )}
                  {m.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => onReject(m)}
                        className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FCA5A5] transition-colors cursor-pointer"
                        title="Reject"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onApprove(m)}
                        className="p-1.5 rounded-lg bg-[#765AB8] text-white hover:bg-[#654A9F] transition-colors cursor-pointer"
                        title="Approve"
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                  {m.status === "SUSPENDED" && (
                    <button
                      onClick={() => onApprove(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors cursor-pointer"
                      title="Reactivate merchant"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reactivate
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile cards */}
    <div className="flex flex-col gap-3 md:hidden">
      {merchants.map((m) => (
        <div
          key={m.id}
          onClick={() => onView(m)}
          className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-xl cursor-pointer hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0A0A0A] truncate">
                {m.businessName}
              </p>
              <p className="text-xs text-[#8C8C8C]">
                {m.restaurantType} · {m.user?.name}
              </p>
            </div>
            <StatusBadge status={m.status} />
          </div>

          <div className="flex items-center justify-between text-xs text-[#8C8C8C] pt-2 border-t border-[#EDEDED]">
            <span className="font-mono font-semibold">
              {m.verifyNumber || "—"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(m.createdAt).toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {m.status === "ACTIVE" && (
              <button
                onClick={() => onSuspend(m)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-600 hover:bg-amber-100 cursor-pointer"
              >
                <PauseCircle className="w-3.5 h-3.5" /> Suspend
              </button>
            )}
            {m.status === "PENDING" && (
              <>
                <button
                  onClick={() => onReject(m)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#FCD5D5] text-xs font-semibold text-[#EF4444] hover:bg-[#FEE2E2] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => onApprove(m)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#765AB8] text-xs font-semibold text-white hover:bg-[#654A9F] cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
              </>
            )}
            {m.status === "SUSPENDED" && (
              <button
                onClick={() => onApprove(m)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-100 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Reactivate
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default RestaurantManagement;
