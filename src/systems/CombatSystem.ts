/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HitBox, Rect } from '../game/GameState.ts';
import { Player } from '../entities/Player.ts';
import { Echo } from '../entities/Echo.ts';
import { Enemy } from '../entities/Enemy.ts';
import { Projectile } from '../entities/Projectile.ts';
import { Switch } from '../world/Switch.ts';
import { Camera } from '../game/Camera.ts';
import { ParticleSystem } from '../rendering/ParticleSystem.ts';
import { AudioSystem } from './AudioSystem.ts';
import { Collision } from '../game/Collision.ts';

export class CombatSystem {
  public update(
    player: Player,
    echoes: Echo[],
    enemies: Enemy[],
    projectiles: Projectile[],
    switches: Switch[],
    playerHitbox: HitBox | null,
    echoHitboxes: HitBox[],
    enemyHitboxes: HitBox[],
    camera: Camera,
    particles: ParticleSystem,
    audio: AudioSystem
  ): void {
    // 1. Process Player & Echo attacks hitting Enemies
    const friendlyHitboxes: HitBox[] = [];
    if (playerHitbox) friendlyHitboxes.push(playerHitbox);
    friendlyHitboxes.push(...echoHitboxes);

    for (const hb of friendlyHitboxes) {
      for (const enemy of enemies) {
        if (enemy.isDead || enemy.hurtTimer > 0) continue;

        if (Collision.aabb(hb, enemy)) {
          // Determine push direction: push enemy directly away from attacker/blade
          const attackerCenterX = hb.ownerId === 'player' ? player.x + player.width / 2 : hb.x + hb.width / 2;
          const enemyCenterX = enemy.x + enemy.width / 2;
          const pushDir = enemyCenterX > attackerCenterX ? 1 : enemyCenterX < attackerCenterX ? -1 : (hb.knockbackX >= 0 ? 1 : -1);

          const baseKnockX = Math.abs(hb.knockbackX) > 0 ? Math.abs(hb.knockbackX) : (hb.isHeavy ? 380 : 250);
          const knockbackX = pushDir * baseKnockX;
          const knockbackY = hb.knockbackY !== undefined ? hb.knockbackY : (hb.isHeavy ? -160 : -100);

          const killed = enemy.takeDamage(hb.damage, knockbackX, knockbackY);

          // Impact feedback
          audio.playSwordClash(hb.isHeavy);
          camera.addTrauma(hb.isHeavy ? 0.45 : 0.22);
          if (hb.isHeavy) {
            camera.triggerHitStop(0.06);
          }

          // Blood / Sparks
          particles.emit('blood', enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, hb.isHeavy ? 18 : 10);
          particles.emit('spark', enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 8);

          if (killed) {
            audio.playEnemyDeath();
            particles.emit('soul', enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 22);
          }
        }
      }

      // Check hit against crystal switches!
      for (const sw of switches) {
        if (sw.checkHit([hb])) {
          audio.playCheckpoint();
          particles.emit('magic', sw.x + sw.width / 2, sw.y + sw.height / 2, 20);
        }
      }
    }

    // 2. Process Enemy melee attacks hitting Player
    for (const hb of enemyHitboxes) {
      if (Collision.aabb(hb, player)) {
        const knockbackDir = hb.knockbackX > 0 ? 1 : -1;
        const { blocked, actualDamage } = player.takeDamage(hb.damage, knockbackDir, hb.isHeavy);

        if (actualDamage > 0) {
          if (blocked) {
            audio.playBlock();
            camera.addTrauma(0.2);
            particles.emit('spark', player.x + player.width / 2, player.y + player.height / 2, 14);
          } else {
            audio.playHurt();
            camera.addTrauma(hb.isHeavy ? 0.5 : 0.3);
            camera.flash('#ef4444', 0.45);
            particles.emit('blood', player.x + player.width / 2, player.y + player.height / 2, 12);
          }
        }
      }
    }

    // 3. Process Projectiles hitting Player
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i];
      if (!proj.active) continue;

      if (proj.checkPlayerHit(player)) {
        proj.active = false;
        const knockDir = proj.vx > 0 ? 1 : -1;
        const { blocked, actualDamage } = player.takeDamage(proj.damage, knockDir, false);

        if (blocked) {
          audio.playBlock();
          particles.emit('spark', proj.x, proj.y, 10);
        } else {
          audio.playHurt();
          camera.flash('#c084fc', 0.4);
          particles.emit('magic', proj.x, proj.y, 16);
        }
      }
    }
  }
}
