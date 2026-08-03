import { useState, useEffect, useRef } from "react"
import { useNetworkStatus } from "../hooks/useNetworkStatus"
import {
  X,
  Mail,
  Phone,
  Calendar,
  IdCard,
  FileBadge,
  Car,
  UserRound,
  ShieldCheck,
  PauseCircle,
  Loader2,
  AlertCircle,
  FileText,
  Pencil,
  RotateCcw,
  Check,
  Upload,
} from "lucide-react"
import {
  useGetRiderByIdQuery,
  useVerifyRiderMutation,
  useSuspendRiderMutation,
  useUpdateRiderMutation,
  useGetUploadUrlMutation,
} from "../features/riders/ridersApi"

// ─── Constants ────────────────────────────────────────────────────────────────

const S3_FOLDERS = {
  nationalIdUrl:           "rider/National-ID-Passport",
  driversLicenseUrl:       "rider/Driver-License",
  vehicleRegistrationUrl:  "rider/Vehicle-Registration",
  profilePhotoUrl:         "rider/Profile-Photo",
}

const ACCEPTED = "image/jpeg,image/png,application/pdf"

const DOC_ITEMS = [
  { field: "nationalIdUrl",          icon: IdCard,    label: "National ID / Passport" },
  { field: "driversLicenseUrl",      icon: FileBadge, label: "Driver's License"       },
  { field: "vehicleRegistrationUrl", icon: Car,       label: "Vehicle Registration"   },
  { field: "profilePhotoUrl",        icon: UserRound, label: "Profile Photo"          },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()

const extractFileName = (url = "") => url.split("/").pop() || "—"

const isFullUrl = (str = "") => str.startsWith("http")

const getContentType = (file) => {
  if (file.type) return file.type
  const ext = file.name.split(".").pop().toLowerCase()
  return { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", pdf: "application/pdf" }[ext] ?? "application/octet-stream"
}

// ─── View-mode sub-components ─────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-[#5C5C5C]" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-[#8C8C8C] font-medium">{label}</p>
      <p className="text-sm font-semibold text-[#0A0A0A] break-all">{value || "—"}</p>
    </div>
  </div>
)

const DocRow = ({ icon: Icon, label, url }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-[#EDEDED] bg-[#F9F9F9]">
    <div className="w-8 h-8 rounded-lg bg-white border border-[#EDEDED] flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-[#5C5C5C]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] text-[#8C8C8C] font-medium">{label}</p>
      {url ? (
        isFullUrl(url) ? (
          <a href={url} target="_blank" rel="noreferrer"
            className="text-xs font-semibold text-[#765AB8] truncate block hover:underline">
            {extractFileName(url)}
          </a>
        ) : (
          <p className="text-xs font-semibold text-[#0A0A0A] truncate font-mono">{extractFileName(url)}</p>
        )
      ) : (
        <p className="text-xs text-[#A3A3A3]">Not uploaded</p>
      )}
    </div>
    <FileText className="w-4 h-4 text-[#D9D9D9] shrink-0" />
  </div>
)

// ─── Edit-mode doc row ────────────────────────────────────────────────────────

const EditDocRow = ({ field, icon: Icon, label, currentUrl, uploadState, newFileName, onFileSelected }) => {
  const inputRef = useRef(null)
  const isDone      = uploadState === "done"
  const isUploading = uploadState === "uploading"
  const isError     = uploadState === "error"

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(field, file)
    e.target.value = ""
  }

  return (
    <div className={`p-3 rounded-xl border transition-colors ${
      isDone  ? "bg-[#F0FDF4] border-[#BBF7D0]" :
      isError ? "bg-[#FEF2F2] border-[#FECACA]" :
                "border-[#EDEDED] bg-[#F9F9F9]"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isDone ? "bg-[#16A34A]" : isUploading ? "bg-[#765AB8]" : "bg-white border border-[#EDEDED]"
        }`}>
          {isUploading
            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
            : isDone
            ? <Check className="w-4 h-4 text-white" />
            : <Icon className="w-4 h-4 text-[#5C5C5C]" />
          }
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-[#8C8C8C] font-medium">{label}</p>
          {isDone ? (
            <p className="text-xs font-semibold text-[#16A34A] truncate">{newFileName}</p>
          ) : isError ? (
            <p className="text-xs font-medium text-[#EF4444]">Upload failed — retry</p>
          ) : isUploading ? (
            <p className="text-xs font-medium text-[#765AB8]">Uploading…</p>
          ) : (
            <p className="text-xs font-semibold text-[#0A0A0A] truncate font-mono">
              {extractFileName(currentUrl) || "Not uploaded"}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D9D9D9] bg-white text-[11px] font-semibold text-[#5C5C5C] hover:bg-[#F5F5F5] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
        >
          {isDone ? <><RotateCcw className="w-3 h-3" /> Replace</> : <><Upload className="w-3 h-3" /> Upload</>}
        </button>

        <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleChange} className="hidden" />
      </div>
    </div>
  )
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const OnlineBadge = ({ status }) => {
  const isOnline = status === "ONLINE"
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      isOnline ? "bg-green-50 text-green-700" : "bg-[#F5F5F5] text-[#737373]"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-[#A3A3A3]"}`} />
      {isOnline ? "Online" : "Offline"}
    </span>
  )
}

const DocStatusBadge = ({ status }) => {
  const map = {
    PENDING:   { cls: "bg-amber-50 text-amber-700 border border-amber-200", label: "Docs Pending" },
    ACTIVE:    { cls: "bg-green-50 text-green-700 border border-green-200",  label: "Verified"     },
    SUSPENDED: { cls: "bg-red-50 text-red-600 border border-red-200",        label: "Suspended"    },
  }
  const cfg = map[status] ?? map.PENDING
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── Confirm overlay ──────────────────────────────────────────────────────────

const ConfirmOverlay = ({ action, riderName, isLoading, onConfirm, onCancel }) => {
  const isActivate = action === "activate"
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center px-5 bg-black/40 rounded-l-2xl"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-2xl shadow-xl p-5 flex flex-col gap-4"
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActivate ? "bg-green-50" : "bg-amber-50"}`}>
            {isActivate
              ? <ShieldCheck className="w-5 h-5 text-green-600" />
              : <PauseCircle className="w-5 h-5 text-amber-500" />
            }
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A0A0A]">
              {isActivate ? "Activate Rider" : "Suspend Rider"}
            </h3>
            <p className="text-xs text-[#8C8C8C] mt-0.5 truncate max-w-[200px]">{riderName}</p>
          </div>
        </div>

        <div className="border-t border-[#EDEDED]" />

        <p className="text-sm text-[#5C5C5C] leading-relaxed">
          {isActivate
            ? <><span className="font-semibold text-[#0A0A0A]">{riderName}</span> will be verified and allowed to go online and accept deliveries.</>
            : <><span className="font-semibold text-[#0A0A0A]">{riderName}</span> will be blocked from going online or accepting any new deliveries.</>
          }
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border border-[#D9D9D9] text-sm font-semibold text-[#5C5C5C] hover:bg-[#F9F9F9] transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 ${
              isActivate ? "bg-green-600 hover:bg-green-700" : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" />{isActivate ? "Activating…" : "Suspending…"}</>
              : isActivate ? "Yes, Activate" : "Yes, Suspend"
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── RiderDetailModal ─────────────────────────────────────────────────────────

const initDocStates = () => ({
  nationalIdUrl: "idle", driversLicenseUrl: "idle",
  vehicleRegistrationUrl: "idle", profilePhotoUrl: "idle",
})

const RiderDetailModal = ({ riderId, onClose, onActionSuccess }) => {
  const [isVisible, setIsVisible]       = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // ── Edit mode state ──
  const [isEditMode, setIsEditMode]     = useState(false)
  const [editName, setEditName]         = useState("")
  const [editEmail, setEditEmail]       = useState("")
  const [editPhone, setEditPhone]       = useState("")
  const [editErrors, setEditErrors]     = useState({})
  const [saveError, setSaveError]       = useState("")
  const [editDocStates, setEditDocStates] = useState(initDocStates)
  const [editDocKeys, setEditDocKeys]   = useState({
    nationalIdUrl: null, driversLicenseUrl: null,
    vehicleRegistrationUrl: null, profilePhotoUrl: null,
  })
  const [editDocFileNames, setEditDocFileNames] = useState({
    nationalIdUrl: "", driversLicenseUrl: "",
    vehicleRegistrationUrl: "", profilePhotoUrl: "",
  })

  const { isOnline } = useNetworkStatus()
  const { data: response, isLoading, isError } = useGetRiderByIdQuery(riderId)
  const [verifyRider,  { isLoading: isVerifying  }] = useVerifyRiderMutation()
  const [suspendRider, { isLoading: isSuspending }] = useSuspendRiderMutation()
  const [updateRider,  { isLoading: isSaving     }] = useUpdateRiderMutation()
  const [getUploadUrl]                               = useGetUploadUrlMutation()

  const isActioning = isVerifying || isSuspending

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  // ── Enter edit mode — pre-fill from current rider data ──
  const enterEditMode = () => {
    if (!rider) return
    setEditName(rider.name ?? "")
    setEditEmail(rider.email ?? "")
    setEditPhone(rider.phone ?? "")
    setEditErrors({})
    setSaveError("")
    setEditDocStates(initDocStates())
    setEditDocKeys({ nationalIdUrl: null, driversLicenseUrl: null, vehicleRegistrationUrl: null, profilePhotoUrl: null })
    setEditDocFileNames({ nationalIdUrl: "", driversLicenseUrl: "", vehicleRegistrationUrl: "", profilePhotoUrl: "" })
    setIsEditMode(true)
  }

  // ── Upload a replacement doc file ──
  const handleDocUpload = async (field, file) => {
    setEditDocStates((prev) => ({ ...prev, [field]: "uploading" }))
    setEditDocFileNames((prev) => ({ ...prev, [field]: file.name }))
    try {
      const contentType = getContentType(file)
      const ext = file.name.split(".").pop().toLowerCase()
      const key = `${S3_FOLDERS[field]}/${crypto.randomUUID()}.${ext}`

      const result = await getUploadUrl({ key, contentType }).unwrap()
      const { uploadUrl, key: returnedKey } = result.data

      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": contentType },
      })
      if (!s3Res.ok) throw new Error("S3 upload failed")

      setEditDocKeys((prev) => ({ ...prev, [field]: returnedKey }))
      setEditDocStates((prev) => ({ ...prev, [field]: "done" }))
    } catch {
      setEditDocStates((prev) => ({ ...prev, [field]: "error" }))
      setEditDocFileNames((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // ── Validate edit form ──
  const validateEdit = () => {
    const e = {}
    if (!editName.trim())  e.name  = "Name is required"
    if (!editEmail.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) e.email = "Enter a valid email"
    if (!editPhone.trim()) e.phone = "Phone is required"
    setEditErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Save edits ──
  const handleSave = async () => {
    if (!validateEdit()) return
    setSaveError("")
    const anyUploading = Object.values(editDocStates).some((s) => s === "uploading")
    if (anyUploading) return

    try {
      await updateRider({
        id:                    riderId,
        name:                  editName.trim(),
        email:                 editEmail.trim(),
        phone:                 editPhone.trim(),
        nationalIdUrl:         editDocKeys.nationalIdUrl          ?? profile.nationalIdUrl,
        driversLicenseUrl:     editDocKeys.driversLicenseUrl      ?? profile.driversLicenseUrl,
        vehicleRegistrationUrl:editDocKeys.vehicleRegistrationUrl ?? profile.vehicleRegistrationUrl,
        profilePhotoUrl:       editDocKeys.profilePhotoUrl        ?? profile.profilePhotoUrl,
      }).unwrap()
      setIsEditMode(false)
      onActionSuccess?.("Rider details updated successfully")
    } catch (err) {
      setSaveError(err?.data?.message ?? err?.data?.error ?? "Failed to save. Please try again.")
    }
  }

  // ── Activate / suspend confirm ──
  const handleConfirm = async () => {
    try {
      if (confirmAction === "activate") await verifyRider(riderId).unwrap()
      else                              await suspendRider(riderId).unwrap()
      setConfirmAction(null)
      onActionSuccess?.(
        confirmAction === "activate" ? "Rider activated successfully" : "Rider suspended successfully"
      )
    } catch {
      setConfirmAction(null)
    }
  }

  const rider   = response?.data
  const profile = rider?.riderProfile
  const docStatus = profile?.status ?? "PENDING"

  const anyDocUploading = Object.values(editDocStates).some((s) => s === "uploading")

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm h-full bg-white rounded-l-2xl flex flex-col transition-transform duration-300 ease-out overflow-hidden ${isVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Confirm overlay */}
        {confirmAction && (
          <ConfirmOverlay
            action={confirmAction}
            riderName={rider?.name ?? ""}
            isLoading={isActioning}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
          />
        )}

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-[#EDEDED] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#765AB8]/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#765AB8]">
                {rider ? getInitials(rider.name) : "—"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-[#0A0A0A] truncate">
                {isEditMode ? "Edit Rider" : (rider?.name ?? "Loading…")}
              </p>
              {!isEditMode && profile && (
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <OnlineBadge status={profile.onlineStatus} />
                  <DocStatusBadge status={docStatus} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Edit toggle — only in view mode when data is loaded */}
            {!isEditMode && rider && !isLoading && !isError && (
              <button
                onClick={enterEditMode}
                title="Edit rider"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#8C8C8C] hover:text-[#0A0A0A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-2 text-[#8C8C8C]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading rider details…</span>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="flex items-center justify-center py-16 gap-2 text-[#EF4444]">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Failed to load details.</span>
            </div>
          )}

          {/* ── View mode ── */}
          {rider && !isEditMode && (
            <>
              <section>
                <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-3">Personal Info</p>
                <div className="flex flex-col gap-3">
                  <InfoRow icon={Mail}     label="Email"  value={rider.email} />
                  <InfoRow icon={Phone}    label="Phone"  value={rider.phone} />
                  <InfoRow icon={Calendar} label="Joined" value={rider.createdAt ? formatDate(rider.createdAt) : "—"} />
                </div>
              </section>

              <div className="border-t border-[#EDEDED]" />

              <section>
                <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-3">Documents</p>
                <div className="flex flex-col gap-2">
                  {DOC_ITEMS.map(({ field, icon, label }) => (
                    <DocRow key={field} icon={icon} label={label} url={profile?.[field]} />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── Edit mode ── */}
          {rider && isEditMode && (
            <>
              <section>
                <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-3">Personal Info</p>
                <div className="flex flex-col gap-3">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#5C5C5C]">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`w-full h-11 px-3 rounded-lg text-sm focus:outline-none transition-colors ${
                        editErrors.name
                          ? "bg-[#FEF2F2] border border-[#FECACA] focus:border-[#EF4444]"
                          : "bg-[#F5F5F5] border border-transparent focus:border-[#765AB8] focus:bg-white"
                      }`}
                    />
                    {editErrors.name && <p className="text-xs text-[#EF4444] font-medium pl-1">{editErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#5C5C5C]">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className={`w-full h-11 px-3 rounded-lg text-sm focus:outline-none transition-colors ${
                        editErrors.email
                          ? "bg-[#FEF2F2] border border-[#FECACA] focus:border-[#EF4444]"
                          : "bg-[#F5F5F5] border border-transparent focus:border-[#765AB8] focus:bg-white"
                      }`}
                    />
                    {editErrors.email && <p className="text-xs text-[#EF4444] font-medium pl-1">{editErrors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#5C5C5C]">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className={`w-full h-11 px-3 rounded-lg text-sm focus:outline-none transition-colors ${
                        editErrors.phone
                          ? "bg-[#FEF2F2] border border-[#FECACA] focus:border-[#EF4444]"
                          : "bg-[#F5F5F5] border border-transparent focus:border-[#765AB8] focus:bg-white"
                      }`}
                    />
                    {editErrors.phone && <p className="text-xs text-[#EF4444] font-medium pl-1">{editErrors.phone}</p>}
                  </div>
                </div>
              </section>

              <div className="border-t border-[#EDEDED]" />

              <section>
                <p className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Documents</p>
                <p className="text-[11px] text-[#8C8C8C] mb-3">Leave unchanged to keep current files.</p>
                <div className="flex flex-col gap-2">
                  {DOC_ITEMS.map(({ field, icon, label }) => (
                    <EditDocRow
                      key={field}
                      field={field}
                      icon={icon}
                      label={label}
                      currentUrl={profile?.[field]}
                      uploadState={editDocStates[field]}
                      newFileName={editDocFileNames[field]}
                      onFileSelected={handleDocUpload}
                    />
                  ))}
                </div>
              </section>

              {/* Save error */}
              {saveError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                  <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#EF4444] font-medium">{saveError}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!isLoading && !isError && rider && (
          <div className="p-5 border-t border-[#EDEDED] shrink-0">

            {/* View mode actions */}
            {!isEditMode && (
              <>
                {(docStatus === "PENDING" || docStatus === "SUSPENDED") && (
                  <button
                    onClick={() => setConfirmAction("activate")}
                    disabled={!isOnline}
                    title={isOnline ? undefined : "No internet connection"}
                    className="w-full h-11 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Activate Rider
                  </button>
                )}
                {docStatus === "ACTIVE" && (
                  <button
                    onClick={() => setConfirmAction("suspend")}
                    disabled={!isOnline}
                    title={isOnline ? undefined : "No internet connection"}
                    className="w-full h-11 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <PauseCircle className="w-4 h-4" />
                    Suspend Rider
                  </button>
                )}
              </>
            )}

            {/* Edit mode actions */}
            {isEditMode && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditMode(false)}
                  disabled={isSaving}
                  className="flex-1 h-11 rounded-xl border border-[#D9D9D9] text-sm font-semibold text-[#5C5C5C] hover:bg-[#F9F9F9] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || anyDocUploading}
                  className="flex-1 h-11 rounded-xl bg-[#765AB8] text-white text-sm font-semibold hover:bg-[#654A9F] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : anyDocUploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                    : "Save Changes"
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RiderDetailModal
