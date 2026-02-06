'use client';

import type { GameDie, ElementColor } from '@/types';
import { ELEMENT_COLORS, ELEMENT_BORDER_COLORS } from '@/types';

interface DieComponentProps {
  die: GameDie;
  showFace?: boolean;
  isRolling?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function DieComponent({
  die,
  showFace = false,
  isRolling = false,
  onClick,
  size = 'md',
  className = '',
}: DieComponentProps) {
  const bgClass = ELEMENT_COLORS[die.element] ?? 'bg-gray-600';
  const borderClass = ELEMENT_BORDER_COLORS[die.element] ?? 'border-gray-500';

  const sizeClasses: Record<string, string> = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg',
  };

  const sizeClass = sizeClasses[size] ?? sizeClasses.md;
  const currentValue = die.faceValues[die.currentFace] ?? 0;

  const selectedRing = die.isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-dungeon-900' : '';
  const heldRing = die.isHeld ? 'ring-2 ring-lightning ring-offset-1 ring-offset-dungeon-900' : '';
  const cursorClass = onClick ? 'cursor-pointer hover:scale-110 active:scale-95' : '';
  const rollingAnim = isRolling ? 'animate-dice-roll' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${sizeClass} ${bgClass} ${borderClass}
        relative rounded-lg border-2 flex items-center justify-center
        font-bold transition-all duration-200
        ${selectedRing} ${heldRing} ${cursorClass} ${rollingAnim}
        ${className}
      `}
      title={`${die.emoji} ${die.tier} (${die.tierPips})`}
    >
      {/* Tier pip */}
      <span className="absolute top-0 left-0.5 text-[8px] leading-none opacity-70">
        {die.tierPips}
      </span>

      {/* Face content */}
      {showFace ? (
        currentValue === 0 ? (
          <span className="text-lg">☠️</span>
        ) : (
          <span className="leading-tight text-center">
            {currentValue <= 3 ? die.emoji.repeat(currentValue) : `${die.emoji}×${currentValue}`}
          </span>
        )
      ) : (
        <span>{die.emoji}</span>
      )}

      {/* Held indicator */}
      {die.isHeld && (
        <span className="absolute -bottom-1 -right-1 text-[10px] bg-lightning text-black rounded-full w-4 h-4 flex items-center justify-center font-black">
          H
        </span>
      )}
    </button>
  );
}