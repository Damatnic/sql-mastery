'use client';

import { useMemo, useState } from 'react';
import { getYourTurn } from '@/lib/yourturn';
import type { FillItem } from '@/lib/checkpoints';

interface YourTurnProps {
  moduleSlug: string;
  lessonSlug: string;
}

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase();

function FillCard({ item, index }: { item: FillItem; index: number }) {
  const parts = useMemo(() => item.template.split('___'), [item.template]);
  const blankCount = parts.length - 1;
  const [vals, setVals] = useState<string[]>(() => Array(blankCount).fill(''));
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const correct = checked && vals.every((v, b) => item.answers[b].some((a) => norm(a) === norm(v)));
  const solved = correct || revealed;

  return (
    <div className="rounded border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-sm text-slate-100">
        <span className="font-mono text-xs text-indigo-300">your turn{blankCount > 1 ? ` (${index + 1})` : ''} · </span>
        {item.prompt}
      </p>
      <pre className="mt-3 overflow-x-auto rounded bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
        {parts.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < blankCount && (
              <input
                aria-label={`blank ${i + 1}`}
                value={revealed ? item.answers[i][0] : vals[i]}
                disabled={solved}
                onChange={(e) => {
                  const next = [...vals];
                  next[i] = e.target.value;
                  setVals(next);
                  setChecked(false);
                }}
                className={`mx-1 inline-block w-28 rounded border bg-slate-900 px-2 py-0.5 text-slate-100 align-baseline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  revealed
                    ? 'border-amber-400/60'
                    : checked
                      ? item.answers[i].some((a) => norm(a) === norm(vals[i]))
                        ? 'border-emerald-500/60'
                        : 'border-rose-500/60'
                      : 'border-slate-700'
                }`}
              />
            )}
          </span>
        ))}
      </pre>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={vals.some((v) => !v.trim()) || solved}
          onClick={() => setChecked(true)}
          className="px-3 py-1.5 rounded border border-indigo-400 text-indigo-300 text-xs font-mono hover:bg-indigo-400/10 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          check
        </button>
        {!solved && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="px-3 py-1.5 rounded border border-slate-700 text-slate-400 text-xs font-mono hover:text-slate-200 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            show answer
          </button>
        )}
        {checked && !revealed && (
          <span className={`font-mono text-xs ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
            {correct ? '✓ nice' : 'not quite, try again or reveal'}
          </span>
        )}
        {revealed && <span className="font-mono text-xs text-amber-400">answer shown</span>}
      </div>
      {solved && <p className="mt-2 font-mono text-xs text-slate-400">{item.explain}</p>}
    </div>
  );
}

export default function YourTurn({ moduleSlug, lessonSlug }: YourTurnProps) {
  const items = useMemo(() => getYourTurn(moduleSlug, lessonSlug), [moduleSlug, lessonSlug]);
  if (items.length === 0) return null;

  return (
    <section id="your-turn" className="scroll-mt-32">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3"># your turn</p>
      <p className="mb-3 text-xs text-slate-500">
        You read the examples. Now finish the query yourself before the full challenges. Stuck? reveal the answer.
      </p>
      <div className="space-y-4">
        {items.map((item, i) => (
          <FillCard key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
