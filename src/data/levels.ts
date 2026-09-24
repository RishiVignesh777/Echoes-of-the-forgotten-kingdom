/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnemyType } from '../game/GameState.ts';
import { ItemType } from './items.ts';
import { LightSource } from '../rendering/Lighting.ts';

export interface LevelEnemySpawn {
  type: EnemyType;
  x: number;
  y: number;
  patrolDistance?: number;
}

export interface LevelItemSpawn {
  id: string;
  type: ItemType;
  x: number;
  y: number;
}

export interface LevelDoorData {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  initiallyOpen?: boolean;
}

export interface LevelPlateData {
  id: string;
  targetId: string;
  x: number;
  y: number;
}

export interface LevelSwitchData {
  id: string;
  targetId: string;
  x: number;
  y: number;
}

export interface LevelPlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  isOneWay?: boolean;
  movingConfig?: { targetX: number; targetY: number; speed: number };
}

export interface LevelData {
  id: string;
  name: string;
  subtitle: string;
  areaNumber: number;
  width: number;
  height: number;
  ambientColor: string;
  weatherEffect: 'wind' | 'leaves' | 'rain' | 'dust' | 'astral';
  skyGradient: [string, string];
  spawnX: number;
  spawnY: number;
  nextLevelId: string | null;
  exitTrigger: { x: number; y: number; width: number; height: number };
  tileMap: string[];
  platforms: LevelPlatformData[];
  doors: LevelDoorData[];
  pressurePlates: LevelPlateData[];
  switches: LevelSwitchData[];
  checkpoints: { id: string; x: number; y: number }[];
  items: LevelItemSpawn[];
  enemies: LevelEnemySpawn[];
  torches: LightSource[];
}

export const LEVELS: LevelData[] = [
  // ==========================================
  // AREA 1: THE FORGOTTEN VILLAGE
  // ==========================================
  {
    id: 'village',
    name: 'The Forgotten Village',
    subtitle: 'Where time first stood still under the amber twilight',
    areaNumber: 1,
    width: 3200,
    height: 720,
    ambientColor: 'rgba(15, 12, 22, 0.45)',
    weatherEffect: 'wind',
    skyGradient: ['#1e1b4b', '#7c2d12'],
    spawnX: 120,
    spawnY: 530,
    nextLevelId: 'forest',
    exitTrigger: { x: 3100, y: 460, width: 90, height: 160 },
    tileMap: [
      // 3200px width / 48px tile ~= 66 columns
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '...................PP.............................................',
      '.............PP.......................PP..........................',
      '.......PP.........................................................',
      '...........................PPPP...............PP..........PPPP....',
      '##################################################################',
      '##################################################################',
    ],
    platforms: [
      { x: 420, y: 440, width: 140, height: 16, isOneWay: true },
      { x: 680, y: 380, width: 150, height: 16, isOneWay: true },
      { x: 980, y: 340, width: 160, height: 16, isOneWay: true },
      { x: 1380, y: 440, width: 140, height: 16, isOneWay: false },
      {
        x: 1820,
        y: 450,
        width: 140,
        height: 18,
        isOneWay: false,
        movingConfig: { targetX: 2040, targetY: 450, speed: 70 },
      },
      { x: 2360, y: 410, width: 160, height: 16, isOneWay: true },
      { x: 2680, y: 350, width: 160, height: 16, isOneWay: true },
    ],
    doors: [
      { id: 'village_gate', x: 2180, y: 432, width: 32, height: 96 },
    ],
    pressurePlates: [
      // Puzzle: Plate is placed at 1680. Player stands on plate (or steps on it while recording),
      // then summons an Echo with [Q] who repeats standing on it, keeping the village gate open!
      { id: 'plate_village', targetId: 'village_gate', x: 1640, y: 520 },
    ],
    switches: [
      { id: 'switch_altar', targetId: 'village_gate', x: 1040, y: 300 },
    ],
    checkpoints: [
      { id: 'cp_village_start', x: 740, y: 448 },
      { id: 'cp_village_gate', x: 2260, y: 448 },
    ],
    items: [
      { id: 'item_coin_1', type: 'ANCIENT_COIN', x: 460, y: 400 },
      { id: 'item_potion_1', type: 'HEALTH_POTION', x: 1020, y: 295 },
      { id: 'item_echo_frag_1', type: 'ECHO_FRAGMENT', x: 1440, y: 395 }, // Grants 2nd/3rd Echo slot!
      { id: 'item_coin_2', type: 'ANCIENT_COIN', x: 2420, y: 360 },
      { id: 'item_relic_1', type: 'KNIGHT_RELIC', x: 2750, y: 300 },
    ],
    enemies: [
      { type: EnemyType.CORRUPTED_KNIGHT, x: 860, y: 460, patrolDistance: 130 },
      { type: EnemyType.SHADOW_WOLF, x: 1480, y: 480, patrolDistance: 160 },
      { type: EnemyType.CORRUPTED_KNIGHT, x: 2520, y: 460, patrolDistance: 140 },
    ],
    torches: [
      { x: 280, y: 470, radius: 180, intensity: 0.85, color: 'rgba(251, 146, 60, 0.25)', flicker: true },
      { x: 1140, y: 470, radius: 190, intensity: 0.85, color: 'rgba(251, 146, 60, 0.25)', flicker: true },
      { x: 1640, y: 480, radius: 210, intensity: 0.9, color: 'rgba(56, 189, 248, 0.3)', flicker: true },
      { x: 2180, y: 420, radius: 200, intensity: 0.85, color: 'rgba(251, 146, 60, 0.25)', flicker: true },
      { x: 3000, y: 460, radius: 210, intensity: 0.85, color: 'rgba(251, 146, 60, 0.25)', flicker: true },
    ],
  },

  // ==========================================
  // AREA 2: THE WHISPERING FOREST
  // ==========================================
  {
    id: 'forest',
    name: 'The Whispering Forest',
    subtitle: 'Where ancient branches entrap temporal echoes in petrified moss',
    areaNumber: 2,
    width: 3400,
    height: 720,
    ambientColor: 'rgba(6, 18, 14, 0.65)',
    weatherEffect: 'leaves',
    skyGradient: ['#022c22', '#14532d'],
    spawnX: 120,
    spawnY: 530,
    nextLevelId: 'castle',
    exitTrigger: { x: 3300, y: 460, width: 90, height: 160 },
    tileMap: [
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '...................PP.............................................',
      '............PP.........................PP........PP...............',
      '......PP.........................PP...............................',
      '.....................PP...............................PP..........',
      '##################################################################',
    ],
    platforms: [
      { x: 360, y: 420, width: 140, height: 16, isOneWay: true },
      { x: 620, y: 340, width: 160, height: 16, isOneWay: true },
      {
        x: 940,
        y: 400,
        width: 140,
        height: 18,
        isOneWay: false,
        movingConfig: { targetX: 1260, targetY: 400, speed: 85 },
      },
      { x: 1480, y: 380, width: 160, height: 16, isOneWay: true },
      { x: 1820, y: 320, width: 150, height: 16, isOneWay: true },
      {
        x: 2180,
        y: 460,
        width: 140,
        height: 18,
        isOneWay: false,
        movingConfig: { targetX: 2180, targetY: 260, speed: 70 }, // Vertical elevator
      },
      { x: 2480, y: 260, width: 180, height: 16, isOneWay: false },
    ],
    doors: [
      { id: 'forest_barrier', x: 2840, y: 432, width: 32, height: 96 },
    ],
    pressurePlates: [
      // Echo required on plate atop high canopy to open barrier below!
      { id: 'plate_canopy', targetId: 'forest_barrier', x: 2540, y: 250 },
    ],
    switches: [],
    checkpoints: [
      { id: 'cp_forest_mid', x: 1520, y: 300 },
    ],
    items: [
      { id: 'forest_coin', type: 'ANCIENT_COIN', x: 660, y: 300 },
      { id: 'forest_pot', type: 'HEALTH_POTION', x: 1860, y: 270 },
      { id: 'forest_frag', type: 'ECHO_FRAGMENT', x: 2600, y: 210 },
    ],
    enemies: [
      { type: EnemyType.SHADOW_WOLF, x: 740, y: 480, patrolDistance: 180 },
      { type: EnemyType.FUNGAL_BRUTE, x: 1720, y: 450, patrolDistance: 120 },
      { type: EnemyType.SHADOW_WOLF, x: 2360, y: 480, patrolDistance: 160 },
      { type: EnemyType.FUNGAL_BRUTE, x: 3040, y: 450, patrolDistance: 100 },
    ],
    torches: [
      { x: 640, y: 320, radius: 200, intensity: 0.9, color: 'rgba(52, 211, 153, 0.35)', flicker: true },
      { x: 1840, y: 300, radius: 210, intensity: 0.9, color: 'rgba(52, 211, 153, 0.35)', flicker: true },
      { x: 2840, y: 420, radius: 220, intensity: 0.85, color: 'rgba(56, 189, 248, 0.3)', flicker: true },
    ],
  },

  // ==========================================
  // AREA 3: THE RUINED CASTLE
  // ==========================================
  {
    id: 'castle',
    name: 'The Ruined Castle',
    subtitle: 'High parapets battered by eternal squalls and spectral sentinels',
    areaNumber: 3,
    width: 3600,
    height: 720,
    ambientColor: 'rgba(12, 16, 26, 0.6)',
    weatherEffect: 'rain',
    skyGradient: ['#0f172a', '#334155'],
    spawnX: 120,
    spawnY: 530,
    nextLevelId: 'crypt',
    exitTrigger: { x: 3500, y: 460, width: 90, height: 160 },
    tileMap: [
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '..................................................................',
      '##################################################################',
    ],
    platforms: [
      { x: 420, y: 420, width: 140, height: 18, isOneWay: false },
      { x: 740, y: 340, width: 150, height: 18, isOneWay: true },
      {
        x: 1060,
        y: 340,
        width: 140,
        height: 18,
        isOneWay: false,
        movingConfig: { targetX: 1360, targetY: 260, speed: 75 },
      },
      { x: 1580, y: 260, width: 160, height: 18, isOneWay: false },
      { x: 1940, y: 340, width: 150, height: 18, isOneWay: true },
      { x: 2320, y: 400, width: 160, height: 18, isOneWay: false },
      { x: 2740, y: 300, width: 180, height: 18, isOneWay: true },
    ],
    doors: [
      { id: 'castle_portcullis', x: 2980, y: 432, width: 32, height: 96 },
    ],
    pressurePlates: [
      { id: 'plate_castle', targetId: 'castle_portcullis', x: 2380, y: 390 },
    ],
    switches: [
      { id: 'switch_tower', targetId: 'castle_portcullis', x: 1640, y: 218 },
    ],
    checkpoints: [
      { id: 'cp_castle_rampart', x: 1600, y: 180 },
    ],
    items: [
      { id: 'castle_pot', type: 'HEALTH_POTION', x: 780, y: 295 },
      { id: 'castle_coin', type: 'ANCIENT_COIN', x: 1980, y: 300 },
      { id: 'castle_relic', type: 'KNIGHT_RELIC', x: 2800, y: 250 },
    ],
    enemies: [
      { type: EnemyType.CORRUPTED_KNIGHT, x: 800, y: 460, patrolDistance: 120 },
      { type: EnemyType.ARCANE_WRAITH, x: 1640, y: 200, patrolDistance: 160 },
      { type: EnemyType.CORRUPTED_KNIGHT, x: 2400, y: 460, patrolDistance: 150 },
      { type: EnemyType.ARCANE_WRAITH, x: 3100, y: 380, patrolDistance: 160 },
    ],
    torches: [
      { x: 440, y: 400, radius: 210, intensity: 0.9, color: 'rgba(251, 146, 60, 0.3)', flicker: true },
      { x: 1600, y: 240, radius: 230, intensity: 0.95, color: 'rgba(192, 132, 252, 0.35)', flicker: true },
      { x: 2980, y: 410, radius: 210, intensity: 0.9, color: 'rgba(251, 146, 60, 0.3)', flicker: true },
    ],
  },

  // ==========================================
  // AREA 4: THE SUNKEN CRYPT
  // ==========================================
  {
    id: 'crypt',
    name: 'The Sunken Crypt',
    subtitle: 'Underground tomb where the souls of oathbound knights kindle blue soulfire',
    areaNumber: 4,
    width: 3400,
    height: 720,
    ambientColor: 'rgba(4, 8, 16, 0.82)', // Deep darkness requiring torches
    weatherEffect: 'dust',
    skyGradient: ['#030712', '#0f172a'],
    spawnX: 120,
    spawnY: 530,
    nextLevelId: 'tower',
    exitTrigger: { x: 3300, y: 460, width: 90, height: 160 },
    tileMap: [
      '..................................................................',
      '##################################################################',
    ],
    platforms: [
      { x: 420, y: 440, width: 140, height: 18, isOneWay: false },
      { x: 780, y: 380, width: 150, height: 18, isOneWay: true },
      { x: 1140, y: 320, width: 160, height: 18, isOneWay: false },
      {
        x: 1540,
        y: 420,
        width: 140,
        height: 18,
        isOneWay: false,
        movingConfig: { targetX: 1840, targetY: 420, speed: 80 },
      },
      { x: 2160, y: 380, width: 160, height: 18, isOneWay: true },
      { x: 2540, y: 300, width: 180, height: 18, isOneWay: false },
    ],
    doors: [
      { id: 'crypt_door', x: 2880, y: 432, width: 32, height: 96 },
    ],
    pressurePlates: [
      { id: 'crypt_plate', targetId: 'crypt_door', x: 2600, y: 290 },
    ],
    switches: [
      { id: 'crypt_switch', targetId: 'crypt_door', x: 1200, y: 278 },
    ],
    checkpoints: [
      { id: 'cp_crypt_altar', x: 1160, y: 240 },
    ],
    items: [
      { id: 'crypt_frag', type: 'ECHO_FRAGMENT', x: 820, y: 335 },
      { id: 'crypt_pot', type: 'HEALTH_POTION', x: 2200, y: 335 },
      { id: 'crypt_coin', type: 'ANCIENT_COIN', x: 2640, y: 255 },
    ],
    enemies: [
      { type: EnemyType.CORRUPTED_KNIGHT, x: 820, y: 460, patrolDistance: 130 },
      { type: EnemyType.ARCANE_WRAITH, x: 1460, y: 360, patrolDistance: 160 },
      { type: EnemyType.FUNGAL_BRUTE, x: 2200, y: 450, patrolDistance: 120 },
      { type: EnemyType.ARCANE_WRAITH, x: 2960, y: 400, patrolDistance: 140 },
    ],
    torches: [
      { x: 300, y: 470, radius: 220, intensity: 0.95, color: 'rgba(103, 232, 249, 0.4)', flicker: true },
      { x: 1160, y: 300, radius: 240, intensity: 1.0, color: 'rgba(103, 232, 249, 0.45)', flicker: true },
      { x: 2540, y: 280, radius: 230, intensity: 0.95, color: 'rgba(103, 232, 249, 0.4)', flicker: true },
      { x: 2880, y: 410, radius: 220, intensity: 0.95, color: 'rgba(103, 232, 249, 0.4)', flicker: true },
    ],
  },

  // ==========================================
  // AREA 5: THE CELESTIAL TOWER
  // ==========================================
  {
    id: 'tower',
    name: 'The Celestial Tower',
    subtitle: 'The epicenter of frozen eternity where The Timeless King awaits',
    areaNumber: 5,
    width: 2560,
    height: 720,
    ambientColor: 'rgba(18, 10, 36, 0.55)',
    weatherEffect: 'astral',
    skyGradient: ['#1e1b4b', '#4c1d95'],
    spawnX: 160,
    spawnY: 530,
    nextLevelId: null, // Final battle!
    exitTrigger: { x: 2480, y: 460, width: 80, height: 160 },
    tileMap: [
      '..................................................................',
      '##################################################################',
    ],
    platforms: [
      { x: 420, y: 420, width: 160, height: 18, isOneWay: true },
      { x: 740, y: 340, width: 160, height: 18, isOneWay: true },
      { x: 1060, y: 440, width: 160, height: 18, isOneWay: true },
      // Boss arena elevated flanks
      { x: 1380, y: 380, width: 180, height: 20, isOneWay: true },
      { x: 1980, y: 380, width: 180, height: 20, isOneWay: true },
    ],
    doors: [],
    pressurePlates: [],
    switches: [],
    checkpoints: [
      { id: 'cp_tower_gates', x: 260, y: 448 },
    ],
    items: [
      { id: 'tower_pot_1', type: 'HEALTH_POTION', x: 460, y: 375 },
      { id: 'tower_pot_2', type: 'HEALTH_POTION', x: 1420, y: 335 },
      { id: 'tower_pot_3', type: 'HEALTH_POTION', x: 2020, y: 335 },
    ],
    enemies: [
      // The Final Boss!
      { type: EnemyType.TIMELESS_KING, x: 1720, y: 410, patrolDistance: 300 },
    ],
    torches: [
      { x: 300, y: 460, radius: 240, intensity: 0.9, color: 'rgba(192, 132, 252, 0.4)', flicker: true },
      { x: 1460, y: 360, radius: 250, intensity: 0.95, color: 'rgba(192, 132, 252, 0.45)', flicker: true },
      { x: 2060, y: 360, radius: 250, intensity: 0.95, color: 'rgba(192, 132, 252, 0.45)', flicker: true },
      { x: 1720, y: 430, radius: 300, intensity: 1.0, color: 'rgba(168, 85, 247, 0.4)', flicker: true },
    ],
  },
];
