// Site mode: "learn" locally (real tracker), "showcase" when deployed (frozen, all complete).
// NEXT_PUBLIC_LEARN_MODE=1 forces learn (e.g. a local prod build). Otherwise:
// ?mode= override (persisted) -> stored override -> hostname.
import { useEffect, useState } from "react";

export type SiteMode = "learn" | "showcase";

export function getSiteMode(): SiteMode {
  if (process.env.NEXT_PUBLIC_LEARN_MODE === "1") return "learn";
  if (typeof window === "undefined") return "showcase";
  try {
    const q = new URLSearchParams(window.location.search).get("mode");
    if (q === "learn" || q === "showcase") {
      try {
        localStorage.setItem("site-mode", q);
      } catch {
        /* private mode */
      }
      return q;
    }
    const stored = localStorage.getItem("site-mode");
    if (stored === "learn" || stored === "showcase") return stored;
  } catch {
    /* private mode */
  }
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h === "0.0.0.0" || h === "" || h === "[::1]") {
    return "learn";
  }
  return "showcase";
}

export function isShowcase(): boolean {
  return getSiteMode() === "showcase";
}

export function isLearn(): boolean {
  return getSiteMode() === "learn";
}

// Switch the site mode (persisted per-browser) and reload so every progress
// gate re-reads it. Used by the visible learn-mode toggle.
export function setSiteMode(mode: SiteMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("site-mode", mode);
    window.location.reload();
  } catch {
    // Private mode blocks localStorage; fall back to a URL param so the
    // choice still applies for this session. Use URLSearchParams to preserve
    // any other existing query params while replacing just the mode value.
    const params = new URLSearchParams(window.location.search);
    params.set("mode", mode);
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  }
}

// SSR-safe: false on first paint (matches server), corrected after mount.
export function useShowcase(): boolean {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mode is client-only, resolve after mount
    setSc(isShowcase());
  }, []);
  return sc;
}

export function useLearn(): boolean {
  const [learn, setLearn] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mode is client-only, resolve after mount
    setLearn(isLearn());
  }, []);
  return learn;
}
