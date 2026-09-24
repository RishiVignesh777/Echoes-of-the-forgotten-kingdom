/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy } from './Enemy.ts';
import { EnemyState, EnemyType, Rect, HitBox } from '../game/GameState.ts';
import { Projectile } from './Projectile.ts';

export class TimelessKing extends Enemy {
  public phase: number = 1; // 1 to 4
  private attackPatternTimer: number = 0;
  private attackType: 'cleave' | 'slam' | 'rift' | 'time_slow' = 'cleave';
  private summonCooldown: number = 0;
  public wantsToSpawnMinion: boolean = false;
  public wantsToSpawnDarkEcho: boolean = false;

  constructor(id: string, x: number, y: number) {
    // 72 wide, 110 tall, 450 max health
    super(id, EnemyType.TIMELESS_KING, x, y, 72, 110, 450, 400);
    this.moveSpeed = 110;
    this.attackRange = 90;
    this.detectRange = 800;
    this.knockbackResistance = 0.45;
  }

  public updateAI(
    deltaTime: number,
    targetEntities: Rect[]
  ): { attackHitbox: HitBox | null; newProjectile: Projectile | null; soundEvents: string[] } {
    let attackHitbox: HitBox | null = null;
    let newProjectile: Projectile | null = null;
    const soundEvents: string[] = [];

    // Phase transition check based on HP percent
    const hpPct = this.health / this.maxHealth;
    const previousPhase = this.phase;
    if (hpPct <= 0.25) {
      this.phase = 4;
    } else if (hpPct <= 0.5) {
      this.phase = 3;
    } else if (hpPct <= 0.75) {
      this.phase = 2;
    } else {
      this.phase = 1;
    }

    if (this.phase !== previousPhase) {
      soundEvents.push('boss_phase');
    }

    if (this.summonCooldown > 0) {
      this.summonCooldown -= deltaTime;
    }

    // Minion / Dark Echo triggers
    if (this.phase >= 2 && this.summonCooldown <= 0) {
      this.summonCooldown = 12.0;
      if (this.phase === 4) {
        this.wantsToSpawnDarkEcho = true;
      } else {
        this.wantsToSpawnMinion = true;
      }
    }

    let nearestTarget: Rect | null = null;
    let nearestDist = Infinity;
    for (const target of targetEntities) {
      const dist = Math.hypot(target.x - this.x, target.y - this.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestTarget = target;
      }
    }

    // Attack state execution
    if (this.state === EnemyState.ATTACK) {
      this.attackPatternTimer += deltaTime;

      if (this.attackType === 'cleave') {
        if (this.attackPatternTimer >= 0.4 && this.attackPatternTimer <= 0.65) {
          const hbW = 100;
          const hx = this.facing > 0 ? this.x + this.width - 6 : this.x - hbW + 6;
          attackHitbox = {
            x: hx,
            y: this.y + 16,
            width: hbW,
            height: 80,
            damage: 32,
            knockbackX: this.facing * 440,
            knockbackY: -180,
            isHeavy: true,
            ownerId: this.id,
          };
        }
        if (this.attackPatternTimer > 0.95) {
          this.state = EnemyState.CHASE;
          this.attackCooldown = 1.6;
          this.attackPatternTimer = 0;
        }
      } else if (this.attackType === 'slam') {
        if (this.attackPatternTimer >= 0.5 && this.attackPatternTimer <= 0.7) {
          const hbW = 120;
          const hx = this.facing > 0 ? this.x + this.width - 10 : this.x - hbW + 10;
          attackHitbox = {
            x: hx,
            y: this.y + 30,
            width: hbW,
            height: 80,
            damage: 40,
            knockbackX: this.facing * 500,
            knockbackY: -220,
            isHeavy: true,
            ownerId: this.id,
          };
        }
        if (this.attackPatternTimer > 1.1) {
          this.state = EnemyState.CHASE;
          this.attackCooldown = 2.0;
          this.attackPatternTimer = 0;
        }
      } else if (this.attackType === 'rift') {
        if (this.attackPatternTimer >= 0.4 && this.attackPatternTimer - deltaTime < 0.4 && nearestTarget) {
          // Shoot 2 temporal rift energy waves
          newProjectile = new Projectile(
            `boss_rift_${Math.random()}`,
            this.x + (this.facing > 0 ? this.width : 0),
            this.y + 40,
            this.facing * 300,
            0,
            24,
            '#a855f7',
            24
          );
          soundEvents.push('magic_projectile');
        }
        if (this.attackPatternTimer > 0.8) {
          this.state = EnemyState.CHASE;
          this.attackCooldown = 2.2;
          this.attackPatternTimer = 0;
        }
      }

      return { attackHitbox, newProjectile, soundEvents };
    }

    // AI movement & decision
    if (nearestTarget && nearestDist < this.detectRange) {
      this.facing = nearestTarget.x > this.x ? 1 : -1;

      if (this.attackCooldown <= 0) {
        this.state = EnemyState.ATTACK;
        this.attackPatternTimer = 0;
        this.velocityX = 0;

        // Choose attack based on phase and distance
        if (nearestDist <= this.attackRange) {
          this.attackType = Math.random() > 0.4 ? 'cleave' : 'slam';
          soundEvents.push('boss_attack');
        } else {
          this.attackType = 'rift';
        }
      } else {
        this.state = EnemyState.CHASE;
        this.velocityX = this.facing * this.moveSpeed;
      }
    } else {
      this.state = EnemyState.PATROL;
      if (this.x <= this.patrolLeft) this.facing = 1;
      if (this.x >= this.patrolRight) this.facing = -1;
      this.velocityX = this.facing * (this.moveSpeed * 0.5);
    }

    return { attackHitbox, newProjectile, soundEvents };
  }
}
