/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Camera } from '../game/Camera.ts';
import { Player } from '../entities/Player.ts';
import { EchoSystem } from '../systems/EchoSystem.ts';
import { Enemy } from '../entities/Enemy.ts';
import { Projectile } from '../entities/Projectile.ts';
import { Platform } from '../world/Platform.ts';
import { Door } from '../world/Door.ts';
import { PressurePlate } from '../world/PressurePlate.ts';
import { Switch } from '../world/Switch.ts';
import { Checkpoint } from '../world/Checkpoint.ts';
import { Item } from '../data/items.ts';
import { TileMap } from '../world/TileMap.ts';
import { ParticleSystem } from './ParticleSystem.ts';
import { Lighting } from './Lighting.ts';
import { HUD } from '../ui/HUD.ts';
import { Menu } from '../ui/Menu.ts';
import { GameMode } from '../game/GameState.ts';
import { Input } from '../game/Input.ts';
import { TimelessKing } from '../entities/Boss.ts';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 1280;
  private height: number = 720;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D rendering context');
    this.ctx = ctx;

    // Crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  public clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * 5-Layer Parallax Background
   */
  public renderBackground(camera: Camera, skyGrad: [string, string], levelId: string): void {
    const ctx = this.ctx;
    const cx = camera.renderX;
    const cy = camera.renderY;

    // Layer 1: Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, skyGrad[0]);
    sky.addColorStop(1, skyGrad[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars / Celestial particles if tower or castle
    if (levelId === 'tower' || levelId === 'castle') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 45; i++) {
        const sx = ((i * 137.5) % this.width);
        const sy = ((i * 83.2) % 360);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }

    // Layer 2: Distant Mountains (Parallax 0.15)
    ctx.save();
    ctx.fillStyle = levelId === 'forest' ? '#062d1d' : levelId === 'crypt' ? '#09090b' : '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    const mtnOffset = cx * 0.15;
    for (let x = -100; x <= this.width + 100; x += 180) {
      const peakX = x;
      const peakY = 320 + Math.sin((x + mtnOffset) * 0.005) * 80;
      ctx.lineTo(peakX, peakY);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Layer 3: Castle & Mountain Silhouettes (Parallax 0.30)
    ctx.save();
    ctx.fillStyle = levelId === 'forest' ? '#042215' : levelId === 'crypt' ? '#0c0a09' : '#0f172a';
    const castleOffset = cx * 0.3;
    const baseY = 420;

    for (let x = -200; x <= this.width + 200; x += 320) {
      const sx = x - (castleOffset % 320);
      // Ruined Fortress spires
      ctx.fillRect(sx, baseY - 120, 60, 240);
      ctx.fillRect(sx - 10, baseY - 140, 80, 20); // Battlement
      ctx.fillRect(sx + 100, baseY - 80, 110, 200);
    }
    ctx.restore();

    // Layer 4: Midground Pine Trees & Distant Architecture (Parallax 0.55)
    ctx.save();
    ctx.fillStyle = levelId === 'forest' ? '#02180d' : '#18181b';
    const midOffset = cx * 0.55;
    for (let x = -100; x <= this.width + 100; x += 70) {
      const treeX = x - (midOffset % 70);
      const treeH = 140 + Math.sin(x) * 30;
      // Conifer shape
      ctx.beginPath();
      ctx.moveTo(treeX, 520 - treeH);
      ctx.lineTo(treeX - 22, 520);
      ctx.lineTo(treeX + 22, 520);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Main World Rendering Pass
   */
  public renderWorld(
    tileMap: TileMap,
    platforms: Platform[],
    doors: Door[],
    pressurePlates: PressurePlate[],
    switches: Switch[],
    checkpoints: Checkpoint[],
    items: Item[],
    camera: Camera,
    playerNearCheckpoint: boolean
  ): void {
    const cx = camera.renderX;
    const cy = camera.renderY;
    const ctx = this.ctx;

    // 1. Tilemap terrain & backdrop architecture
    tileMap.render(ctx, cx, cy);

    // 2. Platforms
    for (const plat of platforms) {
      plat.render(ctx, cx, cy);
    }

    // 3. Pressure Plates
    for (const plate of pressurePlates) {
      plate.render(ctx, cx, cy);
    }

    // 4. Doors & Portcullises
    for (const door of doors) {
      door.render(ctx, cx, cy);
    }

    // 5. Switches & Levers
    for (const sw of switches) {
      sw.render(ctx, cx, cy);
    }

    // 6. Checkpoints
    for (const cp of checkpoints) {
      cp.render(ctx, cx, cy, playerNearCheckpoint);
    }

    // 7. Items
    for (const it of items) {
      it.render(ctx, cx, cy);
    }
  }

  public renderEntities(
    player: Player,
    echoSystem: EchoSystem,
    enemies: Enemy[],
    projectiles: Projectile[],
    camera: Camera
  ): void {
    const cx = camera.renderX;
    const cy = camera.renderY;

    // 1. Echoes
    echoSystem.render(this.ctx, cx, cy);

    // 2. Player Kael
    player.render(this.ctx, cx, cy);

    // 3. Enemies
    for (const enemy of enemies) {
      enemy.render(this.ctx, cx, cy);
    }

    // 4. Projectiles
    for (const proj of projectiles) {
      proj.render(this.ctx, cx, cy);
    }
  }

  public renderParticles(particles: ParticleSystem, camera: Camera): void {
    particles.render(this.ctx, camera.renderX, camera.renderY);
  }

  public renderLighting(lighting: Lighting, camera: Camera): void {
    lighting.render(this.ctx, camera.renderX, camera.renderY);
  }

  public renderScreenEffects(camera: Camera): void {
    if (camera.flashAlpha > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = camera.flashAlpha;
      this.ctx.fillStyle = camera.flashColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }
  }

  public renderHUD(
    hud: HUD,
    player: Player,
    echoSystem: EchoSystem,
    activeBoss: TimelessKing | null,
    levelName: string,
    areaNumber: number
  ): void {
    hud.render(this.ctx, player, echoSystem, activeBoss, levelName, areaNumber);
  }

  public renderMenu(
    menu: Menu,
    mode: GameMode,
    input: Input,
    callbacks: {
      onStart: () => void;
      onResume: () => void;
      onRestart: () => void;
      onRespawn: () => void;
      onSelectLevel: (levelId: string) => void;
      onToggleControls: () => void;
      onToggleSound: () => boolean;
      onToggleMusic: () => boolean;
      onMainMenu: () => void;
      isSoundEnabled: () => boolean;
      isMusicEnabled: () => boolean;
    }
  ): void {
    menu.render(this.ctx, mode, input, callbacks);
  }
}
