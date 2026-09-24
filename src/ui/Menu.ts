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
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: () => void;
  shortcut?: string;
}

export interface MenuCallbacks {
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

export class Menu {
  public mode: GameMode = GameMode.MENU;
  private animTimer: number = 0;
  public hoveredButtonId: string | null = null;

  public getButtonsForMode(mode: GameMode, callbacks: MenuCallbacks): MenuButton[] {
    switch (mode) {
      case GameMode.MENU: {
        const soundLabel = `SOUND: ${callbacks.isSoundEnabled() ? 'ON' : 'OFF'}`;
        const musicLabel = `MUSIC: ${callbacks.isMusicEnabled() ? 'ON' : 'OFF'}`;
        return [
          {
            id: 'start',
            label: 'ENTER THE REALM',
            sublabel: '[SPACE / ENTER / 1]',
            x: 480,
            y: 285,
            width: 320,
            height: 48,
            action: callbacks.onStart,
            shortcut: '1',
          },
          {
            id: 'levels',
            label: 'SELECT REGION',
            sublabel: '[2]',
            x: 480,
            y: 350,
            width: 320,
            height: 48,
            action: () => callbacks.onSelectLevel('village'),
            shortcut: '2',
          },
          {
            id: 'controls',
            label: 'HOW TO PLAY',
            sublabel: '[3 / H]',
            x: 480,
            y: 415,
            width: 320,
            height: 48,
            action: callbacks.onToggleControls,
            shortcut: '3',
          },
          {
            id: 'sound',
            label: soundLabel,
            sublabel: '[S]',
            x: 480,
            y: 480,
            width: 155,
            height: 42,
            action: () => callbacks.onToggleSound(),
            shortcut: 's',
          },
          {
            id: 'music',
            label: musicLabel,
            sublabel: '[M]',
            x: 645,
            y: 480,
            width: 155,
            height: 42,
            action: () => callbacks.onToggleMusic(),
            shortcut: 'm',
          },
        ];
      }

      case GameMode.PAUSED: {
        const audioLabel = `AUDIO: ${callbacks.isSoundEnabled() ? 'ON' : 'MUTED'}`;
        return [
          {
            id: 'resume',
            label: 'RESUME JOURNEY',
            sublabel: '[ESC / SPACE / 1]',
            x: 480,
            y: 220,
            width: 320,
            height: 44,
            action: callbacks.onResume,
            shortcut: '1',
          },
          {
            id: 'restart',
            label: 'RESTART AREA',
            sublabel: '[2]',
            x: 480,
            y: 280,
            width: 320,
            height: 44,
            action: callbacks.onRestart,
            shortcut: '2',
          },
          {
            id: 'controls',
            label: 'CONTROLS',
            sublabel: '[3]',
            x: 480,
            y: 340,
            width: 320,
            height: 44,
            action: callbacks.onToggleControls,
            shortcut: '3',
          },
          {
            id: 'audio',
            label: audioLabel,
            sublabel: '[4 / M]',
            x: 480,
            y: 400,
            width: 320,
            height: 44,
            action: () => callbacks.onToggleSound(),
            shortcut: '4',
          },
          {
            id: 'quit',
            label: 'TITLE SCREEN',
            sublabel: '[5 / Q]',
            x: 480,
            y: 460,
            width: 320,
            height: 44,
            action: callbacks.onMainMenu,
            shortcut: '5',
          },
        ];
      }

      case GameMode.CONTROLS: {
        return [
          {
            id: 'close',
            label: 'RETURN TO ADVENTURE',
            sublabel: '[ESC / ENTER]',
            x: 500,
            y: 565,
            width: 280,
            height: 44,
            action: callbacks.onToggleControls,
            shortcut: 'escape',
          },
        ];
      }

      case GameMode.LEVEL_SELECT: {
        const levels = [
          { id: 'village', label: 'AREA 1: THE FORGOTTEN VILLAGE', sub: '[1]' },
          { id: 'forest', label: 'AREA 2: THE WHISPERING FOREST', sub: '[2]' },
          { id: 'castle', label: 'AREA 3: THE RUINED CASTLE', sub: '[3]' },
          { id: 'crypt', label: 'AREA 4: THE SUNKEN CRYPT', sub: '[4]' },
          { id: 'tower', label: 'AREA 5: THE CELESTIAL TOWER (BOSS)', sub: '[5]' },
        ];

        const buttons: MenuButton[] = levels.map((lvl, idx) => ({
          id: lvl.id,
          label: lvl.label,
          sublabel: lvl.sub,
          x: 400,
          y: 195 + idx * 58,
          width: 480,
          height: 44,
          action: () => callbacks.onSelectLevel(lvl.id),
          shortcut: String(idx + 1),
        }));

        buttons.push({
          id: 'back',
          label: 'BACK TO MENU',
          sublabel: '[ESC / BACKSPACE]',
          x: 520,
          y: 515,
          width: 240,
          height: 42,
          action: callbacks.onMainMenu,
          shortcut: 'escape',
        });

        return buttons;
      }

      case GameMode.GAME_OVER: {
        return [
          {
            id: 'respawn',
            label: 'REVIVE AT CHECKPOINT',
            sublabel: '[SPACE / ENTER / R / 1]',
            x: 480,
            y: 335,
            width: 320,
            height: 48,
            action: callbacks.onRespawn,
            shortcut: '1',
          },
          {
            id: 'restart',
            label: 'RESTART THIS AREA',
            sublabel: '[2]',
            x: 480,
            y: 400,
            width: 320,
            height: 48,
            action: callbacks.onRestart,
            shortcut: '2',
          },
          {
            id: 'title',
            label: 'RETURN TO TITLE',
            sublabel: '[3 / ESC]',
            x: 480,
            y: 465,
            width: 320,
            height: 48,
            action: callbacks.onMainMenu,
            shortcut: '3',
          },
        ];
      }

      case GameMode.VICTORY: {
        return [
          {
            id: 'play_again',
            label: 'PLAY AGAIN FROM VILLAGE',
            sublabel: '[SPACE / ENTER / 1]',
            x: 460,
            y: 345,
            width: 360,
            height: 48,
            action: callbacks.onRestart,
            shortcut: '1',
          },
          {
            id: 'menu',
            label: 'RETURN TO MAIN MENU',
            sublabel: '[2 / ESC]',
            x: 460,
            y: 415,
            width: 360,
            height: 48,
            action: callbacks.onMainMenu,
            shortcut: '2',
          },
        ];
      }

      default:
        return [];
    }
  }

  /**
   * Direct click handler called on pointerdown/click on canvas
   */
  public handleClick(x: number, y: number, mode: GameMode, callbacks: MenuCallbacks): boolean {
    if (mode === GameMode.PLAYING) return false;
    const buttons = this.getButtonsForMode(mode, callbacks);
    for (const btn of buttons) {
      if (Collision.pointInRect(x, y, btn)) {
        btn.action();
        return true;
      }
    }
    return false;
  }

  public update(deltaTime: number, mode: GameMode, input: Input, callbacks: MenuCallbacks): void {
    this.animTimer += deltaTime;
    this.mode = mode;
    if (mode === GameMode.PLAYING) return;

    const buttons = this.getButtonsForMode(mode, callbacks);

    // Track hover
    this.hoveredButtonId = null;
    for (const btn of buttons) {
      if (Collision.pointInRect(input.mouseX, input.mouseY, btn)) {
        this.hoveredButtonId = btn.id;
        break;
      }
    }

    // Handle Mouse Click
    if (input.mouseClicked && this.hoveredButtonId) {
      const btn = buttons.find((b) => b.id === this.hoveredButtonId);
      if (btn) {
        input.consumeClick();
        btn.action();
        return;
      }
    }

    // Keyboard Shortcuts
    switch (mode) {
      case GameMode.MENU:
        if (input.isJustPressed('space') || input.isJustPressed('enter') || input.isJustPressed('1')) {
          callbacks.onStart();
        } else if (input.isJustPressed('2')) {
          callbacks.onSelectLevel('village');
        } else if (input.isJustPressed('3') || input.isJustPressed('h')) {
          callbacks.onToggleControls();
        } else if (input.isJustPressed('s')) {
          callbacks.onToggleSound();
        } else if (input.isJustPressed('m')) {
          callbacks.onToggleMusic();
        }
        break;

      case GameMode.PAUSED:
        if (
          input.isJustPressed('escape') ||
          input.isJustPressed('p') ||
          input.isJustPressed('space') ||
          input.isJustPressed('enter') ||
          input.isJustPressed('1')
        ) {
          callbacks.onResume();
        } else if (input.isJustPressed('2')) {
          callbacks.onRestart();
        } else if (input.isJustPressed('3')) {
          callbacks.onToggleControls();
        } else if (input.isJustPressed('4') || input.isJustPressed('m') || input.isJustPressed('s')) {
          callbacks.onToggleSound();
        } else if (input.isJustPressed('5') || input.isJustPressed('q')) {
          callbacks.onMainMenu();
        }
        break;

      case GameMode.CONTROLS:
        if (
          input.isJustPressed('escape') ||
          input.isJustPressed('enter') ||
          input.isJustPressed('space') ||
          input.isJustPressed('c')
        ) {
          callbacks.onToggleControls();
        }
        break;

      case GameMode.LEVEL_SELECT:
        if (input.isJustPressed('1')) callbacks.onSelectLevel('village');
        else if (input.isJustPressed('2')) callbacks.onSelectLevel('forest');
        else if (input.isJustPressed('3')) callbacks.onSelectLevel('castle');
        else if (input.isJustPressed('4')) callbacks.onSelectLevel('crypt');
        else if (input.isJustPressed('5')) callbacks.onSelectLevel('tower');
        else if (input.isJustPressed('escape') || input.isJustPressed('backspace')) callbacks.onMainMenu();
        break;

      case GameMode.GAME_OVER:
        if (
          input.isJustPressed('space') ||
          input.isJustPressed('enter') ||
          input.isJustPressed('r') ||
          input.isJustPressed('1')
        ) {
          callbacks.onRespawn();
        } else if (input.isJustPressed('2')) {
          callbacks.onRestart();
        } else if (input.isJustPressed('3') || input.isJustPressed('escape')) {
          callbacks.onMainMenu();
        }
        break;

      case GameMode.VICTORY:
        if (input.isJustPressed('space') || input.isJustPressed('enter') || input.isJustPressed('1')) {
          callbacks.onRestart();
        } else if (input.isJustPressed('2') || input.isJustPressed('escape')) {
          callbacks.onMainMenu();
        }
        break;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    mode: GameMode,
    input: Input,
    callbacks: MenuCallbacks
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
    callbacks: MenuCallbacks
  ): void {
    // Backdrop dark fantasy gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 720);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#18181b');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Floating astral particles in background
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    for (let i = 0; i < 28; i++) {
      const px = (i * 97 + this.animTimer * 18) % 1280;
      const py = 120 + ((i * 53 + Math.sin(this.animTimer + i) * 30) % 520);
      ctx.beginPath();
      ctx.arc(px, py, (i % 3) + 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ruined Castle Silhouette in background
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(340, 520);
    ctx.lineTo(340, 280);
    ctx.lineTo(460, 240);
    ctx.lineTo(580, 280);
    ctx.lineTo(580, 520);
    ctx.lineTo(700, 200);
    ctx.lineTo(840, 200);
    ctx.lineTo(840, 520);
    ctx.lineTo(980, 280);
    ctx.lineTo(980, 520);
    ctx.closePath();
    ctx.fill();

    // Title text
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 24;
    ctx.font = 'bold 44px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('ECHOES OF THE FORGOTTEN KINGDOM', 640, 175);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 16px "Crimson Pro", Georgia, serif';
    ctx.fillText('A 2D Action-Adventure of Frozen Time, Echo Puzzles & Tactical Combat', 640, 218);

    // Render Buttons
    const buttons = this.getButtonsForMode(GameMode.MENU, callbacks);
    this.renderButtons(ctx, buttons, input);

    // Footer prompt
    ctx.fillStyle = '#64748b';
    ctx.font = '13px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLICK ANY BUTTON OR PRESS [SPACE / ENTER] TO BEGIN', 640, 580);
    ctx.font = 'italic 12px "Crimson Pro", Georgia, serif';
    ctx.fillStyle = '#52525b';
    ctx.fillText('Created with HTML5 Canvas & TypeScript · No External Assets Required', 640, 608);
  }

  private renderPauseMenu(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: MenuCallbacks
  ): void {
    // Dark overlay
    ctx.fillStyle = 'rgba(10, 8, 14, 0.82)';
    ctx.fillRect(0, 0, 1280, 720);

    // Ornate Panel Box
    ctx.fillStyle = 'rgba(24, 24, 27, 0.96)';
    ctx.fillRect(440, 120, 400, 480);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.strokeRect(440, 120, 400, 480);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 30px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 640, 180);

    const buttons = this.getButtonsForMode(GameMode.PAUSED, callbacks);
    this.renderButtons(ctx, buttons, input);
  }

  private renderControlsModal(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: MenuCallbacks
  ): void {
    ctx.fillStyle = 'rgba(10, 8, 14, 0.90)';
    ctx.fillRect(0, 0, 1280, 720);

    // Box
    ctx.fillStyle = 'rgba(24, 24, 27, 0.98)';
    ctx.fillRect(320, 70, 640, 580);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(320, 70, 640, 580);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('KNIGHT’S CONTROLS & ECHO MECHANICS', 640, 120);

    const binds = [
      ['A / D or ← / →', 'Move Kael horizontally'],
      ['W / Space / ↑', 'Jump / Vault over ledges'],
      ['J (Tap)', 'Light Sword Swing (20 damage)'],
      ['J (Hold & Release)', 'Heavy Sword Cleave (42 dmg, heavy knockback)'],
      ['K (Hold)', 'Shield Block (absorbs 70% damage)'],
      ['SHIFT', 'Dash (invulnerability phase shift)'],
      ['Q', 'Create Echo (Manifests past recorded clone!)'],
      ['R', 'Recall & dissipate active Echoes'],
      ['E', 'Interact with Checkpoints, Statues & Relics'],
      ['ESC / P', 'Pause / Unpause Game'],
    ];

    let rowY = 165;
    ctx.font = '14px Cinzel, serif';
    for (const [key, desc] of binds) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fde047';
      ctx.fillText(key, 550, rowY);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(desc, 570, rowY);
      rowY += 34;
    }

    // Close button
    const buttons = this.getButtonsForMode(GameMode.CONTROLS, callbacks);
    this.renderButtons(ctx, buttons, input);
  }

  private renderLevelSelectModal(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: MenuCallbacks
  ): void {
    ctx.fillStyle = 'rgba(10, 8, 14, 0.90)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = 'rgba(24, 24, 27, 0.98)';
    ctx.fillRect(340, 80, 600, 560);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.strokeRect(340, 80, 600, 560);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRAVEL ACROSS THE REALM', 640, 140);

    const buttons = this.getButtonsForMode(GameMode.LEVEL_SELECT, callbacks);
    this.renderButtons(ctx, buttons, input);
  }

  private renderGameOver(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: MenuCallbacks
  ): void {
    ctx.fillStyle = 'rgba(20, 5, 8, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 24;
    ctx.font = 'bold 44px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('YOU HAVE FALLEN TO TIME', 640, 230);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 16px "Crimson Pro", Georgia, serif';
    ctx.fillText('The temporal curse claims another soul... yet an echo still whispers.', 640, 280);

    const buttons = this.getButtonsForMode(GameMode.GAME_OVER, callbacks);
    this.renderButtons(ctx, buttons, input);
  }

  private renderVictory(
    ctx: CanvasRenderingContext2D,
    input: Input,
    callbacks: MenuCallbacks
  ): void {
    ctx.fillStyle = 'rgba(10, 14, 30, 0.92)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 26;
    ctx.font = 'bold 42px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE HEART OF ETERNITY RESTORED', 640, 210);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'italic 18px "Crimson Pro", Georgia, serif';
    ctx.fillText('The Timeless King rests at last. The kingdom breathes in the light of dawn.', 640, 265);

    const buttons = this.getButtonsForMode(GameMode.VICTORY, callbacks);
    this.renderButtons(ctx, buttons, input);
  }

  private renderButtons(ctx: CanvasRenderingContext2D, buttons: MenuButton[], input: Input): void {
    let anyHovered = false;

    for (const btn of buttons) {
      const isHovered = Collision.pointInRect(input.mouseX, input.mouseY, btn);
      if (isHovered) anyHovered = true;

      // Click fallback check
      if (isHovered && input.mouseClicked) {
        input.consumeClick();
        btn.action();
      }

      ctx.save();
      // Button Background Gradient
      const grad = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.height);
      if (isHovered) {
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
      } else {
        grad.addColorStop(0, 'rgba(24, 24, 27, 0.95)');
        grad.addColorStop(1, 'rgba(15, 15, 18, 0.95)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      // Border with gold or sky blue accent
      ctx.strokeStyle = isHovered ? '#38bdf8' : '#64748b';
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

      // Glow on hover
      if (isHovered) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
      }

      // Main Text
      ctx.fillStyle = isHovered ? '#38bdf8' : '#f8fafc';
      ctx.font = 'bold 14px Cinzel, serif';
      ctx.textAlign = 'center';

      if (btn.sublabel) {
        ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2 - 2);
        // Sublabel (keyboard shortcut hint)
        ctx.font = '10px Cinzel, serif';
        ctx.fillStyle = isHovered ? '#93c5fd' : '#94a3b8';
        ctx.fillText(btn.sublabel, btn.x + btn.width / 2, btn.y + btn.height / 2 + 13);
      } else {
        ctx.fillText(btn.label, btn.x + btn.width / 2, btn.y + btn.height / 2 + 5);
      }

      ctx.restore();
    }

    // Set cursor on canvas
    const canvas = ctx.canvas;
    if (canvas) {
      canvas.style.cursor = anyHovered ? 'pointer' : 'default';
    }
  }
}
