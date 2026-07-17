import { X, UtensilsCrossed, FileText, ExternalLink, XCircle, CheckCircle2 } from "lucide-react"

const RestaurantApplicationModal = ({ application, onClose, onApprove, onReject }) => {
    if (!application) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-white rounded-2xl p-5 sm:p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon + name */}
                <div className="flex flex-col gap-3 pt-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#FEE2E2]">
                        <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-[#EF4444]" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#000000]">
                            {application.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#8C8C8C]">ID: {application.id}</p>
                    </div>
                </div>

                <div className="border-t border-[#EDEDED]" />

                {/* Onboarding details */}
                <div className="flex flex-col gap-3">
                    <p className="text-[11px] sm:text-xs font-bold text-[#8C8C8C] uppercase tracking-wide">
                        Onboarding Details
                    </p>

                    <div className="flex flex-col gap-4 p-4 border border-[#EDEDED] rounded-xl bg-[#FAFAFA]">
                        <div>
                            <p className="text-xs text-[#8C8C8C]">Contact Owner:</p>
                            <p className="text-sm font-semibold text-[#000000]">{application.owner}</p>
                        </div>

                        <div>
                            <p className="text-xs text-[#8C8C8C]">Phone / Email:</p>
                            <p className="text-sm font-semibold text-[#000000] break-words">
                                {application.phone} / {application.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-[#8C8C8C]">Street Address:</p>
                            <p className="text-sm font-semibold text-[#000000]">{application.address}</p>
                        </div>

                        <div>
                            <p className="text-xs text-[#8C8C8C]">Proposed Commission Rate:</p>
                            <p className="text-sm font-bold text-[#EF4444]">{application.commission}</p>
                        </div>
                    </div>
                </div>

                {/* Supporting attachments */}
                <div className="flex flex-col gap-3">
                    <p className="text-[11px] sm:text-xs font-bold text-[#8C8C8C] uppercase tracking-wide">
                        Supporting Attachments
                    </p>

                <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-4 border border-[#EDEDED] rounded-xl hover:bg-[#FAFAFA] transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-[#EF4444] shrink-0" />
                        <span className="text-sm font-semibold text-[#000000] truncate">
                            Business License & Permit
                        </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#EF4444] shrink-0">
                        View
                        <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                </a>

                <div className="flex flex-col gap-1.5 p-4 border border-[#EDEDED] rounded-xl">
                    <p className="text-sm font-bold text-[#000000]">Menu Sample Preview:</p>
                    <p className="text-sm italic text-[#5C5C5C] leading-relaxed">
                        {application.menuSample}
                    </p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                    onClick={() => onReject(application.id)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-[#FEE2E2] text-[#EF4444] text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-[#FCA5A5] transition-colors cursor-pointer"
                >
                    <XCircle className="w-4 h-4 shrink-0" />
                    Reject Request
                </button>
                <button
                    onClick={() => onApprove(application.id)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-[#765AB8] text-white text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-[#654A9F] transition-colors cursor-pointer"
                >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Approve Request
                </button>
            </div>
        </div>
        </div >
    )
}

export default RestaurantApplicationModal