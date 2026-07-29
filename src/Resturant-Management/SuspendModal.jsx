import { useState, useEffect } from "react"
import { X, PauseCircle, Loader2 } from "lucide-react"

const SuspendModal = ({ businessName, isLoading, onConfirm, onCancel }) => {
  const [reason, setReason] = useState("")
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

  const handleConfirm = () => {
    if (!reason.trim() || isLoading) return
    onConfirm(reason.trim())
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
        className={`w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5 transition-all duration-250 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <PauseCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A0A0A]">Suspend Merchant</h3>
              <p className="text-xs text-[#8C8C8C] mt-0.5 truncate max-w-[220px]">{businessName}</p>
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

        {/* Reason */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wide">
            Reason for Suspension <span className="text-amber-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Policy violation, pending compliance review, reported by customers…"
            rows={4}
            className="w-full px-3 py-2.5 border border-[#D9D9D9] rounded-xl text-sm text-[#0A0A0A] placeholder:text-[#ADADAD] focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
          />
          <p className="text-[11px] text-[#8C8C8C]">
            The merchant will lose dashboard access until reinstated. This reason will be communicated via email once the email service is active.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-[#D9D9D9] text-sm font-semibold text-[#5C5C5C] hover:bg-[#F9F9F9] transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Suspending…</>
              : "Confirm Suspension"
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuspendModal
