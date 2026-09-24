/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class Input {
  private canvas: HTMLCanvasElement | null = null;
  private keysDown: Set<string> = new Set();
  private keysPressedThisFrame: Set<string> = new Set();
  private keysReleasedThisFrame: Set<string> = new Set();
  private keyHoldDuration: Map<string, number> = new Map();

  // Mouse / Pointer virtual resolution (1280x720)
  public mouseX: number = 640;
  public mouseY: number = 360;
  public mouseClicked: boolean = false;
  public mouseDown: boolean = false;

  // Callbacks
  public onCanvasClick?: (x: number, y: number) => void;
  public onCanvasHover?: (x: number, y: number) => void;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundClick: (e: MouseEvent) => void;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas || (document.getElementById('game-canvas') as HTMLCanvasElement | null);

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.boundClick = this.handleClick.bind(this);

    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('pointerup', this.boundPointerUp);

    this.attachCanvasListeners();
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.detachCanvasListeners();
    this.canvas = canvas;
    this.attachCanvasListeners();
  }

  private attachCanvasListeners(): void {
    const target = this.canvas || (document.getElementById('game-canvas') as HTMLCanvasElement | null);
    if (!target) return;
    this.canvas = target;

    target.addEventListener('pointermove', this.boundPointerMove);
    target.addEventListener('pointerdown', this.boundPointerDown);
    target.addEventListener('click', this.boundClick);
  }

  private detachCanvasListeners(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('pointermove', this.boundPointerMove);
      this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
      this.canvas.removeEventListener('click', this.boundClick);
    }
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('pointerup', this.boundPointerUp);
    this.detachCanvasListeners();
  }

  public updatePointerPosition(clientX: number, clientY: number): void {
    const canvas = this.canvas || (document.getElementById('game-canvas') as HTMLCanvasElement | null);
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const scaleX = 1280 / rect.width;
      const scaleY = 720 / rect.height;
      this.mouseX = (clientX - rect.left) * scaleX;
      this.mouseY = (clientY - rect.top) * scaleY;
    }
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

  private handlePointerMove(e: PointerEvent): void {
    this.updatePointerPosition(e.clientX, e.clientY);
    this.onCanvasHover?.(this.mouseX, this.mouseY);
  }

  private handlePointerDown(e: PointerEvent): void {
    if (e.button === 0) {
      this.updatePointerPosition(e.clientX, e.clientY);
      this.mouseDown = true;
      this.mouseClicked = true;
      this.onCanvasClick?.(this.mouseX, this.mouseY);
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    if (e.button === 0) {
      this.updatePointerPosition(e.clientX, e.clientY);
      this.mouseDown = false;
    }
  }

  private handleClick(e: MouseEvent): void {
    if (e.button === 0) {
      this.updatePointerPosition(e.clientX, e.clientY);
      this.mouseClicked = true;
      this.onCanvasClick?.(this.mouseX, this.mouseY);
    }
  }

  public consumeClick(): boolean {
    const wasClicked = this.mouseClicked;
    this.mouseClicked = false;
    return wasClicked;
  }

  public update(deltaTime: number): void {
    // Increment hold durations only (do not clear transient single-frame presses here!)
    for (const [key, duration] of this.keyHoldDuration.entries()) {
      this.keyHoldDuration.set(key, duration + deltaTime);
    }
  }

  /**
   * Called at the VERY END of the frame loop after both update() and render() finish
   */
  public endFrame(): void {
    this.keysPressedThisFrame.clear();
    this.keysReleasedThisFrame.clear();
    this.mouseClicked = false;
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

