import { useState, useEffect } from "react"
import { X, BadgePercent, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useUpdateDeliveryFeeMutation } from "../features/deliveryFees/deliveryFeesApi"
import { useNetworkStatus } from "../hooks/useNetworkStatus"

const EditDeliveryFeeForm = ({ currentFee, handleClose, onSuccess }) => {
  const { isOnline } = useNetworkStatus()
  const [name, setName] = useState(
    currentFee?.name ?? "Standard Delivery Fee"
  )
  const [amount, setAmount] = useState(
    currentFee?.amount !== undefined ? String(currentFee.amount) : "15"
  )
  const [description, setDescription] = useState(
    currentFee?.description ?? "Applied to all customer orders at checkout"
  )
  const [errors, setErrors] = useState({})

  const [updateDeliveryFee, { isLoading }] = useUpdateDeliveryFeeMutation()

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) {
      newErrors.name = "Fee name is required"
    }
    if (amount === "" || amount === null || isNaN(Number(amount))) {
      newErrors.amount = "Please enter a valid numeric delivery fee"
    } else if (Number(amount) < 0) {
      newErrors.amount = "Delivery fee cannot be negative"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isOnline) {
      setErrors({ form: "You are currently offline. Please reconnect to save changes." })
      return
    }

    if (!validate()) return

    try {
      const payload = {
        name: name.trim(),
        amount: Number(amount),
        isActive: true,
        description: description.trim(),
      }

      await updateDeliveryFee(payload).unwrap()
      if (onSuccess) {
        onSuccess("Delivery fee configuration updated successfully")
      }
      handleClose()
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to update delivery fee. Please try again."
      setErrors({ form: message })
    }
  }

  // Check if dirty (values changed)
  const isDirty =
    !currentFee ||
    name.trim() !== (currentFee.name || "").trim() ||
    Number(amount) !== Number(currentFee.amount) ||
    description.trim() !== (currentFee.description || "").trim()

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto">
      <div className="p-6 flex flex-col gap-5">
        {errors.form && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Fee Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#000000]!">
            Fee Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Standard Delivery Fee"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[#000000]! placeholder:text-[#8C8C8C] focus:outline-none focus:ring-2 focus:ring-[#765AB8]/20 focus:border-[#765AB8] transition-all ${
              errors.name ? "border-red-400 bg-red-50/20" : "border-[#EDEDED]"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#000000]!">
            Fee Amount (ZAR) <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-sm font-bold text-[#765AB8]">
              R
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="15.00"
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm font-semibold text-[#000000]! placeholder:text-[#8C8C8C] focus:outline-none focus:ring-2 focus:ring-[#765AB8]/20 focus:border-[#765AB8] transition-all ${
                errors.amount ? "border-red-400 bg-red-50/20" : "border-[#EDEDED]"
              }`}
            />
          </div>
          {errors.amount ? (
            <p className="text-xs text-red-500 font-medium">{errors.amount}</p>
          ) : (
            <p className="text-[11px] text-[#8C8C8C]">
              This fixed amount will be added to the customer's cart total upon ordering.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#000000]">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Applied to all orders"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EDEDED] text-sm text-[#000000] placeholder:text-[#8C8C8C] focus:outline-none focus:ring-2 focus:ring-[#765AB8]/20 focus:border-[#765AB8] transition-all resize-none"
          />
          <p className="text-[11px] text-[#8C8C8C]">
            Helpful context or notes visible on internal invoice breakdowns.
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[#EDEDED] bg-[#FAFAFA] flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-lg border border-[#EDEDED] text-sm font-semibold text-[#5C5C5C] hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !isDirty || !isOnline}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#765AB8] hover:bg-[#654A9F] active:scale-95 text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentFee ? "Save Changes" : "Add Delivery Fee"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

const EditDeliveryFeeModal = ({ isOpen, onClose, currentFee, onSuccess }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md h-full bg-white rounded-l-2xl flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EDEDED]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1FA] flex items-center justify-center text-[#765AB8]">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#000000]!">
                {currentFee ? "Edit Delivery Fee" : "Add Delivery Fee"}
              </h2>
              <p className="text-xs text-[#8C8C8C]">
                Impose global checkout delivery fee
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#8C8C8C] hover:text-[#000000] p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner Form with fresh state */}
        <EditDeliveryFeeForm
          key={currentFee?.id || "new-fee"}
          currentFee={currentFee}
          handleClose={handleClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  )
}

export default EditDeliveryFeeModal
