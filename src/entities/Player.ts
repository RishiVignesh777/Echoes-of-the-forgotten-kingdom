/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState, Rect, HitBox } from '../game/GameState.ts';
import { SpriteRenderer } from '../rendering/Sprite.ts';
import { Input } from '../game/Input.ts';

export class Player implements Rect {
  public x: number;
  public y: number;
  public width: number = 38;
  public height: number = 68;

  public velocityX: number = 0;
  public velocityY: number = 0;

  public speed: number = 270;
  public jumpForce: number = 540;
  public facing: number = 1; // 1 = right, -1 = left

  public grounded: boolean = false;
  public isJumping: boolean = false;
  public state: PlayerState = PlayerState.IDLE;

  public health: number = 100;
  public maxHealth: number = 100;
  public stamina: number = 100;
  public maxStamina: number = 100;

  // Combat cooldowns & timers
  public attackTimer: number = 0;
  public heavyChargeTimer: number = 0;
  public isHeavyAttacking: boolean = false;
  public isAttacking: boolean = false;
  public isBlocking: boolean = false;
  public isDashing: boolean = false;
  public dashTimer: number = 0;
  public dashCooldown: number = 0;
  public hurtTimer: number = 0;
  public invulnerableTimer: number = 0;

  // Respawn
  public spawnX: number;
  public spawnY: number;

  // Animation
  public animTime: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
  }

  public setCheckpoint(x: number, y: number): void {
    this.spawnX = x;
    this.spawnY = y;
    this.health = this.maxHealth;
  }

  public respawn(): void {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.velocityX = 0;
    this.velocityY = 0;
    this.health = this.maxHealth;
    this.state = PlayerState.IDLE;
    this.invulnerableTimer = 1.0;
  }

  public takeDamage(amount: number, knockbackDir: number = 0, isHeavy: boolean = false): { blocked: boolean; actualDamage: number } {
    if (this.invulnerableTimer > 0 || this.isDashing || this.state === PlayerState.DEATH) {
      return { blocked: false, actualDamage: 0 };
    }

    let actualDamage = amount;
    let blocked = false;

    if (this.isBlocking) {
      actualDamage = Math.round(amount * 0.3); // 70% reduction
      blocked = true;
      this.velocityX = knockbackDir * 120;
    } else {
      this.health -= actualDamage;
      this.hurtTimer = 0.22;
      this.invulnerableTimer = 0.5;
      this.velocityX = knockbackDir * (isHeavy ? 280 : 180);
      this.velocityY = isHeavy ? -180 : -100;

      if (this.health <= 0) {
        this.health = 0;
        this.state = PlayerState.DEATH;
      } else {
        this.state = PlayerState.HURT;
      }
    }

    return { blocked, actualDamage };
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  public update(deltaTime: number, input: Input): { swordHitbox: HitBox | null; soundEvents: string[] } {
    const soundEvents: string[] = [];
    this.animTime += deltaTime;

    // Timers
    if (this.hurtTimer > 0) this.hurtTimer -= deltaTime;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= deltaTime;
    if (this.dashCooldown > 0) this.dashCooldown -= deltaTime;

    // Stamina regeneration
    if (!this.isBlocking && !this.isDashing && this.stamina < this.maxStamina) {
      this.stamina = Math.min(this.maxStamina, this.stamina + deltaTime * 28);
    }

    if (this.state === PlayerState.DEATH) {
      return { swordHitbox: null, soundEvents };
    }

    // 1. Dash handling
    if (this.isDashing) {
      this.dashTimer -= deltaTime;
      this.velocityX = this.facing * 580;
      this.velocityY = 0; // maintain horizontal glide during dash
      this.state = PlayerState.DASH;

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.state = PlayerState.IDLE;
      }
      return { swordHitbox: null, soundEvents };
    }

    // Trigger Dash
    if (input.dash && this.dashCooldown <= 0 && this.stamina >= 25 && this.hurtTimer <= 0) {
      this.isDashing = true;
      this.dashTimer = 0.18;
      this.dashCooldown = 0.8;
      this.stamina -= 25;
      soundEvents.push('dash');
      return { swordHitbox: null, soundEvents };
    }

    // 2. Block handling
    if (input.block && this.grounded && this.attackTimer <= 0) {
      this.isBlocking = true;
      this.state = PlayerState.BLOCK;
      this.velocityX = 0;
    } else {
      this.isBlocking = false;
    }

    // 3. Attack Handling
    let swordHitbox: HitBox | null = null;

    if (this.attackTimer > 0) {
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.isHeavyAttacking = false;
      }
    }

    // Charging / Executing Heavy Attack
    if (input.attackHolding && !this.isBlocking && !this.isAttacking) {
      this.heavyChargeTimer += deltaTime;
    }

    if (input.isJustReleased('j') && !this.isBlocking && !this.isAttacking) {
      if (this.heavyChargeTimer >= 0.32) {
        // Heavy Attack!
        this.isAttacking = true;
        this.isHeavyAttacking = true;
        this.attackTimer = 0.45;
        this.state = PlayerState.HEAVY_ATTACK;
        soundEvents.push('heavy_attack');
      } else {
        // Light Attack!
        this.isAttacking = true;
        this.isHeavyAttacking = false;
        this.attackTimer = 0.28;
        this.state = PlayerState.ATTACK;
        soundEvents.push('attack');
      }
      this.heavyChargeTimer = 0;
    }

    // Generate Active Sword Hitbox during active swing frames
    if (this.isAttacking) {
      const isHeavy = this.isHeavyAttacking;
      const hitboxW = isHeavy ? 68 : 52;
      const hitboxH = isHeavy ? 56 : 44;
      const hx = this.facing > 0 ? this.x + this.width - 6 : this.x - hitboxW + 6;
      const hy = this.y + (isHeavy ? 6 : 14);

      swordHitbox = {
        x: hx,
        y: hy,
        width: hitboxW,
        height: hitboxH,
        damage: isHeavy ? 42 : 22,
        knockbackX: this.facing * (isHeavy ? 360 : 220),
        knockbackY: isHeavy ? -180 : -90,
        isHeavy,
        ownerId: 'player',
      };
    }

    // 4. Movement handling
    if (!this.isBlocking && this.hurtTimer <= 0) {
      if (input.moveLeft) {
        this.velocityX = -this.speed;
        this.facing = -1;
        if (this.grounded && !this.isAttacking) this.state = PlayerState.RUN;
      } else if (input.moveRight) {
        this.velocityX = this.speed;
        this.facing = 1;
        if (this.grounded && !this.isAttacking) this.state = PlayerState.RUN;
      } else {
        // Friction deceleration
        this.velocityX *= 0.65;
        if (Math.abs(this.velocityX) < 10) this.velocityX = 0;
        if (this.grounded && !this.isAttacking) this.state = PlayerState.IDLE;
      }

      // Jump
      if (input.jump && this.grounded) {
        this.velocityY = -this.jumpForce;
        this.grounded = false;
        this.isJumping = true;
        soundEvents.push('jump');
      }
    }

    // Air states
    if (!this.grounded && !this.isAttacking && !this.isDashing) {
      this.state = this.velocityY < 0 ? PlayerState.JUMP : PlayerState.FALL;
    }

    return { swordHitbox, soundEvents };
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const screenX = this.x - camX + this.width / 2;
    const screenY = this.y - camY + this.height;

    // Semi-transparent blink during invulnerability
    if (this.invulnerableTimer > 0 && Math.floor(this.animTime * 24) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Dash ghostly trail
    if (this.isDashing) {
      SpriteRenderer.drawKnight(
        ctx,
        screenX - this.facing * 18,
        screenY,
        this.facing,
        PlayerState.DASH,
        this.animTime,
        { isEcho: true, echoAlpha: 0.3 }
      );
    }

    SpriteRenderer.drawKnight(
      ctx,
      screenX,
      screenY,
      this.facing,
      this.state,
      this.animTime,
      {
        isHurt: this.hurtTimer > 0,
        isBlocking: this.isBlocking,
      }
    );

    ctx.globalAlpha = 1.0;
  }
}
