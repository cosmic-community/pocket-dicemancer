'use client';

import { useEffect, useState } from 'react';
import type { GameDie } from '@/types';
import DieComponent from '@/components/DieComponent';

interface ConveyorBeltProps {
  conveyor: GameDie[];
  onStoreDie: (dieId: string) => void;
  canStore: boolean;
  turn?: number;
}

export default function ConveyorBelt({ conveyor, onStoreDie, canStore, turn }: ConveyorBeltProps) {
  // Changed: Track when a new die arrives for entrance animation
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null);

  useEffect(() => {
    // Trigger entrance animation when turn changes (new die spawns)
    if (turn !== undefined) {
      setAnimatingSlot(0);
      const timer = setTimeout(() => setAnimatingSlot(null), 500);
      return () => clearTimeout(timer);
    }
  }, [turn]);

  return (
    <div className="relative bg-dungeon-800 rounded-xl border border-dungeon-600 overflow-hidden">
      {/* Changed: Animated conveyor track background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-conveyor-track absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 20px,
              rgba(255,255,255,0.3) 20px,
              rgba(255,255,255,0.3) 22px
            )`,
            backgroundSize: '42px 100%',
          }}
        />
      </div>

      {/* Changed: Header with animated direction indicators */}
      <div className="relative flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Conveyor
          </span>
          <span className="inline-flex items-center text-[9px] text-dungeon-300 bg-dungeon-700 px-1.5 py-0.5 rounded">
            {conveyor.length}/3
          </span>
        </div>
        {/* Changed: Animated chevron direction indicator */}
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] text-green-500/70 font-semibold">NEW</span>
          <div className="flex items-center gap-px ml-1">
            <span className="animate-chevron-1 text-dungeon-400 text-[10px]">›</span>
            <span className="animate-chevron-2 text-dungeon-400 text-[10px]">›</span>
            <span className="animate-chevron-3 text-dungeon-400 text-[10px]">›</span>
          </div>
          <span className="text-[9px] text-fire/70 font-semibold ml-1">DROP</span>
        </div>
      </div>

      {/* Changed: Conveyor belt track with slots */}
      <div className="relative px-3 pb-3 pt-1">
        {/* Changed: Track rail lines */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[2px] bg-dungeon-600/50 rounded-full" />
        <div className="absolute left-3 right-3 top-[calc(50%+20px)] h-[1px] bg-dungeon-700/30 rounded-full" />
        <div className="absolute left-3 right-3 top-[calc(50%-20px)] h-[1px] bg-dungeon-700/30 rounded-full" />

        <div className="relative flex items-center gap-3 justify-center py-2">
          {[0, 1, 2].map((slotIndex) => {
            const die = conveyor[slotIndex];
            const isDangerSlot = slotIndex === 2;
            const isNewSlot = slotIndex === 0;
            const isEntering = animatingSlot === slotIndex;

            if (!die) {
              return (
                <div
                  key={`empty-${slotIndex}`}
                  className={`
                    conveyor-slot relative
                    ${isDangerSlot ? 'border-fire/20' : 'border-dungeon-500/40'}
                    transition-all duration-300
                  `}
                >
                  {/* Changed: Slot position indicator */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className={`text-[8px] font-bold ${isDangerSlot ? 'text-fire/40' : 'text-dungeon-500/60'}`}>
                      {slotIndex + 1}
                    </span>
                  </div>
                  <span className="text-dungeon-500 text-[10px]">—</span>
                </div>
              );
            }

            return (
              <div
                key={die.id}
                className={`
                  relative
                  ${isEntering ? 'animate-conveyor-enter' : 'animate-conveyor-idle'}
                  ${isDangerSlot ? 'animate-danger-pulse' : ''}
                `}
              >
                {/* Changed: Slot position indicator */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                  <span className={`text-[8px] font-bold ${isDangerSlot ? 'text-fire/60' : isNewSlot ? 'text-green-500/60' : 'text-dungeon-400/60'}`}>
                    {slotIndex + 1}
                  </span>
                </div>

                {/* Changed: Glow ring for danger slot */}
                {isDangerSlot && (
                  <div className="absolute -inset-1 rounded-xl bg-fire/10 animate-danger-glow pointer-events-none" />
                )}

                {/* Changed: New die indicator glow */}
                {isNewSlot && isEntering && (
                  <div className="absolute -inset-1 rounded-xl bg-green-500/10 animate-pulse pointer-events-none" />
                )}

                <DieComponent
                  die={die}
                  size="lg"
                  onClick={canStore ? () => onStoreDie(die.id) : undefined}
                  className={isDangerSlot ? 'shadow-lg shadow-fire/20' : ''}
                />

                {/* Changed: Contextual label under die */}
                {canStore && (
                  <span className={`
                    absolute -bottom-3 left-1/2 -translate-x-1/2 
                    text-[8px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap
                    transition-all duration-200
                    ${isDangerSlot
                      ? 'bg-fire/20 text-fire animate-pulse'
                      : 'bg-dungeon-600/80 text-gray-400'}
                  `}>
                    {isDangerSlot ? '⚠️ save!' : 'tap'}
                  </span>
                )}

                {/* Changed: Danger icon for rightmost slot */}
                {isDangerSlot && (
                  <div className="absolute -right-2 -top-2 z-10">
                    <span className="text-sm animate-bounce">⚠️</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Changed: Drop zone indicator at the end */}
          <div className="flex flex-col items-center gap-0.5 ml-1 opacity-40">
            <div className="w-6 h-10 rounded border border-dashed border-fire/30 flex items-center justify-center">
              <span className="text-fire/50 text-xs">✕</span>
            </div>
            <span className="text-[7px] text-fire/40 font-bold">LOST</span>
          </div>
        </div>
      </div>

      {/* Changed: Bottom status bar */}
      <div className="relative flex items-center justify-between px-3 py-1.5 bg-dungeon-900/40 border-t border-dungeon-700/30">
        <span className="text-[9px] text-dungeon-400">
          {conveyor.length === 3 ? '⚠️ Full — next die pushes one off!' : conveyor.length === 0 ? 'Conveyor empty' : `${3 - conveyor.length} slot${3 - conveyor.length !== 1 ? 's' : ''} free`}
        </span>
        {canStore && conveyor.length > 0 && (
          <span className="text-[9px] text-green-500/70 animate-pulse">
            ↑ Tap a die to store
          </span>
        )}
      </div>
    </div>
  );
}