import { useState, useEffect } from "react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import {
  X,
  UtensilsCrossed,
  MapPin,
  Clock,
  Users,
  FileText,
  ExternalLink,
  XCircle,
  CheckCircle2,
  PauseCircle,
  Hash,
  GitBranch,
  Phone,
  Mail,
  Timer,
} from "lucide-react";

const DAY_LABELS = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const formatHours = (hours) => {
  if (!hours || Object.keys(hours).length === 0) return null;
  return DAY_ORDER.filter((d) => hours[d]).map(
    (d) => `${DAY_LABELS[d]}: ${hours[d]}`,
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[11px] text-[#8C8C8C] font-medium">{label}</p>
    <p className="text-sm font-semibold text-[#0A0A0A] break-words">
      {value || "—"}
    </p>
  </div>
);

const RestaurantApplicationModal = ({
  application,
  onClose,
  onApprove,
  onReject,
  onSuspend,
}) => {
  const { isOnline } = useNetworkStatus()
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!application) return null;

  const hoursLines = formatHours(application.openingClosingHours);
  const hasCoords = application.lat != null && application.lng != null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm h-full bg-white rounded-l-2xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col gap-3 pt-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#F5F0FF]">
              <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-[#765AB8]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#000000]!">
                  {application.businessName}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wide bg-[#FF63471A] text-[#FF5A1F]">
                  {application.restaurantType}
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C] mt-0.5 font-mono">
                {application.id.slice(0, 8)}…
              </p>
              <p className="text-[11px] text-[#ADADAD] mt-0.5">
                Submitted{" "}
                {new Date(application.createdAt).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-[#EDEDED]" />

          {/* Owner / Contact */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wide">
              Owner & Contact
            </p>
            <div className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-xl bg-[#FAFAFA]">
              <DetailRow label="Full Name" value={application.user?.name} />
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#8C8C8C] shrink-0" />
                <p className="text-sm font-semibold text-[#0A0A0A] break-all">
                  {application.user?.email || "—"}
                </p>
              </div>
              {/* <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#8C8C8C] shrink-0" />
                <p className="text-sm font-semibold text-[#0A0A0A]">{application.user?.phone || "—"}</p>
              </div> */}
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wide">
              Location
            </p>
            <div className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-xl bg-[#FAFAFA]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#8C8C8C] shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-[#0A0A0A] leading-relaxed">
                  {application.physicalStreetAddress || "—"}
                </p>
              </div>
              {hasCoords && (
                <p className="text-xs text-[#8C8C8C] font-mono pl-5">
                  {application.lat?.toFixed(6)}, {application.lng?.toFixed(6)}
                </p>
              )}
              <div className="flex items-center gap-2 pl-5">
                <GitBranch className="w-3.5 h-3.5 text-[#765AB8]" />
                <p className="text-xs text-[#5C5C5C]">
                  {application._count?.branches ?? 1} branch(es)
                </p>
              </div>
            </div>
          </div>

          {/* Kitchen ops */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wide">
              Kitchen Operations
            </p>
            <div className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-xl bg-[#FAFAFA]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-[#8C8C8C]">
                  <Users className="w-3.5 h-3.5" /> Capacity limit
                </span>
                <span className="text-sm font-bold text-[#0A0A0A]">
                  {application.kitchenCapacityLimit ?? "—"} orders
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-[#8C8C8C]">
                  <Timer className="w-3.5 h-3.5" /> Default prep time
                </span>
                <span className="text-sm font-bold text-[#0A0A0A]">
                  {application.defaultPrepDuration ?? "—"} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-[#8C8C8C]">
                  <Clock className="w-3.5 h-3.5" /> Initial service state
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    application.kitchenServiceState === "OPEN"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {application.kitchenServiceState || "—"}
                </span>
              </div>

              {/* Opening hours */}
              {hoursLines && (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-[#EDEDED]">
                  <p className="text-[11px] text-[#8C8C8C] font-medium">
                    Opening hours
                  </p>
                  {hoursLines.map((line, i) => (
                    <p
                      key={i}
                      className="text-xs font-semibold text-[#0A0A0A] font-mono"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Verification */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wide">
              Verification
            </p>
            <div className="flex flex-col gap-3 p-4 border border-[#EDEDED] rounded-xl bg-[#FAFAFA]">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-[#8C8C8C] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8C8C8C]">
                    Business reg. number
                  </p>
                  <p className="text-sm font-bold text-[#0A0A0A] font-mono tracking-wider">
                    {application.verifyNumber || "—"}
                  </p>
                </div>
              </div>

              {/* {application.verifyDocUrl ? (
                <a
                  href={application.verifyDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3 border border-[#EDEDED] rounded-lg hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#765AB8] shrink-0" />
                    <span className="text-sm font-semibold text-[#0A0A0A] truncate">
                      Verification Document
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#765AB8] shrink-0">
                    View <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </a>
              ) : (
                <p className="text-xs text-[#ADADAD] italic">
                  No document uploaded
                </p>
              )} */}
            </div>
          </div>
        </div>

        {/* Sticky action bar — buttons depend on current merchant status */}
        {application.status === "PENDING" && (
          <div className="shrink-0 border-t border-[#EDEDED] p-4 flex gap-3 bg-white">
            <button
              onClick={() => onReject(application)}
              disabled={!isOnline}
              title={isOnline ? undefined : "No internet connection"}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FEE2E2] text-[#EF4444] text-sm font-semibold hover:bg-[#FCA5A5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              Reject
            </button>
            <button
              onClick={() => onApprove(application)}
              disabled={!isOnline}
              title={isOnline ? undefined : "No internet connection"}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#765AB8] text-white text-sm font-semibold hover:bg-[#654A9F] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Approve
            </button>
          </div>
        )}

        {application.status === "ACTIVE" && (
          <div className="shrink-0 border-t border-[#EDEDED] p-4 bg-white">
            <button
              onClick={() => onSuspend(application)}
              disabled={!isOnline}
              title={isOnline ? undefined : "No internet connection"}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 text-sm font-semibold hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PauseCircle className="w-4 h-4 shrink-0" />
              Suspend Merchant
            </button>
          </div>
        )}

        {application.status === "SUSPENDED" && (
          <div className="shrink-0 border-t border-[#EDEDED] p-4 bg-white">
            <button
              onClick={() => onApprove(application)}
              disabled={!isOnline}
              title={isOnline ? undefined : "No internet connection"}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Reactivate Merchant
            </button>
          </div>
        )}

        {application.status === "REJECTED" && (
          <div className="shrink-0 border-t border-[#EDEDED] p-4 bg-white">
            <p className="text-center text-xs text-[#ADADAD] font-medium py-1">
              No actions available for rejected merchants
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantApplicationModal;
