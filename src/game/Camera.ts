/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;

  public viewportWidth: number = 1280;
  public viewportHeight: number = 720;

  public levelWidth: number = 3840;
  public levelHeight: number = 1080;

  // Smoothing
  private lerpSpeed: number = 0.08;
  private lookAheadDistance: number = 140;
  private lookAheadX: number = 0;

  // Screen shake
  public shakeTrauma: number = 0;
  private shakeOffsetX: number = 0;
  private shakeOffsetY: number = 0;

  // Screen flashes
  public flashColor: string = 'transparent';
  public flashAlpha: number = 0;
  public flashDecay: number = 3.0;

  // Hit stop / Slow-mo
  public hitStopTimer: number = 0;

  constructor(viewportWidth: number = 1280, viewportHeight: number = 720) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public setBounds(width: number, height: number): void {
    this.levelWidth = Math.max(width, this.viewportWidth);
    this.levelHeight = Math.max(height, this.viewportHeight);
  }

  public reset(x: number, y: number): void {
    this.x = x - this.viewportWidth / 2;
    this.y = y - this.viewportHeight / 2 - 40;
    this.clamp();
  }

  public addTrauma(amount: number): void {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + amount);
  }

  public flash(color: string, alpha: number = 0.6, decay: number = 3.0): void {
    this.flashColor = color;
    this.flashAlpha = alpha;
    this.flashDecay = decay;
  }

  public triggerHitStop(duration: number = 0.08): void {
    this.hitStopTimer = duration;
  }

  public update(deltaTime: number, playerX: number, playerY: number, playerFacing: number): void {
    // Decay hit stop
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= deltaTime;
    }

    // Decay screen flash
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - deltaTime * this.flashDecay);
    }

    // Smooth look ahead
    const targetLookAhead = playerFacing * this.lookAheadDistance;
    this.lookAheadX += (targetLookAhead - this.lookAheadX) * 0.05;

    // Target center on player
    this.targetX = playerX + this.lookAheadX - this.viewportWidth / 2;
    this.targetY = playerY - this.viewportHeight * 0.55;

    // Smooth camera motion
    this.x += (this.targetX - this.x) * this.lerpSpeed;
    this.y += (this.targetY - this.y) * this.lerpSpeed;

    this.clamp();

    // Process screen shake
    if (this.shakeTrauma > 0) {
      const shakePower = Math.pow(this.shakeTrauma, 2);
      const maxShake = 22;
      this.shakeOffsetX = (Math.random() * 2 - 1) * maxShake * shakePower;
      this.shakeOffsetY = (Math.random() * 2 - 1) * maxShake * shakePower;
      this.shakeTrauma = Math.max(0, this.shakeTrauma - deltaTime * 1.8);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  private clamp(): void {
    const maxX = Math.max(0, this.levelWidth - this.viewportWidth);
    const maxY = Math.max(0, this.levelHeight - this.viewportHeight);

    if (this.x < 0) this.x = 0;
    if (this.x > maxX) this.x = maxX;
    if (this.y < 0) this.y = 0;
    if (this.y > maxY) this.y = maxY;
  }

  public get renderX(): number {
    return Math.round(this.x + this.shakeOffsetX);
  }

  public get renderY(): number {
    return Math.round(this.y + this.shakeOffsetY);
  }
}
