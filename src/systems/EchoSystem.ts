/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerSnapshot, HitBox, Rect } from '../game/GameState.ts';
import { Player } from '../entities/Player.ts';
import { Echo } from '../entities/Echo.ts';
import { ParticleSystem } from '../rendering/ParticleSystem.ts';
import { AudioSystem } from './AudioSystem.ts';

export class EchoSystem {
  private recording: PlayerSnapshot[] = [];
  private readonly maxRecordFrames: number = 300; // ~5 seconds at 60 FPS
  public echoes: Echo[] = [];
  public maxEchoes: number = 2; // Upgradable to 3 via Echo Fragments
  public echoCooldown: number = 0;
  public readonly cooldownDuration: number = 2.5;

  private recordTimer: number = 0;
  private echoCounter: number = 0;

  constructor() {}

  public upgradeCapacity(): void {
    if (this.maxEchoes < 3) {
      this.maxEchoes++;
    }
  }

  public recordPlayer(player: Player, deltaTime: number): void {
    this.recordTimer += deltaTime;

    const snapshot: PlayerSnapshot = {
      x: player.x,
      y: player.y,
      velocityX: player.velocityX,
      velocityY: player.velocityY,
      facing: player.facing,
      state: player.state,
      attacking: player.isAttacking,
      heavyAttacking: player.isHeavyAttacking,
      blocking: player.isBlocking,
      dashTrail: player.isDashing,
      animTimer: player.animTime,
    };

    this.recording.push(snapshot);
    if (this.recording.length > this.maxRecordFrames) {
      this.recording.shift();
    }
  }

  public canCreateEcho(): boolean {
    return this.echoes.length < this.maxEchoes && this.echoCooldown <= 0 && this.recording.length >= 40;
  }

  public createEcho(particles: ParticleSystem, audio: AudioSystem): Echo | null {
    if (!this.canCreateEcho()) return null;

    this.echoCounter++;
    // We snapshot the last 180-240 frames (~3-4 seconds of recorded action)
    const snapshotsToReplay = [...this.recording];
    const newEcho = new Echo(`echo_${this.echoCounter}`, snapshotsToReplay);

    this.echoes.push(newEcho);
    this.echoCooldown = this.cooldownDuration;

    // Visual & audio feedback
    audio.playEchoSpawn();
    particles.emit('echo', newEcho.x + newEcho.width / 2, newEcho.y + newEcho.height / 2, 28);

    return newEcho;
  }

  public recallAll(particles: ParticleSystem): void {
    for (const echo of this.echoes) {
      particles.emit('magic', echo.x + echo.width / 2, echo.y + echo.height / 2, 20);
    }
    this.echoes = [];
  }

  public update(deltaTime: number, particles: ParticleSystem, audio: AudioSystem): HitBox[] {
    if (this.echoCooldown > 0) {
      this.echoCooldown -= deltaTime;
    }

    const hitboxes: HitBox[] = [];

    for (let i = this.echoes.length - 1; i >= 0; i--) {
      const echo = this.echoes[i];
      const { swordHitbox, soundEvents } = echo.update(deltaTime);

      if (swordHitbox) {
        hitboxes.push(swordHitbox);
      }

      if (soundEvents.includes('echo_dissipate')) {
        particles.emit('magic', echo.x + echo.width / 2, echo.y + echo.height / 2, 16);
      }

      // Trail particles while moving
      if (Math.random() < 0.25) {
        particles.emit('echo', echo.x + echo.width / 2, echo.y + echo.height - 10, 1);
      }

      if (!echo.active) {
        this.echoes.splice(i, 1);
      }
    }

    return hitboxes;
  }

  public getEchoRects(): Rect[] {
    return this.echoes.map((e) => ({
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height,
    }));
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    for (const echo of this.echoes) {
      echo.render(ctx, camX, camY);
    }
  }

  public clear(): void {
    this.echoes = [];
    this.recording = [];
    this.echoCooldown = 0;
  }
}
