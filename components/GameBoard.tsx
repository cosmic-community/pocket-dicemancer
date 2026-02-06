'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type {
  GameData,
  GameState,
  GameDie,
  GameEnemy,
  GamePhase,
  BattleLogEntry,
  ElementColor,
  DiceDefinition,
  ElementEffect,
  EnemyType,
  DOTEffect,
} from '@/types';
import { COLOR_MATCH_BONUS } from '@/types';
import EnemyDisplay from '@/components/EnemyDisplay';
import ConveyorBelt from '@/components/ConveyorBelt';
import InventoryGrid from '@/components/InventoryGrid';
import BattleLog from '@/components/BattleLog';
import GameControls from '@/components/GameControls';
import DieComponent from '@/components/DieComponent';

// ------- Utility helpers -------

let dieIdCounter = 0;
function nextDieId(): string {
  dieIdCounter += 1;
  return `die-${dieIdCounter}-${Date.now()}`;
}

let logIdCounter = 0;
function nextLogId(): string {
  logIdCounter += 1;
  return `log-${logIdCounter}`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function rollFace(faceValues: number[]): number {
  return Math.floor(Math.random() * faceValues.length);
}

function createGameDie(def: DiceDefinition): GameDie {
  return {
    id: nextDieId(),
    definitionId: def.id,
    element: def.metadata.element.key as ElementColor,
    tier: def.metadata.tier.key as 'common' | 'rare' | 'epic' | 'legendary',
    tierPips: def.metadata.tier_pips,
    emoji: def.metadata.element_emoji,
    faceValues: def.metadata.face_values,
    hasSKull: def.metadata.has_skull,
    specialEffect: def.metadata.special_effect_description ?? null,
    currentFace: 0,
    isHeld: false,
    isSelected: false,
  };
}

function createEnemy(enemyType: EnemyType, floor: number, isBossFloor: boolean): GameEnemy {
  const hpScale = 1 + (floor - 1) * 0.15;
  const dmgScale = 1 + (floor - 1) * 0.1;
  const baseHp = isBossFloor ? enemyType.metadata.hp : enemyType.metadata.hp;

  return {
    id: `enemy-${Date.now()}`,
    name: enemyType.title,
    maxHp: Math.round(baseHp * hpScale),
    currentHp: Math.round(baseHp * hpScale),
    damage: Math.round(enemyType.metadata.damage * dmgScale),
    attackTimer: enemyType.metadata.attack_timer,
    currentTimer: enemyType.metadata.attack_timer,
    isBoss: enemyType.metadata.is_boss,
    specialAbility: enemyType.metadata.special_ability ?? null,
    imageUrl: enemyType.metadata.enemy_image?.imgix_url,
    dotEffects: [],
    stunTurns: 0,
    healTimer: enemyType.metadata.special_ability?.toLowerCase().includes('heal') ? 5 : undefined,
    maxHpOriginal: enemyType.metadata.hp,
  };
}

function getInitialState(): GameState {
  return {
    phase: 'advance',
    turn: 0,
    floor: 1,
    encounterIndex: 0,
    encountersPerFloor: 3,
    playerHp: 50,
    playerMaxHp: 50,
    playerShield: 0,
    rerollTokens: 0,
    freeRerolls: 2,
    conveyor: [],
    inventory: [],
    rolledDice: [],
    rollResults: [],
    hasStoredThisTurn: false,
    conveyorBoostActive: false,
    enemy: null,
    battleLog: [],
    lastComboSize: 0,
    lastDamageDealt: 0,
    lastElementUsed: null,
    isShaking: false,
    showDamageNumber: false,
    damageNumberValue: 0,
    damageNumberColor: '#ef4444',
  };
}

const MAX_INVENTORY = 6;
const MAX_REROLL_TOKENS = 5;

// ------- Main GameBoard Component -------

interface GameBoardProps {
  gameData: GameData;
}

export default function GameBoard({ gameData }: GameBoardProps) {
  const [state, setState] = useState<GameState>(getInitialState());

  const addLog = useCallback((message: string, type: BattleLogEntry['type'], currentState: GameState): BattleLogEntry => {
    return {
      id: nextLogId(),
      turn: currentState.turn,
      message,
      type,
    };
  }, []);

  // Find element effect by color key
  const getElementEffect = useCallback((colorKey: ElementColor): ElementEffect | undefined => {
    return gameData.elements.find(e => e.metadata.element_color.key === colorKey);
  }, [gameData.elements]);

  // Pick a random die definition eligible for the current floor
  const pickRandomDie = useCallback((): DiceDefinition => {
    const floor = state.floor;
    let pool = gameData.dice.filter(d => d.metadata.tier.key === 'common');
    if (floor >= 3) {
      pool = [...pool, ...gameData.dice.filter(d => d.metadata.tier.key === 'rare')];
    }
    if (floor >= 6) {
      pool = [...pool, ...gameData.dice.filter(d => d.metadata.tier.key === 'epic')];
    }
    if (floor >= 10) {
      pool = [...pool, ...gameData.dice.filter(d => d.metadata.tier.key === 'legendary')];
    }
    if (pool.length === 0) pool = gameData.dice;
    return pickRandom(pool);
  }, [gameData.dice, state.floor]);

  // Pick an enemy for the current floor
  const pickEnemy = useCallback((floor: number): EnemyType => {
    const isBossFloor = floor % 5 === 0;
    let pool: EnemyType[];
    if (isBossFloor) {
      pool = gameData.enemies.filter(e => e.metadata.is_boss && e.metadata.min_floor <= floor);
      if (pool.length === 0) pool = gameData.enemies.filter(e => e.metadata.is_boss);
    } else {
      pool = gameData.enemies.filter(e => !e.metadata.is_boss && e.metadata.min_floor <= floor);
      if (pool.length === 0) pool = gameData.enemies.filter(e => !e.metadata.is_boss);
    }
    if (pool.length === 0) pool = gameData.enemies;
    return pickRandom(pool);
  }, [gameData.enemies]);

  // Initialize a new run
  const initRun = useCallback(() => {
    dieIdCounter = 0;
    logIdCounter = 0;
    const newState = getInitialState();
    // Start with 3 random common dice
    const startingDice: GameDie[] = [];
    const commonDice = gameData.dice.filter(d => d.metadata.tier.key === 'common');
    for (let i = 0; i < 3; i++) {
      const pool = commonDice.length > 0 ? commonDice : gameData.dice;
      startingDice.push(createGameDie(pickRandom(pool)));
    }
    newState.inventory = startingDice;

    // First enemy
    const enemyType = pickEnemy(1);
    newState.enemy = createEnemy(enemyType, 1, false);

    // First conveyor die
    const conveyorDie = createGameDie(pickRandom(commonDice.length > 0 ? commonDice : gameData.dice));
    newState.conveyor = [conveyorDie];

    newState.battleLog = [addLog(`Floor 1 — ${newState.enemy.name} appears!`, 'info', newState)];
    newState.phase = 'store';
    newState.turn = 1;

    setState(newState);
  }, [gameData.dice, pickEnemy, addLog]);

  // Start the game on mount
  useEffect(() => {
    initRun();
  }, [initRun]);

  // ------ Actions ------

  const handleStoreDie = useCallback((dieId: string) => {
    setState(prev => {
      if (prev.phase !== 'store' && prev.phase !== 'discard') return prev;
      if (prev.inventory.length >= MAX_INVENTORY) return prev;
      const dieIndex = prev.conveyor.findIndex(d => d.id === dieId);
      if (dieIndex === -1) return prev;
      const die = prev.conveyor[dieIndex]!;
      const newConveyor = prev.conveyor.filter(d => d.id !== dieId);
      const newInventory = [...prev.inventory, die];
      const log = addLog(`Stored ${die.emoji} ${die.tier} die`, 'info', prev);
      return {
        ...prev,
        conveyor: newConveyor,
        inventory: newInventory,
        hasStoredThisTurn: true,
        phase: 'discard' as GamePhase,
        battleLog: [...prev.battleLog, log],
      };
    });
  }, [addLog]);

  const handleSelectDie = useCallback((dieId: string) => {
    setState(prev => {
      if (prev.phase !== 'store' && prev.phase !== 'discard' && prev.phase !== 'roll-select') return prev;
      const newInventory = prev.inventory.map(d =>
        d.id === dieId ? { ...d, isSelected: !d.isSelected } : d
      );
      return { ...prev, inventory: newInventory, phase: 'discard' as GamePhase };
    });
  }, []);

  const handleDiscardDie = useCallback((dieId: string) => {
    setState(prev => {
      if (prev.phase !== 'store' && prev.phase !== 'discard') return prev;
      if (prev.rerollTokens >= MAX_REROLL_TOKENS) return prev;
      const die = prev.inventory.find(d => d.id === dieId);
      if (!die) return prev;
      const newInventory = prev.inventory.filter(d => d.id !== dieId);
      const newTokens = Math.min(prev.rerollTokens + 1, MAX_REROLL_TOKENS);
      const log = addLog(`Discarded ${die.emoji} → earned ⭐ token (${newTokens}/5)`, 'info', prev);
      return {
        ...prev,
        inventory: newInventory,
        rerollTokens: newTokens,
        battleLog: [...prev.battleLog, log],
      };
    });
  }, [addLog]);

  const handleRollFromInventory = useCallback(() => {
    setState(prev => {
      const selected = prev.inventory.filter(d => d.isSelected);
      if (selected.length === 0) return prev;

      // Roll each selected die
      const rolled = selected.map(d => ({
        ...d,
        currentFace: rollFace(d.faceValues),
        isHeld: false,
        isSelected: false,
      }));

      // Remove rolled dice from inventory
      const selectedIds = new Set(selected.map(d => d.id));
      const remainingInventory = prev.inventory
        .filter(d => !selectedIds.has(d.id))
        .map(d => ({ ...d, isSelected: false }));

      const log = addLog(`Rolled ${rolled.length} dice from inventory`, 'info', prev);
      return {
        ...prev,
        rolledDice: rolled,
        inventory: remainingInventory,
        freeRerolls: 2,
        phase: 'reroll' as GamePhase,
        conveyorBoostActive: false,
        battleLog: [...prev.battleLog, log],
      };
    });
  }, [addLog]);

  const handleRollFromConveyor = useCallback(() => {
    setState(prev => {
      if (prev.hasStoredThisTurn || prev.conveyor.length === 0) return prev;
      const die = prev.conveyor[0]!;
      const rolled: GameDie = {
        ...die,
        currentFace: rollFace(die.faceValues),
        isHeld: false,
        isSelected: false,
      };
      const newConveyor = prev.conveyor.slice(1);
      const log = addLog(`Conveyor roll! ${die.emoji} with 2x boost`, 'combo', prev);
      return {
        ...prev,
        rolledDice: [rolled],
        conveyor: newConveyor,
        freeRerolls: 2,
        phase: 'reroll' as GamePhase,
        conveyorBoostActive: true,
        battleLog: [...prev.battleLog, log],
      };
    });
  }, [addLog]);

  const handleSkipTurn = useCallback(() => {
    setState(prev => {
      const newTokens = Math.min(prev.rerollTokens + 2, MAX_REROLL_TOKENS);
      const log = addLog(`Skipped turn — earned 2⭐ tokens (${newTokens}/5)`, 'info', prev);

      // Deselect all
      const newInventory = prev.inventory.map(d => ({ ...d, isSelected: false }));

      return {
        ...prev,
        rerollTokens: newTokens,
        inventory: newInventory,
        phase: 'enemy-turn' as GamePhase,
        battleLog: [...prev.battleLog, log],
      };
    });

    // Process enemy turn after a small delay
    setTimeout(() => processEnemyTurn(), 600);
  }, [addLog]);

  const handleToggleHold = useCallback((dieId: string) => {
    setState(prev => {
      if (prev.phase !== 'reroll') return prev;
      const newRolled = prev.rolledDice.map(d =>
        d.id === dieId ? { ...d, isHeld: !d.isHeld } : d
      );
      return { ...prev, rolledDice: newRolled };
    });
  }, []);

  const handleReroll = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'reroll') return prev;
      const totalRerolls = prev.freeRerolls + prev.rerollTokens;
      if (totalRerolls <= 0) return prev;
      const hasUnheld = prev.rolledDice.some(d => !d.isHeld);
      if (!hasUnheld) return prev;

      let newFree = prev.freeRerolls;
      let newTokens = prev.rerollTokens;
      if (newFree > 0) {
        newFree -= 1;
      } else {
        newTokens -= 1;
      }

      const newRolled = prev.rolledDice.map(d => {
        if (d.isHeld) return d;
        return { ...d, currentFace: rollFace(d.faceValues) };
      });

      const log = addLog(
        `Rerolled ${newRolled.filter(d => !d.isHeld).length} dice (${newFree} free + ${newTokens}⭐ left)`,
        'info',
        prev
      );

      return {
        ...prev,
        rolledDice: newRolled,
        freeRerolls: newFree,
        rerollTokens: newTokens,
        battleLog: [...prev.battleLog, log],
      };
    });
  }, [addLog]);

  const handleConfirmRoll = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'reroll' || !prev.enemy) return prev;

      const rolledDice = prev.rolledDice;
      const newLogs: BattleLogEntry[] = [];
      let enemy = { ...prev.enemy, dotEffects: [...prev.enemy.dotEffects] };
      let playerHp = prev.playerHp;
      let playerShield = prev.playerShield;

      // Group by element
      const groups: Record<string, { dice: GameDie[]; totalPower: number }> = {};
      for (const die of rolledDice) {
        const value = die.faceValues[die.currentFace] ?? 0;
        if (!groups[die.element]) {
          groups[die.element] = { dice: [], totalPower: 0 };
        }
        groups[die.element]!.dice.push(die);
        groups[die.element]!.totalPower += value;
      }

      let totalDamageDealt = 0;
      let biggestCombo = 0;
      let lastElement: ElementColor | null = null;

      for (const [elementKey, group] of Object.entries(groups)) {
        if (!group) continue;
        const comboSize = group.dice.length;
        const bonusMult = COLOR_MATCH_BONUS[comboSize] ?? (comboSize > 5 ? 1.0 : 0);
        let power = Math.round(group.totalPower * (1 + bonusMult));

        // Apply conveyor boost
        if (prev.conveyorBoostActive) {
          power *= 2;
        }

        if (comboSize > biggestCombo) biggestCombo = comboSize;
        lastElement = elementKey as ElementColor;

        if (comboSize >= 2) {
          newLogs.push(addLog(
            `${comboSize}x ${group.dice[0]?.emoji ?? ''} combo! +${Math.round(bonusMult * 100)}% bonus → ${power} power`,
            'combo',
            prev
          ));
        }

        // Apply element effect
        const effect = getElementEffect(elementKey as ElementColor);
        if (!effect) {
          // Default: direct damage
          enemy.currentHp -= power;
          totalDamageDealt += power;
          newLogs.push(addLog(`${group.dice[0]?.emoji ?? ''} dealt ${power} damage`, 'damage', prev));
          continue;
        }

        const instantPercent = effect.metadata.instant_damage_percent;
        const dotPercent = effect.metadata.dot_damage_percent;
        const dotDuration = effect.metadata.dot_duration;
        const mechanic = (effect.metadata.special_mechanic ?? '').toLowerCase();

        // Heal
        if (mechanic.includes('heal')) {
          const healAmount = power;
          const maxOverheal = Math.round(prev.playerMaxHp * 1.2);
          playerHp = Math.min(playerHp + healAmount, maxOverheal);
          newLogs.push(addLog(`${effect.metadata.element_emoji} Healed ${healAmount} HP (${playerHp}/${prev.playerMaxHp})`, 'heal', prev));
          continue;
        }

        // Shield (ice)
        if (mechanic.includes('shield') || mechanic.includes('ice armor')) {
          playerShield += power;
          newLogs.push(addLog(`${effect.metadata.element_emoji} Shield +${power} (total: ${playerShield})`, 'shield', prev));
          continue;
        }

        // Stun
        if (mechanic.includes('stun') || mechanic.includes('slow')) {
          const instantDmg = Math.round(power * instantPercent / 100);
          enemy.currentHp -= instantDmg;
          totalDamageDealt += instantDmg;
          const stunAmount = power >= 6 ? 2 : 1;
          enemy.stunTurns += stunAmount;
          newLogs.push(addLog(`${effect.metadata.element_emoji} ${instantDmg} dmg + stun ${stunAmount} turns`, 'stun', prev));
          continue;
        }

        // Lightning (chain/multi-hit)
        if (mechanic.includes('chain') || mechanic.includes('1.5x')) {
          const multiplied = Math.round(power * 1.5);
          enemy.currentHp -= multiplied;
          totalDamageDealt += multiplied;
          newLogs.push(addLog(`${effect.metadata.element_emoji} Lightning ×1.5 → ${multiplied} damage!`, 'damage', prev));
          continue;
        }

        // Generic instant + DoT
        const instantDmg = Math.round(power * instantPercent / 100);
        if (instantDmg > 0) {
          enemy.currentHp -= instantDmg;
          totalDamageDealt += instantDmg;
          newLogs.push(addLog(`${effect.metadata.element_emoji} ${instantDmg} instant damage`, 'damage', prev));
        }

        if (dotPercent > 0 && dotDuration > 0) {
          const totalDot = Math.round(power * dotPercent / 100);
          const perTurn = Math.max(1, Math.round(totalDot / dotDuration));
          const dot: DOTEffect = {
            element: elementKey as ElementColor,
            emoji: effect.metadata.element_emoji,
            damagePerTurn: perTurn,
            turnsRemaining: dotDuration,
          };
          enemy.dotEffects.push(dot);
          newLogs.push(addLog(
            `${effect.metadata.element_emoji} Applied ${perTurn}/turn DoT for ${dotDuration} turns`,
            'dot',
            prev
          ));
        }
      }

      // Check enemy death
      const enemyDead = enemy.currentHp <= 0;
      if (enemyDead) {
        enemy.currentHp = 0;
        newLogs.push(addLog(`💀 ${enemy.name} defeated!`, 'info', prev));
      }

      const dmgColor = lastElement === 'purple' ? '#a855f7'
        : lastElement === 'blue' ? '#3b82f6'
        : '#ef4444';

      return {
        ...prev,
        enemy,
        playerHp,
        playerShield,
        rolledDice: [],
        phase: enemyDead ? 'reward' as GamePhase : 'enemy-turn' as GamePhase,
        battleLog: [...prev.battleLog, ...newLogs],
        lastComboSize: biggestCombo,
        lastDamageDealt: totalDamageDealt,
        lastElementUsed: lastElement,
        isShaking: biggestCombo >= 3,
        showDamageNumber: true,
        damageNumberValue: totalDamageDealt,
        damageNumberColor: dmgColor,
      };
    });

    // Clear animation flags
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isShaking: false,
        showDamageNumber: false,
      }));
    }, 1000);

    // Process enemy turn if not dead
    setTimeout(() => {
      setState(prev => {
        if (prev.phase === 'enemy-turn') {
          processEnemyTurn();
        }
        return prev;
      });
    }, 1200);
  }, [addLog, getElementEffect]);

  const processEnemyTurn = useCallback(() => {
    setState(prev => {
      if (!prev.enemy || prev.phase === 'reward' || prev.phase === 'game-over' || prev.phase === 'victory') return prev;

      let enemy = { ...prev.enemy, dotEffects: [...prev.enemy.dotEffects] };
      let playerHp = prev.playerHp;
      let playerShield = prev.playerShield;
      const newLogs: BattleLogEntry[] = [];

      // Process DOTs
      const remainingDots: DOTEffect[] = [];
      for (const dot of enemy.dotEffects) {
        enemy.currentHp -= dot.damagePerTurn;
        newLogs.push(addLog(`${dot.emoji} DoT ticks for ${dot.damagePerTurn}`, 'dot', prev));
        if (dot.turnsRemaining > 1) {
          remainingDots.push({ ...dot, turnsRemaining: dot.turnsRemaining - 1 });
        }
      }
      enemy.dotEffects = remainingDots;

      // Check enemy death from DOT
      if (enemy.currentHp <= 0) {
        enemy.currentHp = 0;
        newLogs.push(addLog(`💀 ${enemy.name} defeated by damage over time!`, 'info', prev));
        return {
          ...prev,
          enemy,
          phase: 'reward' as GamePhase,
          battleLog: [...prev.battleLog, ...newLogs],
        };
      }

      // Healer mage special
      if (enemy.healTimer !== undefined) {
        const turnCount = prev.turn;
        if (turnCount > 0 && turnCount % 5 === 0 && enemy.currentHp < enemy.maxHp) {
          const healAmt = Math.min(5, enemy.maxHp - enemy.currentHp);
          enemy.currentHp += healAmt;
          newLogs.push(addLog(`${enemy.name} heals ${healAmt} HP!`, 'enemy', prev));
        }
      }

      // Handle stun
      if (enemy.stunTurns > 0) {
        enemy.stunTurns -= 1;
        newLogs.push(addLog(`${enemy.name} is stunned! (${enemy.stunTurns} turns left)`, 'stun', prev));
      } else {
        // Decrement timer
        enemy.currentTimer -= 1;

        if (enemy.currentTimer <= 0) {
          // Enemy attacks!
          let dmg = enemy.damage;

          // Boss phase 2
          if (enemy.isBoss && enemy.currentHp <= enemy.maxHp / 2) {
            dmg *= 2;
            newLogs.push(addLog(`💥 ${enemy.name} Phase 2 — double attack!`, 'enemy', prev));
          }

          // Apply to shield first
          if (playerShield > 0) {
            const absorbed = Math.min(playerShield, dmg);
            playerShield -= absorbed;
            dmg -= absorbed;
            if (absorbed > 0) {
              newLogs.push(addLog(`🛡️ Shield absorbed ${absorbed} damage`, 'shield', prev));
            }
          }

          if (dmg > 0) {
            playerHp -= dmg;
            newLogs.push(addLog(`👹 ${enemy.name} attacks for ${dmg} damage!`, 'enemy', prev));
          }

          enemy.currentTimer = enemy.attackTimer;
        } else {
          newLogs.push(addLog(`⏱️ ${enemy.name} attack in ${enemy.currentTimer} turns`, 'info', prev));
        }
      }

      // Check player death
      if (playerHp <= 0) {
        playerHp = 0;
        newLogs.push(addLog(`💀 You have been slain! Game Over.`, 'enemy', prev));
        return {
          ...prev,
          enemy,
          playerHp,
          playerShield,
          phase: 'game-over' as GamePhase,
          battleLog: [...prev.battleLog, ...newLogs],
        };
      }

      // Advance turn — new die on conveyor
      const newConveyor = [...prev.conveyor];
      // Rightmost falls off if conveyor is full (3)
      if (newConveyor.length >= 3) {
        const fallen = newConveyor.pop();
        if (fallen) {
          newLogs.push(addLog(`${fallen.emoji} fell off the conveyor!`, 'info', prev));
        }
      }
      // Spawn new die on left
      const commonDice = gameData.dice.filter(d => d.metadata.tier.key === 'common');
      let diePool = commonDice.length > 0 ? commonDice : gameData.dice;
      if (prev.floor >= 3) diePool = [...diePool, ...gameData.dice.filter(d => d.metadata.tier.key === 'rare')];
      if (prev.floor >= 6) diePool = [...diePool, ...gameData.dice.filter(d => d.metadata.tier.key === 'epic')];
      const newDie = createGameDie(pickRandom(diePool));
      newConveyor.unshift(newDie);

      return {
        ...prev,
        enemy,
        playerHp,
        playerShield,
        conveyor: newConveyor,
        turn: prev.turn + 1,
        freeRerolls: 2,
        hasStoredThisTurn: false,
        conveyorBoostActive: false,
        inventory: prev.inventory.map(d => ({ ...d, isSelected: false })),
        phase: 'store' as GamePhase,
        battleLog: [...prev.battleLog, ...newLogs],
      };
    });
  }, [addLog, gameData.dice]);

  const handleNextEncounter = useCallback(() => {
    setState(prev => {
      const newEncounter = prev.encounterIndex + 1;
      const healAmount = Math.round(prev.playerMaxHp * 0.25);
      let newHp = Math.min(prev.playerHp + healAmount, prev.playerMaxHp);
      const newLogs: BattleLogEntry[] = [];

      newLogs.push(addLog(`💚 Healed ${healAmount} HP`, 'heal', prev));

      // Chance to get a new die
      const commonDice = gameData.dice.filter(d => d.metadata.tier.key === 'common');
      let diePool = commonDice.length > 0 ? commonDice : gameData.dice;
      if (prev.floor >= 5) diePool = [...diePool, ...gameData.dice.filter(d => d.metadata.tier.key === 'rare')];
      if (prev.floor >= 10) diePool = [...diePool, ...gameData.dice.filter(d => d.metadata.tier.key === 'epic')];

      let newInventory = [...prev.inventory];
      if (newInventory.length < MAX_INVENTORY) {
        const rewardDie = createGameDie(pickRandom(diePool));
        newInventory.push(rewardDie);
        newLogs.push(addLog(`🎲 Found ${rewardDie.emoji} ${rewardDie.tier} die!`, 'info', prev));
      }

      // Check if moving to next floor
      let newFloor = prev.floor;
      let newEncounterIndex = newEncounter;
      if (newEncounter >= prev.encountersPerFloor) {
        newFloor += 1;
        newEncounterIndex = 0;
        newLogs.push(addLog(`🏰 Descended to Floor ${newFloor}!`, 'info', prev));
      }

      // Spawn next enemy
      const isBossFloor = newFloor % 5 === 0 && newEncounterIndex === prev.encountersPerFloor - 1;
      const enemyType = pickEnemy(newFloor);
      const newEnemy = createEnemy(enemyType, newFloor, isBossFloor);
      newLogs.push(addLog(`👹 ${newEnemy.name} appears! (${newEnemy.currentHp} HP)`, 'enemy', prev));

      return {
        ...prev,
        floor: newFloor,
        encounterIndex: newEncounterIndex,
        playerHp: newHp,
        playerShield: 0,
        enemy: newEnemy,
        inventory: newInventory.map(d => ({ ...d, isSelected: false })),
        phase: 'store' as GamePhase,
        battleLog: [...prev.battleLog, ...newLogs],
        turn: prev.turn + 1,
        freeRerolls: 2,
        hasStoredThisTurn: false,
      };
    });
  }, [addLog, gameData.dice, pickEnemy]);

  const handleRestart = useCallback(() => {
    initRun();
  }, [initRun]);

  // Calculate selected count
  const selectedCount = state.inventory.filter(d => d.isSelected).length;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-dungeon-800 border-b border-dungeon-600 px-3 py-2 flex items-center justify-between">
        <Link href="/" className="text-gray-400 hover:text-white text-sm">
          ← Menu
        </Link>
        <h1 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-fire to-heal">
          🎲 Pocket Dicemancer
        </h1>
        <span className="text-xs text-gray-500">F{state.floor}</span>
      </header>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto pb-4">
        {/* Enemy */}
        {state.enemy && (
          <EnemyDisplay
            enemy={state.enemy}
            isShaking={state.isShaking}
            showDamageNumber={state.showDamageNumber}
            damageNumberValue={state.damageNumberValue}
            damageNumberColor={state.damageNumberColor}
          />
        )}

        {/* Combo notification */}
        {state.lastComboSize >= 3 && state.phase === 'reroll' && (
          <div className="text-center animate-pulse">
            <span className={`text-lg font-black ${state.lastComboSize >= 5 ? 'text-lightning text-shadow-glow' : 'text-burn'}`}>
              {state.lastComboSize >= 5 ? '🔥 MEGA COMBO! 🔥' : `${state.lastComboSize}x COMBO!`}
            </span>
          </div>
        )}

        {/* Rolled dice display */}
        {state.rolledDice.length > 0 && (
          <div className="bg-dungeon-700 rounded-xl p-3 border border-dungeon-500">
            <div className="text-xs text-gray-400 mb-2 text-center font-semibold uppercase tracking-wider">
              {state.phase === 'reroll' ? '🎲 Roll Results — tap to hold' : '🎲 Rolling...'}
              {state.conveyorBoostActive && <span className="text-lightning ml-2">⚡ 2x BOOST</span>}
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {state.rolledDice.map(die => (
                <DieComponent
                  key={die.id}
                  die={die}
                  showFace
                  size="lg"
                  onClick={state.phase === 'reroll' ? () => handleToggleHold(die.id) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Game Over / Victory overlay */}
        {state.phase === 'game-over' && (
          <div className="bg-red-900/30 rounded-xl p-6 border border-red-600 text-center animate-fade-in">
            <div className="text-4xl mb-2">💀</div>
            <h2 className="text-2xl font-black text-red-400 mb-2">Game Over</h2>
            <p className="text-gray-400 text-sm">
              Reached Floor {state.floor} · Turn {state.turn} · {state.encounterIndex} encounters
            </p>
          </div>
        )}

        {state.phase === 'reward' && (
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-600/30 text-center animate-fade-in">
            <div className="text-3xl mb-1">🎉</div>
            <h3 className="text-lg font-bold text-green-400">Enemy Defeated!</h3>
            <p className="text-xs text-gray-400 mt-1">Claim your reward and continue...</p>
          </div>
        )}

        {/* Changed: Conveyor — now passes turn for animation triggers */}
        <ConveyorBelt
          conveyor={state.conveyor}
          onStoreDie={handleStoreDie}
          canStore={
            (state.phase === 'store' || state.phase === 'discard') &&
            state.inventory.length < MAX_INVENTORY
          }
          turn={state.turn}
        />

        {/* Inventory */}
        <InventoryGrid
          inventory={state.inventory}
          onSelectDie={handleSelectDie}
          onDiscardDie={handleDiscardDie}
          canSelect={state.phase === 'store' || state.phase === 'discard' || state.phase === 'roll-select'}
          canDiscard={state.phase === 'store' || state.phase === 'discard'}
          maxSlots={MAX_INVENTORY}
        />

        {/* Controls */}
        <GameControls
          phase={state.phase}
          rerollTokens={state.rerollTokens}
          freeRerolls={state.freeRerolls}
          turn={state.turn}
          floor={state.floor}
          encounterIndex={state.encounterIndex}
          encountersPerFloor={state.encountersPerFloor}
          playerHp={state.playerHp}
          playerMaxHp={state.playerMaxHp}
          playerShield={state.playerShield}
          hasStoredThisTurn={state.hasStoredThisTurn}
          conveyorLength={state.conveyor.length}
          selectedCount={selectedCount}
          rolledDice={state.rolledDice}
          onRollFromInventory={handleRollFromInventory}
          onRollFromConveyor={handleRollFromConveyor}
          onSkipTurn={handleSkipTurn}
          onReroll={handleReroll}
          onConfirmRoll={handleConfirmRoll}
          onNextEncounter={handleNextEncounter}
          onRestart={handleRestart}
        />

        {/* Battle Log */}
        <BattleLog log={state.battleLog} />
      </div>
    </div>
  );
}