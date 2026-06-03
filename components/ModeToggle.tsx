"use client";

import { useLearn, setSiteMode } from "@/lib/mode";

// A visible switch into real learn mode. On the deployed site the default is
// showcase (frozen, nothing tracked); one click flips this browser into learn
// mode, where progress, XP, streak, and the review system all work. Locally
// (npm run dev) you are already in learn mode, so this just shows the status.
export default function ModeToggle() {
  const learn = useLearn();

  if (learn) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-success/40 text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
          learn mode on · progress saved in this browser
        </span>
        <button
          type="button"
          onClick={() => setSiteMode("showcase")}
          className="text-muted-foreground hover:text-foreground rounded px-1 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          reset to showcase
        </button>
      </div>
    );
  }

  return (
    <div className="rounded border border-accent/40 bg-accent/5 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        You are viewing the <span className="text-foreground">showcase</span>. Turn on learn mode to work the
        lessons for real and track your progress on this device.
      </p>
      <button
        type="button"
        onClick={() => setSiteMode("learn")}
        className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded border border-accent text-accent hover:bg-accent/10 transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span aria-hidden="true">▶</span> start learning · track my progress
      </button>
    </div>
  );
}
