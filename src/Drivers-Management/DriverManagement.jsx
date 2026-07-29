import { useState, useMemo } from "react";
import { Search, Bike, Truck, Plus } from "lucide-react";
import Topbar from "../Dashboard/Topbar";
import AddDriverModal from "./AddDriver";

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

const VehicleIcon = ({ vehicle }) => {
  const Icon = vehicle === "Bike" ? Bike : Truck;
  return <Icon className="w-4 h-4 text-[#FF5A1F]" />;
};

const ActivityStatus = ({ status }) => {
  const styles = {
    "Online Now": { dot: "bg-[#22C55E]", pill: "bg-[#DCFCE7] text-[#16A34A]" },
    Offline: { dot: "bg-[#A3A3A3]", pill: "bg-[#F5F5F5] text-[#737373]" },
    Suspended: { dot: "bg-[#EF4444]", pill: "bg-[#FEE2E2] text-[#EF4444]" },
  };
  const style = styles[status] || styles["Offline"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

const DriverManagement = ({ onMenuClick }) => {
  const [search, setSearch] = useState("");
  const [activeVehicle, setActiveVehicle] = useState("All Vehicles");
  const [showAddDriver, setShowAddDriver] = useState(false);

  const filteredDrivers = useMemo(() => {
    return driversData.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.id.toLowerCase().includes(search.toLowerCase());
      const matchesVehicle =
        activeVehicle === "All Vehicles" || d.vehicle === activeVehicle;
      return matchesSearch && matchesVehicle;
    });
  }, [search, activeVehicle]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Topbar title="System Oversight" onMenuClick={onMenuClick} />

      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8">
        {/* Heading + Add button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h4 className="text-2xl sm:text-normal font-bold text-[#000000]!">
              Driver Management
            </h4>
            <p className="text-xs sm:text-sm text-[#8C8C8C]">
              Track courier document validation queues and manage online fleet
              access
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

        {/* Driver's Directory */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#000000]">
              Driver's Directory
            </h2>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by courier name or ID..."
                  className="w-full h-10 pl-9 pr-3 bg-white border border-[#D9D9D9] rounded-md text-sm focus:outline-none focus:border-[#765AB8]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-[#8C8C8C] whitespace-nowrap">
                  Vehicle:
                </span>
                <select
                  value={activeVehicle}
                  onChange={(e) => setActiveVehicle(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#D9D9D9] rounded-md text-xs sm:text-sm font-medium text-[#000000] cursor-pointer focus:outline-none"
                >
                  {vehicleFilters.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block border border-[#EDEDED] rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
                  <th className="px-4 py-3 text-[14px] font-bold text-[#000000]">
                    Courier
                  </th>
                  <th className="px-4 py-3 text-[14px] font-bold text-[#000000]">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-[14px] font-bold text-[#000000]">
                    Activity Status
                  </th>
                  <th className="px-4 py-3 text-[14px] font-bold text-[#000000]">
                    Contact Email
                  </th>
                  <th className="px-4 py-3 text-[14px] font-bold text-[#000000]">
                    Deliveries
                  </th>
                  <th className="px-4 py-3 text-[14px] font-bold text-[#000000]">
                    Joined Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-[#EDEDED] last:border-0 hover:bg-[#F9F9F9]"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-[#000000]">
                        {d.name}
                      </p>
                      <p className="text-xs text-[#8C8C8C]">{d.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-[#000000]">
                        <VehicleIcon vehicle={d.vehicle} />
                        {d.vehicle}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ActivityStatus status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#5C5C5C]">
                      {d.email}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#000000]">
                      {d.deliveries}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8C8C8C]">
                      {d.joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {filteredDrivers.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#000000]">
                      {d.name}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">{d.id}</p>
                  </div>
                  <ActivityStatus status={d.status} />
                </div>

                <div className="flex items-center gap-2 text-sm text-[#000000]">
                  <VehicleIcon vehicle={d.vehicle} />
                  {d.vehicle}
                </div>

                <p className="text-xs text-[#5C5C5C] truncate">{d.email}</p>

                <div className="flex items-center justify-between text-xs text-[#8C8C8C] pt-2 border-t border-[#EDEDED]">
                  <span>
                    <span className="font-bold text-[#000000]">
                      {d.deliveries}
                    </span>{" "}
                    deliveries
                  </span>
                  <span>Joined {d.joined}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredDrivers.length === 0 && (
            <p className="text-center text-sm text-[#8C8C8C] py-10">
              No drivers found matching your filters.
            </p>
          )}
        </div>
      </div>
      {showAddDriver && (
        <AddDriverModal
          onClose={() => setShowAddDriver(false)}
          onSubmit={async (data) => {
            // TODO: API call — driver create karna hai
            console.log("New driver data:", data);
          }}
        />
      )}
    </div>
  );
};

export default DriverManagement;
