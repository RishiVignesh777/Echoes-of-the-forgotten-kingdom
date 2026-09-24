/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect, HitBox } from '../game/GameState.ts';
import { Collision } from '../game/Collision.ts';

export class Switch implements Rect {
  public id: string;
  public targetId: string;
  public x: number;
  public y: number;
  public width: number = 32;
  public height: number = 42;
  public isActivated: boolean = false;
  private animTimer: number = 0;

  constructor(id: string, targetId: string, x: number, y: number) {
    this.id = id;
    this.targetId = targetId;
    this.x = x;
    this.y = y;
  }

  public checkHit(hitboxes: HitBox[]): boolean {
    if (this.isActivated) return false;

    const myBox: Rect = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };

    for (const hb of hitboxes) {
      if (Collision.aabb(myBox, hb)) {
        this.isActivated = true;
        return true;
      }
    }
    return false;
  }

  public interact(): boolean {
    if (!this.isActivated) {
      this.isActivated = true;
      return true;
    }
    return false;
  }

  public update(deltaTime: number): void {
    this.animTimer += deltaTime;
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = Math.round(this.x - camX);
    const ry = Math.round(this.y - camY);

    ctx.save();
    // Pedestal
    ctx.fillStyle = '#44403c';
    ctx.fillRect(rx + 6, ry + 22, 20, 20);

    // Floating Magical Crystal / Lever
    const floatY = Math.sin(this.animTimer * 4) * 3;
    const crystalY = ry + 8 + floatY;

    if (this.isActivated) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 14;
    } else {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 8;
    }

    // Rhombus Crystal
    ctx.beginPath();
    ctx.moveTo(rx + 16, crystalY - 12);
    ctx.lineTo(rx + 26, crystalY);
    ctx.lineTo(rx + 16, crystalY + 12);
    ctx.lineTo(rx + 6, crystalY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
