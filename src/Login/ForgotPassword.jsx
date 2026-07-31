import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { InputField } from "../components/InputField";
import {
  useSendResetOtpMutation,
  useVerifyResetOtpMutation,
  useConfirmPasswordResetMutation,
} from "../features/auth/authApi";

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = ["email", "otp", "password"];

const STEP_LABELS = {
  email: {
    title: "Reset Password",
    subtitle: "Enter your admin email to receive a one-time code",
  },
  otp: { title: "Enter Code", subtitle: null }, // subtitle is dynamic
  password: {
    title: "New Password",
    subtitle: "Choose a strong password for your account",
  },
};

// ─── OTP segmented input ──────────────────────────────────────────────────────

const OtpInput = ({ value, onChange, hasError, disabled }) => {
  const refs = useRef([]);

  // Auto-focus first box when rendered
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (value[index]) {
        const next = [...value];
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        const next = [...value];
        next[index - 1] = "";
        onChange(next);
        refs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = Array(6)
      .fill("")
      .map((_, i) => pasted[i] ?? "");
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all select-none disabled:opacity-50 ${
            hasError
              ? "border-red-300 bg-red-50 text-red-600"
              : digit
                ? "border-[#765AB8] bg-purple-50 text-[#765AB8]"
                : "border-gray-200 bg-gray-50 text-gray-900 focus:border-[#765AB8] focus:bg-white"
          }`}
        />
      ))}
    </div>
  );
};

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_SHORT_LABELS = ["Enter Mail", "Verify OTP", "Reset Password"];

const StepIndicator = ({ currentStep }) => {
  const idx = STEPS.indexOf(currentStep);
  const progress = (idx / (STEPS.length - 1)) * 100;

  return (
    <div className="relative w-full flex items-start justify-between mb-8">
      {/* Track */}
      <div className="absolute top-[18px] left-[18px] right-[18px] h-[2px] bg-gray-200 z-0">
        <div
          className="h-full bg-[#765AB8] transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s} className="flex flex-col items-center relative z-10">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                done
                  ? "bg-[#765AB8] text-white shadow-sm scale-100"
                  : active
                    ? "bg-[#765AB8] text-white shadow-md scale-110 ring-4 ring-[#765AB8]/15"
                    : "bg-gray-100 text-gray-400 border border-gray-200 scale-100"
              }`}
            >
              {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-[11px] font-semibold mt-2.5 transition-colors duration-500 text-center whitespace-nowrap ${
                active || done ? "text-[#765AB8]" : "text-gray-400"
              }`}
            >
              {STEP_SHORT_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── ForgotPassword ───────────────────────────────────────────────────────────

const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [errors, setErrors] = useState({});
  const [rootError, setRootError] = useState("");

  const [sendOtp, { isLoading: isSending }] = useSendResetOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyResetOtpMutation();
  const [confirmReset, { isLoading: isConfirming }] =
    useConfirmPasswordResetMutation();

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const fmtTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const clearErrors = () => {
    setErrors({});
    setRootError("");
  };

  const goBack = () => {
    clearErrors();
    if (step === "email") return onBack();
    if (step === "otp") return setStep("email");
    if (step === "password") return setStep("otp");
  };

  // ── Step 1: send OTP ──────────────────────────────────────────────────────

  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearErrors();
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }

    try {
      const res = await sendOtp(email.trim()).unwrap();
      setTimeLeft(res.data.expiresIn ?? 300);
      setOtp(Array(6).fill(""));
      setStep("otp");
    } catch (err) {
      setRootError(
        err?.data?.message ??
          err?.data?.error ??
          "Failed to send code. Please try again.",
      );
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearErrors();
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      setErrors({ otp: "Please enter all 6 digits" });
      return;
    }

    try {
      const res = await verifyOtp({ email, otp: otpStr }).unwrap();
      setResetToken(res.data.resetToken);
      setNewPassword("");
      setConfirmPwd("");
      setStep("password");
    } catch (err) {
      setErrors({
        otp: err?.data?.message ?? "Invalid or expired code. Please try again.",
      });
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const handleResend = async () => {
    clearErrors();
    setOtp(Array(6).fill(""));
    try {
      const res = await sendOtp(email.trim()).unwrap();
      setTimeLeft(res.data.expiresIn ?? 300);
    } catch (err) {
      setRootError(err?.data?.message ?? "Failed to resend code.");
    }
  };

  // ── Step 3: confirm new password ──────────────────────────────────────────

  const handleConfirm = async (e) => {
    e.preventDefault();
    clearErrors();
    const errs = {};
    if (!newPassword) errs.newPassword = "Password is required";
    else if (newPassword.length < 6)
      errs.newPassword = "Password must be at least 6 characters";
    if (!confirmPwd) errs.confirmPwd = "Please confirm your password";
    else if (newPassword !== confirmPwd)
      errs.confirmPwd = "Passwords do not match";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      await confirmReset({ resetToken, newPassword }).unwrap();
      setStep("success");
    } catch (err) {
      setRootError(
        err?.data?.message ??
          "Reset failed — the code may have expired. Please start over.",
      );
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div
        className="text-center py-2"
        style={{
          animation: "fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-[22px] font-bold text-gray-900! mb-2">
          Password Reset!
        </h2>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          Your password has been updated. You can now sign in with your new
          credentials.
        </p>
        <button
          onClick={onBack}
          className="w-full py-4 mt-8 text-white text-[15px] font-semibold rounded-lg bg-[#765AB8] hover:opacity-90 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    );
  }

  // ── Shared layout for steps 1–3 ───────────────────────────────────────────

  const cfg = STEP_LABELS[step];

  return (
    <div
      key={step}
      style={{
        animation: "fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-start gap-3 mb-5">
        <button
          onClick={goBack}
          className="mt-1 w-auto h-8 flex items-center justify-center gap-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shrink-0 px-4 pl-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div>
          <h4 className="text-[26px] font-bold text-black leading-tight">
            {cfg.title}
          </h4>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {step === "otp" ? (
              <>
                Code sent to{" "}
                <span className="font-semibold text-gray-600">{email}</span>
              </>
            ) : (
              cfg.subtitle
            )}
          </p>
        </div>
      </div>

      <StepIndicator currentStep={step} />

      {/* Root error */}
      {rootError && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{rootError}</span>
        </div>
      )}

      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <form onSubmit={handleSendOtp} noValidate>
          <InputField
            label="Email Address"
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="Enter your admin email"
            required
          />
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-4 text-white text-[15px] font-semibold rounded-lg bg-[#765AB8] hover:opacity-90 hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending…
              </>
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <form
          onSubmit={handleVerifyOtp}
          noValidate
          className="flex flex-col gap-5"
        >
          <OtpInput
            value={otp}
            onChange={setOtp}
            hasError={!!errors.otp}
            disabled={isVerifying}
          />

          {errors.otp && (
            <p className="text-center text-xs text-red-500 font-medium -mt-2">
              {errors.otp}
            </p>
          )}

          {/* Timer / resend */}
          <div className="flex justify-center">
            {timeLeft > 0 ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#765AB8] animate-pulse" />
                <span className="text-[13px] text-gray-600 font-medium">
                  Expires in{" "}
                  <span className="font-bold text-[#765AB8]">
                    {fmtTime(timeLeft)}
                  </span>
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSending}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#765AB8] hover:underline disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {isSending ? "Resending…" : "Resend Code"}
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.join("").length < 6}
            className="w-full py-4 text-white text-[15px] font-semibold rounded-lg bg-[#765AB8] hover:opacity-90 hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
              </>
            ) : (
              "Verify Code"
            )}
          </button>
        </form>
      )}

      {/* ── Step 3: New password ── */}
      {step === "password" && (
        <form onSubmit={handleConfirm} noValidate>
          <InputField
            label="New Password"
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            placeholder="Min. 6 characters"
            required
          />
          <InputField
            label="Confirm Password"
            id="confirm-password"
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            error={errors.confirmPwd}
            placeholder="Re-enter your new password"
            required
          />
          <button
            type="submit"
            disabled={isConfirming}
            className="w-full py-4 text-white text-[15px] font-semibold rounded-lg bg-[#765AB8] hover:opacity-90 hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Resetting…
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
