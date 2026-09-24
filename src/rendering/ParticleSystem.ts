/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ParticleType =
  | 'dust'
  | 'spark'
  | 'fire'
  | 'magic'
  | 'echo'
  | 'leaf'
  | 'rain'
  | 'blood'
  | 'astral'
  | 'soul';

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: ParticleType;
  rotation: number;
  vRot: number;
  gravity: number;
}

export class ParticleSystem {
  private pool: Particle[] = [];
  private readonly maxParticles: number = 800;

  constructor() {
    // Pre-allocate particle pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 1,
        type: 'dust',
        rotation: 0,
        vRot: 0,
        gravity: 0,
      });
    }
  }

  public emit(
    type: ParticleType,
    x: number,
    y: number,
    count: number = 1,
    customProps?: Partial<Particle>
  ): void {
    let spawned = 0;
    for (let i = 0; i < this.pool.length && spawned < count; i++) {
      const p = this.pool[i];
      if (!p.active) {
        p.active = true;
        p.type = type;
        p.x = x + (Math.random() - 0.5) * 8;
        p.y = y + (Math.random() - 0.5) * 8;
        p.rotation = Math.random() * Math.PI * 2;
        p.vRot = (Math.random() - 0.5) * 4;

        switch (type) {
          case 'dust':
            p.vx = (Math.random() - 0.5) * 40;
            p.vy = -Math.random() * 25 - 5;
            p.size = Math.random() * 3 + 2;
            p.color = '#c2b280';
            p.maxLife = Math.random() * 0.4 + 0.2;
            p.gravity = 15;
            break;

          case 'spark':
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 160 + 80;
            p.vx = Math.cos(angle) * spd;
            p.vy = Math.sin(angle) * spd;
            p.size = Math.random() * 2.5 + 1.5;
            p.color = Math.random() > 0.5 ? '#fff385' : '#ff9d00';
            p.maxLife = Math.random() * 0.25 + 0.15;
            p.gravity = 300;
            break;

          case 'fire':
            p.vx = (Math.random() - 0.5) * 20;
            p.vy = -Math.random() * 45 - 20;
            p.size = Math.random() * 3 + 2;
            p.color = Math.random() > 0.4 ? '#ff7b00' : '#ffcf40';
            p.maxLife = Math.random() * 0.6 + 0.3;
            p.gravity = -20;
            break;

          case 'echo':
          case 'magic':
            p.vx = (Math.random() - 0.5) * 35;
            p.vy = -Math.random() * 40 - 15;
            p.size = Math.random() * 3.5 + 1.5;
            p.color = Math.random() > 0.5 ? '#38bdf8' : '#a5f3fc';
            p.maxLife = Math.random() * 0.7 + 0.4;
            p.gravity = -10;
            break;

          case 'leaf':
            p.vx = (Math.random() - 0.5) * 40 - 20;
            p.vy = Math.random() * 35 + 25;
            p.size = Math.random() * 4 + 2.5;
            p.color = Math.random() > 0.5 ? '#4d7c0f' : '#b45309';
            p.maxLife = Math.random() * 4.0 + 3.0;
            p.gravity = 10;
            break;

          case 'rain':
            p.vx = -40;
            p.vy = Math.random() * 300 + 400;
            p.size = Math.random() * 8 + 6;
            p.color = '#7dd3fc';
            p.maxLife = 1.0;
            p.gravity = 0;
            break;

          case 'blood':
            const bAngle = Math.random() * Math.PI - Math.PI * 0.8;
            const bSpd = Math.random() * 140 + 40;
            p.vx = Math.cos(bAngle) * bSpd;
            p.vy = Math.sin(bAngle) * bSpd;
            p.size = Math.random() * 3 + 2;
            p.color = '#991b1b';
            p.maxLife = Math.random() * 0.3 + 0.2;
            p.gravity = 400;
            break;

          case 'astral':
            p.vx = (Math.random() - 0.5) * 20;
            p.vy = (Math.random() - 0.5) * 20 - 15;
            p.size = Math.random() * 3 + 1.5;
            p.color = Math.random() > 0.5 ? '#c084fc' : '#818cf8';
            p.maxLife = Math.random() * 1.5 + 0.8;
            p.gravity = -5;
            break;

          case 'soul':
            p.vx = (Math.random() - 0.5) * 15;
            p.vy = -Math.random() * 30 - 10;
            p.size = Math.random() * 3 + 2;
            p.color = '#67e8f9';
            p.maxLife = Math.random() * 1.0 + 0.5;
            p.gravity = -15;
            break;
        }

        if (customProps) {
          Object.assign(p, customProps);
        }

        p.life = p.maxLife;
        p.alpha = 1;
        spawned++;
      }
    }
  }

  public update(deltaTime: number): void {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life -= deltaTime;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.vy += p.gravity * deltaTime;
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.rotation += p.vRot * deltaTime;

      const progress = p.life / p.maxLife;
      p.alpha = Math.min(1, progress * 1.5);
    }
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    ctx.save();
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      const screenX = p.x - camX;
      const screenY = p.y - camY;

      // Frustum culling check
      if (screenX < -20 || screenX > 1300 || screenY < -20 || screenY > 740) {
        continue;
      }

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'rain') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX - 3, screenY + p.size);
        ctx.stroke();
      } else if (p.type === 'spark' || p.type === 'echo' || p.type === 'astral' || p.type === 'soul') {
        // Glowing circular particle
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'leaf') {
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Square or pixel dust
        ctx.fillRect(screenX - p.size / 2, screenY - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();
  }

  public clear(): void {
    for (const p of this.pool) {
      p.active = false;
    }
  }
}
