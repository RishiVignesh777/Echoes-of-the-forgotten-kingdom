/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerSnapshot, Rect, HitBox, PlayerState } from '../game/GameState.ts';
import { SpriteRenderer } from '../rendering/Sprite.ts';

export class Echo implements Rect {
  public id: string;
  public snapshots: PlayerSnapshot[];
  public currentFrame: number = 0;

  public x: number = 0;
  public y: number = 0;
  public width: number = 38;
  public height: number = 68;
  public facing: number = 1;
  public state: PlayerState = PlayerState.IDLE;
  public active: boolean = true;
  public opacity: number = 0.55;
  public animTime: number = 0;
  public loopCount: number = 0;
  public maxLoops: number = 6; // Repeats its recorded sequence up to 6 times before fading

  constructor(id: string, snapshots: PlayerSnapshot[]) {
    this.id = id;
    this.snapshots = [...snapshots];
    if (this.snapshots.length > 0) {
      this.x = this.snapshots[0].x;
      this.y = this.snapshots[0].y;
      this.facing = this.snapshots[0].facing;
      this.state = this.snapshots[0].state;
    }
  }

  public update(deltaTime: number): { swordHitbox: HitBox | null; soundEvents: string[] } {
    const soundEvents: string[] = [];
    if (!this.active || this.snapshots.length === 0) {
      return { swordHitbox: null, soundEvents };
    }

    this.animTime += deltaTime;

    const snapshot = this.snapshots[this.currentFrame];
    this.x = snapshot.x;
    this.y = snapshot.y;
    this.facing = snapshot.facing;
    this.state = snapshot.state;

    let swordHitbox: HitBox | null = null;
    if (snapshot.attacking) {
      const isHeavy = snapshot.heavyAttacking;
      const hitboxW = isHeavy ? 68 : 52;
      const hitboxH = isHeavy ? 56 : 44;
      const hx = this.facing > 0 ? this.x + this.width - 6 : this.x - hitboxW + 6;
      const hy = this.y + (isHeavy ? 6 : 14);

      swordHitbox = {
        x: hx,
        y: hy,
        width: hitboxW,
        height: hitboxH,
        damage: isHeavy ? 36 : 18,
        knockbackX: this.facing * (isHeavy ? 350 : 230),
        knockbackY: isHeavy ? -150 : -90,
        isHeavy,
        ownerId: `echo-${this.id}`,
      };
    }

    this.currentFrame++;
    if (this.currentFrame >= this.snapshots.length) {
      this.currentFrame = 0;
      this.loopCount++;
      if (this.loopCount >= this.maxLoops) {
        this.active = false;
        soundEvents.push('echo_dissipate');
      }
    }

    return { swordHitbox, soundEvents };
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (!this.active) return;

    const screenX = this.x - camX + this.width / 2;
    const screenY = this.y - camY + this.height;

    // Viewport cull check
    if (screenX < -60 || screenX > 1340 || screenY < -60 || screenY > 800) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Slight ethereal blue pulse
    const pulse = Math.sin(this.animTime * 6) * 0.1;
    ctx.globalAlpha = Math.max(0.2, this.opacity + pulse);

    SpriteRenderer.drawKnight(
      ctx,
      screenX,
      screenY,
      this.facing,
      this.state,
      this.animTime,
      {
        isEcho: true,
        echoAlpha: this.opacity,
        isBlocking: this.state === PlayerState.BLOCK,
      }
    );

    ctx.restore();
  }
}
