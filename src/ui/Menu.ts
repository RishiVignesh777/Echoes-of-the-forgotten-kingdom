/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode } from '../game/GameState.ts';
import { Collision } from '../game/Collision.ts';
import { Input } from '../game/Input.ts';

export interface MenuButton {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: () => void;
}

export class Menu {
  public mode: GameMode = GameMode.MENU;
  private animTimer: number = 0;
  private hoveredButtonId: string | null = null;

  public update(deltaTime: number): void {
    this.animTimer += deltaTime;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    mode: GameMode,
    input: Input,
    callbacks: {
      onStart: () => void;
      onResume: () => void;
      onRestart: () => void;
      onRespawn: () => void;
      onSelectLevel: (levelId: string) => void;
      onToggleControls: () => void;
      onToggleSound: () => boolean;
      onToggleMusic: () => boolean;
      onMainMenu: () => void;
      isSoundEnabled: () => boolean;
      isMusicEnabled: () => boolean;
    }
  ): void {
    this.mode = mode;
    if (mode === GameMode.PLAYING) return;

    ctx.save();
    switch (mode) {
      case GameMode.MENU:
        this.renderMainMenu(ctx, input, callbacks);
        break;

      case GameMode.PAUSED:
        this.renderPauseMenu(ctx, input, callbacks);
        break;

      case GameMode.CONTROLS:
        this.renderControlsModal(ctx, input, callbacks);
        break;

      case GameMode.LEVEL_SELECT:
        this.renderLevelSelectModal(ctx, input, callbacks);
        break;

      case GameMode.GAME_OVER:
        this.renderGameOver(ctx, input, callbacks);
        break;

      case GameMode.VICTORY:
        this.renderVictory(ctx, input, callbacks);
        break;
    }
    ctx.restore();
  }

  private renderMainMenu(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: {
      onStart: () => void;
      onSelectLevel: (levelId: string) => void;
      onToggleControls: () => void;
      onToggleSound: () => boolean;
      onToggleMusic: () => boolean;
      isSoundEnabled: () => boolean;
      isMusicEnabled: () => boolean;
    }
  ): void {
    // Backdrop dark fantasy gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 720);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#18181b');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Ruined Castle Silhouette in background
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(340, 500);
    ctx.lineTo(340, 280);
    ctx.lineTo(460, 240);
    ctx.lineTo(580, 280);
    ctx.lineTo(580, 500);
    ctx.lineTo(700, 200);
    ctx.lineTo(840, 200);
    ctx.lineTo(840, 500);
    ctx.lineTo(980, 280);
    ctx.lineTo(980, 500);
    ctx.closePath();
    ctx.fill();

    // Title text
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 24;
    ctx.font = 'bold 44px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('ECHOES OF THE FORGOTTEN KINGDOM', 640, 180);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 16px "Crimson Pro", Georgia, serif';
    ctx.fillText('A 2D Action-Adventure of Frozen Time, Echo Puzzles & Tactical Combat', 640, 222);

    // Buttons
    const buttons: MenuButton[] = [
      { id: 'start', label: 'ENTER THE REALM', x: 500, y: 290, width: 280, height: 46, action: callbacks.onStart },
      { id: 'levels', label: 'SELECT REGION', x: 500, y: 355, width: 280, height: 46, action: () => callbacks.onSelectLevel('village') },
      { id: 'controls', label: 'HOW TO PLAY', x: 500, y: 420, width: 280, height: 46, action: callbacks.onToggleControls },
    ];

    // Sound / Music toggle buttons at bottom
    const soundLabel = `SOUND: ${callbacks.isSoundEnabled() ? 'ON' : 'OFF'}`;
    buttons.push({
      id: 'sound',
      label: soundLabel,
      x: 500,
      y: 485,
      width: 135,
      height: 40,
      action: () => callbacks.onToggleSound(),
    });

    const musicLabel = `MUSIC: ${callbacks.isMusicEnabled() ? 'ON' : 'OFF'}`;
    buttons.push({
      id: 'music',
      label: musicLabel,
      x: 645,
      y: 485,
      width: 135,
      height: 40,
      action: () => callbacks.onToggleMusic(),
    });

    this.renderButtons(ctx, buttons, input);
  }

  private renderPauseMenu(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: {
      onResume: () => void;
      onRestart: () => void;
      onToggleControls: () => void;
      onMainMenu: () => void;
      onToggleSound: () => boolean;
      onToggleMusic: () => boolean;
      isSoundEnabled: () => boolean;
      isMusicEnabled: () => boolean;
    }
  ): void {
    // Dark overlay
    ctx.fillStyle = 'rgba(10, 8, 14, 0.78)';
    ctx.fillRect(0, 0, 1280, 720);

    // Ornate Panel Box
    ctx.fillStyle = 'rgba(24, 24, 27, 0.95)';
    ctx.fillRect(460, 140, 360, 440);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.strokeRect(460, 140, 360, 440);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 30px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 640, 200);

    const buttons: MenuButton[] = [
      { id: 'resume', label: 'RESUME JOURNEY', x: 500, y: 240, width: 280, height: 44, action: callbacks.onResume },
      { id: 'restart', label: 'RESTART AREA', x: 500, y: 300, width: 280, height: 44, action: callbacks.onRestart },
      { id: 'controls', label: 'CONTROLS', x: 500, y: 360, width: 280, height: 44, action: callbacks.onToggleControls },
      {
        id: 'audio',
        label: `AUDIO: ${callbacks.isSoundEnabled() ? 'ON' : 'MUTED'}`,
        x: 500,
        y: 420,
        width: 280,
        height: 44,
        action: () => callbacks.onToggleSound(),
      },
      { id: 'quit', label: 'TITLE SCREEN', x: 500, y: 480, width: 280, height: 44, action: callbacks.onMainMenu },
    ];

    this.renderButtons(ctx, buttons, input);
  }

  private renderControlsModal(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: { onToggleControls: () => void }
  ): void {
    ctx.fillStyle = 'rgba(10, 8, 14, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    // Box
    ctx.fillStyle = 'rgba(24, 24, 27, 0.96)';
    ctx.fillRect(340, 80, 600, 560);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(340, 80, 600, 560);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('KNIGHT’S CONTROLS & ECHO MECHANICS', 640, 130);

    // Key map table
    const binds = [
      ['A / D or ← / →', 'Move Kael horizontally'],
      ['W / Space / ↑', 'Jump / Vault over ledges'],
      ['J (Tap)', 'Light Sword Swing (20 damage)'],
      ['J (Hold & Release)', 'Heavy Sword Cleave (42 damage, high knockback)'],
      ['K (Hold)', 'Shield Block (absorbs 70% of damage)'],
      ['SHIFT', 'Dash (invulnerability phase shift)'],
      ['Q', 'Create Echo (Replays your past recorded actions!)'],
      ['R', 'Recall & dissipate active Echoes'],
      ['E', 'Interact with Checkpoints, Statues & Relics'],
      ['ESC / P', 'Pause / Unpause Game'],
    ];

    let rowY = 175;
    ctx.font = '14px Cinzel, serif';
    for (const [key, desc] of binds) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fde047';
      ctx.fillText(key, 580, rowY);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(desc, 600, rowY);
      rowY += 34;
    }

    // Close button
    const buttons: MenuButton[] = [
      { id: 'close', label: 'CLOSE', x: 520, y: 555, width: 240, height: 44, action: callbacks.onToggleControls },
    ];
    this.renderButtons(ctx, buttons, input);
  }

  private renderLevelSelectModal(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: {
      onSelectLevel: (levelId: string) => void;
      onMainMenu: () => void;
    }
  ): void {
    ctx.fillStyle = 'rgba(10, 8, 14, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = 'rgba(24, 24, 27, 0.96)';
    ctx.fillRect(360, 100, 560, 520);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.strokeRect(360, 100, 560, 520);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRAVEL ACROSS THE REALM', 640, 160);

    const levels = [
      { id: 'village', label: 'AREA 1: THE FORGOTTEN VILLAGE' },
      { id: 'forest', label: 'AREA 2: THE WHISPERING FOREST' },
      { id: 'castle', label: 'AREA 3: THE RUINED CASTLE' },
      { id: 'crypt', label: 'AREA 4: THE SUNKEN CRYPT' },
      { id: 'tower', label: 'AREA 5: THE CELESTIAL TOWER (BOSS)' },
    ];

    const buttons: MenuButton[] = levels.map((lvl, idx) => ({
      id: lvl.id,
      label: lvl.label,
      x: 420,
      y: 200 + idx * 60,
      width: 440,
      height: 44,
      action: () => callbacks.onSelectLevel(lvl.id),
    }));

    buttons.push({
      id: 'back',
      label: 'BACK TO MENU',
      x: 520,
      y: 525,
      width: 240,
      height: 42,
      action: callbacks.onMainMenu,
    });

    this.renderButtons(ctx, buttons, input);
  }

  private renderGameOver(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: {
      onRespawn: () => void;
      onRestart: () => void;
      onMainMenu: () => void;
    }
  ): void {
    ctx.fillStyle = 'rgba(20, 5, 8, 0.85)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 24;
    ctx.font = 'bold 44px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('YOU HAVE FALLEN TO TIME', 640, 240);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 16px "Crimson Pro", Georgia, serif';
    ctx.fillText('The temporal curse claims another soul... yet an echo still whispers.', 640, 290);

    const buttons: MenuButton[] = [
      { id: 'respawn', label: 'REVIVE AT CHECKPOINT', x: 480, y: 340, width: 320, height: 46, action: callbacks.onRespawn },
      { id: 'restart', label: 'RESTART THIS AREA', x: 480, y: 405, width: 320, height: 46, action: callbacks.onRestart },
      { id: 'title', label: 'RETURN TO TITLE', x: 480, y: 470, width: 320, height: 46, action: callbacks.onMainMenu },
    ];

    this.renderButtons(ctx, buttons, input);
  }

  private renderVictory(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: {
      onRestart: () => void;
      onMainMenu: () => void;
    }
  ): void {
    ctx.fillStyle = 'rgba(10, 14, 30, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 26;
    ctx.font = 'bold 42px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE HEART OF ETERNITY RESTORED', 640, 220);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'italic 18px "Crimson Pro", Georgia, serif';
    ctx.fillText('The Timeless King rests at last. The kingdom breathes in the light of dawn.', 640, 275);

    const buttons: MenuButton[] = [
      { id: 'play_again', label: 'PLAY AGAIN FROM VILLAGE', x: 480, y: 350, width: 320, height: 46, action: callbacks.onRestart },
      { id: 'menu', label: 'RETURN TO MAIN MENU', x: 480, y: 420, width: 320, height: 46, action: callbacks.onMainMenu },
    ];

    this.renderButtons(ctx, buttons, input);
  }

  private renderButtons(ctx: CanvasRenderingContext2D, buttons: MenuButton[], input: Input): void {
    for (const btn of buttons) {
      const isHovered = Collision.pointInRect(input.mouseX, input.mouseY, btn);

      if (isHovered && input.mouseClicked) {
        btn.action();
      }

      ctx.save();
      // Button Background
      ctx.fillStyle = isHovered ? '#1e293b' : 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      // Border
      ctx.strokeStyle = isHovered ? '#38bdf8' : '#64748b';
      ctx.lineWidth = isHovered ? 2 : 1.5;
      ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

      // Glow on hover
      if (isHovered) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
      }

      // Text
      ctx.fillStyle = isHovered ? '#38bdf8' : '#f8fafc';
      ctx.font = 'bold 14px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2 + 5);

      ctx.restore();
    }
  }
}
