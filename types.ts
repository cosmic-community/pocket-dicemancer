// Base Cosmic object
export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, unknown>;
  type?: string;
  created_at?: string;
  modified_at?: string;
}

// Select dropdown value shape from Cosmic
export interface SelectDropdownValue {
  key: string;
  value: string;
}

// File metafield shape from Cosmic
export interface CosmicFile {
  url: string;
  imgix_url: string;
}

// --- Dice Definitions ---
export type ElementColor = 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'gray';
export type DiceTier = 'common' | 'rare' | 'epic' | 'legendary';

export interface DiceDefinition extends CosmicObject {
  metadata: {
    element: SelectDropdownValue;
    tier: SelectDropdownValue;
    tier_pips: string;
    element_emoji: string;
    face_values: number[];
    has_skull: boolean;
    special_effect_description?: string | null;
  };
}

// --- Element Effects ---
export interface ElementEffect extends CosmicObject {
  metadata: {
    element_color: SelectDropdownValue;
    element_emoji: string;
    instant_damage_percent: number;
    dot_damage_percent: number;
    dot_duration: number;
    special_mechanic?: string | null;
  };
}

// --- Enemy Types ---
export interface EnemyType extends CosmicObject {
  metadata: {
    hp: number;
    damage: number;
    attack_timer: number;
    is_boss: boolean;
    min_floor: number;
    special_ability?: string | null;
    enemy_image?: CosmicFile | null;
  };
}

// --- Game State Types ---
export interface GameDie {
  id: string;
  definitionId: string;
  element: ElementColor;
  tier: DiceTier;
  tierPips: string;
  emoji: string;
  faceValues: number[];
  hasSKull: boolean;
  specialEffect?: string | null;
  currentFace: number; // index into faceValues
  isHeld: boolean;
  isSelected: boolean;
}

export interface DOTEffect {
  element: ElementColor;
  emoji: string;
  damagePerTurn: number;
  turnsRemaining: number;
}

export interface GameEnemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  damage: number;
  attackTimer: number;
  currentTimer: number;
  isBoss: boolean;
  specialAbility?: string | null;
  imageUrl?: string;
  dotEffects: DOTEffect[];
  stunTurns: number;
  healTimer?: number;
  maxHpOriginal: number;
}

export type GamePhase =
  | 'advance'
  | 'store'
  | 'discard'
  | 'roll-select'
  | 'rolling'
  | 'reroll'
  | 'resolution'
  | 'enemy-turn'
  | 'reward'
  | 'game-over'
  | 'victory';

export interface BattleLogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'damage' | 'heal' | 'shield' | 'enemy' | 'info' | 'combo' | 'dot' | 'stun';
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  floor: number;
  encounterIndex: number;
  encountersPerFloor: number;

  // Player
  playerHp: number;
  playerMaxHp: number;
  playerShield: number;
  rerollTokens: number;
  freeRerolls: number;

  // Conveyor
  conveyor: GameDie[];

  // Inventory
  inventory: GameDie[];

  // Rolling
  rolledDice: GameDie[];
  rollResults: number[];
  hasStoredThisTurn: boolean;
  conveyorBoostActive: boolean;

  // Enemy
  enemy: GameEnemy | null;

  // Battle log
  battleLog: BattleLogEntry[];

  // Combo
  lastComboSize: number;
  lastDamageDealt: number;
  lastElementUsed: ElementColor | null;

  // Animations
  isShaking: boolean;
  showDamageNumber: boolean;
  damageNumberValue: number;
  damageNumberColor: string;
}

export interface GameData {
  dice: DiceDefinition[];
  elements: ElementEffect[];
  enemies: EnemyType[];
}

// Color matching bonuses
export const COLOR_MATCH_BONUS: Record<number, number> = {
  2: 0.20,
  3: 0.40,
  4: 0.70,
  5: 1.00,
};

// Element color to CSS class mapping
export const ELEMENT_COLORS: Record<ElementColor, string> = {
  red: 'bg-fire',
  blue: 'bg-ice',
  green: 'bg-poison',
  yellow: 'bg-lightning',
  orange: 'bg-burn',
  purple: 'bg-heal',
  gray: 'bg-stun',
};

export const ELEMENT_TEXT_COLORS: Record<ElementColor, string> = {
  red: 'text-fire',
  blue: 'text-ice',
  green: 'text-poison',
  yellow: 'text-lightning',
  orange: 'text-burn',
  purple: 'text-heal',
  gray: 'text-stun',
};

export const ELEMENT_BORDER_COLORS: Record<ElementColor, string> = {
  red: 'border-fire',
  blue: 'border-ice',
  green: 'border-poison',
  yellow: 'border-lightning',
  orange: 'border-burn',
  purple: 'border-heal',
  gray: 'border-stun',
};

// Helper to check cosmic 404
export function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}