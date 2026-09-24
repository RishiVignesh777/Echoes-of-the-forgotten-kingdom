/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy } from './Enemy.ts';
import { EnemyState, EnemyType, Rect, HitBox } from '../game/GameState.ts';
import { Projectile } from './Projectile.ts';

export class FungalBrute extends Enemy {
  private slamTimer: number = 0;

  constructor(id: string, x: number, y: number, patrolDistance: number = 100) {
    super(id, EnemyType.FUNGAL_BRUTE, x, y, 64, 76, 140, patrolDistance);
    this.moveSpeed = 75;
    this.attackRange = 60;
    this.detectRange = 260;
  }

  public updateAI(
    deltaTime: number,
    targetEntities: Rect[]
  ): { attackHitbox: HitBox | null; newProjectile: Projectile | null; soundEvents: string[] } {
    let attackHitbox: HitBox | null = null;
    let newProjectile: Projectile | null = null;
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
      this.slamTimer += deltaTime;
      if (this.slamTimer >= 0.4 && this.slamTimer <= 0.6) {
        const hbW = 72;
        const hx = this.facing > 0 ? this.x + this.width - 8 : this.x - hbW + 8;
        attackHitbox = {
          x: hx,
          y: this.y + 20,
          width: hbW,
          height: 56,
          damage: 34,
          knockbackX: this.facing * 380,
          knockbackY: -160,
          isHeavy: true,
          ownerId: this.id,
        };
      }
      if (this.slamTimer > 0.85) {
        this.state = EnemyState.CHASE;
        this.attackCooldown = 2.2;
        this.slamTimer = 0;
      }
      return { attackHitbox, newProjectile, soundEvents };
    }

    if (nearestTarget && nearestDist < this.detectRange && Math.abs(nearestTarget.y - this.y) < 140) {
      this.facing = nearestTarget.x > this.x ? 1 : -1;

      if (nearestDist <= this.attackRange && this.attackCooldown <= 0) {
        this.state = EnemyState.ATTACK;
        this.slamTimer = 0;
        this.velocityX = 0;
        soundEvents.push('brute_slam');
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
      this.velocityX = this.facing * (this.moveSpeed * 0.5);
    }

    return { attackHitbox, newProjectile, soundEvents };
  }
}
