/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect } from '../game/GameState.ts';
import { Collision } from '../game/Collision.ts';

export class PressurePlate implements Rect {
  public id: string;
  public targetId: string;
  public x: number;
  public y: number;
  public width: number = 44;
  public height: number = 10;
  public isPressed: boolean = false;
  private wasPressed: boolean = false;
  private depressAmount: number = 0;

  constructor(id: string, targetId: string, x: number, y: number) {
    this.id = id;
    this.targetId = targetId;
    this.x = x;
    this.y = y;
  }

  public update(entities: Rect[]): boolean {
    this.wasPressed = this.isPressed;
    this.isPressed = false;

    // Hitbox for standing on plate
    const triggerBox: Rect = {
      x: this.x + 2,
      y: this.y - 6,
      width: this.width - 4,
      height: 12,
    };

    for (const e of entities) {
      if (Collision.aabb(triggerBox, e)) {
        this.isPressed = true;
        break;
      }
    }

    // Depress animation
    if (this.isPressed) {
      this.depressAmount = Math.min(6, this.depressAmount + 1.2);
    } else {
      this.depressAmount = Math.max(0, this.depressAmount - 1.2);
    }

    // Return true if state just changed
    return this.isPressed !== this.wasPressed;
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = Math.round(this.x - camX);
    const ry = Math.round(this.y - camY);

    ctx.save();
    // Stone foundation
    ctx.fillStyle = '#292524';
    ctx.fillRect(rx - 4, ry + 4, this.width + 8, 8);

    // Depressing plate
    const plateY = ry + this.depressAmount;
    ctx.fillStyle = this.isPressed ? '#0284c7' : '#78716c';
    ctx.fillRect(rx, plateY, this.width, 6);

    // Glowing ancient rune when pressed
    if (this.isPressed) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillRect(rx + 14, plateY + 1, 16, 3);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#a8a29e';
      ctx.fillRect(rx + 16, plateY + 1, 12, 2);
    }

    ctx.restore();
  }
}
