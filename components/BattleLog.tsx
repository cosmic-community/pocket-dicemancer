'use client';

import { useRef, useEffect } from 'react';
import type { BattleLogEntry } from '@/types';

const LOG_COLORS: Record<string, string> = {
  damage: 'text-fire',
  heal: 'text-heal',
  shield: 'text-ice',
  enemy: 'text-red-400',
  info: 'text-gray-400',
  combo: 'text-lightning',
  dot: 'text-poison',
  stun: 'text-stun',
};

interface BattleLogProps {
  log: BattleLogEntry[];
}

export default function BattleLog({ log }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log.length]);

  return (
    <div className="bg-dungeon-800 rounded-xl border border-dungeon-600 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-dungeon-600 bg-dungeon-700">
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Battle Log</h3>
      </div>
      <div ref={scrollRef} className="max-h-28 overflow-y-auto p-2 space-y-0.5">
        {log.length === 0 && (
          <p className="text-xs text-gray-600 italic">The dungeon awaits...</p>
        )}
        {log.map((entry) => (
          <div key={entry.id} className="flex gap-2 text-xs animate-slide-in">
            <span className="text-gray-600 font-mono shrink-0">T{entry.turn}</span>
            <span className={LOG_COLORS[entry.type] ?? 'text-gray-400'}>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}