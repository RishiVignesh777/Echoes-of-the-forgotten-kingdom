/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnemyType } from '../game/GameState.ts';

export interface EnemyDef {
  type: EnemyType;
  name: string;
  description: string;
  maxHealth: number;
  damage: number;
  xpReward: number;
}

export const ENEMY_DEFINITIONS: Record<EnemyType, EnemyDef> = {
  [EnemyType.CORRUPTED_KNIGHT]: {
    type: EnemyType.CORRUPTED_KNIGHT,
    name: 'Corrupted Knight',
    description: 'Former guardian of the royal court, now twisted by the frozen curse.',
    maxHealth: 80,
    damage: 22,
    xpReward: 50,
  },
  [EnemyType.SHADOW_WOLF]: {
    type: EnemyType.SHADOW_WOLF,
    name: 'Shadow Wolf',
    description: 'A swift, ravenous beast woven from the temporal rifts in the ancient forest.',
    maxHealth: 50,
    damage: 18,
    xpReward: 40,
  },
  [EnemyType.FUNGAL_BRUTE]: {
    type: EnemyType.FUNGAL_BRUTE,
    name: 'Fungal Brute',
    description: 'An ancient moss-covered earth titan empowered with subterranean spore vitality.',
    maxHealth: 140,
    damage: 34,
    xpReward: 90,
  },
  [EnemyType.ARCANE_WRAITH]: {
    type: EnemyType.ARCANE_WRAITH,
    name: 'Arcane Wraith',
    description: 'A hovering shadow of a court sorcerer slinging lethal celestial bolts.',
    maxHealth: 70,
    damage: 20,
    xpReward: 75,
  },
  [EnemyType.TIMELESS_KING]: {
    type: EnemyType.TIMELESS_KING,
    name: 'The Timeless King',
    description: 'Monarch of the forgotten realm, shattered by the Heart of Eternity.',
    maxHealth: 450,
    damage: 40,
    xpReward: 500,
  },
};
