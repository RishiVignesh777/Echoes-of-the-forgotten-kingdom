/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect } from '../game/GameState.ts';

export class Door implements Rect {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public initialHeight: number;
  public isOpen: boolean = false;
  public openProgress: number = 0; // 0 = closed, 1 = fully open

  constructor(id: string, x: number, y: number, width: number = 32, height: number = 96) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.initialHeight = height;
  }

  public setOpen(open: boolean): boolean {
    const changed = this.isOpen !== open;
    this.isOpen = open;
    return changed;
  }

  public update(deltaTime: number): void {
    const targetProgress = this.isOpen ? 1 : 0;
    if (this.openProgress < targetProgress) {
      this.openProgress = Math.min(targetProgress, this.openProgress + deltaTime * 2.2);
    } else if (this.openProgress > targetProgress) {
      this.openProgress = Math.max(targetProgress, this.openProgress - deltaTime * 2.2);
    }
  }

  public get currentCollisionBox(): Rect | null {
    if (this.openProgress >= 0.85) return null; // passable when mostly open
    const currentH = this.initialHeight * (1 - this.openProgress);
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: currentH,
    };
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = Math.round(this.x - camX);
    const ry = Math.round(this.y - camY);

    ctx.save();
    // Door frame / Stone arch
    ctx.fillStyle = '#292524';
    ctx.fillRect(rx - 6, ry - 8, 6, this.initialHeight + 8);
    ctx.fillRect(rx + this.width, ry - 8, 6, this.initialHeight + 8);
    ctx.fillRect(rx - 6, ry - 10, this.width + 12, 10);

    // Sliding Portcullis / Iron Gate bars (retracts upward)
    const currentH = this.initialHeight * (1 - this.openProgress);
    if (currentH > 2) {
      ctx.fillStyle = '#44403c';
      ctx.fillRect(rx, ry, this.width, currentH);

      // Iron vertical bars
      ctx.fillStyle = '#1c1917';
      for (let bx = 4; bx < this.width; bx += 8) {
        ctx.fillRect(rx + bx, ry, 3, currentH);
      }

      // Horizontal crossbars
      for (let by = 16; by < currentH; by += 28) {
        ctx.fillStyle = '#57534e';
        ctx.fillRect(rx, ry + by, this.width, 5);
      }

      // Spiked bottom tips
      ctx.fillStyle = '#1c1917';
      for (let bx = 4; bx < this.width; bx += 8) {
        ctx.beginPath();
        ctx.moveTo(rx + bx, ry + currentH);
        ctx.lineTo(rx + bx + 1.5, ry + currentH + 6);
        ctx.lineTo(rx + bx + 3, ry + currentH);
        ctx.fill();
      }
    }

    // Glowing gate gem when opened
    if (this.isOpen) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(rx + this.width / 2, ry - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
