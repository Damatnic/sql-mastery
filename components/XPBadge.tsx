'use client';

import { Zap, Flame } from 'lucide-react';
import { useProgressStore } from '@/lib/progress';

interface XPBadgeProps {
  showStreak?: boolean;
  className?: string;
}

export default function XPBadge({ showStreak = true, className = '' }: XPBadgeProps) {
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/50 border border-indigo-700/50 rounded-full">
        <Zap className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-300">{xp.toLocaleString()} XP</span>
      </div>

      {showStreak && streak > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/50 border border-orange-700/50 rounded-full">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-300">{streak} day{streak !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
