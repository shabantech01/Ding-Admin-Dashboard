import { useState, useMemo } from "react";
import { Search, Bike, Truck, Plus, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Topbar from "../Dashboard/Topbar";
import AddDriverModal from "./AddDriver";
import RiderDetailModal from "./RiderDetailModal";
import { useGetRidersQuery } from "../features/riders/ridersApi";

// ─── Dummy data (kept — vehicle & deliveries fields will come from API later) ─

const driversData = [
  {
    id: "DRV-001",
    name: "Liam Davies",
    vehicle: "Scooter",
    status: "Online Now",
    email: "liam.davies@gmail.com",
    deliveries: 412,
    joined: "1 Jun 2026",
  },
  {
    id: "DRV-002",
    name: "Olivia Martinez",
    vehicle: "Bike",
    status: "Offline",
    email: "olivia.m@outlook.com",
    deliveries: 189,
    joined: "5 Jun 2026",
  },
  {
    id: "DRV-004",
    name: "David Kim",
    vehicle: "Scooter",
    status: "Offline",
    email: "david.kim@yahoo.com",
    deliveries: 0,
    joined: "22 Jun 2026",
  },
  {
    id: "DRV-005",
    name: "Lucas Smith",
    vehicle: "Bike",
    status: "Suspended",
    email: "lucas.smith@gmail.com",
    deliveries: 98,
    joined: "14 May 2026",
  },
];

const vehicleFilters = ["All Vehicles", "Scooter", "Bike"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_TABS = ["ALL", "ACTIVE", "PENDING", "SUSPENDED"];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const shortId = (id) => id.slice(0, 8).toUpperCase();

const getActivityStatus = (rider) => {
  if (rider.status === "SUSPENDED") return "Suspended";
  return rider.riderProfile?.onlineStatus === "ONLINE" ? "Online Now" : "Offline";
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

// ─── Badge components ─────────────────────────────────────────────────────────

const ActivityStatus = ({ status }) => {
  const map = {
    "Online Now": { dot: "bg-[#22C55E]", pill: "bg-[#DCFCE7] text-[#16A34A]" },
    Offline:      { dot: "bg-[#A3A3A3]", pill: "bg-[#F5F5F5] text-[#737373]"  },
    Suspended:    { dot: "bg-[#EF4444]", pill: "bg-[#FEE2E2] text-[#EF4444]"  },
  };
  const s = map[status] ?? map["Offline"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const DocStatusBadge = ({ status }) => {
  const map = {
    PENDING:   "bg-amber-50 text-amber-700 border border-amber-200",
    ACTIVE:    "bg-green-50 text-green-700 border border-green-200",
    SUSPENDED: "bg-red-50  text-red-600   border border-red-200",
  };
  const labels = { PENDING: "Docs Pending", ACTIVE: "Verified", SUSPENDED: "Suspended" };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? map.PENDING}`}>
      {labels[status] ?? status}
    </span>
  );
};

// ─── DriverManagement ─────────────────────────────────────────────────────────

const DriverManagement = ({ onMenuClick }) => {
  const [search, setSearch]           = useState("");
  const [activeTab, setActiveTab]     = useState("ALL");
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState(null);
  const [toast, setToast]             = useState(null);

  const { data: response, isLoading, isError } = useGetRidersQuery(activeTab);
  const riders = response?.data ?? [];

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return riders;
    const q = search.toLowerCase();
    return riders.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
    );
  }, [riders, search]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Topbar title="System Oversight" onMenuClick={onMenuClick} />

      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">

        {/* Heading + Add button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h4 className="text-2xl font-bold text-[#000000]!">Driver Management</h4>
            <p className="text-xs sm:text-sm text-[#8C8C8C]">
              Track courier document validation queues and manage online fleet access
            </p>
          </div>
          <button
            onClick={() => setShowAddDriver(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-[#765AB8] text-white text-sm font-semibold hover:bg-[#654A9F] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add New Driver
          </button>
        </div>

        {/* Status tabs + search */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-lg w-fit">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer capitalize ${
                    activeTab === tab
                      ? "bg-white text-[#765AB8] shadow-sm"
                      : "text-[#8C8C8C] hover:text-[#000000]"
                  }`}
                >
                  {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or ID…"
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#D9D9D9] rounded-md text-sm focus:outline-none focus:border-[#765AB8]"
              />
            </div>
          </div>

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-[#8C8C8C]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading riders…</span>
            </div>
          )}

          {/* ── Error ── */}
          {isError && !isLoading && (
            <div className="flex items-center justify-center py-16 gap-2 text-[#EF4444]">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Failed to load riders. Please refresh.</span>
            </div>
          )}

          {/* ── Table ── */}
          {!isLoading && !isError && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block border border-[#EDEDED] rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
                      {["Rider", "Online Status", "Doc Status", "Email", "Phone", "Joined"].map((h) => (
                        <th key={h} className="px-4 py-3 text-[13px] font-bold text-[#000000]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRiderId(r.id)}
                        className="border-b border-[#EDEDED] last:border-0 hover:bg-[#F9F9F9] cursor-pointer"
                      >
                        {/* Rider */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#765AB8]/10 flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-bold text-[#765AB8]">
                                {getInitials(r.name)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#000000]">{r.name}</p>
                              <p className="text-xs text-[#8C8C8C] font-mono">{shortId(r.id)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Online Status */}
                        <td className="px-4 py-3">
                          <ActivityStatus status={getActivityStatus(r)} />
                        </td>

                        {/* Doc Status */}
                        <td className="px-4 py-3">
                          <DocStatusBadge status={r.riderProfile?.status ?? "PENDING"} />
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-sm text-[#5C5C5C]">{r.email}</td>

                        {/* Phone */}
                        <td className="px-4 py-3 text-sm text-[#5C5C5C]">{r.phone ?? "—"}</td>

                        {/* Joined */}
                        <td className="px-4 py-3 text-sm text-[#8C8C8C]">
                          {r.createdAt ? formatDate(r.createdAt) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRiderId(r.id)}
                    className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-lg cursor-pointer hover:bg-[#F9F9F9] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#765AB8]/10 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-[#765AB8]">
                            {getInitials(r.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#000000] truncate">{r.name}</p>
                          <p className="text-xs text-[#8C8C8C] font-mono">{shortId(r.id)}</p>
                        </div>
                      </div>
                      <ActivityStatus status={getActivityStatus(r)} />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <DocStatusBadge status={r.riderProfile?.status ?? "PENDING"} />
                    </div>

                    <p className="text-xs text-[#5C5C5C] truncate">{r.email}</p>
                    {r.phone && <p className="text-xs text-[#5C5C5C]">{r.phone}</p>}

                    <div className="flex items-center justify-between text-xs text-[#8C8C8C] pt-2 border-t border-[#EDEDED]">
                      <span>Joined {r.createdAt ? formatDate(r.createdAt) : "—"}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-[#8C8C8C] py-10">
                  No riders found{search ? " matching your search" : " in this status"}.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-70 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success"
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />
          }
          {toast.message}
        </div>
      )}

      {/* Add Driver modal */}
      {showAddDriver && (
        <AddDriverModal
          onClose={() => setShowAddDriver(false)}
          onSuccess={() => showToast("success", "Rider created successfully")}
        />
      )}

      {/* Rider detail modal */}
      {selectedRiderId && (
        <RiderDetailModal
          riderId={selectedRiderId}
          onClose={() => setSelectedRiderId(null)}
          onActionSuccess={(msg) => {
            setSelectedRiderId(null);
            showToast("success", msg);
          }}
        />
      )}
    </div>
  );
};

export default DriverManagement;
