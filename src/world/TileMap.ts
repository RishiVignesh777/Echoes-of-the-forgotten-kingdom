/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect } from '../game/GameState.ts';
import { Collision } from '../game/Collision.ts';

export class TileMap {
  public static readonly TILE_SIZE = 48;
  public width: number = 3200;
  public height: number = 720;
  public groundY: number = 528; // main baseline floor
  public levelId: string = 'village';

  public loadLevel(levelId: string, width: number, height: number): void {
    this.levelId = levelId;
    this.width = width;
    this.height = height;
    this.groundY = height - TileMap.TILE_SIZE * 4;
  }

  /**
   * Resolves collision between an entity and the solid world floor/walls
   */
  public collideEntity(entity: Rect, prevY: number, vy: number): { grounded: boolean; adjustedY: number } {
    const feet = entity.y + entity.height;
    if (feet >= this.groundY) {
      return {
        grounded: true,
        adjustedY: this.groundY - entity.height,
      };
    }
    return {
      grounded: false,
      adjustedY: entity.y,
    };
  }

  /**
   * Checks if an entity is on the ground
   */
  public isGrounded(entity: Rect): boolean {
    return entity.y + entity.height >= this.groundY - 1;
  }

  /**
   * Renders the themed terrain, stone road, and architectural structures
   */
  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const startX = Math.max(0, Math.floor(camX / TileMap.TILE_SIZE) * TileMap.TILE_SIZE);
    const endX = Math.min(this.width, Math.ceil((camX + 1300) / TileMap.TILE_SIZE) * TileMap.TILE_SIZE);

    ctx.save();

    // 1. Environmental Structures (Behind Player)
    switch (this.levelId) {
      case 'village':
        this.renderVillageEnvironment(ctx, camX, camY);
        break;
      case 'forest':
        this.renderForestEnvironment(ctx, camX, camY);
        break;
      case 'castle':
        this.renderCastleEnvironment(ctx, camX, camY);
        break;
      case 'crypt':
        this.renderCryptEnvironment(ctx, camX, camY);
        break;
      case 'tower':
        this.renderTowerEnvironment(ctx, camX, camY);
        break;
    }

    // 2. Ground Terrain & Subsoil
    const gy = this.groundY - camY;
    const groundH = this.height - this.groundY + 100;

    // Deep subsoil rock
    ctx.fillStyle = this.levelId === 'crypt' ? '#18181b' : this.levelId === 'forest' ? '#142e1d' : '#292524';
    ctx.fillRect(startX - camX, gy + 16, endX - startX, groundH);

    // Stone road / Grass top layer
    for (let x = startX; x < endX; x += TileMap.TILE_SIZE) {
      const rx = x - camX;

      if (this.levelId === 'village') {
        // Cobblestone road with grass tufts
        ctx.fillStyle = '#57534e';
        ctx.fillRect(rx, gy, TileMap.TILE_SIZE, 18);
        ctx.fillStyle = '#44403c';
        ctx.fillRect(rx + 2, gy + 4, TileMap.TILE_SIZE - 4, 10);
        // Grass trim
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(rx, gy, TileMap.TILE_SIZE, 3);
        // Stone paving joints
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx + 2, gy + 2, 20, 8);
        ctx.strokeRect(rx + 24, gy + 2, 20, 8);
      } else if (this.levelId === 'forest') {
        // Mossy soil with exposed roots
        ctx.fillStyle = '#166534';
        ctx.fillRect(rx, gy, TileMap.TILE_SIZE, 6);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(rx, gy + 6, TileMap.TILE_SIZE, 12);
        // Twisted root strands
        ctx.fillStyle = '#78350f';
        ctx.fillRect(rx + 6, gy + 8, TileMap.TILE_SIZE - 12, 5);
      } else if (this.levelId === 'castle') {
        // Smooth fortress flagstone
        ctx.fillStyle = '#78716c';
        ctx.fillRect(rx, gy, TileMap.TILE_SIZE, 18);
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2;
        ctx.strokeRect(rx, gy, TileMap.TILE_SIZE, 18);
      } else if (this.levelId === 'crypt') {
        // Dark sunken catacomb slabs
        ctx.fillStyle = '#27272a';
        ctx.fillRect(rx, gy, TileMap.TILE_SIZE, 18);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(rx + 4, gy + 3, TileMap.TILE_SIZE - 8, 12);
      } else {
        // Celestial astral crystal platforming
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(rx, gy, TileMap.TILE_SIZE, 18);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(rx, gy, TileMap.TILE_SIZE, 4);
      }
    }

    ctx.restore();
  }

  // --- Village Architectural Props ---
  private renderVillageEnvironment(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const gy = this.groundY - camY;

    // Cottages
    const houses = [
      { x: 180, w: 220, h: 160 },
      { x: 1040, w: 260, h: 180 },
      { x: 2640, w: 240, h: 170 },
    ];

    for (const h of houses) {
      const rx = h.x - camX;
      if (rx < -300 || rx > 1350) continue;

      // Stone Wall Base
      ctx.fillStyle = '#57534e';
      ctx.fillRect(rx, gy - h.h, h.w, h.h);

      // Wooden Timber Beams
      ctx.fillStyle = '#451a03';
      ctx.fillRect(rx, gy - h.h, 12, h.h);
      ctx.fillRect(rx + h.w - 12, gy - h.h, 12, h.h);
      ctx.fillRect(rx, gy - h.h, h.w, 10);
      ctx.fillRect(rx, gy - h.h / 2, h.w, 8);

      // Thatched / Tiled Roof (A-frame)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(rx - 20, gy - h.h);
      ctx.lineTo(rx + h.w / 2, gy - h.h - 70);
      ctx.lineTo(rx + h.w + 20, gy - h.h);
      ctx.closePath();
      ctx.fill();

      // Stone Chimney
      ctx.fillStyle = '#78716c';
      ctx.fillRect(rx + h.w - 40, gy - h.h - 85, 24, 60);

      // Warm glowing windows (time frozen)
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 10;
      ctx.fillRect(rx + 35, gy - h.h + 30, 32, 36);
      ctx.fillRect(rx + h.w - 65, gy - h.h + 30, 32, 36);
      ctx.shadowBlur = 0;

      // Wooden Door
      ctx.fillStyle = '#29180c';
      ctx.fillRect(rx + h.w / 2 - 18, gy - 60, 36, 60);
    }

    // Broken Cart
    const cartX = 840 - camX;
    if (cartX > -100 && cartX < 1350) {
      ctx.fillStyle = '#5c2d11';
      ctx.fillRect(cartX, gy - 26, 60, 16);
      // Wheels
      ctx.strokeStyle = '#29180c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cartX + 12, gy - 12, 14, 0, Math.PI * 2);
      ctx.arc(cartX + 48, gy - 12, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Stone Well
    const wellX = 1520 - camX;
    if (wellX > -100 && wellX < 1350) {
      ctx.fillStyle = '#44403c';
      ctx.fillRect(wellX, gy - 40, 52, 40);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(wellX + 8, gy - 75, 6, 35);
      ctx.fillRect(wellX + 38, gy - 75, 6, 35);
      ctx.fillRect(wellX + 4, gy - 85, 44, 10);
    }
  }

  // --- Forest Environmental Props ---
  private renderForestEnvironment(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const gy = this.groundY - camY;

    // Massive ancient twisted trees
    const trees = [220, 880, 1640, 2400, 3100];
    for (const tx of trees) {
      const rx = tx - camX;
      if (rx < -200 || rx > 1400) continue;

      // Massive trunk
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(rx, gy);
      ctx.lineTo(rx + 20, gy - 360);
      ctx.lineTo(rx + 80, gy - 360);
      ctx.lineTo(rx + 100, gy);
      ctx.closePath();
      ctx.fill();

      // Canopy foliage (Deep dark emerald & teal)
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(rx + 50, gy - 360, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.arc(rx + 30, gy - 390, 90, 0, Math.PI * 2);
      ctx.fill();

      // Hanging moss / vines
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 3;
      for (let vx = rx; vx < rx + 100; vx += 25) {
        ctx.beginPath();
        ctx.moveTo(vx, gy - 260);
        ctx.quadraticCurveTo(vx - 10, gy - 160, vx, gy - 100);
        ctx.stroke();
      }
    }
  }

  // --- Castle Environmental Props ---
  private renderCastleEnvironment(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const gy = this.groundY - camY;

    // Castle Fortress Towers & Buttresses
    const towers = [320, 1280, 2240, 3200];
    for (const tw of towers) {
      const rx = tw - camX;
      if (rx < -250 || rx > 1400) continue;

      // Main tower body
      ctx.fillStyle = '#292524';
      ctx.fillRect(rx, gy - 380, 160, 380);

      // Crenellations at top
      ctx.fillStyle = '#44403c';
      for (let bx = rx - 10; bx <= rx + 150; bx += 24) {
        ctx.fillRect(bx, gy - 400, 14, 20);
      }

      // Slit arrow windows
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(rx + 74, gy - 300, 12, 34);
      ctx.fillRect(rx + 74, gy - 180, 12, 34);

      // Royal blue banners hanging from walls
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(rx + 60, gy - 240, 40, 90);
      // Gold rampant lion / cross emblem
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(rx + 75, gy - 210, 10, 30);
      ctx.fillRect(rx + 68, gy - 200, 24, 8);
    }
  }

  // --- Crypt Environmental Props ---
  private renderCryptEnvironment(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const gy = this.groundY - camY;

    // Coffins and stone pillars
    const pillars = [260, 920, 1680, 2420, 3100];
    for (const px of pillars) {
      const rx = px - camX;
      if (rx < -200 || rx > 1400) continue;

      // Carved stone column
      ctx.fillStyle = '#27272a';
      ctx.fillRect(rx, gy - 420, 64, 420);
      ctx.fillStyle = '#52525b';
      ctx.fillRect(rx - 8, gy - 420, 80, 20);
      ctx.fillRect(rx - 8, gy - 20, 80, 20);

      // Hanging iron chains
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rx + 32, gy - 400);
      ctx.lineTo(rx + 32, gy - 220);
      ctx.stroke();

      // Blue Soul Brazier
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(rx + 32, gy - 220, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // --- Celestial Tower Environmental Props ---
  private renderTowerEnvironment(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const gy = this.groundY - camY;

    // Grand Astral Dais & Timeless King's Throne
    const throneX = 1720 - camX;
    if (throneX > -200 && throneX < 1400) {
      // Massive Golden Ruin Arch
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(throneX + 36, gy - 180, 140, Math.PI, 0);
      ctx.stroke();

      // Floating time runes
      const t = performance.now() * 0.002;
      for (let i = 0; i < 6; i++) {
        const angle = t + (i * Math.PI) / 3;
        const ox = throneX + 36 + Math.cos(angle) * 110;
        const oy = gy - 180 + Math.sin(angle) * 80;

        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 10;
        ctx.fillRect(ox - 5, oy - 5, 10, 10);
        ctx.shadowBlur = 0;
      }
    }
  }
}
