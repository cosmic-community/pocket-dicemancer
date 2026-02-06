'use client';

import type { GameDie } from '@/types';
import DieComponent from '@/components/DieComponent';

interface ConveyorBeltProps {
  conveyor: GameDie[];
  onStoreDie: (dieId: string) => void;
  canStore: boolean;
}

export default function ConveyorBelt({ conveyor, onStoreDie, canStore }: ConveyorBeltProps) {
  return (
    <div className="bg-dungeon-800 rounded-xl p-3 border border-dungeon-600">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Conveyor Belt
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>← new</span>
          <span className="text-gray-600">→ falls off →</span>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-center">
        {[0, 1, 2].map((slotIndex) => {
          const die = conveyor[slotIndex];
          if (!die) {
            return (
              <div key={slotIndex} className="conveyor-slot">
                <span className="text-gray-600 text-xs">empty</span>
              </div>
            );
          }
          return (
            <div key={die.id} className="relative animate-slide-in">
              <DieComponent
                die={die}
                size="lg"
                onClick={canStore ? () => onStoreDie(die.id) : undefined}
              />
              {canStore && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] bg-dungeon-600 text-gray-300 px-1.5 rounded-full">
                  tap to store
                </span>
              )}
              {slotIndex === 2 && (
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-fire text-xs">⚠️</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}