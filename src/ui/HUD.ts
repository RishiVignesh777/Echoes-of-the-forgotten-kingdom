/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HealthBar } from './HealthBar.ts';
import { Player } from '../entities/Player.ts';
import { EchoSystem } from '../systems/EchoSystem.ts';
import { TimelessKing } from '../entities/Boss.ts';

export class HUD {
  private notificationText: string | null = null;
  private notificationTimer: number = 0;
  private bannerTitle: string = '';
  private bannerSubtitle: string = '';
  private bannerTimer: number = 0;

  public showBanner(title: string, subtitle: string): void {
    this.bannerTitle = title;
    this.bannerSubtitle = subtitle;
    this.bannerTimer = 4.0;
  }

  public notify(text: string): void {
    this.notificationText = text;
    this.notificationTimer = 3.0;
  }

  public update(deltaTime: number): void {
    if (this.notificationTimer > 0) this.notificationTimer -= deltaTime;
    if (this.bannerTimer > 0) this.bannerTimer -= deltaTime;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    player: Player,
    echoSystem: EchoSystem,
    activeBoss: TimelessKing | null,
    levelName: string,
    areaNumber: number
  ): void {
    ctx.save();

    // 1. Health & Stamina Bar (Top-Left)
    HealthBar.renderPlayerBar(
      ctx,
      28,
      28,
      player.health,
      player.maxHealth,
      player.stamina,
      player.maxStamina
    );

    // 2. Echo Charges (Top-Center-Left)
    this.renderEchoMeters(ctx, 28, 64, echoSystem);

    // 3. Area Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Cinzel, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`AREA ${areaNumber}: ${levelName.toUpperCase()}`, 28, 114);

    // 4. Boss Health Bar (Top-Center)
    if (activeBoss && !activeBoss.isDead) {
      HealthBar.renderBossBar(
        ctx,
        'The Timeless King',
        activeBoss.health,
        activeBoss.maxHealth,
        activeBoss.phase
      );
    }

    // 5. Center Welcome Banner (Fades out)
    if (this.bannerTimer > 0) {
      const alpha = Math.min(1, this.bannerTimer, 4.0 - this.bannerTimer);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.font = 'bold 32px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.bannerTitle, 640, 260);

      ctx.font = 'italic 16px "Crimson Pro", Georgia, serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(this.bannerSubtitle, 640, 292);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    }

    // 6. Notification Toast (Top-Right)
    if (this.notificationTimer > 0 && this.notificationText) {
      const nAlpha = Math.min(1, this.notificationTimer);
      ctx.globalAlpha = nAlpha;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(940, 28, 310, 42);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(940, 28, 310, 42);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px Cinzel, serif';
      ctx.textAlign = 'left';
      ctx.fillText(`✦ ${this.notificationText}`, 956, 54);
      ctx.globalAlpha = 1.0;
    }

    // 7. Compact Controls Guide (Bottom-Right)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(860, 680, 395, 28);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(860, 680, 395, 28);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('A/D Move • W Jump • J Attack • K Block • Shift Dash • Q Echo • E Interact', 1058, 698);

    ctx.restore();
  }

  private renderEchoMeters(ctx: CanvasRenderingContext2D, x: number, y: number, echoSystem: EchoSystem): void {
    const orbRadius = 11;
    const spacing = 32;

    for (let i = 0; i < echoSystem.maxEchoes; i++) {
      const orbX = x + i * spacing + orbRadius;
      const orbY = y + orbRadius;
      const isUsed = i < echoSystem.echoes.length;

      // Dark socket
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isUsed ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (isUsed) {
        // Active Echo in field
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (echoSystem.echoCooldown <= 0) {
        // Available to spawn
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius - 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Cinzel, serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `ECHOES [Q] (${echoSystem.echoes.length}/${echoSystem.maxEchoes})`,
      x + echoSystem.maxEchoes * spacing + 6,
      y + 15
    );
  }
}
