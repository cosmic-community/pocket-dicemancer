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

// Changed: Map element colors to hex values for SVG rendering
const ELEMENT_HEX: Record<ElementColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  gray: '#6b7280',
};

// Changed: Darker shade for die border/depth effect
const ELEMENT_HEX_DARK: Record<ElementColor, string> = {
  red: '#b91c1c',
  blue: '#1d4ed8',
  green: '#15803d',
  yellow: '#a16207',
  orange: '#c2410c',
  purple: '#7e22ce',
  gray: '#4b5563',
};

// Changed: Lighter shade for pip/dot highlights
const ELEMENT_HEX_LIGHT: Record<ElementColor, string> = {
  red: '#fca5a5',
  blue: '#93c5fd',
  green: '#86efac',
  yellow: '#fde047',
  orange: '#fdba74',
  purple: '#d8b4fe',
  gray: '#d1d5db',
};

// Changed: SVG-based die face rendering with pips for small values
function DieFaceSVG({ value, emoji, element, size }: { value: number; emoji: string; element: ElementColor; size: 'sm' | 'md' | 'lg' }) {
  const pipColor = ELEMENT_HEX_LIGHT[element] ?? '#fff';
  const svgSize = size === 'sm' ? 28 : size === 'md' ? 36 : 44;

  // Skull face
  if (value === 0) {
    return (
      <span className="text-lg leading-none" role="img" aria-label="skull">☠️</span>
    );
  }

  // For values 1-6, show pips arranged like real dice faces
  if (value <= 6) {
    const pipPositions = getPipPositions(value);
    const pipR = size === 'sm' ? 2.5 : size === 'md' ? 3 : 3.5;
    return (
      <svg width={svgSize} height={svgSize} viewBox="0 0 40 40" className="drop-shadow-sm">
        {pipPositions.map((pos, i) => (
          <g key={i}>
            <circle cx={pos.x} cy={pos.y} r={pipR + 1} fill={ELEMENT_HEX_DARK[element] ?? '#333'} opacity={0.4} />
            <circle cx={pos.x} cy={pos.y} r={pipR} fill={pipColor} />
            <circle cx={pos.x - 0.8} cy={pos.y - 0.8} r={pipR * 0.4} fill="white" opacity={0.6} />
          </g>
        ))}
      </svg>
    );
  }

  // For values > 6 (legendary/special), show emoji × value
  return (
    <span className="leading-tight text-center">
      {emoji}×{value}
    </span>
  );
}

// Changed: Standard die pip positions matching real dice layouts
function getPipPositions(count: number): Array<{ x: number; y: number }> {
  const c = 20; // center
  const o = 10; // offset from center
  switch (count) {
    case 1:
      return [{ x: c, y: c }];
    case 2:
      return [{ x: c - o, y: c - o }, { x: c + o, y: c + o }];
    case 3:
      return [{ x: c - o, y: c - o }, { x: c, y: c }, { x: c + o, y: c + o }];
    case 4:
      return [
        { x: c - o, y: c - o }, { x: c + o, y: c - o },
        { x: c - o, y: c + o }, { x: c + o, y: c + o },
      ];
    case 5:
      return [
        { x: c - o, y: c - o }, { x: c + o, y: c - o },
        { x: c, y: c },
        { x: c - o, y: c + o }, { x: c + o, y: c + o },
      ];
    case 6:
      return [
        { x: c - o, y: c - o }, { x: c + o, y: c - o },
        { x: c - o, y: c }, { x: c + o, y: c },
        { x: c - o, y: c + o }, { x: c + o, y: c + o },
      ];
    default:
      return [{ x: c, y: c }];
  }
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
        font-bold transition-all duration-200 shadow-md
        ${selectedRing} ${heldRing} ${cursorClass} ${rollingAnim}
        ${className}
      `}
      title={`${die.emoji} ${die.tier} (${die.tierPips})`}
      style={{
        // Changed: Add subtle inner gradient for 3D die look
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)`,
      }}
    >
      {/* Tier pip - Changed: improved styling */}
      <span className="absolute top-0 left-0.5 text-[8px] leading-none opacity-80 font-black drop-shadow-sm">
        {die.tierPips}
      </span>

      {/* Face content - Changed: Use SVG pips when showing face */}
      {showFace ? (
        <DieFaceSVG value={currentValue} emoji={die.emoji} element={die.element} size={size} />
      ) : (
        // Changed: Better idle die display with element emoji
        <span className="drop-shadow-sm">{die.emoji}</span>
      )}

      {/* Held indicator */}
      {die.isHeld && (
        <span className="absolute -bottom-1 -right-1 text-[10px] bg-lightning text-black rounded-full w-4 h-4 flex items-center justify-center font-black shadow-sm">
          H
        </span>
      )}

      {/* Changed: Corner dots to make it feel more like a physical die */}
      <span className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-white/20" />
      <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white/20" />
    </button>
  );
}