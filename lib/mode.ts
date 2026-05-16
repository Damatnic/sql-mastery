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

// SSR-safe: false on first paint (matches server), corrected after mount.
export function useShowcase(): boolean {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    setSc(isShowcase());
  }, []);
  return sc;
}

export function useLearn(): boolean {
  const [learn, setLearn] = useState(false);
  useEffect(() => {
    setLearn(isLearn());
  }, []);
  return learn;
}
