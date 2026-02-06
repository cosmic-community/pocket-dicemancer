'use client';

import type { GameDie } from '@/types';
import DieComponent from '@/components/DieComponent';

interface InventoryGridProps {
  inventory: GameDie[];
  onSelectDie: (dieId: string) => void;
  onDiscardDie: (dieId: string) => void;
  canSelect: boolean;
  canDiscard: boolean;
  maxSlots: number;
}

export default function InventoryGrid({
  inventory,
  onSelectDie,
  onDiscardDie,
  canSelect,
  canDiscard,
  maxSlots,
}: InventoryGridProps) {
  return (
    <div className="bg-dungeon-800 rounded-xl p-3 border border-dungeon-600">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Inventory ({inventory.length}/{maxSlots})
        </h3>
        {canDiscard && (
          <span className="text-[10px] text-burn">Long-press to discard</span>
        )}
      </div>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: maxSlots }, (_, i) => {
          const die = inventory[i];
          if (!die) {
            return (
              <div key={`slot-${i}`} className="inventory-slot">
                <span className="text-gray-700 text-[10px]">—</span>
              </div>
            );
          }
          return (
            <div key={die.id} className="relative group">
              <DieComponent
                die={die}
                size="md"
                onClick={canSelect ? () => onSelectDie(die.id) : undefined}
              />
              {canDiscard && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDiscardDie(die.id);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[8px] font-bold items-center justify-center hidden group-hover:flex hover:bg-red-500 z-10"
                  title="Discard for ⭐ reroll token"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}