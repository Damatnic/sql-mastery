// Site mode is deliberately airtight, because the deployed site is a portfolio
// piece that must stay a frozen showcase:
//   - deployed (any real domain)  -> "showcase" (frozen, all complete, no tracking)
//   - localhost                   -> "learn"    (real progress tracking)
//   - NEXT_PUBLIC_LEARN_MODE=1     -> "learn"    (for a local production build)
// There is no URL or localStorage override, so nothing a visitor does on the
// live site can flip it out of showcase. You learn on the local copy.
import { useEffect, useState } from "react";

export type SiteMode = "learn" | "showcase";

export function getSiteMode(): SiteMode {
  if (process.env.NEXT_PUBLIC_LEARN_MODE === "1") return "learn";
  if (typeof window === "undefined") return "showcase";
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
