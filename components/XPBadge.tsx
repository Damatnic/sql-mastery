'use client';

import { useProgressStore } from '@/lib/progress';
import { useShowcase } from '@/lib/mode';

interface XPBadgeProps {
  showStreak?: boolean;
  className?: string;
}

export default function XPBadge({ showStreak = true, className = '' }: XPBadgeProps) {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);
  const showcase = useShowcase();

  if (showcase) return null;

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
