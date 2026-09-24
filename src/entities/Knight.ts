/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy } from './Enemy.ts';
import { EnemyState, EnemyType, Rect, HitBox } from '../game/GameState.ts';
import { Projectile } from './Projectile.ts';

export class CorruptedKnight extends Enemy {
  private attackWindup: number = 0;

  constructor(id: string, x: number, y: number, patrolDistance: number = 160) {
    super(id, EnemyType.CORRUPTED_KNIGHT, x, y, 40, 68, 80, patrolDistance);
    this.moveSpeed = 120;
    this.attackRange = 48;
    this.detectRange = 280;
    this.knockbackResistance = 0.9;
  }

  public updateAI(
    deltaTime: number,
    targetEntities: Rect[]
  ): { attackHitbox: HitBox | null; newProjectile: Projectile | null; soundEvents: string[] } {
    let attackHitbox: HitBox | null = null;
    const soundEvents: string[] = [];

    // Find nearest target (Player or Echo)
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
      this.attackWindup += deltaTime;
      if (this.attackWindup >= 0.25 && this.attackWindup <= 0.42) {
        // Active swing hitbox
        const hbW = 56;
        const hx = this.facing > 0 ? this.x + this.width - 4 : this.x - hbW + 4;
        attackHitbox = {
          x: hx,
          y: this.y + 12,
          width: hbW,
          height: 48,
          damage: 22,
          knockbackX: this.facing * 260,
          knockbackY: -110,
          ownerId: this.id,
        };
      }
      if (this.attackWindup > 0.55) {
        this.state = EnemyState.CHASE;
        this.attackCooldown = 1.4;
        this.attackWindup = 0;
      }
      return { attackHitbox, newProjectile: null, soundEvents };
    }

    // Target detection
    if (nearestTarget && nearestDist < this.detectRange && Math.abs(nearestTarget.y - this.y) < 120) {
      this.facing = nearestTarget.x > this.x ? 1 : -1;

      if (nearestDist <= this.attackRange && this.attackCooldown <= 0) {
        // Strike!
        this.state = EnemyState.ATTACK;
        this.attackWindup = 0;
        this.velocityX = 0;
        soundEvents.push('enemy_attack');
      } else {
        // Chase target
        this.state = EnemyState.CHASE;
        this.velocityX = this.facing * this.moveSpeed;
      }
    } else {
      // Normal Patrol
      this.state = EnemyState.PATROL;
      if (this.x <= this.patrolLeft) {
        this.facing = 1;
      } else if (this.x >= this.patrolRight) {
        this.facing = -1;
      }
      this.velocityX = this.facing * (this.moveSpeed * 0.55);
    }

    return { attackHitbox, newProjectile: null, soundEvents };
  }
}
