/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnemyState, EnemyType, Rect, HitBox } from '../game/GameState.ts';
import { SpriteRenderer } from '../rendering/Sprite.ts';
import { Projectile } from './Projectile.ts';

export abstract class Enemy implements Rect {
  public id: string;
  public type: EnemyType;
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public velocityX: number = 0;
  public velocityY: number = 0;
  public facing: number = -1;
  public state: EnemyState = EnemyState.PATROL;

  public health: number;
  public maxHealth: number;
  public isDead: boolean = false;

  public hurtTimer: number = 0;
  public attackCooldown: number = 0;
  public stateTimer: number = 0;
  public animTime: number = 0;

  // Patrol boundaries
  public patrolLeft: number;
  public patrolRight: number;

  // Target detection
  public detectRange: number = 280;
  public attackRange: number = 55;
  public moveSpeed: number = 110;
  public knockbackResistance: number = 1.0;

  constructor(
    id: string,
    type: EnemyType,
    x: number,
    y: number,
    width: number,
    height: number,
    maxHealth: number,
    patrolDistance: number = 180
  ) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxHealth = maxHealth;
    this.health = maxHealth;

    this.patrolLeft = x - patrolDistance;
    this.patrolRight = x + patrolDistance;
  }

  public takeDamage(amount: number, knockbackX: number, knockbackY: number = -90): boolean {
    if (this.isDead) return false;

    this.health -= amount;
    this.hurtTimer = 0.28;

    // Apply knockback velocity with enemy-specific weight factor
    const factor = this.knockbackResistance;
    this.velocityX = knockbackX * factor;
    this.velocityY = knockbackY * factor;

    // Instant satisfying tactile pushback displacement
    const pushDir = knockbackX >= 0 ? 1 : -1;
    const instantDisplacement = (amount > 30 ? 14 : 9) * factor;
    this.x += pushDir * instantDisplacement;

    // Turn to face the attacker as they reel back
    if (pushDir > 0) {
      this.facing = -1;
    } else {
      this.facing = 1;
    }

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.state = EnemyState.DEAD;
      return true; // killed
    } else {
      this.state = EnemyState.HURT;
    }
    return false;
  }

  public abstract updateAI(
    deltaTime: number,
    targetEntities: Rect[]
  ): { attackHitbox: HitBox | null; newProjectile: Projectile | null; soundEvents: string[] };

  public update(
    deltaTime: number,
    targetEntities: Rect[]
  ): { attackHitbox: HitBox | null; newProjectile: Projectile | null; soundEvents: string[] } {
    this.animTime += deltaTime;

    // While in hurt state: apply smooth friction deceleration and prevent AI override
    if (this.hurtTimer > 0) {
      this.hurtTimer -= deltaTime;
      this.velocityX *= Math.pow(0.04, deltaTime);
      if (Math.abs(this.velocityX) < 15) {
        this.velocityX = 0;
      }
      if (this.hurtTimer <= 0 && !this.isDead) {
        this.state = EnemyState.CHASE;
        this.velocityX = 0;
      }
      // When reeling from hit, enemy cannot attack or cancel knockback
      return { attackHitbox: null, newProjectile: null, soundEvents: [] };
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    if (this.isDead) {
      return { attackHitbox: null, newProjectile: null, soundEvents: [] };
    }

    return this.updateAI(deltaTime, targetEntities);
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (this.isDead && this.hurtTimer <= 0) return;

    // Viewport frustum culling
    const screenX = this.x - camX;
    const screenY = this.y - camY;
    if (screenX < -100 || screenX > 1380 || screenY < -100 || screenY > 820) {
      return;
    }

    SpriteRenderer.drawEnemy(
      ctx,
      this.type,
      this.x - camX,
      this.y - camY,
      this.width,
      this.height,
      this.facing,
      this.animTime,
      this.state,
      this.hurtTimer > 0
    );

    // Overhead Health Bar
    if (this.health < this.maxHealth && !this.isDead) {
      this.renderHealthBar(ctx, camX, camY);
    }
  }

  protected renderHealthBar(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = Math.round(this.x - camX);
    const ry = Math.round(this.y - camY - 10);
    const barW = this.width;
    const barH = 5;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(rx, ry, barW, barH);

    const pct = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = pct > 0.4 ? '#ef4444' : '#b91c1c';
    ctx.fillRect(rx + 1, ry + 1, (barW - 2) * pct, barH - 2);
    ctx.restore();
  }
}
