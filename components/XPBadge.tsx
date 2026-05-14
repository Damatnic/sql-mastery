'use client';

import { useProgressStore } from '@/lib/progress';

interface XPBadgeProps {
  showStreak?: boolean;
  className?: string;
}

export default function XPBadge({ showStreak = true, className = '' }: XPBadgeProps) {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);

  return (
    <span className={`font-mono text-xs text-slate-400 ${className}`}>
      <span className="text-indigo-400">xp</span> {xp.toLocaleString()}
      {showStreak && streak > 0 && (
        <>
          {' · '}
          <span className="text-amber-400">{streak}d streak</span>
        </>
      )}
    </span>
  );
}
