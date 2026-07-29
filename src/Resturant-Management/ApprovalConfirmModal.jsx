import { useState, useEffect } from "react"
import { X, ShieldCheck, Loader2 } from "lucide-react"

const ApprovalConfirmModal = ({ businessName, isLoading, onConfirm, onCancel }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const handleCancel = () => {
    if (isLoading) return
    setVisible(false)
    setTimeout(onCancel, 250)
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 transition-opacity duration-250 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5 transition-all duration-250 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A0A0A]">Approve Merchant</h3>
              <p className="text-xs text-[#8C8C8C] mt-0.5 truncate max-w-[180px]">{businessName}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-t border-[#EDEDED]" />

        <p className="text-sm text-[#5C5C5C] leading-relaxed">
          Approving <span className="font-semibold text-[#0A0A0A]">{businessName}</span> will grant them
          full access to the merchant dashboard and allow them to start receiving orders on Ding.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-[#D9D9D9] text-sm font-semibold text-[#5C5C5C] hover:bg-[#F9F9F9] transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Approving…</>
              : "Yes, Approve"
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApprovalConfirmModal
