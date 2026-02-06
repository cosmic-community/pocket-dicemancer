'use client';

import type { GameEnemy } from '@/types';

interface EnemyDisplayProps {
  enemy: GameEnemy;
  isShaking: boolean;
  showDamageNumber: boolean;
  damageNumberValue: number;
  damageNumberColor: string;
}

// Changed: Map enemy names to fallback emojis for when images look off
const ENEMY_EMOJI_MAP: Record<string, string> = {
  'Rat': '🐀',
  'Skeleton': '💀',
  'Goblin': '👺',
  'Orc': '👹',
  'Slime': '🟢',
  'Spider': '🕷️',
  'Healer Mage': '🧙',
  'Dragon': '🐉',
  'Mimic': '📦',
  'Wraith': '👻',
};

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

  // Changed: Get a fallback emoji based on enemy name
  const fallbackEmoji = ENEMY_EMOJI_MAP[enemy.name] ?? '👹';

  return (
    <div className={`relative ${isShaking ? 'animate-shake' : ''}`}>
      <div className="bg-dungeon-800 rounded-xl p-4 border border-dungeon-600">
        {/* Changed: Enemy image at top, larger and more prominent */}
        <div className="flex items-start gap-3 mb-3">
          {/* Enemy portrait */}
          <div className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${enemy.isBoss ? 'border-fire/60' : 'border-dungeon-500'} bg-dungeon-700`}>
            {enemy.imageUrl ? (
              <img
                src={`${enemy.imageUrl}?w=200&h=200&fit=crop&auto=format,compress`}
                alt={enemy.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {fallbackEmoji}
              </div>
            )}
          </div>

          {/* Enemy info */}
          <div className="flex-1 min-w-0">
            {/* Enemy name & boss badge */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold truncate ${enemy.isBoss ? 'text-fire' : 'text-white'}`}>
                {enemy.name}
              </h3>
              {enemy.isBoss && (
                <span className="text-[10px] bg-fire/20 text-fire px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                  BOSS
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">⚔️ {enemy.damage} DMG</span>
          </div>
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