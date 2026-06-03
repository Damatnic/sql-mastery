"use client";

import { useLearn } from "@/lib/mode";

// The deployed site is a frozen showcase (a portfolio piece): this renders
// nothing there, so visitors see a clean, finished product with no learning
// chrome to poke at. Locally (npm run dev / the .command launchers) the site
// runs in learn mode, where this shows a quiet confirmation that progress is
// being saved. Real learning happens on the local copy, not the live one.
export default function ModeToggle() {
  const learn = useLearn();

  if (!learn) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-success/40 text-success text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
      learn mode · your progress is saving in this browser
    </span>
  );
}
