/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  color?: string;
  flicker?: boolean;
}

export class Lighting {
  private lights: LightSource[] = [];
  public ambientColor: string = 'rgba(12, 10, 16, 0.65)';
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  constructor(width: number = 1280, height: number = 720) {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    const ctx = this.offscreenCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context for lighting');
    this.offscreenCtx = ctx;
  }

  public setAmbient(color: string): void {
    this.ambientColor = color;
  }

  public clear(): void {
    this.lights = [];
  }

  public addLight(light: LightSource): void {
    this.lights.push(light);
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const w = this.offscreenCanvas.width;
    const h = this.offscreenCanvas.height;
    const octx = this.offscreenCtx;

    // 1. Fill offscreen with ambient darkness
    octx.globalCompositeOperation = 'source-over';
    octx.fillStyle = this.ambientColor;
    octx.fillRect(0, 0, w, h);

    // 2. Cut out light cones and circles using destination-out
    octx.globalCompositeOperation = 'destination-out';

    const now = performance.now() * 0.005;

    for (let i = 0; i < this.lights.length; i++) {
      const light = this.lights[i];
      const screenX = light.x - camX;
      const screenY = light.y - camY;

      // Viewport bounds check
      if (
        screenX < -light.radius ||
        screenX > w + light.radius ||
        screenY < -light.radius ||
        screenY > h + light.radius
      ) {
        continue;
      }

      // Natural flicker modulation
      let flickerFactor = 1.0;
      if (light.flicker) {
        flickerFactor = 0.92 + Math.sin(now * 3.5 + i * 2.1) * 0.08 + Math.cos(now * 7.1 + i * 5.3) * 0.04;
      }
      const radius = light.radius * flickerFactor;
      const intensity = Math.min(1.0, light.intensity * flickerFactor);

      const grad = octx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
      grad.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      grad.addColorStop(0.5, `rgba(0, 0, 0, ${intensity * 0.6})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      octx.fillStyle = grad;
      octx.beginPath();
      octx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      octx.fill();
    }

    // 3. Render colored light tints (soft warm orange for torches, ethereal cyan for echoes)
    octx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < this.lights.length; i++) {
      const light = this.lights[i];
      if (!light.color) continue;

      const screenX = light.x - camX;
      const screenY = light.y - camY;
      if (
        screenX < -light.radius ||
        screenX > w + light.radius ||
        screenY < -light.radius ||
        screenY > h + light.radius
      ) {
        continue;
      }

      const grad = octx.createRadialGradient(screenX, screenY, 0, screenX, screenY, light.radius);
      grad.addColorStop(0, light.color);
      grad.addColorStop(1, 'transparent');

      octx.fillStyle = grad;
      octx.beginPath();
      octx.arc(screenX, screenY, light.radius, 0, Math.PI * 2);
      octx.fill();
    }

    // 4. Draw darkness overlay onto main canvas
    ctx.save();
    ctx.drawImage(this.offscreenCanvas, 0, 0);
    ctx.restore();
  }
}
