/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect } from '../game/GameState.ts';
import { Collision } from '../game/Collision.ts';

export type ItemType = 'HEALTH_POTION' | 'ECHO_FRAGMENT' | 'ANCIENT_COIN' | 'KNIGHT_RELIC';

export class Item implements Rect {
  public id: string;
  public type: ItemType;
  public x: number;
  public y: number;
  public width: number = 24;
  public height: number = 24;
  public collected: boolean = false;
  private animTimer: number = Math.random() * 5;

  constructor(id: string, type: ItemType, x: number, y: number) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
  }

  public checkCollect(playerBox: Rect): boolean {
    if (this.collected) return false;
    const myBox: Rect = {
      x: this.x - 4,
      y: this.y - 4,
      width: this.width + 8,
      height: this.height + 8,
    };
    if (Collision.aabb(myBox, playerBox)) {
      this.collected = true;
      return true;
    }
    return false;
  }

  public update(deltaTime: number): void {
    this.animTimer += deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (this.collected) return;

    const rx = Math.round(this.x - camX);
    const ry = Math.round(this.y - camY + Math.sin(this.animTimer * 4) * 4);

    ctx.save();
    switch (this.type) {
      case 'HEALTH_POTION':
        // Glass flask with crimson elixir
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(rx + 12, ry + 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Neck & Cork
        ctx.fillStyle = '#78350f';
        ctx.fillRect(rx + 10, ry + 3, 4, 5);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(rx + 9, ry + 1, 6, 3);
        break;

      case 'ECHO_FRAGMENT':
        // Brilliant cyan time crystal
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(rx + 12, ry + 2);
        ctx.lineTo(rx + 20, ry + 12);
        ctx.lineTo(rx + 12, ry + 22);
        ctx.lineTo(rx + 4, ry + 12);
        ctx.closePath();
        ctx.fill();
        // Inner white shine
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rx + 11, ry + 10, 3, 4);
        ctx.shadowBlur = 0;
        break;

      case 'ANCIENT_COIN':
        // Golden round kingdom medallion
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(rx + 12, ry + 12, 8, 0, Math.PI * 2);
        ctx.fill();
        // Embossed cross
        ctx.fillStyle = '#78350f';
        ctx.fillRect(rx + 10, ry + 7, 4, 10);
        ctx.fillRect(rx + 7, ry + 10, 10, 4);
        ctx.shadowBlur = 0;
        break;

      case 'KNIGHT_RELIC':
        // Silver shield pendant
        ctx.fillStyle = '#94a3b8';
        ctx.shadowColor = '#cbd5e1';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(rx + 6, ry + 4);
        ctx.lineTo(rx + 18, ry + 4);
        ctx.lineTo(rx + 18, ry + 14);
        ctx.lineTo(rx + 12, ry + 22);
        ctx.lineTo(rx + 6, ry + 14);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
    }
    ctx.restore();
  }
}
