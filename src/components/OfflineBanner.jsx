import { useState, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { WifiOff, Wifi } from "lucide-react"
import { useNetworkStatus } from "../hooks/useNetworkStatus"
import { merchantsApi } from "../features/merchants/merchantsApi"
import { ridersApi } from "../features/riders/ridersApi"

// ─── Duration formatter ───────────────────────────────────────────────────────

function useOfflineDuration(offlineSince, isOnline) {
  const [label, setLabel] = useState("")

  useEffect(() => {
    if (!offlineSince || isOnline) { setLabel(""); return }

    const tick = () => {
      const secs = Math.floor((Date.now() - offlineSince) / 1000)
      const m = Math.floor(secs / 60)
      const s = secs % 60
      setLabel(m > 0 ? `${m}m ${s}s` : `${s}s`)
    }

    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [offlineSince, isOnline])

  return label
}

// ─── OfflineBanner ────────────────────────────────────────────────────────────

const OfflineBanner = () => {
  const dispatch = useDispatch()
  const { isOnline, connectionRestored, offlineSince } = useNetworkStatus()
  const duration = useOfflineDuration(offlineSince, isOnline)

  // When the connection is first restored, refresh all cached data.
  const prevRestoredRef = useRef(false)
  useEffect(() => {
    if (connectionRestored && !prevRestoredRef.current) {
      dispatch(merchantsApi.util.invalidateTags(["Merchants"]))
      dispatch(ridersApi.util.invalidateTags(["Riders"]))
    }
    prevRestoredRef.current = connectionRestored
  }, [connectionRestored, dispatch])

  // ── Visibility / animation state ──────────────────────────────────────────
  // `shouldShow`  → the logical condition (render at all?)
  // `isSlid`      → drives the CSS transform (slide in / out)
  // We keep the element mounted briefly after shouldShow→false to let the
  // slide-out animation finish before removing from DOM.

  const shouldShow = !isOnline || connectionRestored
  const [mounted, setMounted]   = useState(false)
  const [isSlid,  setIsSlid]    = useState(false)
  const unmountTimerRef = useRef(null)

  useEffect(() => {
    clearTimeout(unmountTimerRef.current)

    if (shouldShow) {
      setMounted(true)
      // One frame delay lets the browser paint the element before animating.
      requestAnimationFrame(() => requestAnimationFrame(() => setIsSlid(true)))
    } else {
      setIsSlid(false)
      // Keep mounted until slide-out animation finishes (300ms).
      unmountTimerRef.current = setTimeout(() => setMounted(false), 350)
    }

    return () => clearTimeout(unmountTimerRef.current)
  }, [shouldShow])

  if (!mounted) return null

  const isRestored = isOnline && connectionRestored

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-[60] transition-transform duration-300 ease-in-out ${
        isSlid ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className={`flex items-center justify-center gap-2.5 px-4 py-2.5 text-white text-sm font-semibold transition-colors duration-500 ${
          isRestored ? "bg-[#16A34A]" : "bg-[#1A1A1A]"
        }`}
      >
        {isRestored ? (
          <>
            <Wifi className="w-4 h-4 shrink-0" />
            <span>Back online — refreshing data…</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              No internet connection
              {duration ? (
                <span className="ml-2 font-normal text-white/70">
                  · Offline for {duration}
                </span>
              ) : null}
            </span>
          </>
        )}
      </div>

      {/* Thin accent line at the bottom of the banner */}
      <div
        className={`h-0.5 w-full transition-colors duration-500 ${
          isRestored ? "bg-[#15803D]" : "bg-[#333333]"
        }`}
      />
    </div>
  )
}

export default OfflineBanner
