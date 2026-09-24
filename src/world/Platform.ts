/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect } from '../game/GameState.ts';

export class Platform implements Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public isOneWay: boolean;
  public isMoving: boolean;

  // Moving platform parameters
  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private speed: number;
  private progress: number = 0;
  private movingForward: boolean = true;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    isOneWay: boolean = false,
    movingConfig?: { targetX: number; targetY: number; speed: number }
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isOneWay = isOneWay;

    this.startX = x;
    this.startY = y;
    if (movingConfig) {
      this.isMoving = true;
      this.targetX = movingConfig.targetX;
      this.targetY = movingConfig.targetY;
      this.speed = movingConfig.speed;
    } else {
      this.isMoving = false;
      this.targetX = x;
      this.targetY = y;
      this.speed = 0;
    }
  }

  public update(deltaTime: number): { dx: number; dy: number } {
    if (!this.isMoving) return { dx: 0, dy: 0 };

    const totalDistX = this.targetX - this.startX;
    const totalDistY = this.targetY - this.startY;
    const distance = Math.hypot(totalDistX, totalDistY);

    if (distance === 0) return { dx: 0, dy: 0 };

    const step = (this.speed * deltaTime) / distance;
    if (this.movingForward) {
      this.progress += step;
      if (this.progress >= 1) {
        this.progress = 1;
        this.movingForward = false;
      }
    } else {
      this.progress -= step;
      if (this.progress <= 0) {
        this.progress = 0;
        this.movingForward = true;
      }
    }

    const prevX = this.x;
    const prevY = this.y;

    // Smooth sinusoidal easing
    const eased = (1 - Math.cos(this.progress * Math.PI)) / 2;
    this.x = this.startX + totalDistX * eased;
    this.y = this.startY + totalDistY * eased;

    return {
      dx: this.x - prevX,
      dy: this.y - prevY,
    };
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = Math.round(this.x - camX);
    const ry = Math.round(this.y - camY);

    ctx.save();
    if (this.isOneWay) {
      // Wooden Beam / Scaffold Platform
      ctx.fillStyle = '#78350f';
      ctx.fillRect(rx, ry, this.width, 8);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(rx, ry + 1, this.width, 3);
      // Support braces
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      for (let ox = 8; ox < this.width; ox += 24) {
        ctx.strokeRect(rx + ox - 4, ry + 8, 8, 6);
      }
    } else {
      // Solid Stone / Castle Platform
      ctx.fillStyle = '#44403c';
      ctx.fillRect(rx, ry, this.width, this.height);

      // Top highlighted stone ledge
      ctx.fillStyle = '#78716c';
      ctx.fillRect(rx, ry, this.width, 5);

      // Edge bevels
      ctx.fillStyle = '#292524';
      ctx.fillRect(rx, ry + this.height - 4, this.width, 4);

      // Stone brick lines
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.5;
      for (let ox = 24; ox < this.width; ox += 32) {
        ctx.beginPath();
        ctx.moveTo(rx + ox, ry + 5);
        ctx.lineTo(rx + ox, ry + this.height - 4);
        ctx.stroke();
      }

      // Moving gear glow if platform moves
      if (this.isMoving) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(rx + this.width / 2, ry + this.height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();
  }
}
