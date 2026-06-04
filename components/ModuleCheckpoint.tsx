'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCheckpoint, type CheckpointItem } from '@/lib/checkpoints';
import { useProgressStore } from '@/lib/progress';
import { useShowcase } from '@/lib/mode';

interface ModuleCheckpointProps {
  moduleSlug: string;
}

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase();

function McqBlock({
  item,
  index,
  onResolved,
}: {
  item: Extract<CheckpointItem, { kind: 'mcq' }>;
  index: number;
  onResolved: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = checked && picked === item.answer;

  return (
    <fieldset className="rounded border border-slate-800 bg-slate-900/40 p-4">
      <legend className="px-1 font-mono text-xs text-slate-500">question {index + 1}</legend>
      <p className="text-sm text-slate-100">{item.question}</p>
      <div role="radiogroup" aria-label={item.question} className="mt-3 space-y-2">
        {item.options.map((opt, i) => {
          const isPicked = picked === i;
          const showRight = checked && i === item.answer;
          const showWrong = checked && isPicked && i !== item.answer;
          return (
            <label
              key={i}
              className={`flex items-start gap-2 rounded border px-3 py-2 text-sm cursor-pointer transition-colors ${
                showRight
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                  : showWrong
                    ? 'border-rose-500/60 bg-rose-500/10 text-rose-200'
                    : isPicked
                      ? 'border-indigo-400/60 bg-indigo-400/10 text-slate-100'
                      : 'border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name={`mcq-${index}`}
                checked={isPicked}
                disabled={correct}
                onChange={() => setPicked(i)}
                className="mt-0.5 accent-indigo-400"
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={picked === null || correct}
          onClick={() => {
            setChecked(true);
            if (picked === item.answer) onResolved(true);
          }}
          className="px-3 py-1.5 rounded border border-indigo-400 text-indigo-300 text-xs font-mono hover:bg-indigo-400/10 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          check
        </button>
        {checked && (
          <span className={`font-mono text-xs ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
            {correct ? '✓ correct' : 'not quite, try again'}
          </span>
        )}
      </div>
      {checked && correct && (
        <p className="mt-2 font-mono text-xs text-slate-400">{item.explain}</p>
      )}
    </fieldset>
  );
}

function FillBlock({
  item,
  index,
  onResolved,
}: {
  item: Extract<CheckpointItem, { kind: 'fill' }>;
  index: number;
  onResolved: (correct: boolean) => void;
}) {
  const parts = useMemo(() => item.template.split('___'), [item.template]);
  const blankCount = parts.length - 1;
  const [vals, setVals] = useState<string[]>(() => Array(blankCount).fill(''));
  const [checked, setChecked] = useState(false);

  const allCorrect =
    checked &&
    vals.every((v, b) => item.answers[b].some((a) => norm(a) === norm(v)));

  return (
    <fieldset className="rounded border border-slate-800 bg-slate-900/40 p-4">
      <legend className="px-1 font-mono text-xs text-slate-500">fill in the blank · question {index + 1}</legend>
      <p className="text-sm text-slate-100">{item.prompt}</p>
      <pre className="mt-3 overflow-x-auto rounded bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
        {parts.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < blankCount && (
              <input
                aria-label={`blank ${i + 1}`}
                value={vals[i]}
                disabled={allCorrect}
                onChange={(e) => {
                  const next = [...vals];
                  next[i] = e.target.value;
                  setVals(next);
                  setChecked(false);
                }}
                className={`mx-1 inline-block w-28 rounded border bg-slate-900 px-2 py-0.5 text-slate-100 align-baseline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  checked
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
          disabled={vals.some((v) => !v.trim()) || allCorrect}
          onClick={() => {
            setChecked(true);
            if (vals.every((v, b) => item.answers[b].some((a) => norm(a) === norm(v)))) {
              onResolved(true);
            }
          }}
          className="px-3 py-1.5 rounded border border-indigo-400 text-indigo-300 text-xs font-mono hover:bg-indigo-400/10 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          check
        </button>
        {checked && (
          <span className={`font-mono text-xs ${allCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
            {allCorrect ? '✓ correct' : 'not quite, check the blank'}
          </span>
        )}
      </div>
      {checked && allCorrect && (
        <p className="mt-2 font-mono text-xs text-slate-400">{item.explain}</p>
      )}
    </fieldset>
  );
}

export default function ModuleCheckpoint({ moduleSlug }: ModuleCheckpointProps) {
  const items = useMemo(() => getCheckpoint(moduleSlug), [moduleSlug]);
  const showcase = useShowcase();
  const completeCheckpoint = useProgressStore((s) => s.completeCheckpoint);
  const alreadyDone = useProgressStore((s) => (s.completedCheckpoints ?? []).includes(moduleSlug));
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const firedRef = useRef(false);

  const allResolved = items.length > 0 && resolved.size === items.length;
  // `alreadyDone` is reactive from the store, so it flips true after we record.
  const done = alreadyDone;

  // Record completion in an effect, once (never during another render).
  useEffect(() => {
    if (allResolved && !showcase && !alreadyDone && !firedRef.current) {
      firedRef.current = true;
      completeCheckpoint(moduleSlug);
    }
  }, [allResolved, showcase, alreadyDone, moduleSlug, completeCheckpoint]);

  if (items.length === 0) return null;

  const onResolved = (i: number) => {
    setResolved((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  };

  return (
    <section id="checkpoint" className="scroll-mt-32 pt-2">
      <div className="rounded-lg border border-indigo-400/30 bg-indigo-400/[0.04] p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-indigo-300"># module checkpoint</p>
          <span className="font-mono text-xs text-slate-500">
            {resolved.size}/{items.length} correct
          </span>
        </div>
        <p className="mt-1 mb-4 text-sm text-slate-300">
          Quick check that this module stuck. Answer each one to finish the checkpoint.
        </p>

        <div className="space-y-4">
          {items.map((item, i) =>
            item.kind === 'mcq' ? (
              <McqBlock key={i} item={item} index={i} onResolved={() => onResolved(i)} />
            ) : (
              <FillBlock key={i} item={item} index={i} onResolved={() => onResolved(i)} />
            ),
          )}
        </div>

        {allResolved && (
          <p className="mt-4 font-mono text-xs text-emerald-400">
            ✓ checkpoint cleared
            {!showcase && (done ? ' · added to your spaced review' : '')}
            {showcase && ' · (progress tracked on the local learn site)'}
          </p>
        )}
      </div>
    </section>
  );
}
