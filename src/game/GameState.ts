/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameMode {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_SELECT = 'LEVEL_SELECT',
  CONTROLS = 'CONTROLS',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum PlayerState {
  IDLE = 'IDLE',
  RUN = 'RUN',
  JUMP = 'JUMP',
  FALL = 'FALL',
  ATTACK = 'ATTACK',
  HEAVY_ATTACK = 'HEAVY_ATTACK',
  BLOCK = 'BLOCK',
  DASH = 'DASH',
  HURT = 'HURT',
  DEATH = 'DEATH',
  ECHO_CAST = 'ECHO_CAST'
}

export enum EnemyState {
  IDLE = 'IDLE',
  PATROL = 'PATROL',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
  HURT = 'HURT',
  DEAD = 'DEAD'
}

export enum EnemyType {
  CORRUPTED_KNIGHT = 'CORRUPTED_KNIGHT',
  SHADOW_WOLF = 'SHADOW_WOLF',
  FUNGAL_BRUTE = 'FUNGAL_BRUTE',
  ARCANE_WRAITH = 'ARCANE_WRAITH',
  TIMELESS_KING = 'TIMELESS_KING'
}

export interface PlayerSnapshot {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facing: number;
  state: PlayerState;
  attacking: boolean;
  heavyAttacking: boolean;
  blocking: boolean;
  dashTrail: boolean;
  animTimer: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HitBox extends Rect {
  damage: number;
  knockbackX: number;
  knockbackY: number;
  isHeavy?: boolean;
  ownerId: string;
}
