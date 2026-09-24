/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../entities/Player.ts';
import { Enemy } from '../entities/Enemy.ts';
import { Platform } from '../world/Platform.ts';
import { Door } from '../world/Door.ts';
import { TileMap } from '../world/TileMap.ts';
import { Collision } from '../game/Collision.ts';

export class PhysicsSystem {
  public static readonly GRAVITY = 1500;

  public update(
    deltaTime: number,
    player: Player,
    enemies: Enemy[],
    platforms: Platform[],
    doors: Door[],
    tileMap: TileMap,
    levelWidth: number
  ): void {
    // 1. Update moving platforms and calculate deltas
    const platformDeltas = new Map<Platform, { dx: number; dy: number }>();
    for (const plat of platforms) {
      const delta = plat.update(deltaTime);
      platformDeltas.set(plat, delta);
    }

    // 2. Player Physics
    this.updateEntityPhysics(deltaTime, player, platforms, platformDeltas, doors, tileMap, levelWidth, true);

    // 3. Enemies Physics
    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      this.updateEntityPhysics(deltaTime, enemy, platforms, platformDeltas, doors, tileMap, levelWidth, false);
    }
  }

  private updateEntityPhysics(
    deltaTime: number,
    entity: Player | Enemy,
    platforms: Platform[],
    platformDeltas: Map<Platform, { dx: number; dy: number }>,
    doors: Door[],
    tileMap: TileMap,
    levelWidth: number,
    isPlayer: boolean
  ): void {
    const prevY = entity.y;

    // Apply Gravity (unless dashing or floating)
    const isDashing = isPlayer && (entity as Player).isDashing;
    if (!isDashing) {
      entity.velocityY += PhysicsSystem.GRAVITY * deltaTime;
    }

    // Move Horizontal
    entity.x += entity.velocityX * deltaTime;

    // Boundary check
    if (entity.x < 10) {
      entity.x = 10;
      entity.velocityX = 0;
    } else if (entity.x + entity.width > levelWidth - 10) {
      entity.x = levelWidth - 10 - entity.width;
      entity.velocityX = 0;
    }

    // Door horizontal block
    for (const door of doors) {
      const doorBox = door.currentCollisionBox;
      if (doorBox && Collision.aabb(entity, doorBox)) {
        if (entity.velocityX > 0) {
          entity.x = doorBox.x - entity.width;
        } else if (entity.velocityX < 0) {
          entity.x = doorBox.x + doorBox.width;
        }
        entity.velocityX = 0;
      }
    }

    // Move Vertical
    entity.y += entity.velocityY * deltaTime;
    let grounded = false;

    // Platform collisions
    for (const plat of platforms) {
      if (plat.isOneWay) {
        // Only land from top while falling down
        if (entity.velocityY >= 0 && Collision.isOnTop(entity, prevY, plat, 10)) {
          entity.y = plat.y - entity.height;
          entity.velocityY = 0;
          grounded = true;

          // Carry entity along with moving platform
          if (plat.isMoving) {
            const pDelta = platformDeltas.get(plat);
            if (pDelta) {
              entity.x += pDelta.dx;
              entity.y += pDelta.dy;
            }
          }
        }
      } else {
        // Solid platform
        if (Collision.aabb(entity, plat)) {
          if (entity.velocityY > 0 && prevY + entity.height <= plat.y + 12) {
            // Landed on top
            entity.y = plat.y - entity.height;
            entity.velocityY = 0;
            grounded = true;

            if (plat.isMoving) {
              const pDelta = platformDeltas.get(plat);
              if (pDelta) {
                entity.x += pDelta.dx;
                entity.y += pDelta.dy;
              }
            }
          } else if (entity.velocityY < 0 && prevY >= plat.y + plat.height - 12) {
            // Hit head from below
            entity.y = plat.y + plat.height;
            entity.velocityY = 0;
          }
        }
      }
    }

    // World floor collision via TileMap
    const floorCheck = tileMap.collideEntity(entity, prevY, entity.velocityY);
    if (floorCheck.grounded) {
      entity.y = floorCheck.adjustedY;
      entity.velocityY = 0;
      grounded = true;
    }

    if (isPlayer) {
      (entity as Player).grounded = grounded;
    }
  }
}
