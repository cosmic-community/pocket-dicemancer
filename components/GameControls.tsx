'use client';

import type { GamePhase, GameDie } from '@/types';

interface GameControlsProps {
  phase: GamePhase;
  rerollTokens: number;
  freeRerolls: number;
  turn: number;
  floor: number;
  encounterIndex: number;
  encountersPerFloor: number;
  playerHp: number;
  playerMaxHp: number;
  playerShield: number;
  hasStoredThisTurn: boolean;
  conveyorLength: number;
  selectedCount: number;
  rolledDice: GameDie[];
  onRollFromInventory: () => void;
  onRollFromConveyor: () => void;
  onSkipTurn: () => void;
  onReroll: () => void;
  onConfirmRoll: () => void;
  onNextEncounter: () => void;
  onRestart: () => void;
}

export default function GameControls({
  phase,
  rerollTokens,
  freeRerolls,
  turn,
  floor,
  encounterIndex,
  encountersPerFloor,
  playerHp,
  playerMaxHp,
  playerShield,
  hasStoredThisTurn,
  conveyorLength,
  selectedCount,
  rolledDice,
  onRollFromInventory,
  onRollFromConveyor,
  onSkipTurn,
  onReroll,
  onConfirmRoll,
  onNextEncounter,
  onRestart,
}: GameControlsProps) {
  const totalRerolls = freeRerolls + rerollTokens;
  const hasUnheldDice = rolledDice.some(d => !d.isHeld);

  const hpPercent = Math.max(0, (playerHp / playerMaxHp) * 100);
  const hpColor = hpPercent > 60 ? 'bg-green-500' : hpPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-2">
      {/* Player Status Bar */}
      <div className="bg-dungeon-800 rounded-xl p-3 border border-dungeon-600">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-3">
            <span className="font-semibold">🧙 Hero</span>
            <span className="text-gray-400">Floor {floor} · {encounterIndex + 1}/{encountersPerFloor}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Turn {turn}</span>
            {playerShield > 0 && (
              <span className="text-ice font-bold">🛡️ {playerShield}</span>
            )}
          </div>
        </div>
        {/* Player HP */}
        <div className="relative">
          <div className="w-full bg-dungeon-600 rounded-full h-3 overflow-hidden">
            <div className={`hp-bar ${hpColor}`} style={{ width: `${hpPercent}%` }} />
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow">
            {playerHp}/{playerMaxHp}
          </span>
        </div>
        {/* Reroll tokens */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Rerolls:</span>
            <span className="text-xs font-bold text-white">{freeRerolls} free</span>
            {rerollTokens > 0 && (
              <span className="text-xs text-lightning font-bold">+ {rerollTokens}⭐</span>
            )}
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`text-sm ${i < rerollTokens ? 'opacity-100' : 'opacity-20'}`}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Phase-specific controls */}
      <div className="bg-dungeon-800 rounded-xl p-3 border border-dungeon-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {phase === 'store' && '📦 Store Phase'}
            {phase === 'discard' && '🗑️ Discard Phase'}
            {phase === 'roll-select' && '🎲 Select Dice to Roll'}
            {phase === 'rolling' && '🎲 Rolling...'}
            {phase === 'reroll' && '🔄 Reroll Phase'}
            {phase === 'resolution' && '⚡ Resolution'}
            {phase === 'enemy-turn' && '👹 Enemy Turn'}
            {phase === 'advance' && '⏩ Advancing...'}
            {phase === 'reward' && '🎁 Victory Reward'}
            {phase === 'game-over' && '💀 Game Over'}
            {phase === 'victory' && '🏆 Victory!'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Store/Discard phase controls */}
          {(phase === 'store' || phase === 'discard') && (
            <>
              <button
                type="button"
                onClick={onRollFromInventory}
                disabled={selectedCount === 0}
                className="btn-game bg-gradient-to-r from-heal to-purple-700 text-white flex-1"
              >
                🎲 Roll Selected ({selectedCount})
              </button>
              {!hasStoredThisTurn && conveyorLength > 0 && (
                <button
                  type="button"
                  onClick={onRollFromConveyor}
                  className="btn-game bg-gradient-to-r from-lightning to-yellow-700 text-black flex-1"
                >
                  ⚡ Conveyor Roll (2x)
                </button>
              )}
              <button
                type="button"
                onClick={onSkipTurn}
                className="btn-game bg-dungeon-600 text-gray-300 border border-dungeon-500"
              >
                ⏭️ Skip (+2⭐)
              </button>
            </>
          )}

          {/* Roll select phase */}
          {phase === 'roll-select' && (
            <>
              <button
                type="button"
                onClick={onRollFromInventory}
                disabled={selectedCount === 0}
                className="btn-game bg-gradient-to-r from-heal to-purple-700 text-white flex-1"
              >
                🎲 Roll Selected ({selectedCount})
              </button>
              <button
                type="button"
                onClick={onSkipTurn}
                className="btn-game bg-dungeon-600 text-gray-300 border border-dungeon-500"
              >
                ⏭️ Skip (+2⭐)
              </button>
            </>
          )}

          {/* Reroll phase */}
          {phase === 'reroll' && (
            <>
              <button
                type="button"
                onClick={onReroll}
                disabled={totalRerolls <= 0 || !hasUnheldDice}
                className="btn-game bg-gradient-to-r from-lightning to-yellow-700 text-black flex-1"
              >
                🔄 Reroll ({freeRerolls > 0 ? `${freeRerolls} free` : `${rerollTokens}⭐`})
              </button>
              <button
                type="button"
                onClick={onConfirmRoll}
                className="btn-game bg-gradient-to-r from-fire to-burn text-white flex-1"
              >
                ✅ Confirm Roll
              </button>
            </>
          )}

          {/* Reward phase */}
          {phase === 'reward' && (
            <button
              type="button"
              onClick={onNextEncounter}
              className="btn-game bg-gradient-to-r from-poison to-green-700 text-white flex-1"
            >
              ⚔️ Next Encounter
            </button>
          )}

          {/* Game Over / Victory */}
          {(phase === 'game-over' || phase === 'victory') && (
            <button
              type="button"
              onClick={onRestart}
              className="btn-game bg-gradient-to-r from-fire to-burn text-white flex-1"
            >
              🔄 New Run
            </button>
          )}
        </div>
      </div>
    </div>
  );
}