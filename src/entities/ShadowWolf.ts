/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy } from './Enemy.ts';
import { EnemyState, EnemyType, Rect, HitBox } from '../game/GameState.ts';
import { Projectile } from './Projectile.ts';

export class ShadowWolf extends Enemy {
  private leapTimer: number = 0;

  constructor(id: string, x: number, y: number, patrolDistance: number = 140) {
    super(id, EnemyType.SHADOW_WOLF, x, y, 48, 36, 50, patrolDistance);
    this.moveSpeed = 190;
    this.attackRange = 65;
    this.detectRange = 320;
  }

  public updateAI(
    deltaTime: number,
    targetEntities: Rect[]
  ): { attackHitbox: HitBox | null; newProjectile: Projectile | null; soundEvents: string[] } {
    let attackHitbox: HitBox | null = null;
    const soundEvents: string[] = [];

    let nearestTarget: Rect | null = null;
    let nearestDist = Infinity;

    for (const target of targetEntities) {
      const dist = Math.hypot(target.x - this.x, target.y - this.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestTarget = target;
      }
    }

    if (this.state === EnemyState.ATTACK) {
      this.leapTimer += deltaTime;
      if (this.leapTimer >= 0.1 && this.leapTimer <= 0.35) {
        const hbW = 44;
        const hx = this.facing > 0 ? this.x + this.width - 2 : this.x - hbW + 2;
        attackHitbox = {
          x: hx,
          y: this.y,
          width: hbW,
          height: 36,
          damage: 18,
          knockbackX: this.facing * 280,
          knockbackY: -100,
          ownerId: this.id,
        };
      }
      if (this.leapTimer > 0.45) {
        this.state = EnemyState.CHASE;
        this.attackCooldown = 1.1;
        this.leapTimer = 0;
      }
      return { attackHitbox, newProjectile: null, soundEvents };
    }

    if (nearestTarget && nearestDist < this.detectRange && Math.abs(nearestTarget.y - this.y) < 100) {
      this.facing = nearestTarget.x > this.x ? 1 : -1;

      if (nearestDist <= this.attackRange && this.attackCooldown <= 0) {
        this.state = EnemyState.ATTACK;
        this.leapTimer = 0;
        this.velocityX = this.facing * 340; // Lunge forward
        this.velocityY = -120;
        soundEvents.push('wolf_bite');
      } else {
        this.state = EnemyState.CHASE;
        this.velocityX = this.facing * this.moveSpeed;
      }
    } else {
      this.state = EnemyState.PATROL;
      if (this.x <= this.patrolLeft) {
        this.facing = 1;
      } else if (this.x >= this.patrolRight) {
        this.facing = -1;
      }
      this.velocityX = this.facing * (this.moveSpeed * 0.45);
    }

    return { attackHitbox, newProjectile: null, soundEvents };
  }
}
