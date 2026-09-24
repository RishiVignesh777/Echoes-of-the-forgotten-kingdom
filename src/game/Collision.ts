/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect } from './GameState.ts';

export class Collision {
  /**
   * Tests if two axis-aligned bounding boxes overlap
   */
  static aabb(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Checks if point is inside a rect
   */
  static pointInRect(px: number, py: number, rect: Rect): boolean {
    return (
      px >= rect.x &&
      px <= rect.x + rect.width &&
      py >= rect.y &&
      py <= rect.y + rect.height
    );
  }

  /**
   * Calculates the overlap between two bounding boxes
   */
  static getOverlap(a: Rect, b: Rect): { overlapX: number; overlapY: number } {
    const halfWidthA = a.width / 2;
    const halfHeightA = a.height / 2;
    const halfWidthB = b.width / 2;
    const halfHeightB = b.height / 2;

    const centerAX = a.x + halfWidthA;
    const centerAY = a.y + halfHeightA;
    const centerBX = b.x + halfWidthB;
    const centerBY = b.y + halfHeightB;

    const dx = centerAX - centerBX;
    const dy = centerAY - centerBY;

    const minDistanceX = halfWidthA + halfWidthB;
    const minDistanceY = halfHeightA + halfHeightB;

    const depthX = minDistanceX - Math.abs(dx);
    const depthY = minDistanceY - Math.abs(dy);

    return {
      overlapX: depthX > 0 ? (dx > 0 ? depthX : -depthX) : 0,
      overlapY: depthY > 0 ? (dy > 0 ? depthY : -depthY) : 0,
    };
  }

  /**
   * Checks if an entity is landing on top of a one-way or solid platform
   */
  static isOnTop(entity: Rect, prevY: number, platform: Rect, tolerance: number = 8): boolean {
    const feetCurrent = entity.y + entity.height;
    const feetPrev = prevY + entity.height;
    const platformTop = platform.y;

    // Entity was above or at platform top, and is now at or slightly below it
    const crossedTop = feetPrev <= platformTop + tolerance && feetCurrent >= platformTop - tolerance;
    const horizontalOverlap = entity.x + entity.width > platform.x + 2 && entity.x < platform.x + platform.width - 2;

    return crossedTop && horizontalOverlap;
  }
}
