/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState } from '../game/GameState.ts';

export class SpriteRenderer {
  /**
   * Draws Kael the Knight using layered Canvas 2D primitives with smooth procedural animations
   */
  static drawKnight(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: number,
    state: PlayerState,
    animTime: number,
    options: {
      isEcho?: boolean;
      echoAlpha?: number;
      isHurt?: boolean;
      isBlocking?: boolean;
      dashTrail?: boolean;
    } = {}
  ): void {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (facing < 0) {
      ctx.scale(-1, 1);
    }

    const t = animTime;
    const isEcho = options.isEcho || false;
    const isHurt = options.isHurt || false;
    const isBlocking = options.isBlocking || false;

    // Echo glow effect
    if (isEcho) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
    }

    if (isHurt) {
      ctx.filter = 'brightness(2.5) sepia(1) hue-rotate(320deg)';
    }

    // Procedural animation parameters
    let bobY = 0;
    let legAngleLeft = 0;
    let legAngleRight = 0;
    let swordAngle = 0;
    let swordOffsetX = 0;
    let swordOffsetY = 0;
    let capeSway = Math.sin(t * 4) * 5;

    switch (state) {
      case PlayerState.IDLE:
        bobY = Math.sin(t * 3) * 1.5;
        capeSway = Math.sin(t * 2.5) * 4;
        swordAngle = -0.15 + Math.sin(t * 2) * 0.05;
        break;

      case PlayerState.RUN:
        bobY = Math.abs(Math.sin(t * 12)) * 3;
        legAngleLeft = Math.sin(t * 12) * 0.6;
        legAngleRight = -Math.sin(t * 12) * 0.6;
        capeSway = -12 + Math.sin(t * 14) * 8;
        swordAngle = 0.3 + Math.sin(t * 12) * 0.2;
        break;

      case PlayerState.JUMP:
        bobY = -2;
        legAngleLeft = -0.3;
        legAngleRight = 0.2;
        capeSway = 12;
        swordAngle = -0.5;
        break;

      case PlayerState.FALL:
        bobY = 1;
        legAngleLeft = 0.2;
        legAngleRight = -0.3;
        capeSway = -10;
        swordAngle = 0.1;
        break;

      case PlayerState.ATTACK:
        const attackProgress = (t % 0.35) / 0.35;
        swordAngle = -1.8 + attackProgress * 3.4; // Wide front slash
        swordOffsetX = Math.cos(swordAngle) * 14;
        swordOffsetY = Math.sin(swordAngle) * 10;
        capeSway = -15;
        break;

      case PlayerState.HEAVY_ATTACK:
        const heavyProgress = (t % 0.55) / 0.55;
        swordAngle = -2.4 + heavyProgress * 4.2; // Huge sweeping cleave
        swordOffsetX = Math.cos(swordAngle) * 22;
        swordOffsetY = Math.sin(swordAngle) * 15;
        capeSway = -24;
        break;

      case PlayerState.BLOCK:
        swordAngle = -1.2;
        swordOffsetX = -4;
        swordOffsetY = -6;
        break;

      case PlayerState.DASH:
        bobY = 2;
        capeSway = -28;
        swordAngle = -0.8;
        break;

      case PlayerState.HURT:
        bobY = 4;
        swordAngle = 0.6;
        capeSway = 8;
        break;

      case PlayerState.DEATH:
        ctx.rotate(Math.PI / 2.2);
        ctx.translate(10, 20);
        break;
    }

    // Apply vertical bob
    ctx.translate(0, bobY);

    // Color palette (Kael vs Echo)
    const steelDark = isEcho ? 'rgba(70, 115, 160, 0.7)' : '#333b47';
    const steelMed = isEcho ? 'rgba(100, 160, 220, 0.75)' : '#535c6c';
    const steelLight = isEcho ? 'rgba(170, 225, 255, 0.85)' : '#9ba3af';
    const capeColor = isEcho ? 'rgba(30, 80, 140, 0.6)' : '#172033';
    const capeBorder = isEcho ? 'rgba(56, 189, 248, 0.8)' : '#2563eb';
    const leather = isEcho ? 'rgba(80, 100, 130, 0.7)' : '#5b3824';
    const visorGlow = isEcho ? '#e0f2fe' : '#38bdf8';

    // 1. Cape (Behind body)
    this.drawCape(ctx, capeSway, capeColor, capeBorder);

    // 2. Legs & Boots
    this.drawLegs(ctx, legAngleLeft, legAngleRight, steelDark, steelMed);

    // 3. Torso & Body Armor
    this.drawBody(ctx, steelDark, steelMed, steelLight);

    // 4. Belt & Accessories
    this.drawBelt(ctx, leather);

    // 5. Shield on Back
    this.drawShield(ctx, steelDark, steelLight, capeBorder);

    // 6. Helmet & Visor
    this.drawHelmet(ctx, steelMed, steelLight, visorGlow);

    // 7. Arms & Longsword
    this.drawSword(ctx, swordAngle, swordOffsetX, swordOffsetY, steelLight, steelMed, isEcho, isBlocking);

    // 8. Glowing Markings / Echo Magic Runes
    if (isEcho || state === PlayerState.ECHO_CAST) {
      this.drawMagicEffects(ctx, t);
    }

    ctx.restore();
  }

  private static drawCape(
    ctx: CanvasRenderingContext2D,
    sway: number,
    color: string,
    trim: string
  ): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-8, -48);
    ctx.quadraticCurveTo(-26 + sway * 0.5, -20, -22 + sway, 12);
    ctx.lineTo(-4 + sway * 0.4, 8);
    ctx.lineTo(4, -46);
    ctx.closePath();
    ctx.fill();

    // Cape royal-blue trim
    ctx.strokeStyle = trim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-22 + sway, 12);
    ctx.lineTo(-4 + sway * 0.4, 8);
    ctx.stroke();
  }

  private static drawLegs(
    ctx: CanvasRenderingContext2D,
    leftRot: number,
    rightRot: number,
    colorDark: string,
    colorLight: string
  ): void {
    // Back leg
    ctx.save();
    ctx.translate(-5, -16);
    ctx.rotate(rightRot);
    ctx.fillStyle = colorDark;
    ctx.fillRect(-4, 0, 8, 14); // Thigh
    ctx.fillStyle = colorLight;
    ctx.fillRect(-5, 12, 10, 10); // Greave / Boot
    ctx.restore();

    // Front leg
    ctx.save();
    ctx.translate(6, -16);
    ctx.rotate(leftRot);
    ctx.fillStyle = colorDark;
    ctx.fillRect(-4, 0, 8, 14);
    ctx.fillStyle = colorLight;
    ctx.fillRect(-5, 12, 11, 10);
    ctx.restore();
  }

  private static drawBody(
    ctx: CanvasRenderingContext2D,
    steelDark: string,
    steelMed: string,
    steelLight: string
  ): void {
    // Under-armor / Gambeson
    ctx.fillStyle = steelDark;
    ctx.fillRect(-12, -45, 24, 30);

    // Steel Cuirass (Chestplate)
    ctx.fillStyle = steelMed;
    ctx.beginPath();
    ctx.moveTo(-13, -46);
    ctx.lineTo(13, -46);
    ctx.lineTo(10, -22);
    ctx.lineTo(-10, -22);
    ctx.closePath();
    ctx.fill();

    // Chestplate highlight ridge
    ctx.strokeStyle = steelLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.lineTo(0, -23);
    ctx.stroke();

    // Pauldrons (Shoulder guards)
    ctx.fillStyle = steelLight;
    ctx.beginPath();
    ctx.arc(-12, -44, 5, 0, Math.PI * 2);
    ctx.arc(12, -44, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawBelt(ctx: CanvasRenderingContext2D, leather: string): void {
    ctx.fillStyle = leather;
    ctx.fillRect(-11, -22, 22, 5);

    // Golden/Brass buckle
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-3, -23, 6, 7);
  }

  private static drawShield(
    ctx: CanvasRenderingContext2D,
    darkSteel: string,
    lightSteel: string,
    crestColor: string
  ): void {
    ctx.save();
    ctx.translate(-14, -36);
    ctx.rotate(-0.15);

    // Heater shield body
    ctx.fillStyle = darkSteel;
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.lineTo(10, -10);
    ctx.lineTo(10, 4);
    ctx.quadraticCurveTo(4, 16, 4, 18);
    ctx.quadraticCurveTo(-2, 14, -2, -10);
    ctx.closePath();
    ctx.fill();

    // Shield rim
    ctx.strokeStyle = lightSteel;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Royal Blue Emblem
    ctx.fillStyle = crestColor;
    ctx.fillRect(1, -6, 6, 8);
    ctx.restore();
  }

  private static drawHelmet(
    ctx: CanvasRenderingContext2D,
    helmetColor: string,
    highlight: string,
    visorGlow: string
  ): void {
    // Great helm dome
    ctx.fillStyle = helmetColor;
    ctx.beginPath();
    ctx.arc(0, -56, 13, Math.PI, 0);
    ctx.lineTo(11, -45);
    ctx.lineTo(-11, -45);
    ctx.closePath();
    ctx.fill();

    // Top metal ridge / crest
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, -67);
    ctx.lineTo(2, -67);
    ctx.lineTo(0, -56);
    ctx.stroke();

    // Visor dark plate
    ctx.fillStyle = '#111827';
    ctx.fillRect(-10, -56, 21, 7);

    // Glowing eye slit
    ctx.fillStyle = visorGlow;
    ctx.fillRect(-4, -54, 15, 2.5);

    // Breathing perforations on helm
    ctx.fillStyle = '#1e293b';
    for (let i = -6; i <= 6; i += 3) {
      ctx.fillRect(i, -49, 1.5, 2);
    }
  }

  private static drawSword(
    ctx: CanvasRenderingContext2D,
    angle: number,
    offsetX: number,
    offsetY: number,
    bladeColor: string,
    hiltColor: string,
    isEcho: boolean,
    isBlocking: boolean
  ): void {
    ctx.save();
    // Arm origin
    ctx.translate(6 + offsetX, -38 + offsetY);
    ctx.rotate(angle);

    if (isBlocking) {
      // Parry angle
      ctx.rotate(-0.8);
    }

    // Forearm
    ctx.fillStyle = hiltColor;
    ctx.fillRect(-3, -3, 8, 6);

    // Crossguard
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(4, -8, 4, 16);

    // Hilt / Pommel
    ctx.fillStyle = '#451a03';
    ctx.fillRect(1, -2, 4, 4);
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Steel Blade
    ctx.fillStyle = bladeColor;
    ctx.beginPath();
    ctx.moveTo(8, -3.5);
    ctx.lineTo(44, -2.5);
    ctx.lineTo(50, 0); // Point
    ctx.lineTo(44, 2.5);
    ctx.lineTo(8, 3.5);
    ctx.closePath();
    ctx.fill();

    // Blade fuller / central groove
    ctx.strokeStyle = isEcho ? '#e0f2fe' : '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(40, 0);
    ctx.stroke();

    // Echo blade trail
    if (isEcho) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(52, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  private static drawMagicEffects(ctx: CanvasRenderingContext2D, t: number): void {
    // Ethereal circular glyph on ground
    ctx.save();
    ctx.translate(0, 2);
    ctx.scale(1, 0.35);
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + Math.sin(t * 5) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24 + Math.sin(t * 6) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws enemies based on their type and animation state
   */
  static drawEnemy(
    ctx: CanvasRenderingContext2D,
    type: string,
    x: number,
    y: number,
    width: number,
    height: number,
    facing: number,
    animTime: number,
    state: string,
    isHurt: boolean = false
  ): void {
    ctx.save();
    ctx.translate(Math.round(x + width / 2), Math.round(y + height));

    if (facing < 0) {
      ctx.scale(-1, 1);
    }

    if (isHurt) {
      ctx.filter = 'brightness(2) contrast(1.5)';
    }

    const t = animTime;

    switch (type) {
      case 'CORRUPTED_KNIGHT':
        this.drawCorruptedKnight(ctx, t, state);
        break;

      case 'SHADOW_WOLF':
        this.drawShadowWolf(ctx, t, state);
        break;

      case 'FUNGAL_BRUTE':
        this.drawFungalBrute(ctx, t, state);
        break;

      case 'ARCANE_WRAITH':
        this.drawArcaneWraith(ctx, t, state);
        break;

      case 'TIMELESS_KING':
        this.drawTimelessKing(ctx, t, state);
        break;
    }

    ctx.restore();
  }

  private static drawCorruptedKnight(
    ctx: CanvasRenderingContext2D,
    t: number,
    state: string
  ): void {
    const isAttacking = state === 'ATTACK';
    const swing = isAttacking ? Math.sin(t * 15) * 1.5 : 0;

    // Dark cape
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(-12, -50);
    ctx.lineTo(-24 + Math.sin(t * 4) * 4, 0);
    ctx.lineTo(0, -6);
    ctx.closePath();
    ctx.fill();

    // Spiked heavy plate
    ctx.fillStyle = '#292524';
    ctx.fillRect(-12, -45, 24, 28);

    // Crimson glowing sigil on chest
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3, -36, 6, 12);
    ctx.fillRect(-7, -33, 14, 4);

    // Spiked pauldrons
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.moveTo(-16, -48);
    ctx.lineTo(-22, -56);
    ctx.lineTo(-10, -48);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -48);
    ctx.lineTo(20, -56);
    ctx.lineTo(16, -48);
    ctx.fill();

    // Legs
    const legOffset = state === 'CHASE' || state === 'PATROL' ? Math.sin(t * 10) * 8 : 0;
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-10, -17, 8, 17 - legOffset * 0.3);
    ctx.fillRect(2, -17, 8, 17 + legOffset * 0.3);

    // Horned Great Helm
    ctx.fillStyle = '#44403c';
    ctx.fillRect(-10, -60, 20, 16);
    // Horns
    ctx.beginPath();
    ctx.moveTo(-10, -58);
    ctx.lineTo(-18, -70);
    ctx.lineTo(-6, -60);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -60);
    ctx.lineTo(18, -70);
    ctx.lineTo(10, -58);
    ctx.fill();

    // Red glowing eye visor
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(-2, -54, 12, 3);
    ctx.shadowBlur = 0;

    // Heavy Jagged Cleaver
    ctx.save();
    ctx.translate(10, -32);
    ctx.rotate(isAttacking ? swing - 1.2 : -0.2);
    ctx.fillStyle = '#57534e';
    ctx.fillRect(0, -4, 38, 8);
    // Spikes on blade
    ctx.fillStyle = '#a8a29e';
    ctx.beginPath();
    ctx.moveTo(38, -4);
    ctx.lineTo(46, 0);
    ctx.lineTo(38, 4);
    ctx.fill();
    ctx.restore();
  }

  private static drawShadowWolf(ctx: CanvasRenderingContext2D, t: number, state: string): void {
    const runCycle = state === 'CHASE' ? Math.sin(t * 16) : Math.sin(t * 6);

    // Shadow aura
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, -16, 32, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(0, -18 + runCycle * 2, 26, 12, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 4;
    // Front legs
    ctx.beginPath();
    ctx.moveTo(14, -14);
    ctx.lineTo(18 + runCycle * 10, 0);
    ctx.moveTo(8, -14);
    ctx.lineTo(10 - runCycle * 8, 0);
    // Back legs
    ctx.moveTo(-16, -14);
    ctx.lineTo(-12 - runCycle * 10, 0);
    ctx.moveTo(-20, -14);
    ctx.lineTo(-24 + runCycle * 8, 0);
    ctx.stroke();

    // Wolf Head & Jaws
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(16, -26);
    ctx.lineTo(36, -20);
    ctx.lineTo(26, -12);
    ctx.closePath();
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(18, -26);
    ctx.lineTo(22, -34);
    ctx.lineTo(26, -24);
    ctx.fill();

    // Crimson glowing eyes
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 6;
    ctx.fillRect(24, -22, 4, 3);
    ctx.shadowBlur = 0;

    // Tail
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-24, -20);
    ctx.quadraticCurveTo(-36, -28 + runCycle * 6, -42, -18);
    ctx.stroke();
  }

  private static drawFungalBrute(ctx: CanvasRenderingContext2D, t: number, state: string): void {
    const isAttacking = state === 'ATTACK';
    const heave = Math.sin(t * 4) * 3;

    // Heavy rocky body
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.roundRect(-28, -68 + heave, 56, 52, 12);
    ctx.fill();

    // Thick stone legs
    ctx.fillStyle = '#27272a';
    ctx.fillRect(-22, -20, 18, 20);
    ctx.fillRect(4, -20, 18, 20);

    // Glowing Bioluminescent Mushrooms on back/shoulders
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-18, -72 + heave, 10, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -75 + heave, 12, Math.PI, 0);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Mushroom stems
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-20, -64 + heave, 4, 8);
    ctx.fillRect(10, -66 + heave, 5, 10);

    // Moss / Spore cracks
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-16, -50 + heave);
    ctx.lineTo(-4, -42 + heave);
    ctx.lineTo(8, -52 + heave);
    ctx.stroke();

    // Heavy stone fists
    ctx.fillStyle = '#52525b';
    const armY = isAttacking ? -30 + Math.sin(t * 12) * 20 : -40 + heave;
    ctx.beginPath();
    ctx.arc(26, armY, 14, 0, Math.PI * 2);
    ctx.arc(-26, armY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Tiny glowing yellow eyes
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-6, -56 + heave, 4, 3);
    ctx.fillRect(4, -56 + heave, 4, 3);
  }

  private static drawArcaneWraith(ctx: CanvasRenderingContext2D, t: number, state: string): void {
    const floatY = Math.sin(t * 3.5) * 8;

    // Floating purple robes
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.moveTo(0, -68 + floatY);
    ctx.lineTo(-18, -40 + floatY);
    ctx.lineTo(-24 + Math.sin(t * 5) * 5, -8 + floatY);
    ctx.lineTo(-6, -14 + floatY);
    ctx.lineTo(6, -6 + floatY);
    ctx.lineTo(24 + Math.cos(t * 5) * 5, -12 + floatY);
    ctx.lineTo(18, -40 + floatY);
    ctx.closePath();
    ctx.fill();

    // Deep Hood
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -56 + floatY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Void interior face
    ctx.fillStyle = '#050510';
    ctx.beginPath();
    ctx.arc(0, -55 + floatY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Astral Eyes
    ctx.fillStyle = '#c084fc';
    ctx.shadowColor = '#e879f9';
    ctx.shadowBlur = 10;
    ctx.fillRect(-4, -56 + floatY, 3, 3);
    ctx.fillRect(3, -56 + floatY, 3, 3);
    ctx.shadowBlur = 0;

    // Floating Arcane Spell Orbs orbiting hands
    for (let i = 0; i < 3; i++) {
      const orbAngle = t * 4 + (i * Math.PI * 2) / 3;
      const orbX = Math.cos(orbAngle) * 22;
      const orbY = -42 + floatY + Math.sin(orbAngle) * 8;

      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private static drawTimelessKing(ctx: CanvasRenderingContext2D, t: number, state: string): void {
    const isAttacking = state === 'ATTACK';
    const breathe = Math.sin(t * 2.5) * 4;

    // Massive regal tattered purple cloak
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.moveTo(-30, -96 + breathe);
    ctx.quadraticCurveTo(-60, -30, -50 + Math.sin(t * 3) * 10, 0);
    ctx.lineTo(10, 0);
    ctx.lineTo(30, -96 + breathe);
    ctx.closePath();
    ctx.fill();

    // Broken Golden Armor (Torso)
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-24, -90 + breathe, 48, 54);
    // Gold filigree highlights
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.strokeRect(-22, -88 + breathe, 44, 50);

    // Corrupted crystal heart core in chest (The Heart of Eternity)
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, -68 + breathe, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Massive Pauldrons
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(-24, -94 + breathe);
    ctx.lineTo(-44, -86 + breathe);
    ctx.lineTo(-24, -70 + breathe);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(24, -94 + breathe);
    ctx.lineTo(44, -86 + breathe);
    ctx.lineTo(24, -70 + breathe);
    ctx.fill();

    // Armored Greaves & Legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-18, -36, 15, 36);
    ctx.fillRect(4, -36, 15, 36);

    // Helmet with shattered skull visor
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, -108 + breathe, 16, 0, Math.PI * 2);
    ctx.fill();

    // Floating Shattered Crown with time runes
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 10;
    const crownFloat = -130 + breathe + Math.sin(t * 4) * 3;
    ctx.beginPath();
    ctx.moveTo(-18, crownFloat);
    ctx.lineTo(-14, crownFloat - 14);
    ctx.lineTo(-4, crownFloat - 6);
    ctx.lineTo(0, crownFloat - 18); // Center peak
    ctx.lineTo(4, crownFloat - 6);
    ctx.lineTo(14, crownFloat - 14);
    ctx.lineTo(18, crownFloat);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing temporal eyes
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 12;
    ctx.fillRect(-6, -110 + breathe, 4, 4);
    ctx.fillRect(4, -110 + breathe, 4, 4);
    ctx.shadowBlur = 0;

    // Massive Greatsword of Eternity
    ctx.save();
    ctx.translate(24, -70 + breathe);
    const swordRot = isAttacking ? -1.6 + Math.sin(t * 12) * 1.8 : 0.2;
    ctx.rotate(swordRot);

    // Blade
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(4, -8, 86, 16);
    // Blade runic core
    ctx.fillStyle = '#9333ea';
    ctx.fillRect(8, -2, 70, 4);
    // Crossguard
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, -18, 8, 36);
    ctx.restore();
  }
}
