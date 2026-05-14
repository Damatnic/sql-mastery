"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const target = pathname && pathname !== "/" ? pathname : "/the-page";

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-mono text-sm">
      <section className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <p>
          <span className="text-indigo-400">damato@sql</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-500">~$</span>{" "}
          <span>cd {target}</span>
        </p>
        <p className="mt-2 text-rose-400">
          bash: cd: {target}: No such file or directory
        </p>

        <p className="mt-8">
          <span className="text-indigo-400">damato@sql</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-500">~$</span>{" "}
          <span>cd ~</span>
          <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-3 py-2 rounded border border-slate-800 hover:border-indigo-400 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span className="text-indigo-400">→</span> back to ~
        </Link>
      </section>

      <footer className="border-t border-slate-800/60 py-5 text-xs">
        <div className="max-w-3xl mx-auto px-6 text-slate-500">
          <span className="text-rose-400">exit 1</span> · path not found
        </div>
      </footer>
    </main>
  );
}
