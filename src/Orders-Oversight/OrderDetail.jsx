import { useState, useEffect } from "react";
import {
  X,
  FileText,
  User,
  UtensilsCrossed,
  Truck,
  MapPin,
  CreditCard,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useGetAdminOrderByIdQuery } from "../features/orders/ordersApi";

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing Food",
  READY_FOR_PICKUP: "Ready for Pickup",
  ASSIGNED: "Rider Assigned",
  PICKED_UP: "Picked Up",
  ON_THE_WAY: "On the Way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES = {
  PLACED: "bg-[#FEF3C7] text-[#D97706]",
  CONFIRMED: "bg-[#DBEAFE] text-[#2563EB]",
  PREPARING: "bg-[#EDE9FE] text-[#7C3AED]",
  READY_FOR_PICKUP: "bg-[#FEF9C3] text-[#CA8A04]",
  ASSIGNED: "bg-[#F0FDF4] text-[#15803D]",
  PICKED_UP: "bg-[#E0E7FF] text-[#4F46E5]",
  ON_THE_WAY: "bg-[#FFF7ED] text-[#EA580C]",
  DELIVERED: "bg-[#DCFCE7] text-[#16A34A]",
  CANCELLED: "bg-[#FEE2E2] text-[#DC2626]",
};

const PAYMENT_STATUS_STYLES = {
  PENDING: "bg-[#FEF3C7] text-[#D97706]",
  COMPLETED: "bg-[#DCFCE7] text-[#16A34A]",
  PAID: "bg-[#DCFCE7] text-[#16A34A]",
  FAILED: "bg-[#FEE2E2] text-[#DC2626]",
};

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
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
};

const fmtShortId = (id) => id?.slice(0, 8).toUpperCase() ?? "—";

// ── Small reusable pieces ──────────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wide">
    {children}
  </p>
);

const Divider = () => <div className="border-t border-[#EDEDED]" />;

// ── Skeleton ───────────────────────────────────────────────────────────────────

const DetailSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse pt-1">
    <div className="flex flex-col gap-2">
      <div className="h-12 w-12 bg-[#F0F0F0] rounded-full" />
      <div className="h-5 bg-[#F0F0F0] rounded-full w-32 mt-1" />
      <div className="h-3 bg-[#F0F0F0] rounded-full w-24" />
    </div>
    <Divider />
    {[80, 60, 100].map((w, i) => (
      <div key={i} className="flex flex-col gap-3">
        <div className="h-3 bg-[#F0F0F0] rounded-full w-20" />
        <div className="flex flex-col gap-2.5 p-4 border border-[#EDEDED] rounded-xl">
          <div className="h-3 bg-[#F0F0F0] rounded-full w-full" />
          <div
            style={{ width: `${w}%` }}
            className="h-3 bg-[#F0F0F0] rounded-full"
          />
          <div className="h-3 bg-[#F0F0F0] rounded-full w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// ── Timeline Item ──────────────────────────────────────────────────────────────

const TimelineItem = ({ status, label, time, isLast }) => {
  const isCancelled = status === "CANCELLED";
  const dotCls = isCancelled ? "bg-[#DC2626]" : "bg-[#6B46C1]";
  const lineCls = isCancelled ? "bg-[#DC2626]" : "bg-[#6B46C1]";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${dotCls}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[22px] mt-0.5 ${lineCls} opacity-30`}
          />
        )}
      </div>
      <div className="pb-5">
        <p className="text-sm font-bold text-[#000000]">{label}</p>
        <p className="text-xs text-[#8C8C8C] mt-0.5">{fmtDate(time)}</p>
      </div>
    </div>
  );
};

// ── Main Modal ─────────────────────────────────────────────────────────────────

const OrderDetailModal = ({ orderId, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetAdminOrderByIdQuery(orderId, {
    skip: !orderId,
  });

  // API envelope: { success, data: { ...order }, message }
  const order = response?.data;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Build chronological timeline from statusLogs (API returns newest-first)
  const timeline = order?.statusLogs
    ? [...order.statusLogs].reverse().map((log) => ({
        status: log.toStatus,
        label: STATUS_LABEL[log.toStatus] ?? log.toStatus,
        time: log.createdAt,
      }))
    : [];

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm h-full bg-white rounded-l-2xl flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable body */}
        <div className="flex flex-col gap-6 p-5 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* ── Loading ── */}
          {isLoading && <DetailSkeleton />}

          {/* ── Error ── */}
          {isError && !isLoading && (
            <div className="flex flex-col items-center gap-4 py-14">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FEE2E2]">
                <AlertCircle className="w-7 h-7 text-[#EF4444]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#000000]">
                  Failed to load order
                </p>
                <p
                  className="text-xs 
                text-black! mt-1"
                >
                  Couldn't fetch the order details.
                </p>
              </div>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-[#6B46C1] text-white rounded-lg text-sm font-semibold hover:bg-[#5A3AA0] transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {/* ── Content ── */}
          {!isLoading && !isError && order && (
            <>
              {/* Header */}
              <div className="flex flex-col gap-3 pt-1">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F5F3FF]">
                  <FileText className="w-6 h-6 text-[#6B46C1]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-[#000000]!">
                    Order Details
                  </h2>
                  <p className="text-[11px] font-mono font-semibold text-[#6B46C1] break-all leading-relaxed">
                    {order.id}
                  </p>
                  <p className="text-xs text-[#8C8C8C]">{fmtDate(order.placedAt)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      STATUS_STYLES[order.status] ??
                      "bg-[#F5F5F5] text-[#737373]"
                    }`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-lg font-bold text-[#000000]">
                    R {Number(order.totalAmount).toLocaleString("en-ZA")}
                  </span>
                </div>
              </div>

              <Divider />

              {/* Stakeholders */}
              <div className="flex flex-col gap-3">
                <SectionLabel>Stakeholders</SectionLabel>
                <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-wide">
                        Customer
                      </p>
                      <p className="text-sm font-bold text-[#000000]">
                        {order.customer?.name ?? "—"}
                      </p>
                      {order.customer?.phone ? (
                        <p className="text-xs text-[#8C8C8C]">
                          {order.customer.phone}
                        </p>
                      ) : (
                        <p className="text-xs italic text-[#BFBFBF]">
                          No phone on file
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <UtensilsCrossed className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-wide">
                        Branch
                      </p>
                      <p className="text-sm font-bold text-[#000000]">
                        {order.branch?.name ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Truck className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-wide">
                        Assigned Rider
                      </p>
                      {order.assignedRiderId ? (
                        <p className="text-sm font-bold text-[#000000] font-mono">
                          {fmtShortId(order.assignedRiderId)}
                        </p>
                      ) : (
                        <p className="text-sm italic font-medium text-[#F97316]">
                          Unassigned
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="flex flex-col gap-3">
                <SectionLabel>Delivery Address</SectionLabel>
                <div className="flex items-start gap-3 p-4 border border-[#EDEDED] rounded-xl">
                  <MapPin className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                  <p className="text-sm text-[#000000]">
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* Order Basket */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <SectionLabel>Order Basket</SectionLabel>
                  <span className="px-2.5 py-1 rounded-md bg-[#F5F5F5] text-[11px] font-semibold text-[#5C5C5C]">
                    {order.items?.length ?? 0}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="border border-[#EDEDED] rounded-xl overflow-hidden">
                  {order.items?.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex gap-3 p-3.5 ${idx !== 0 ? "border-t border-[#EDEDED]" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#000000]">
                          {item.menuItem?.name ?? "Item"}
                        </p>
                        {item.modifiers?.length > 0 && (
                          <div className="mt-1 flex flex-col gap-0.5">
                            {item.modifiers.map((mod, mIdx) => (
                              <p
                                key={mIdx}
                                className="text-[11px] text-[#8C8C8C]"
                              >
                                <span className="font-medium">{mod.name}:</span>{" "}
                                {mod.options.join(", ")}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-0.5">
                        <p className="text-[11px] text-[#8C8C8C]">
                          ×{item.quantity}
                        </p>
                        <p className="text-[11px] text-[#8C8C8C]">
                          R{Number(item.unitPrice).toFixed(0)} ea
                        </p>
                        <p className="text-sm font-bold text-[#000000]">
                          R{Number(item.totalPrice).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between px-3.5 py-3 border-t border-[#EDEDED] bg-[#FAFAFA]">
                    <span className="text-sm font-bold text-[#000000]">
                      Total
                    </span>
                    <span className="text-base font-bold text-[#000000]">
                      R {Number(order.totalAmount).toLocaleString("en-ZA")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              {order.payment && (
                <div className="flex flex-col gap-3">
                  <SectionLabel>Payment</SectionLabel>
                  <div className="p-4 border border-[#EDEDED] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <CreditCard className="w-4 h-4 text-[#8C8C8C]" />
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          PAYMENT_STATUS_STYLES[order.payment.status] ??
                          "bg-[#F5F5F5] text-[#737373]"
                        }`}
                      >
                        {order.payment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <p className="text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-wide">
                          Method
                        </p>
                        <p className="text-sm font-bold text-[#000000]">
                          {order.payment.method}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#8C8C8C] uppercase tracking-wide">
                          Amount
                        </p>
                        <p className="text-sm font-bold text-[#000000]">
                          {order.payment.currency}{" "}
                          {Number(order.payment.amount).toLocaleString("en-ZA")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Note */}
              {order.customerNote && (
                <div className="flex flex-col gap-3">
                  <SectionLabel>Customer Note</SectionLabel>
                  <div className="flex gap-3 p-4 border border-[#FDE68A] rounded-xl bg-[#FFFBEB]">
                    <MessageSquare className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                    <p className="text-sm text-[#000000]">
                      {order.customerNote}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              {timeline.length > 0 && (
                <div className="flex flex-col gap-3">
                  <SectionLabel>Status Timeline</SectionLabel>
                  <div className="flex flex-col p-4 border border-[#EDEDED] rounded-xl">
                    {timeline.map((step, idx) => (
                      <TimelineItem
                        key={idx}
                        status={step.status}
                        label={step.label}
                        time={step.time}
                        isLast={idx === timeline.length - 1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Close button — always visible */}
          <button
            onClick={handleClose}
            className="w-full h-12 rounded-lg border border-[#D9D9D9] text-sm font-bold text-[#000000] hover:bg-[#F9F9F9] transition-colors cursor-pointer mt-auto"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
