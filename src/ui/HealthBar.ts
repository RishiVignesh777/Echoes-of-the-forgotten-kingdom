/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class HealthBar {
  public static renderPlayerBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    health: number,
    maxHealth: number,
    stamina: number,
    maxStamina: number
  ): void {
    ctx.save();

    // 1. Health Bar Outer Frame
    const barW = 200;
    const barH = 18;

    // Dark backdrop
    ctx.fillStyle = 'rgba(15, 12, 20, 0.85)';
    ctx.fillRect(x - 4, y - 4, barW + 8, barH + 20);

    // Ornate Gold Trim
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, barW + 4, barH + 4);

    // Red Health Fill
    const hpRatio = Math.max(0, Math.min(1, health / maxHealth));
    const hpGrad = ctx.createLinearGradient(x, y, x, y + barH);
    hpGrad.addColorStop(0, '#f87171');
    hpGrad.addColorStop(1, '#b91c1c');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(x, y, barW * hpRatio, barH);

    // Heart Icon & Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Cinzel, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`KAEL  ${Math.round(health)} / ${maxHealth}`, x + 8, y + 13);

    // 2. Stamina Bar
    const stamY = y + barH + 4;
    const stamH = 6;
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x, stamY, barW, stamH);

    const stamRatio = Math.max(0, Math.min(1, stamina / maxStamina));
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x, stamY, barW * stamRatio, stamH);

    ctx.restore();
  }

  public static renderBossBar(
    ctx: CanvasRenderingContext2D,
    name: string,
    health: number,
    maxHealth: number,
    phase: number
  ): void {
    ctx.save();
    const barW = 460;
    const barH = 16;
    const x = 640 - barW / 2;
    const y = 62;

    // Boss Name & Phase
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 15px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${name.toUpperCase()} — PHASE ${phase}`, 640, y - 8);
    ctx.shadowBlur = 0;

    // Background
    ctx.fillStyle = 'rgba(20, 10, 30, 0.9)';
    ctx.fillRect(x - 4, y - 3, barW + 8, barH + 6);

    // Ornate Border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, barW + 4, barH + 4);

    // Purple / Crimson Boss Fill
    const hpRatio = Math.max(0, Math.min(1, health / maxHealth));
    const grad = ctx.createLinearGradient(x, y, x + barW, y);
    grad.addColorStop(0, '#9333ea');
    grad.addColorStop(0.5, '#c084fc');
    grad.addColorStop(1, '#dc2626');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW * hpRatio, barH);

    ctx.restore();
  }
}
