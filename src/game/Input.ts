/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class Input {
  private keysDown: Set<string> = new Set();
  private keysPressedThisFrame: Set<string> = new Set();
  private keysReleasedThisFrame: Set<string> = new Set();
  private keyHoldDuration: Map<string, number> = new Map();

  // Mouse / Pointer
  public mouseX: number = 0;
  public mouseY: number = 0;
  public mouseClicked: boolean = false;
  public mouseDown: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mousedown', this.boundMouseDown);
    window.addEventListener('mouseup', this.boundMouseUp);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mousedown', this.boundMouseDown);
    window.removeEventListener('mouseup', this.boundMouseUp);
  }

  private normalizeKey(key: string): string {
    const k = key.toLowerCase();
    if (k === ' ') return 'space';
    if (k === 'arrowleft') return 'left';
    if (k === 'arrowright') return 'right';
    if (k === 'arrowup') return 'up';
    if (k === 'arrowdown') return 'down';
    return k;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default scrolling for game keys
    const code = e.code.toLowerCase();
    if (['space', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(code)) {
      e.preventDefault();
    }
    const key = this.normalizeKey(e.key);
    if (!this.keysDown.has(key)) {
      this.keysPressedThisFrame.add(key);
      this.keyHoldDuration.set(key, 0);
    }
    this.keysDown.add(key);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const key = this.normalizeKey(e.key);
    this.keysDown.delete(key);
    this.keysReleasedThisFrame.add(key);
    this.keyHoldDuration.delete(key);
  }

  private handleMouseMove(e: MouseEvent): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = 1280 / rect.width;
      const scaleY = 720 / rect.height;
      this.mouseX = (e.clientX - rect.x) * scaleX;
      this.mouseY = (e.clientY - rect.y) * scaleY;
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      this.mouseDown = true;
      this.mouseClicked = true;
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) {
      this.mouseDown = false;
    }
  }

  public update(deltaTime: number): void {
    // Clear transient one-frame states
    this.keysPressedThisFrame.clear();
    this.keysReleasedThisFrame.clear();
    this.mouseClicked = false;

    // Increment hold durations
    for (const [key, duration] of this.keyHoldDuration.entries()) {
      this.keyHoldDuration.set(key, duration + deltaTime);
    }
  }

  public isDown(key: string): boolean {
    return this.keysDown.has(this.normalizeKey(key));
  }

  public isJustPressed(key: string): boolean {
    return this.keysPressedThisFrame.has(this.normalizeKey(key));
  }

  public isJustReleased(key: string): boolean {
    return this.keysReleasedThisFrame.has(this.normalizeKey(key));
  }

  public getHoldDuration(key: string): number {
    return this.keyHoldDuration.get(this.normalizeKey(key)) || 0;
  }

  // Common Action Helpers
  public get moveLeft(): boolean {
    return this.isDown('a') || this.isDown('left');
  }

  public get moveRight(): boolean {
    return this.isDown('d') || this.isDown('right');
  }

  public get jump(): boolean {
    return this.isJustPressed('w') || this.isJustPressed('space') || this.isJustPressed('up');
  }

  public get jumpHolding(): boolean {
    return this.isDown('w') || this.isDown('space') || this.isDown('up');
  }

  public get dropDown(): boolean {
    return this.isDown('s') || this.isDown('down');
  }

  public get attack(): boolean {
    return this.isJustPressed('j');
  }

  public get attackHolding(): boolean {
    return this.isDown('j');
  }

  public get block(): boolean {
    return this.isDown('k');
  }

  public get dash(): boolean {
    return this.isJustPressed('shift');
  }

  public get interact(): boolean {
    return this.isJustPressed('e');
  }

  public get createEcho(): boolean {
    return this.isJustPressed('q');
  }

  public get recallEcho(): boolean {
    return this.isJustPressed('r');
  }

  public get pause(): boolean {
    return this.isJustPressed('escape') || this.isJustPressed('p');
  }
}
