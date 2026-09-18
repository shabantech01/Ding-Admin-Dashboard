import { useState } from "react";
import {
  ShoppingBag,
  DollarSign,
  Users,
  Truck,
  Clock,
  // ArrowUp,
  // ArrowDown,
  Activity,
  Award,
  RefreshCw,
} from "lucide-react";
import Topbar from "../Dashboard/Topbar";
import OrdersRevenueChart from "./OrdersRevenueChart";
import { useGetDashboardStatsQuery } from "../features/dashboard/dashboardApi";

const PERIOD_OPTIONS = [
  { label: "Today", value: "TODAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
  // { label: "All Time", value: "ALL" },
];

const RANK_COLORS = [
  { badgeBg: "bg-[#FEF3C7]", badgeText: "text-[#D97706]" },
  { badgeBg: "bg-[#DBEAFE]", badgeText: "text-[#2563EB]" },
  { badgeBg: "bg-[#FED7AA]", badgeText: "text-[#C2410C]" },
  { badgeBg: "bg-[#FEE2E2]", badgeText: "text-[#EF4444]" },
  { badgeBg: "bg-[#F5F5F5]", badgeText: "text-[#737373]" },
];

const formatCurrency = (val) => {
  if (val == null) return "—";
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 10_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
};

const formatDeliveryTime = (mins) => {
  if (mins == null) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const formatLastUpdate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Marks a field as placeholder — pending backend data
const DemoBadge = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-600 uppercase tracking-wide leading-none">
    Demo
  </span>
);

const SkeletonCard = () => (
  <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl animate-pulse">
    <div className="flex items-center justify-between gap-2">
      <div className="h-2.5 w-20 bg-gray-200 rounded-full" />
      <div className="w-7 h-7 bg-gray-200 rounded-full" />
    </div>
    <div className="h-7 w-24 bg-gray-200 rounded-lg" />
    <div className="h-2.5 w-16 bg-gray-200 rounded-full" />
  </div>
);

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  const isUp = stat.direction === "up";

  return (
    <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
          {stat.label}
        </span>
        <div
          className={`w-7 h-7 flex items-center justify-center rounded-full shrink-0 ${stat.iconBg}`}
        >
          <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xl sm:text-2xl font-bold text-[#000000]">
          {stat.value}
        </p>
        {stat.valueIsDemo && <DemoBadge />}
      </div>

      {/* change indicators hidden until backend provides prev-period comparison
      <div className="flex items-center gap-1 text-xs flex-wrap">
        {isUp ? (
          <ArrowUp className="w-3 h-3 text-[#16A34A]" />
        ) : (
          <ArrowDown className="w-3 h-3 text-[#EF4444]" />
        )}
        <span className={`font-semibold ${isUp ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
          {stat.change}
        </span>
        <span className="text-[#8C8C8C]">{stat.sublabel}</span>
        {stat.changeIsDemo && <DemoBadge />}
      </div>
      */}
    </div>
  );
};

const Dashboard = ({ onMenuClick }) => {
  const [period, setPeriod] = useState("LAST_MONTH");

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDashboardStatsQuery(period, {
    pollingInterval: 30_000,
  });

  const stats = response?.data;
  const overview = stats?.overview;
  const liveOps = stats?.liveOps;
  const topRestaurants = stats?.topRestaurants ?? [];

  // Cards with real vs. demo fields annotated.
  // valueIsDemo  → the number itself has no API source yet (ask backend)
  // changeIsDemo → API has no prev-period comparison yet (ask backend)
  const statCards = [
    {
      label: "Total Orders",
      value: overview?.totalOrders?.toLocaleString() ?? "—",
      change: "5.6%",
      direction: "up",
      sublabel: "vs prev",
      icon: ShoppingBag,
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#2563EB]",
      valueIsDemo: false,
      changeIsDemo: true,
    },
    {
      label: "Revenue",
      value: formatCurrency(overview?.revenue),
      change: "3.2%",
      direction: "down",
      sublabel: "vs prev",
      icon: DollarSign,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#16A34A]",
      valueIsDemo: false,
      changeIsDemo: true, // backend missing: overview.revenueChange
    },
    {
      label: "Total Users",
      value: overview?.totalUsers?.toLocaleString() ?? "—",
      change: "20%",
      direction: "up",
      sublabel: "vs prev",
      icon: Users,
      iconBg: "bg-[#F3E8FF]",
      iconColor: "text-[#9333EA]",
      valueIsDemo: false,
      changeIsDemo: true,
    },
    {
      label: "Active Drivers",
      value: overview?.activeDrivers?.toString() ?? "—",
      change: "100%",
      direction: "up",
      sublabel: "vs prev",
      icon: Truck,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
      valueIsDemo: false,
      changeIsDemo: true, // backend missing: overview.driversChange
    },
    {
      label: "Avg Delivery Time",
      value: formatDeliveryTime(overview?.avgDeliveryTimeMinutes),
      change: "6.7%",
      direction: "up",
      sublabel: "speed",
      icon: Clock,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#EF4444]",
      valueIsDemo: false,
      changeIsDemo: true, // backend missing: overview.avgTimeChange
    },
  ];

  return (
    <>
      <Topbar title="System Oversight" onMenuClick={onMenuClick} />

      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-2xl sm:text-normal font-bold text-[#000000]!">
              Dashboard
            </h4>
            <p className="text-xs sm:text-sm text-[#8C8C8C]">
              Basic Reporting — platform metrics and performance summary
            </p>
          </div>

          <button
            onClick={refetch}
            disabled={isFetching}
            className="flex items-center gap-1.5 h-9 px-3 border border-[#D9D9D9] rounded-md text-xs font-medium text-[#000000] bg-white hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {isError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            Failed to load dashboard data. Will retry automatically.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : statCards.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
        </div>

        <OrdersRevenueChart
          data={stats?.trends?.data ?? []}
          period={period}
          onPeriodChange={setPeriod}
          isLoading={isLoading}
          isFetching={isFetching}
          periodOptions={PERIOD_OPTIONS}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Ops Monitor — all fields from liveOps are real API data */}
          <div className="border border-[#EDEDED] rounded-xl overflow-hidden">
            <div className="flex flex-col gap-1 p-4 sm:p-5 bg-[#F0FDF4]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <h2 className="text-sm sm:text-base font-bold text-[#000000]!">
                  Live Ops Monitor
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#8C8C8C]">
                Real-time platform activity indicators
              </p>
            </div>

            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-center justify-between p-4 border border-[#EDEDED] rounded-xl">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#16A34A]" />
                  <div>
                    <p className="text-sm font-bold text-[#000000]">
                      Active Deliveries
                    </p>
                    <p className="text-xs text-[#8C8C8C]">
                      Orders currently in flight
                    </p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <span className="text-2xl font-bold text-[#000000]">
                    {liveOps?.activeDeliveries ?? "—"}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8C8C]">Server Connection:</span>
                  <span
                    className={`font-semibold ${isError ? "text-[#EF4444]" : "text-[#16A34A]"}`}
                  >
                    {isError ? "Disconnected" : "Connected"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8C8C]">Last Updated:</span>
                  {isLoading ? (
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <span className="font-semibold text-[#000000]">
                      {formatLastUpdate(liveOps?.lastUpdate)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8C8C]">Riders Online:</span>
                  {isLoading ? (
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <span className="font-semibold text-[#000000]">
                      {liveOps?.riderOnline ?? "—"} /{" "}
                      {liveOps?.riderTotal ?? "—"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C8C8C]">Active Districts:</span>
                  {isLoading ? (
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <span className="font-semibold text-[#000000]">
                      {liveOps?.activeDistricts ?? "—"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Top Restaurants — name/orders/revenue from API; rating pending backend */}
          <div className="border border-[#EDEDED] rounded-xl overflow-hidden">
            <div className="flex flex-col gap-1 p-4 sm:p-5 bg-[#FFF7ED]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D97706]" />
                <h2 className="text-sm sm:text-base font-bold text-[#000000]!">
                  Top Restaurants
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#8C8C8C]">
                Ranked by order volume & revenue
              </p>
            </div>

            <div className="flex flex-col">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#EDEDED] last:border-0 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3.5 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-12 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      <div className="h-3.5 w-16 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))
              ) : topRestaurants.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#8C8C8C]">
                  No restaurant data available for this period
                </div>
              ) : (
                topRestaurants.map((r, i) => {
                  const colors =
                    RANK_COLORS[i] ?? RANK_COLORS[RANK_COLORS.length - 1];
                  return (
                    <div
                      key={r.merchantId}
                      className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#EDEDED] last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${colors.badgeBg} ${colors.badgeText}`}
                        >
                          #{i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#000000] truncate">
                            {r.name}
                          </p>
                          {/* rating pending backend: topRestaurants[].rating */}
                          <div className="flex items-center gap-1 text-xs text-[#D97706]">
                            ★ <DemoBadge />
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#000000]">
                          {formatCurrency(r.totalRevenue)}
                        </p>
                        <p className="text-xs text-[#8C8C8C]">
                          {r.totalOrders} orders
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
