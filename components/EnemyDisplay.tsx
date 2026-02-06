'use client';

import type { GameEnemy } from '@/types';

interface EnemyDisplayProps {
  enemy: GameEnemy;
  isShaking: boolean;
  showDamageNumber: boolean;
  damageNumberValue: number;
  damageNumberColor: string;
}

export default function EnemyDisplay({
  enemy,
  isShaking,
  showDamageNumber,
  damageNumberValue,
  damageNumberColor,
}: EnemyDisplayProps) {
  const hpPercent = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
  const hpBarColor =
    hpPercent > 60 ? 'bg-green-500' : hpPercent > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`relative ${isShaking ? 'animate-shake' : ''}`}>
      <div className="bg-dungeon-800 rounded-xl p-4 border border-dungeon-600">
        {/* Enemy name & boss badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold ${enemy.isBoss ? 'text-fire' : 'text-white'}`}>
              {enemy.name}
            </h3>
            {enemy.isBoss && (
              <span className="text-[10px] bg-fire/20 text-fire px-2 py-0.5 rounded-full font-bold">
                BOSS
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">⚔️ {enemy.damage} DMG</span>
        </div>

        {/* HP bar */}
        <div className="relative mb-2">
          <div className="w-full bg-dungeon-600 rounded-full h-4 overflow-hidden">
            <div
              className={`hp-bar ${hpBarColor}`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
            {enemy.currentHp} / {enemy.maxHp}
          </span>
        </div>

        {/* Timer & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">⏱️ Attack in:</span>
            <div className="flex gap-1">
              {Array.from({ length: enemy.attackTimer }, (_, i) => (
                <div
                  key={i}
                  className={`timer-pip ${
                    i < enemy.currentTimer ? 'bg-fire' : 'bg-dungeon-500'
                  }`}
                />
              ))}
            </div>
            {enemy.currentTimer <= 1 && (
              <span className="text-xs text-fire font-bold ml-1 animate-pulse">⚠️</span>
            )}
          </div>

          <div className="flex gap-1">
            {enemy.dotEffects.map((dot, i) => (
              <span key={i} className="text-xs" title={`${dot.emoji} ${dot.damagePerTurn}/turn for ${dot.turnsRemaining}t`}>
                {dot.emoji}
              </span>
            ))}
            {enemy.stunTurns > 0 && (
              <span className="text-xs" title={`Stunned for ${enemy.stunTurns} turns`}>
                💫×{enemy.stunTurns}
              </span>
            )}
          </div>
        </div>

        {/* Enemy image */}
        {enemy.imageUrl && (
          <div className="mt-3 flex justify-center">
            <img
              src={`${enemy.imageUrl}?w=300&h=200&fit=crop&auto=format,compress`}
              alt={enemy.name}
              width={150}
              height={100}
              className="rounded-lg w-full max-w-[200px] h-24 object-cover opacity-80"
            />
          </div>
        )}
      </div>

      {/* Damage number popup */}
      {showDamageNumber && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 animate-damage-pop font-black text-2xl pointer-events-none"
          style={{ color: damageNumberColor }}
        >
          {damageNumberValue > 0 ? `-${damageNumberValue}` : damageNumberValue === 0 ? 'MISS' : `+${Math.abs(damageNumberValue)}`}
        </div>
      )}
    </div>
  );
}