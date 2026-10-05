import { useState } from "react";
import {
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  Clock,
  Tag,
  User,
  Calendar,
} from "lucide-react";
import Topbar from "../Dashboard/Topbar";
import {
  useGetContactsByStatusQuery,
  useUpdateContactStatusMutation,
} from "../features/support/supportApi";

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    ", " +
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
};

const fmtShortId = (id) => id?.slice(0, 8).toUpperCase() ?? "—";

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
      status === "RESOLVED"
        ? "bg-[#DCFCE7] text-[#16A34A]"
        : "bg-[#FEF3C7] text-[#D97706]"
    }`}
  >
    {status === "RESOLVED" ? (
      <CheckCircle2 className="w-3 h-3" />
    ) : (
      <Clock className="w-3 h-3" />
    )}
    {status}
  </span>
);

const SkeletonRow = () => (
  <tr className="border-b border-[#EDEDED] animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3 bg-[#F0F0F0] rounded-full w-full max-w-[140px]" />
      </td>
    ))}
  </tr>
);

const TicketDetailModal = ({ ticket, onClose, onResolve, resolving }) => {
  if (!ticket) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEDED]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#765AB8]" />
            <h2 className="text-base font-bold text-[#1A1A2E]!">
              Support Ticket
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#374151] text-xl font-bold leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Status + ID row */}
          <div className="flex items-center justify-between">
            <StatusBadge status={ticket.status} />
            <span className="text-[11px] font-mono text-[#9CA3AF]">
              #{fmtShortId(ticket.id)}
            </span>
          </div>

          {/* Subject */}
          <div>
            <p className="text-[11px] font-semibold text-[#9B8FC4] uppercase tracking-wider mb-1">
              Subject
            </p>
            <p className="text-sm font-semibold text-[#1A1A2E]">
              {ticket.subject}
            </p>
          </div>

          {/* Message */}
          <div>
            <p className="text-[11px] font-semibold text-[#9B8FC4] uppercase tracking-wider mb-1">
              Message
            </p>
            <p className="text-sm text-[#374151] leading-relaxed bg-[#F8F7FC] rounded-xl p-3 border border-[#EDE9F9]">
              {ticket.message}
            </p>
          </div>

          {/* User */}
          {ticket.user && (
            <div className="bg-[#F8F7FC] rounded-xl p-4 border border-[#EDE9F9]">
              <p className="text-[11px] font-semibold text-[#9B8FC4] uppercase tracking-wider mb-2">
                Customer
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#765AB8] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {ticket.user.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">
                    {ticket.user.name ?? "—"}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {ticket.user.email ?? "—"}
                  </p>
                  {ticket.user.phone && (
                    <p className="text-xs text-[#64748B]">
                      {ticket.user.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order ID */}
          {ticket.orderId && (
            <div className="flex items-center gap-2 bg-[#FFF3EE] border border-[#FDDCCC] rounded-xl px-4 py-3">
              <Tag className="w-4 h-4 text-[#F4622A] shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-[#F4622A] uppercase tracking-wider">
                  Linked Order
                </p>
                <p className="text-xs font-mono text-[#374151] mt-0.5">
                  {ticket.orderId}
                </p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F7FC] rounded-xl p-3 border border-[#EDE9F9]">
              <p className="text-[10px] font-semibold text-[#9B8FC4] uppercase tracking-wider mb-1">
                Submitted
              </p>
              <p className="text-xs text-[#374151]">
                {fmtDate(ticket.createdAt)}
              </p>
            </div>
            {ticket.status === "RESOLVED" && (
              <div className="bg-[#F0FDF4] rounded-xl p-3 border border-[#BBF7D0]">
                <p className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider mb-1">
                  Resolved
                </p>
                <p className="text-xs text-[#374151]">
                  {fmtDate(ticket.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EDEDED] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#EDEDED] text-sm font-semibold text-[#374151] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
          >
            Close
          </button>
          {ticket.status === "OPEN" && (
            <button
              onClick={() => onResolve(ticket.id)}
              disabled={resolving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {resolving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Mark as Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const SupportOversight = ({ onMenuClick }) => {
  const [activeTab, setActiveTab] = useState("OPEN");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetContactsByStatusQuery(activeTab);

  const [updateContactStatus] = useUpdateContactStatusMutation();

  const tickets = response?.data ?? [];

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await updateContactStatus({ id, status: "RESOLVED" }).unwrap();
      setSelectedTicket(null);
    } catch {
      // silently fail — RTK cache won't update, user can retry
    } finally {
      setResolvingId(null);
    }
  };

  const TABS = [
    { key: "OPEN", label: "Open", icon: <Clock className="w-4 h-4" /> },
    {
      key: "RESOLVED",
      label: "Resolved",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <Topbar title="Support" onMenuClick={onMenuClick} />

      <div className="flex-1 overflow-y-auto bg-[#F9F8FD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#EDE9F9] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <span className="text-xs font-semibold text-[#9B8FC4] uppercase tracking-wider">
                  Open
                </span>
              </div>
              <p className="text-2xl font-black text-[#1A1A2E]">
                {activeTab === "OPEN" ? tickets.length : "—"}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-[#EDE9F9] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span className="text-xs font-semibold text-[#9B8FC4] uppercase tracking-wider">
                  Resolved
                </span>
              </div>
              <p className="text-2xl font-black text-[#1A1A2E]">
                {activeTab === "RESOLVED" ? tickets.length : "—"}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-[#EDE9F9] shadow-sm col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-[#F4622A]" />
                <span className="text-xs font-semibold text-[#9B8FC4] uppercase tracking-wider">
                  With Order
                </span>
              </div>
              <p className="text-2xl font-black text-[#1A1A2E]">
                {tickets.filter((t) => t.orderId).length}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-[#EDE9F9] rounded-xl p-1 shadow-sm">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-[#765AB8] text-white shadow-sm"
                      : "text-[#64748B] hover:bg-[#F5F3FF]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={refetch}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#765AB8] bg-white border border-[#EDE9F9] rounded-xl hover:bg-[#F5F3FF] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#EDE9F9] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#EDEDED] bg-[#F8F7FC]">
                    {[
                      "Ticket ID",
                      "Customer",
                      "Subject",
                      "Linked Order",
                      "Submitted",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold text-[#9B8FC4] uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#F5F3FF] flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-[#765AB8]" />
                          </div>
                          <p className="text-sm font-semibold text-[#374151]">
                            No {activeTab.toLowerCase()} tickets
                          </p>
                          <p className="text-xs text-[#9CA3AF]">
                            {activeTab === "OPEN"
                              ? "All support tickets have been resolved."
                              : "No tickets have been resolved yet."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b border-[#EDEDED] hover:bg-[#F8F7FC] transition-colors cursor-pointer"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#9CA3AF]">
                          #{fmtShortId(ticket.id)}
                        </td>
                        <td className="px-4 py-3">
                          {ticket.user ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#765AB8] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {ticket.user.name
                                  ?.split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2) ?? "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#1A1A2E] truncate max-w-[120px]">
                                  {ticket.user.name ?? "—"}
                                </p>
                                <p className="text-[10px] text-[#9CA3AF] truncate max-w-[120px]">
                                  {ticket.user.email ?? "—"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-[#9CA3AF]">
                              Unknown
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-[#1A1A2E] max-w-[160px] truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF] max-w-[160px] truncate mt-0.5">
                            {ticket.message}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {ticket.orderId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FFF3EE] border border-[#FDDCCC] rounded-lg text-[10px] font-semibold text-[#F4622A] font-mono">
                              <Tag className="w-2.5 h-2.5" />
                              {fmtShortId(ticket.orderId)}
                            </span>
                          ) : (
                            <span className="text-xs text-[#D1D5DB]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                          {fmtDate(ticket.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ticket.status === "OPEN" ? (
                            <button
                              onClick={() => handleResolve(ticket.id)}
                              disabled={resolvingId === ticket.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#16A34A] text-white rounded-lg text-[11px] font-semibold hover:bg-[#15803D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {resolvingId === ticket.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              Resolve
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#9CA3AF]">
                              Resolved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResolve={handleResolve}
          resolving={resolvingId === selectedTicket.id}
        />
      )}
    </div>
  );
};

export default SupportOversight;
