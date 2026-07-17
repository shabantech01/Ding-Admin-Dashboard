import { useState, useRef } from "react"
import {
    X,
    RotateCcw,
    Camera,
    Upload,
    Check,
    IdCard,
    Car,
    FileBadge,
    UserRound,
} from "lucide-react"

const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 14; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
}

const documentTypes = [
    { key: "nationalId", label: "National ID / Passport", icon: IdCard },
    { key: "driversLicense", label: "Driver's License", icon: FileBadge },
    { key: "vehicleReg", label: "Vehicle Registration", icon: Car },
    { key: "profilePhoto", label: "Profile Photo", icon: UserRound },
]

const DocumentUploadRow = ({ docType, file, onUpload }) => {
    const cameraInputRef = useRef(null)
    const galleryInputRef = useRef(null)
    const Icon = docType.icon
    const isUploaded = !!file

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0]
        if (selected) onUpload(docType.key, selected)
    }

    return (
        <div
            className={`flex flex-col gap-3 p-4 rounded-xl border ${
                isUploaded
                    ? "bg-[#FEF1EE] border-[#FBD9CF]"
                    : "border-dashed border-[#D9D9D9] bg-white"
            }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-black shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#000000] truncate">
                            {docType.label}
                        </p>
                        {isUploaded ? (
                            <p className="flex items-center gap-1 text-xs font-medium text-[#16A34A]">
                                <Check className="w-3.5 h-3.5" />
                                Uploaded successfully
                            </p>
                        ) : (
                            <p className="text-xs text-[#8C8C8C]">Tap to upload</p>
                        )}
                    </div>
                </div>

                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FEE2E2] text-[#EF4444] shrink-0">
                    <Upload className="w-4 h-4" />
                </div>
            </div>

            {!isUploaded && (
                <div className="flex items-center gap-2">
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border border-[#D9D9D9] bg-white text-xs sm:text-sm font-semibold text-[#000000] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
                    >
                        <Camera className="w-4 h-4" />
                        Camera
                    </button>
                    <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border border-[#D9D9D9] bg-white text-xs sm:text-sm font-semibold text-[#000000] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
                    >
                        <Upload className="w-4 h-4" />
                        Gallery
                    </button>
                </div>
            )}
        </div>
    )
}

const AddDriverModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: generateRandomPassword(),
    })
    const [documents, setDocuments] = useState({
        nationalId: null,
        driversLicense: null,
        vehicleReg: null,
        profilePhoto: null,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

    const handleRegeneratePassword = () => {
        setFormData((prev) => ({ ...prev, password: generateRandomPassword() }))
    }

    const handleDocUpload = (key, file) => {
        setDocuments((prev) => ({ ...prev, [key]: file }))
    }

    const allDocsUploaded = Object.values(documents).every(Boolean)
    const isFormValid =
        formData.fullName.trim() &&
        formData.email.trim() &&
        formData.phone.trim() &&
        allDocsUploaded

    const handleSubmit = async () => {
        if (!isFormValid) return
        setIsSubmitting(true)
        try {
            // TODO: API call — driver create karna hai (multipart/form-data ke sath documents)
            await onSubmit({ ...formData, documents })
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-white rounded-2xl flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-[#EDEDED]">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#000000]">
                            Add New Driver
                        </h2>
                        <p className="text-xs sm:text-sm text-[#8C8C8C] mt-1">
                            Upload clear photos of the documents below. This keeps everyone safe on our platform.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex flex-col gap-5 p-5 sm:p-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#000000]">Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange("fullName")}
                            placeholder="Enter your full name"
                            className="w-full h-12 px-4 bg-[#F5F5F5] border border-transparent rounded-lg text-sm placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#765AB8] focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#000000]">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={handleChange("email")}
                            placeholder="Enter your email address"
                            className="w-full h-12 px-4 bg-[#F5F5F5] border border-transparent rounded-lg text-sm placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#765AB8] focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#000000]">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange("phone")}
                            placeholder="Enter your phone number"
                            className="w-full h-12 px-4 bg-[#F5F5F5] border border-transparent rounded-lg text-sm placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#765AB8] focus:bg-white transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#000000]">Generate Password</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.password}
                                readOnly
                                className="w-full h-12 pl-4 pr-12 bg-[#F5F5F5] rounded-lg text-sm text-[#5C5C5C] focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleRegeneratePassword}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#EDEDED] transition-colors cursor-pointer"
                                title="Generate new password"
                            >
                                <RotateCcw className="w-4 h-4 text-[#000000]" />
                            </button>
                        </div>
                    </div>

                    {/* Document uploads */}
                    <div className="flex flex-col gap-3 pt-2">
                        {documentTypes.map((docType) => (
                            <DocumentUploadRow
                                key={docType.key}
                                docType={docType}
                                file={documents[docType.key]}
                                onUpload={handleDocUpload}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 sm:p-6 border-t border-[#EDEDED]">
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className="w-full h-12 rounded-lg bg-[#765AB8] text-white text-sm sm:text-base font-semibold hover:bg-[#654A9F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        {isSubmitting ? "Adding Driver..." : "Add Driver"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddDriverModal