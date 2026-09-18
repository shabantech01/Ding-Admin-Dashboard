import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatAxisDate = (dateStr) => {
  // Append T00:00:00 to prevent UTC-to-local shift from changing the date
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-[#EDEDED] rounded-lg shadow-md px-3 py-2">
      <p className="text-xs font-semibold text-[#000000] mb-1">{formatAxisDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
          {entry.dataKey === "orders" ? "Orders: " : "Revenue: $"}
          {entry.value}
        </p>
      ))}
    </div>
  );
};

const OrdersRevenueChart = ({
  data,
  period,
  onPeriodChange,
  isLoading,
  isFetching,
  periodOptions,
}) => {
  // Thin out X-axis ticks when there are many data points
  const xInterval =
    data.length <= 7 ? 0 : data.length <= 14 ? 1 : Math.floor(data.length / 7);

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 border border-[#EDEDED] rounded-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#000000]!">
              Orders & Revenue Trends
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#2563EB] text-[10px] sm:text-xs font-semibold">
              Orders
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[10px] sm:text-xs font-semibold">
              Revenue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8C8C8C]">
            Visual history of placed orders and revenue
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="h-9 px-3 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none self-start"
        >
          {periodOptions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`w-full h-[260px] sm:h-[340px] md:h-[400px] transition-opacity duration-200 ${
          isFetching && !isLoading ? "opacity-50" : "opacity-100"
        }`}
      >
        {isLoading ? (
          <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#737373" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#737373" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />

              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                interval={xInterval}
                tick={{ fontSize: 11, fill: "#8C8C8C" }}
                axisLine={{ stroke: "#EDEDED" }}
                tickLine={false}
              />

              <YAxis
                yAxisId="orders"
                tick={{ fontSize: 11, fill: "#F97316" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />

              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={{ fontSize: 11, fill: "#16A34A" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke="#F97316"
                strokeWidth={2}
                fill="url(#ordersGradient)"
              />

              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#16A34A"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default OrdersRevenueChart;
