'use client';

import { useEffect, useRef, useState } from 'react';
import { MODULE_CHECKPOINTS, type CheckpointItem } from '@/lib/checkpoints';
import { useProgressStore, isLessonDue, checkpointKey } from '@/lib/progress';
import { useShowcase } from '@/lib/mode';

// Gentle pop-quiz tuning. Adjust these to dial frequency up or down.
const POP_PROBABILITY = 0.25; // ~1 in 4 lesson completions
const COOLDOWN_TRIGGERS = 3; // skip this many completions after one fires
const DUE_ONLY = true; // only pop a question whose module checkpoint is due for review

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase();

interface Picked {
  moduleSlug: string;
  item: CheckpointItem;
}

export default function PopQuiz() {
  const showcase = useShowcase();
  const completedCheckpoints = useProgressStore((s) => s.completedCheckpoints ?? []);
  const reviewedAt = useProgressStore((s) => s.reviewedAt);
  const markReviewed = useProgressStore((s) => s.markReviewed);

  const [picked, setPicked] = useState<Picked | null>(null);
  const cooldownRef = useRef(0);
  // Read the latest store values inside the event handler without re-binding.
  const stateRef = useRef({ completedCheckpoints, reviewedAt });
  useEffect(() => {
    stateRef.current = { completedCheckpoints, reviewedAt };
  }, [completedCheckpoints, reviewedAt]);

  useEffect(() => {
    if (showcase) return;

    const onLessonCompleted = () => {
      if (picked) return; // one at a time
      if (cooldownRef.current > 0) {
        cooldownRef.current -= 1;
        return;
      }
      if (Math.random() > POP_PROBABILITY) return;

      const { completedCheckpoints: done, reviewedAt: rv } = stateRef.current;
      const eligibleModules = done.filter(
        (m) => MODULE_CHECKPOINTS[m] && (!DUE_ONLY || isLessonDue(checkpointKey(m), rv)),
      );
      if (eligibleModules.length === 0) return;

      const mod = eligibleModules[Math.floor(Math.random() * eligibleModules.length)];
      const items = MODULE_CHECKPOINTS[mod];
      const item = items[Math.floor(Math.random() * items.length)];
      setPicked({ moduleSlug: mod, item });
      cooldownRef.current = COOLDOWN_TRIGGERS;
    };

    window.addEventListener('lesson-completed', onLessonCompleted);
    return () => window.removeEventListener('lesson-completed', onLessonCompleted);
  }, [showcase, picked]);

  if (showcase || !picked) return null;

  return (
    <PopCard
      picked={picked}
      onClose={() => setPicked(null)}
      onCorrect={() => markReviewed(checkpointKey(picked.moduleSlug))}
    />
  );
}

function PopCard({
  picked,
  onClose,
  onCorrect,
}: {
  picked: Picked;
  onClose: () => void;
  onCorrect: () => void;
}) {
  const { item } = picked;
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [fillVal, setFillVal] = useState('');
  const [checked, setChecked] = useState(false);

  const mcq = item.kind === 'mcq' ? item : null;
  const fill = item.kind === 'fill' ? item : null;
  // Pop quiz keeps fill-ins to a single blank for a quick check.
  const fillAccepted = fill ? fill.answers[0] : [];

  const correct = checked && (mcq ? pickedIdx === mcq.answer : fillAccepted.some((a) => norm(a) === norm(fillVal)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="pop quiz, quick recall check"
      className="fixed bottom-4 right-4 z-[55] w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-indigo-400/40 bg-slate-900 shadow-2xl font-mono"
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <span className="text-xs text-indigo-300">pop quiz · quick check</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="dismiss pop quiz"
          className="text-slate-500 hover:text-slate-200 text-xs px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
        >
          ✕
        </button>
      </div>
      <div className="p-3">
        {mcq && (
          <>
            <p className="text-sm text-slate-100">{mcq.question}</p>
            <div role="radiogroup" aria-label={mcq.question} className="mt-2 space-y-1.5">
              {mcq.options.map((opt, i) => {
                const showRight = checked && i === mcq.answer;
                const showWrong = checked && pickedIdx === i && i !== mcq.answer;
                return (
                  <label
                    key={i}
                    className={`flex items-start gap-2 rounded border px-2 py-1.5 text-xs cursor-pointer ${
                      showRight
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                        : showWrong
                          ? 'border-rose-500/60 bg-rose-500/10 text-rose-200'
                          : pickedIdx === i
                            ? 'border-indigo-400/60 text-slate-100'
                            : 'border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="popquiz"
                      checked={pickedIdx === i}
                      disabled={correct}
                      onChange={() => setPickedIdx(i)}
                      className="mt-0.5 accent-indigo-400"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </>
        )}
        {fill && (
          <>
            <p className="text-sm text-slate-100">{fill.prompt}</p>
            <pre className="mt-2 overflow-x-auto rounded bg-slate-950 border border-slate-800 p-2 text-xs text-slate-300 whitespace-pre-wrap">
              {fill.template.split('___')[0]}
              <input
                aria-label="fill the blank"
                value={fillVal}
                disabled={correct}
                onChange={(e) => {
                  setFillVal(e.target.value);
                  setChecked(false);
                }}
                className={`mx-1 inline-block w-24 rounded border bg-slate-900 px-1.5 py-0.5 text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  checked ? (correct ? 'border-emerald-500/60' : 'border-rose-500/60') : 'border-slate-700'
                }`}
              />
              {fill.template.split('___').slice(1).join('___')}
            </pre>
          </>
        )}

        <div className="mt-3 flex items-center gap-3">
          {!correct ? (
            <button
              type="button"
              disabled={mcq ? pickedIdx === null : !fillVal.trim()}
              onClick={() => {
                setChecked(true);
                const ok = mcq ? pickedIdx === mcq.answer : fillAccepted.some((a) => norm(a) === norm(fillVal));
                if (ok) onCorrect();
              }}
              className="px-3 py-1 rounded border border-indigo-400 text-indigo-300 text-xs hover:bg-indigo-400/10 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              check
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded border border-emerald-500 text-emerald-300 text-xs hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              nice, close
            </button>
          )}
          {checked && (
            <span className={`text-xs ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
              {correct ? '✓ still got it' : 'not quite'}
            </span>
          )}
        </div>
        {checked && correct && <p className="mt-2 text-xs text-slate-400">{item.explain}</p>}
      </div>
    </div>
  );
}
