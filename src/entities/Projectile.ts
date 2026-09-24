/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect, HitBox } from '../game/GameState.ts';
import { Collision } from '../game/Collision.ts';

export class Projectile implements Rect {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public vx: number;
  public vy: number;
  public damage: number;
  public active: boolean = true;
  public color: string;
  public life: number = 4.0;
  public isArcane: boolean;

  constructor(
    id: string,
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number = 18,
    color: string = '#c084fc',
    size: number = 14,
    isArcane: boolean = true
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.width = size;
    this.height = size;
    this.color = color;
    this.isArcane = isArcane;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;
    this.life -= deltaTime;
    if (this.life <= 0) {
      this.active = false;
      return;
    }
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }

  public toHitBox(): HitBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      damage: this.damage,
      knockbackX: this.vx > 0 ? 160 : -160,
      knockbackY: -80,
      ownerId: `projectile-${this.id}`,
    };
  }

  public checkPlayerHit(playerBox: Rect): boolean {
    if (!this.active) return false;
    return Collision.aabb(this, playerBox);
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (!this.active) return;
    const rx = Math.round(this.x - camX);
    const ry = Math.round(this.y - camY);

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(rx + this.width / 2, ry + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(rx + this.width / 2, ry + this.height / 2, this.width / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
