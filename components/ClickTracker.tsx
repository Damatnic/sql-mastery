"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSession(): { id: string; startedAt: number } {
  const key = "dama_session";
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(key);
  } catch {}
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  const session = { id: crypto.randomUUID(), startedAt: Date.now() };
  try {
    sessionStorage.setItem(key, JSON.stringify(session));
  } catch {}
  return session;
}

function postEvent(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    const endpoint = "https://damato-data.vercel.app/api/track";
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

function classifyHref(href: string, host: string) {
  if (!href || href.startsWith("#")) return "anchor";
  if (href.startsWith("mailto:")) return "mailto";
  if (href.startsWith("tel:")) return "tel";
  try {
    return new URL(href, `https://${host}`).hostname === host ? "internal" : "external";
  } catch {
    return "unknown";
  }
}

export function ClickTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const referrer = useRef<string | null>(null);

  useEffect(() => {
    referrer.current = document.referrer || null;
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const full = pathname + (window.location.search ?? "");
    if (lastPath.current === full) return;
    const session = getOrCreateSession();
    const first = lastPath.current === null;
    lastPath.current = full;
    postEvent({
      type: "pageview", path: full, referrer: first ? referrer.current : null,
      sessionId: session.id, sessionStart: session.startedAt, ts: Date.now(),
    });
  }, [pathname]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href) return;
      const label = (anchor.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
      const session = getOrCreateSession();
      postEvent({
        type: "click", href, label, kind: classifyHref(href, window.location.hostname),
        path: window.location.pathname, target: anchor.getAttribute("target") ?? "_self",
        sessionId: session.id, ts: Date.now(),
      });
    }
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, []);

  return null;
}
