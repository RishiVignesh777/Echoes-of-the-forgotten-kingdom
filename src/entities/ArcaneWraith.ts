/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy } from './Enemy.ts';
import { EnemyState, EnemyType, Rect, HitBox } from '../game/GameState.ts';
import { Projectile } from './Projectile.ts';

export class ArcaneWraith extends Enemy {
  private castTimer: number = 0;
  private projectileCounter: number = 0;

  constructor(id: string, x: number, y: number, patrolDistance: number = 120) {
    super(id, EnemyType.ARCANE_WRAITH, x, y, 42, 64, 70, patrolDistance);
    this.moveSpeed = 95;
    this.attackRange = 360; // ranged
    this.detectRange = 440;
    this.knockbackResistance = 1.05;
  }

  public updateAI(
    deltaTime: number,
    targetEntities: Rect[]
  ): { attackHitbox: HitBox | null; newProjectile: Projectile | null; soundEvents: string[] } {
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
      this.castTimer += deltaTime;
      if (this.castTimer >= 0.45 && this.castTimer - deltaTime < 0.45 && nearestTarget) {
        // Shoot arcane bolt towards target
        this.projectileCounter++;
        const targetCenterX = nearestTarget.x + nearestTarget.width / 2;
        const targetCenterY = nearestTarget.y + nearestTarget.height / 2;
        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + 24;

        const dx = targetCenterX - myCenterX;
        const dy = targetCenterY - myCenterY;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 260;

        newProjectile = new Projectile(
          `${this.id}_bolt_${this.projectileCounter}`,
          myCenterX,
          myCenterY,
          (dx / dist) * speed,
          (dy / dist) * speed,
          20,
          '#c084fc',
          14
        );
        soundEvents.push('magic_projectile');
      }

      if (this.castTimer > 0.8) {
        this.state = EnemyState.CHASE;
        this.attackCooldown = 2.4;
        this.castTimer = 0;
      }
      return { attackHitbox: null, newProjectile, soundEvents };
    }

    if (nearestTarget && nearestDist < this.detectRange) {
      this.facing = nearestTarget.x > this.x ? 1 : -1;

      if (nearestDist <= this.attackRange && this.attackCooldown <= 0) {
        this.state = EnemyState.ATTACK;
        this.castTimer = 0;
        this.velocityX = 0;
      } else {
        // Keep distance if too close, approach if far
        if (nearestDist < 160) {
          this.velocityX = -this.facing * this.moveSpeed; // back away
        } else {
          this.velocityX = this.facing * (this.moveSpeed * 0.7);
        }
      }
    } else {
      this.state = EnemyState.PATROL;
      if (this.x <= this.patrolLeft) {
        this.facing = 1;
      } else if (this.x >= this.patrolRight) {
        this.facing = -1;
      }
      this.velocityX = this.facing * (this.moveSpeed * 0.4);
    }

    return { attackHitbox: null, newProjectile, soundEvents };
  }
}
