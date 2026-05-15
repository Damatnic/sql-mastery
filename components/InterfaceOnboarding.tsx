'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'sql-mastery-onboarding-seen';

interface Step {
  selector: string;
  text: string;
  placement: 'top' | 'bottom' | 'left';
}

const STEPS: Step[] = [
  {
    selector: '[data-tour-target="anchor-nav"]',
    text: 'theory teaches it. examples show it. challenges make you do it. project ties it together.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour-target="editor"]',
    text: 'your sql runs against a real sqlite database here. ⌘+enter runs the query.',
    placement: 'top',
  },
  {
    selector: '[data-tour-target="tutor"]',
    text: "stuck? this won't give you the answer — but it'll ask the question that gets you unstuck.",
    placement: 'top',
  },
];

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // ignore
  }
}

export default function InterfaceOnboarding() {
  const [step, setStep] = useState<number>(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      return;
    }
    const t = setTimeout(() => setStep(0), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step < 0) return;
    if (step >= STEPS.length) {
      markSeen();
      setRect(null);
      return;
    }
    const el = document.querySelector(STEPS[step].selector);
    const initialRect = el?.getBoundingClientRect();
    if (!el || !initialRect || initialRect.width === 0 || initialRect.height === 0) {
      setRect(null);
      setStep((s) => s + 1);
      return;
    }
    // Bring the target into view so the tooltip lands on-screen even when the
    // target sits far below the fold (e.g. the inline editor).
    el.scrollIntoView({ behavior: 'auto', block: 'center' });
    const update = () => setRect(el.getBoundingClientRect());
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [step]);

  function done() {
    markSeen();
    setStep(-1);
  }

  if (step < 0 || step >= STEPS.length || !rect) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  let top = rect.bottom + 12;
  let left = rect.left;
  if (current.placement === 'top') {
    top = rect.top - 12 - 100;
  }
  if (current.placement === 'left') {
    top = rect.top;
    left = Math.max(12, rect.left - 320);
  }

  const clampedTop = Math.min(Math.max(12, top), window.innerHeight - 150);
  const clampedLeft = Math.min(Math.max(12, left), window.innerWidth - 320);
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${clampedTop}px`,
    left: `${clampedLeft}px`,
    width: '300px',
    zIndex: 60,
  };

  const highlightStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.top - 4}px`,
    left: `${rect.left - 4}px`,
    width: `${rect.width + 8}px`,
    height: `${rect.height + 8}px`,
    borderRadius: '8px',
    pointerEvents: 'none',
    zIndex: 59,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
  };

  return (
    <>
      <div style={highlightStyle} className="border-2 border-indigo-400" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="interface tour"
        style={tooltipStyle}
        className="rounded border border-indigo-400 bg-slate-950 px-4 py-3 font-mono text-xs shadow-2xl"
      >
        <p className="text-slate-100 leading-relaxed">{current.text}</p>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span aria-live="polite">
            step {step + 1} of {STEPS.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={done}
              className="rounded px-2 py-1 text-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              skip
            </button>
            <button
              type="button"
              onClick={() => (isLast ? done() : setStep(step + 1))}
              className="rounded border border-indigo-400 px-2 py-1 text-indigo-400 hover:bg-indigo-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {isLast ? 'got it' : 'next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
