"use client";

import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-mono text-sm">
      <section className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <p>
          <span className="text-indigo-400">damato@sql</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-500">~$</span> <span>./app</span>
        </p>

        <p className="mt-4 text-rose-400">
          error: {error.message || "something went wrong"}
        </p>

        {error.digest && (
          <p className="mt-1 text-xs text-slate-500">digest: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-3 py-2 rounded border border-slate-800 hover:border-indigo-400 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="text-indigo-400">$</span> retry
          </button>
          <Link
            href="/"
            className="px-3 py-2 rounded border border-slate-800 hover:border-indigo-400 hover:text-indigo-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="text-indigo-400">→</span> back to ~
          </Link>
        </div>

        <p className="mt-10">
          <span className="text-indigo-400">damato@sql</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-500">~$</span>{" "}
          <span className="ml-1 inline-block w-2 h-4 align-text-bottom bg-slate-100 terminal-cursor" aria-hidden="true" />
        </p>
      </section>

      <footer className="border-t border-slate-800/60 py-5 text-xs">
        <div className="max-w-3xl mx-auto px-6 text-slate-500">
          <span className="text-rose-400">exit 1</span> · unexpected runtime error
        </div>
      </footer>
    </main>
  );
}
