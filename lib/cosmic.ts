import { createBucketClient } from '@cosmicjs/sdk';
import type { DiceDefinition, ElementEffect, EnemyType, GameData } from '@/types';
import { hasStatus } from '@/types';

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
});

export async function getDiceDefinitions(): Promise<DiceDefinition[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'dice-definitions' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
      .limit(50);
    return response.objects as DiceDefinition[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch dice definitions');
  }
}

export async function getElementEffects(): Promise<ElementEffect[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'element-effects' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
      .limit(50);
    return response.objects as ElementEffect[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch element effects');
  }
}

export async function getEnemyTypes(): Promise<EnemyType[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'enemy-types' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)
      .limit(50);
    return response.objects as EnemyType[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch enemy types');
  }
}

export async function getAllGameData(): Promise<GameData> {
  const [dice, elements, enemies] = await Promise.all([
    getDiceDefinitions(),
    getElementEffects(),
    getEnemyTypes(),
  ]);
  return { dice, elements, enemies };
}