import { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Upload,
  Check,
  IdCard,
  Car,
  FileBadge,
  UserRound,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  useGetUploadUrlMutation,
  useCreateRiderMutation,
} from "../features/riders/ridersApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const S3_FOLDERS = {
  nationalId: "rider/National-ID-Passport",
  driversLicense: "rider/Driver-License",
  vehicleReg: "rider/Vehicle-Registration",
  profilePhoto: "rider/Profile-Photo",
};

const PAYLOAD_URL_KEYS = {
  nationalId: "nationalIdUrl",
  driversLicense: "driversLicenseUrl",
  vehicleReg: "vehicleRegistrationUrl",
  profilePhoto: "profilePhotoUrl",
};

const documentTypes = [
  { key: "nationalId", label: "National ID / Passport", icon: IdCard },
  { key: "driversLicense", label: "Driver's License", icon: FileBadge },
  { key: "vehicleReg", label: "Vehicle Registration", icon: Car },
  { key: "profilePhoto", label: "Profile Photo", icon: UserRound },
];

const ACCEPTED = "image/jpeg,image/png,application/pdf";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getContentType = (file) => {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop().toLowerCase();
  return (
    {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      pdf: "application/pdf",
    }[ext] ?? "application/octet-stream"
  );
};

const getFileExt = (file) => file.name.split(".").pop().toLowerCase();

// ─── DocumentUploadRow ────────────────────────────────────────────────────────

const DocumentUploadRow = ({
  docType,
  uploadState,
  fileName,
  onFileSelected,
}) => {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const Icon = docType.icon;

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(docType.key, file);
    e.target.value = "";
  };

  const isDone = uploadState === "done";
  const isUploading = uploadState === "uploading";
  const isError = uploadState === "error";
  const isIdle = uploadState === "idle";

  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-xl border transition-colors ${
        isDone
          ? "bg-[#F0FDF4] border-[#BBF7D0]"
          : isError
            ? "bg-[#FEF2F2] border-[#FECACA]"
            : isUploading
              ? "bg-[#FAF5FF] border-[#E9D5FF]"
              : "border-dashed border-[#D9D9D9] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-lg shrink-0 ${
              isDone
                ? "bg-[#16A34A]"
                : isError
                  ? "bg-[#EF4444]"
                  : isUploading
                    ? "bg-[#765AB8]"
                    : "bg-black"
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Icon className="w-5 h-5 text-white" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#000000] truncate">
              {docType.label}
            </p>
            {isDone && (
              <p className="flex items-center gap-1 text-xs font-medium text-[#16A34A]">
                <Check className="w-3.5 h-3.5" />
                {fileName}
              </p>
            )}
            {isUploading && (
              <p className="text-xs font-medium text-[#765AB8]">
                Uploading to S3…
              </p>
            )}
            {isError && (
              <p className="flex items-center gap-1 text-xs font-medium text-[#EF4444]">
                <AlertCircle className="w-3.5 h-3.5" />
                Upload failed — try again
              </p>
            )}
            {isIdle && (
              <p className="text-xs text-[#8C8C8C]">JPG, PNG or PDF accepted</p>
            )}
          </div>
        </div>

        {(isDone || isError) && !isUploading && (
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            title="Replace file"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-[#8C8C8C]" />
          </button>
        )}
      </div>

      {(isIdle || isError) && !isUploading && (
        <div className="flex items-center gap-2">
          <input
            ref={cameraRef}
            type="file"
            accept={ACCEPTED}
            capture="environment"
            onChange={handleChange}
            className="hidden"
          />
          <input
            ref={galleryRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border border-[#D9D9D9] bg-white text-xs font-semibold text-[#000000] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border border-[#D9D9D9] bg-white text-xs font-semibold text-[#000000] hover:bg-[#F9F9F9] transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Gallery
          </button>
        </div>
      )}

      {/* Hidden replace input (shown via RotateCcw button on done state) */}
      {isDone && (
        <input
          ref={galleryRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleChange}
          className="hidden"
        />
      )}
    </div>
  );
};

// ─── AddDriverModal ───────────────────────────────────────────────────────────

const AddDriverModal = ({ onClose, onSuccess }) => {
  const [getUploadUrl] = useGetUploadUrlMutation();
  const [createRider] = useCreateRiderMutation();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadStates, setUploadStates] = useState({
    nationalId: "idle",
    driversLicense: "idle",
    vehicleReg: "idle",
    profilePhoto: "idle",
  });
  const [fileNames, setFileNames] = useState({
    nationalId: "",
    driversLicense: "",
    vehicleReg: "",
    profilePhoto: "",
  });
  const [s3Keys, setS3Keys] = useState({
    nationalId: null,
    driversLicense: null,
    vehicleReg: null,
    profilePhoto: null,
  });

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Upload a single file to S3 via presigned URL ──────────────────────────

  const uploadFile = async (docKey, file) => {
    setUploadStates((prev) => ({ ...prev, [docKey]: "uploading" }));
    setFileNames((prev) => ({ ...prev, [docKey]: file.name }));
    setS3Keys((prev) => ({ ...prev, [docKey]: null }));

    try {
      const contentType = getContentType(file);
      const ext = getFileExt(file);
      const key = `${S3_FOLDERS[docKey]}/${crypto.randomUUID()}.${ext}`;

      const result = await getUploadUrl({ key, contentType }).unwrap();
      const { uploadUrl, key: returnedKey } = result.data;

      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": contentType },
      });

      if (!s3Res.ok) throw new Error("S3 upload failed");

      setS3Keys((prev) => ({ ...prev, [docKey]: returnedKey }));
      setUploadStates((prev) => ({ ...prev, [docKey]: "done" }));
    } catch {
      setUploadStates((prev) => ({ ...prev, [docKey]: "error" }));
      setFileNames((prev) => ({ ...prev, [docKey]: "" }));
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const allDocsReady = Object.values(uploadStates).every((s) => s === "done");
  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    allDocsReady;

  // ── Submit — all files already uploaded, just POST rider ──────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!allDocsReady) return;
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const urlPayload = Object.fromEntries(
        documentTypes.map(({ key }) => [PAYLOAD_URL_KEYS[key], s3Keys[key]]),
      );

      await createRider({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        ...urlPayload,
      }).unwrap();

      setIsVisible(false);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 300);
    } catch (err) {
      const msg =
        err?.data?.message ??
        err?.data?.error ??
        "Failed to create rider. Please try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const anyUploading = Object.values(uploadStates).some(
    (s) => s === "uploading",
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md h-full bg-white rounded-l-2xl flex flex-col transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-[#EDEDED]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#000000]!">
              Add New Driver
            </h2>
            <p className="text-xs sm:text-sm text-[#8C8C8C] mt-1">
              Fill in the rider's details and upload all required documents.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#8C8C8C] hover:text-[#000000] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5 sm:p-6 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Text fields */}
          {[
            {
              field: "fullName",
              label: "Full Name",
              type: "text",
              placeholder: "e.g. John Doe",
            },
            {
              field: "email",
              label: "Email Address",
              type: "email",
              placeholder: "Enter email address",
            },
            {
              field: "phone",
              label: "Phone Number",
              type: "tel",
              placeholder: "e.g. +27123456789",
            },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field} className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#000000]">
                {label}
              </label>
              <input
                type={type}
                value={formData[field]}
                onChange={handleChange(field)}
                placeholder={placeholder}
                className={`w-full h-12 px-4 rounded-lg text-sm placeholder:text-[#A3A3A3] focus:outline-none transition-colors ${
                  formErrors[field]
                    ? "bg-[#FEF2F2] border border-[#FECACA] focus:border-[#EF4444]"
                    : "bg-[#F5F5F5] border border-transparent focus:border-[#765AB8] focus:bg-white"
                }`}
              />
              {formErrors[field] && (
                <p className="text-xs text-[#EF4444] font-medium pl-1">
                  {formErrors[field]}
                </p>
              )}
            </div>
          ))}

          {/* Document uploads */}
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#000000]">Documents</p>
              <p className="text-xs text-[#8C8C8C]">
                {Object.values(uploadStates).filter((s) => s === "done").length}{" "}
                / 4 uploaded
              </p>
            </div>

            {documentTypes.map((docType) => (
              <DocumentUploadRow
                key={docType.key}
                docType={docType}
                uploadState={uploadStates[docType.key]}
                fileName={fileNames[docType.key]}
                onFileSelected={uploadFile}
              />
            ))}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <p className="text-xs text-[#EF4444] font-medium">
                {submitError}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-[#EDEDED] flex flex-col gap-3">
          {!allDocsReady && (
            <p className="text-xs text-center text-[#8C8C8C]">
              {anyUploading
                ? "Waiting for uploads to complete…"
                : "All 4 documents must be uploaded before submitting"}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || anyUploading}
            className="w-full h-12 rounded-lg bg-[#765AB8] text-white text-sm font-semibold hover:bg-[#654A9F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating rider…
              </>
            ) : (
              "Add Driver"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDriverModal;
