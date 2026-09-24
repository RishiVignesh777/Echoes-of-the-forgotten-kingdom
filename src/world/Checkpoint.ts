/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect } from '../game/GameState.ts';
import { Collision } from '../game/Collision.ts';

export class Checkpoint implements Rect {
  public id: string;
  public x: number;
  public y: number;
  public width: number = 44;
  public height: number = 80;
  public isActivated: boolean = false;
  private animTimer: number = 0;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  public isNear(playerBox: Rect): boolean {
    const proximityBox: Rect = {
      x: this.x - 30,
      y: this.y - 10,
      width: this.width + 60,
      height: this.height + 20,
    };
    return Collision.aabb(proximityBox, playerBox);
  }

  public activate(): boolean {
    if (!this.isActivated) {
      this.isActivated = true;
      return true;
    }
    return false;
  }

  public update(deltaTime: number): void {
    this.animTimer += deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number, showPrompt: boolean): void {
    const rx = Math.round(this.x - camX);
    const ry = Math.round(this.y - camY);

    ctx.save();
    // Ancient stone plinth
    ctx.fillStyle = '#292524';
    ctx.fillRect(rx - 4, ry + this.height - 12, this.width + 8, 12);
    ctx.fillStyle = '#44403c';
    ctx.fillRect(rx + 2, ry + this.height - 24, this.width - 4, 12);

    // Weathered Angelic / Guardian Statue
    ctx.fillStyle = this.isActivated ? '#cbd5e1' : '#78716c';
    // Robed Body
    ctx.beginPath();
    ctx.moveTo(rx + 22, ry + 16);
    ctx.lineTo(rx + 36, ry + this.height - 24);
    ctx.lineTo(rx + 8, ry + this.height - 24);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(rx + 22, ry + 14, 8, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.beginPath();
    ctx.moveTo(rx + 16, ry + 22);
    ctx.quadraticCurveTo(rx - 8, ry + 6, rx - 6, ry - 6);
    ctx.quadraticCurveTo(rx + 6, ry + 12, rx + 16, ry + 28);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(rx + 28, ry + 22);
    ctx.quadraticCurveTo(rx + 52, ry + 6, rx + 50, ry - 6);
    ctx.quadraticCurveTo(rx + 38, ry + 12, rx + 28, ry + 28);
    ctx.fill();

    // Glowing Heart / Relic in statue's hands
    if (this.isActivated) {
      const pulse = Math.sin(this.animTimer * 4) * 2;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(rx + 22, ry + 26, 6 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Aura ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rx + 22, ry + 26, 14 + pulse * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Interaction hint
    if (showPrompt && !this.isActivated) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('[E] Commune', rx + 22, ry - 14);
    }

    ctx.restore();
  }
}
