import { useState, useEffect, useRef, useCallback } from "react"

const PROBE_INTERVAL_ONLINE  = 15_000  // check every 15s while online
const PROBE_INTERVAL_OFFLINE =  5_000  // check every 5s while offline (faster reconnect)
const PROBE_TIMEOUT          =  5_000  // abort probe after 5s
const RESTORED_TTL           =  3_000  // show "back online" badge for 3s

// Google's connectivity check endpoint — returns HTTP 204, no body, CDN-distributed.
// Same URL Android uses for captive portal / connectivity detection.
// We probe this rather than our API root because:
//   1. It reliably returns 2xx → no console ERR_ABORTED noise
//   2. The banner is about INTERNET loss; API-specific errors are handled by RTK Query
const PROBE_URL = "https://www.gstatic.com/generate_204"

async function probeConnectivity() {
  const ctrl = new AbortController()
  const tid  = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT)
  try {
    // no-cors: no preflight, opaque response is fine — we only care whether
    // the fetch resolves (network up) or throws (network down / timeout).
    await fetch(PROBE_URL, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: ctrl.signal,
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(tid)
  }
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline]                   = useState(navigator.onLine)
  const [connectionRestored, setConnectionRestored] = useState(false)
  const [offlineSince, setOfflineSince]             = useState(null)

  // Refs let timer callbacks read current state without stale closures.
  const onlineRef       = useRef(navigator.onLine)
  const probingRef      = useRef(false)
  const probeTimerRef   = useRef(null)
  const restoredTimerRef = useRef(null)

  const markOnline = useCallback(() => {
    if (onlineRef.current) return
    onlineRef.current = true
    setIsOnline(true)
    setOfflineSince(null)
    setConnectionRestored(true)
    clearTimeout(restoredTimerRef.current)
    restoredTimerRef.current = setTimeout(
      () => setConnectionRestored(false),
      RESTORED_TTL
    )
  }, [])

  const markOffline = useCallback(() => {
    if (!onlineRef.current) return
    onlineRef.current = false
    setIsOnline(false)
    setOfflineSince(Date.now())
    setConnectionRestored(false)
  }, [])

  // Schedules a probe after `delay` ms, then re-schedules itself.
  const scheduleProbe = useCallback(
    (delay = PROBE_INTERVAL_ONLINE) => {
      clearTimeout(probeTimerRef.current)
      probeTimerRef.current = setTimeout(async () => {
        if (!probingRef.current) {
          probingRef.current = true
          const ok = await probeConnectivity()
          probingRef.current = false
          if (ok) markOnline(); else markOffline()
        }
        scheduleProbe(onlineRef.current ? PROBE_INTERVAL_ONLINE : PROBE_INTERVAL_OFFLINE)
      }, delay)
    },
    [markOnline, markOffline]
  )

  useEffect(() => {
    // Browser's offline event is highly reliable — trust it immediately.
    const onOffline = () => {
      markOffline()
      scheduleProbe(PROBE_INTERVAL_OFFLINE)
    }

    // Browser's online event is unreliable (fires on local-only network too),
    // so we use it only to trigger an immediate probe rather than trusting it.
    const onOnline = () => scheduleProbe(0)

    window.addEventListener("offline", onOffline)
    window.addEventListener("online",  onOnline)

    // Kick off the steady-state probe loop.
    scheduleProbe(PROBE_INTERVAL_ONLINE)

    return () => {
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("online",  onOnline)
      clearTimeout(probeTimerRef.current)
      clearTimeout(restoredTimerRef.current)
    }
  }, [scheduleProbe, markOffline])

  return { isOnline, connectionRestored, offlineSince }
}
