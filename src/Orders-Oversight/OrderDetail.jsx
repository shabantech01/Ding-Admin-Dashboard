import { useState, useEffect } from "react"
import { X, FileText, User, UtensilsCrossed, Truck, CheckCircle2, HelpCircle } from "lucide-react"

const timelineSteps = [
    { key: "placed", label: "Order Placed", time: "23/06/2026, 03:04:42" },
    { key: "confirmed", label: "Confirmed", time: "23/06/2026, 03:07:42" },
    { key: "preparing", label: "Preparing Food", time: "23/06/2026, 03:12:42" },
    { key: "pickedUp", label: "Courier Picked Up", time: null },
    { key: "delivered", label: "Delivered", time: null },
]

const TimelineItem = ({ step, isCompleted, isLast }) => (
    <div className="flex gap-3">
        <div className="flex flex-col items-center">
            <div
                className={`w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${
                    isCompleted
                        ? "bg-[#16A34A] text-white"
                        : "bg-white border-2 border-[#D9D9D9] text-[#A3A3A3]"
                }`}
            >
                {isCompleted ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                ) : (
                    <HelpCircle className="w-3.5 h-3.5" />
                )}
            </div>
            {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] ${isCompleted ? "bg-[#16A34A]" : "bg-[#D9D9D9]"}`} />
            )}
        </div>
        <div className="pb-6">
            <p className={`text-sm font-bold ${isCompleted ? "text-[#000000]" : "text-[#A3A3A3]"}`}>
                {step.label}
            </p>
            {step.time && (
                <p className="text-xs text-[#8C8C8C] mt-0.5">{step.time}</p>
            )}
        </div>
    </div>
)

const OrderDetailModal = ({ order, onClose }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(onClose, 300)
    }

    if (!order) return null

    const statusIndex = {
        "Placed": 0,
        "Preparing": 2,
        "Picked Up": 3,
        "Delivered": 4,
    }
    const currentStepIndex = statusIndex[order.status] ?? 0

    const items = order.items || [
        { name: "Butter Chicken", category: "Main Course", qty: "02", status: "Packed" },
        { name: "Garlic Naan", category: "Sides", qty: "01", status: "Packed" },
    ]

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
                <div className="flex flex-col gap-6 p-5 sm:p-6 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <button
                        onClick={handleClose}
                        className="absolute top-5 right-5 sm:top-6 sm:right-6 text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col gap-3 pt-1">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#FEE2E2]">
                            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-[#EF4444]" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-[#000000]">
                                Order Details
                            </h2>
                            <p className="text-xs sm:text-sm text-[#8C8C8C]">ID: {order.id}</p>
                        </div>
                    </div>

                    <div className="border-t border-[#EDEDED] -mt-2" />

                    <div className="flex flex-col gap-3">
                        <p className="text-[11px] sm:text-xs font-bold text-[#8C8C8C] uppercase tracking-wide">
                            Stakeholders
                        </p>

                        <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                                        Client Customer
                                    </p>
                                    <p className="text-sm font-bold text-[#000000]">{order.customer}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <UtensilsCrossed className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                                        Restaurant Merchant
                                    </p>
                                    <p className="text-sm font-bold text-[#000000]">{order.restaurant}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Truck className="w-4 h-4 text-[#8C8C8C] mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] sm:text-xs font-semibold text-[#8C8C8C] uppercase tracking-wide">
                                        Assigned Courier
                                    </p>
                                    <p className="text-sm font-bold text-[#000000]">
                                        {order.driver || "Unassigned"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="text-[11px] sm:text-xs font-bold text-[#8C8C8C] uppercase tracking-wide">
                            Delivery Status Timeline
                        </p>

                        <div className="flex flex-col">
                            {timelineSteps.map((step, index) => (
                                <TimelineItem
                                    key={step.key}
                                    step={step}
                                    isCompleted={index <= currentStepIndex}
                                    isLast={index === timelineSteps.length - 1}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] sm:text-xs font-bold text-[#8C8C8C] uppercase tracking-wide">
                                Order Basket
                            </p>
                            <span className="px-2.5 py-1 rounded-md bg-[#F5F5F5] text-[10px] sm:text-xs font-semibold text-[#5C5C5C]">
                                {items.length} Items
                            </span>
                        </div>

                        <div className="border border-[#EDEDED] rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#F9F9F9] border-b border-[#EDEDED]">
                                        <th className="px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-[#8C8C8C] uppercase">
                                            Item Name
                                        </th>
                                        <th className="px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-[#8C8C8C] uppercase text-center">
                                            Qty
                                        </th>
                                        <th className="px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-[#8C8C8C] uppercase text-right">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="border-b border-[#EDEDED]">
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-[#000000]">{item.name}</p>
                                                <p className="text-xs text-[#8C8C8C]">{item.category}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-[#000000] text-center">{item.qty}</td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-[#16A34A]">
                                                    {item.status}
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-sm font-bold text-[#000000]">Total Price</span>
                                <span className="text-base font-bold text-[#000000]">
                                    ${order.total?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full h-12 rounded-lg py-3 border border-[#D9D9D9] text-sm sm:text-base font-bold text-[#000000] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
                    >
                        Close Oversight Detail
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailModal