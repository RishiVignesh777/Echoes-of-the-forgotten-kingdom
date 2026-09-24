/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode, PlayerState, HitBox, Rect } from './GameState.ts';
import { Camera } from './Camera.ts';
import { Input } from './Input.ts';
import { Player } from '../entities/Player.ts';
import { Enemy } from '../entities/Enemy.ts';
import { CorruptedKnight } from '../entities/Knight.ts';
import { ShadowWolf } from '../entities/ShadowWolf.ts';
import { FungalBrute } from '../entities/FungalBrute.ts';
import { ArcaneWraith } from '../entities/ArcaneWraith.ts';
import { TimelessKing } from '../entities/Boss.ts';
import { Projectile } from '../entities/Projectile.ts';
import { TileMap } from '../world/TileMap.ts';
import { Platform } from '../world/Platform.ts';
import { Door } from '../world/Door.ts';
import { PressurePlate } from '../world/PressurePlate.ts';
import { Switch } from '../world/Switch.ts';
import { Checkpoint } from '../world/Checkpoint.ts';
import { Item } from '../data/items.ts';
import { LEVELS, LevelData } from '../data/levels.ts';
import { Renderer } from '../rendering/Renderer.ts';
import { ParticleSystem } from '../rendering/ParticleSystem.ts';
import { Lighting } from '../rendering/Lighting.ts';
import { CombatSystem } from '../systems/CombatSystem.ts';
import { EchoSystem } from '../systems/EchoSystem.ts';
import { PhysicsSystem } from '../systems/PhysicsSystem.ts';
import { AudioSystem } from '../systems/AudioSystem.ts';
import { HUD } from '../ui/HUD.ts';
import { Menu } from '../ui/Menu.ts';
import { Collision } from './Collision.ts';

export class Game {
  public canvas: HTMLCanvasElement;
  public mode: GameMode = GameMode.MENU;

  // Systems
  public input: Input;
  public camera: Camera;
  public renderer: Renderer;
  public particleSystem: ParticleSystem;
  public lighting: Lighting;
  public combatSystem: CombatSystem;
  public echoSystem: EchoSystem;
  public physicsSystem: PhysicsSystem;
  public audioSystem: AudioSystem;
  public hud: HUD;
  public menu: Menu;

  // World & Entities
  public currentLevel!: LevelData;
  public tileMap: TileMap;
  public player!: Player;
  public platforms: Platform[] = [];
  public doors: Door[] = [];
  public pressurePlates: PressurePlate[] = [];
  public switches: Switch[] = [];
  public checkpoints: Checkpoint[] = [];
  public items: Item[] = [];
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public activeBoss: TimelessKing | null = null;

  private isRunning: boolean = false;
  private weatherTimer: number = 0;
  private previousMenuMode: GameMode = GameMode.MENU;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.input = new Input();
    this.camera = new Camera(1280, 720);
    this.renderer = new Renderer(canvas);
    this.particleSystem = new ParticleSystem();
    this.lighting = new Lighting(1280, 720);
    this.combatSystem = new CombatSystem();
    this.echoSystem = new EchoSystem();
    this.physicsSystem = new PhysicsSystem();
    this.audioSystem = new AudioSystem();
    this.hud = new HUD();
    this.menu = new Menu();
    this.tileMap = new TileMap();

    // Initial level
    this.loadLevel('village');
  }

  public loadLevel(levelId: string): void {
    const data = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    this.currentLevel = data;

    // Camera bounds
    this.camera.setBounds(data.width, data.height);

    // Audio theme
    this.audioSystem.setAreaTheme(data.id);

    // World tilemap
    this.tileMap.loadLevel(data.id, data.width, data.height);

    // Platforms
    this.platforms = data.platforms.map(
      (p) => new Platform(p.x, p.y, p.width, p.height, p.isOneWay, p.movingConfig)
    );

    // Doors
    this.doors = data.doors.map((d) => new Door(d.id, d.x, d.y, d.width, d.height));

    // Pressure Plates
    this.pressurePlates = data.pressurePlates.map(
      (p) => new PressurePlate(p.id, p.targetId, p.x, p.y)
    );

    // Switches
    this.switches = data.switches.map((s) => new Switch(s.id, s.targetId, s.x, s.y));

    // Checkpoints
    this.checkpoints = data.checkpoints.map((c) => new Checkpoint(c.id, c.x, c.y));

    // Items
    this.items = data.items.map((i) => new Item(i.id, i.type, i.x, i.y));

    // Player
    if (!this.player) {
      this.player = new Player(data.spawnX, data.spawnY);
    } else {
      this.player.x = data.spawnX;
      this.player.y = data.spawnY;
      this.player.spawnX = data.spawnX;
      this.player.spawnY = data.spawnY;
      this.player.velocityX = 0;
      this.player.velocityY = 0;
      this.player.state = PlayerState.IDLE;
    }

    // Enemies
    this.activeBoss = null;
    this.enemies = data.enemies.map((e, idx) => {
      const eid = `${data.id}_enemy_${idx}`;
      switch (e.type) {
        case 'SHADOW_WOLF':
          return new ShadowWolf(eid, e.x, e.y, e.patrolDistance);
        case 'FUNGAL_BRUTE':
          return new FungalBrute(eid, e.x, e.y, e.patrolDistance);
        case 'ARCANE_WRAITH':
          return new ArcaneWraith(eid, e.x, e.y, e.patrolDistance);
        case 'TIMELESS_KING':
          const boss = new TimelessKing(eid, e.x, e.y);
          this.activeBoss = boss;
          return boss;
        default:
          return new CorruptedKnight(eid, e.x, e.y, e.patrolDistance);
      }
    });

    // Projectiles & Echoes
    this.projectiles = [];
    this.echoSystem.clear();
    this.particleSystem.clear();

    // Reset Camera
    this.camera.reset(this.player.x, this.player.y);

    // Ambient Lighting
    this.lighting.setAmbient(data.ambientColor);

    // Welcome Banner
    this.hud.showBanner(data.name, data.subtitle);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    let previousTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - previousTime) / 1000, 0.033);
      previousTime = currentTime;

      this.update(deltaTime);
      this.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  public update(deltaTime: number): void {
    this.input.update(deltaTime);
    this.menu.update(deltaTime);

    // Audio unlock on user action
    if (this.input.mouseClicked || this.input.attack || this.input.jump) {
      this.audioSystem.unlock();
    }

    // Toggle Pause
    if (this.input.pause) {
      if (this.mode === GameMode.PLAYING) {
        this.mode = GameMode.PAUSED;
      } else if (this.mode === GameMode.PAUSED) {
        this.mode = GameMode.PLAYING;
      }
    }

    if (this.mode !== GameMode.PLAYING) {
      return;
    }

    // Hit stop freeze frame
    if (this.camera.hitStopTimer > 0) {
      this.camera.update(deltaTime, this.player.x, this.player.y, this.player.facing);
      return;
    }

    // 1. Record Player Timeline for Echo System
    this.echoSystem.recordPlayer(this.player, deltaTime);

    // 2. Player Input & Actions
    if (this.input.createEcho) {
      const newEcho = this.echoSystem.createEcho(this.particleSystem, this.audioSystem);
      if (newEcho) {
        this.camera.flash('#38bdf8', 0.35);
        this.hud.notify('Echo Manifested!');
      }
    }

    if (this.input.recallEcho) {
      this.echoSystem.recallAll(this.particleSystem);
      this.hud.notify('Echoes Recalled');
    }

    const { swordHitbox: playerHitbox, soundEvents: pSounds } = this.player.update(deltaTime, this.input);
    for (const snd of pSounds) {
      if (snd === 'attack') this.audioSystem.playSwordSwing(false);
      else if (snd === 'heavy_attack') this.audioSystem.playSwordSwing(true);
      else if (snd === 'dash') this.audioSystem.playDash();
      else if (snd === 'jump') this.audioSystem.playJump();
    }

    // Death check
    if (this.player.health <= 0 && this.mode === GameMode.PLAYING) {
      this.mode = GameMode.GAME_OVER;
      return;
    }

    // 3. Echo System Update (Hitboxes from active echoes)
    const echoHitboxes = this.echoSystem.update(deltaTime, this.particleSystem, this.audioSystem);

    // 4. Puzzle Elements (Pressure Plates & Switches)
    // Gather all entities capable of pressing plates: Player + all Echoes!
    const plateActivators: Rect[] = [this.player, ...this.echoSystem.getEchoRects()];

    for (const plate of this.pressurePlates) {
      const stateChanged = plate.update(plateActivators);
      if (stateChanged) {
        this.audioSystem.playPlateClick();
        this.particleSystem.emit('spark', plate.x + plate.width / 2, plate.y, 6);
      }

      // Link plate to doors or platforms
      for (const door of this.doors) {
        if (door.id === plate.targetId) {
          const changed = door.setOpen(plate.isPressed);
          if (changed) this.audioSystem.playDoorMove();
        }
      }
    }

    // Link crystal switches to doors
    for (const sw of this.switches) {
      sw.update(deltaTime);
      if (sw.isActivated) {
        for (const door of this.doors) {
          if (door.id === sw.targetId) {
            door.setOpen(true);
          }
        }
      }
    }

    // Update Doors
    for (const door of this.doors) {
      door.update(deltaTime);
    }

    // 5. Checkpoints & Statues
    for (const cp of this.checkpoints) {
      cp.update(deltaTime);
      if (cp.isNear(this.player) && this.input.interact) {
        const justActivated = cp.activate();
        if (justActivated) {
          this.player.setCheckpoint(cp.x, cp.y);
          this.audioSystem.playCheckpoint();
          this.particleSystem.emit('echo', cp.x + cp.width / 2, cp.y + 30, 24);
          this.camera.flash('#38bdf8', 0.4);
          this.hud.notify('Checkpoint Attuned & Health Restored');
        }
      }
    }

    // 6. Collectible Items
    for (const item of this.items) {
      item.update(deltaTime);
      if (item.checkCollect(this.player)) {
        this.audioSystem.playItemPickup();
        this.particleSystem.emit('magic', item.x + item.width / 2, item.y + item.height / 2, 14);

        if (item.type === 'HEALTH_POTION') {
          this.player.heal(40);
          this.hud.notify('Elixir Imbibed (+40 HP)');
        } else if (item.type === 'ECHO_FRAGMENT') {
          this.echoSystem.upgradeCapacity();
          this.hud.notify(`Echo Fragment Found! (Max Echoes: ${this.echoSystem.maxEchoes})`);
        } else if (item.type === 'ANCIENT_COIN') {
          this.hud.notify('Ancient Kingdom Medallion Found');
        } else if (item.type === 'KNIGHT_RELIC') {
          this.hud.notify('Knight’s Oath Relic Claimed');
        }
      }
    }

    // 7. Enemy AI & Projectiles
    // Enemies target Player OR nearest active Echo (Echo distraction mechanic!)
    const enemyTargets: Rect[] = [this.player, ...this.echoSystem.getEchoRects()];
    const enemyHitboxes: HitBox[] = [];

    for (const enemy of this.enemies) {
      const { attackHitbox, newProjectile, soundEvents } = enemy.update(deltaTime, enemyTargets);

      if (attackHitbox) enemyHitboxes.push(attackHitbox);
      if (newProjectile) {
        this.projectiles.push(newProjectile);
        this.audioSystem.playProjectile();
      }

      // Boss special minion / dark echo spawns
      if (enemy instanceof TimelessKing) {
        if (enemy.wantsToSpawnMinion) {
          enemy.wantsToSpawnMinion = false;
          const minion = new CorruptedKnight(
            `boss_minion_${Math.random()}`,
            enemy.x + (enemy.facing > 0 ? 90 : -90),
            enemy.y,
            120
          );
          this.enemies.push(minion);
          this.particleSystem.emit('soul', minion.x, minion.y, 20);
          this.hud.notify('The King summons a Corrupted Knight!');
        }
        if (enemy.wantsToSpawnDarkEcho) {
          enemy.wantsToSpawnDarkEcho = false;
          // Spawn shadow wolf or wraith
          const wraith = new ArcaneWraith(
            `boss_wraith_${Math.random()}`,
            enemy.x + (enemy.facing > 0 ? -120 : 120),
            enemy.y - 40,
            100
          );
          this.enemies.push(wraith);
          this.hud.notify('A temporal shadow joins the fray!');
        }
      }
    }

    // Check Victory (Boss defeat)
    if (this.activeBoss && this.activeBoss.isDead) {
      this.mode = GameMode.VICTORY;
      return;
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(deltaTime);
      if (!proj.active) {
        this.projectiles.splice(i, 1);
      }
    }

    // 8. Combat Resolution
    this.combatSystem.update(
      this.player,
      this.echoSystem.echoes,
      this.enemies,
      this.projectiles,
      this.switches,
      playerHitbox,
      echoHitboxes,
      enemyHitboxes,
      this.camera,
      this.particleSystem,
      this.audioSystem
    );

    // 9. Physics System
    this.physicsSystem.update(
      deltaTime,
      this.player,
      this.enemies,
      this.platforms,
      this.doors,
      this.tileMap,
      this.currentLevel.width
    );

    // 10. Ambient Weather & Particles
    this.weatherTimer += deltaTime;
    if (this.weatherTimer > 0.06) {
      this.weatherTimer = 0;
      const spawnX = this.camera.x + Math.random() * 1320;
      const spawnY = this.camera.y - 20;

      if (this.currentLevel.weatherEffect === 'leaves') {
        this.particleSystem.emit('leaf', spawnX, spawnY, 1);
      } else if (this.currentLevel.weatherEffect === 'rain') {
        this.particleSystem.emit('rain', spawnX, spawnY, 3);
      } else if (this.currentLevel.weatherEffect === 'astral') {
        this.particleSystem.emit('astral', spawnX, spawnY + Math.random() * 600, 1);
      } else if (this.currentLevel.weatherEffect === 'dust') {
        this.particleSystem.emit('dust', spawnX, this.camera.y + Math.random() * 600, 1);
      }
    }
    this.particleSystem.update(deltaTime);

    // 11. Dynamic Lighting Assembly
    this.lighting.clear();
    // Torches in level
    for (const torch of this.currentLevel.torches) {
      this.lighting.addLight(torch);
    }
    // Player Lantern
    this.lighting.addLight({
      x: this.player.x + this.player.width / 2,
      y: this.player.y + 30,
      radius: 190,
      intensity: 0.9,
      color: 'rgba(251, 146, 60, 0.22)',
      flicker: true,
    });
    // Active Echo lights
    for (const echo of this.echoSystem.echoes) {
      this.lighting.addLight({
        x: echo.x + echo.width / 2,
        y: echo.y + 30,
        radius: 170,
        intensity: 0.85,
        color: 'rgba(56, 189, 248, 0.35)',
        flicker: false,
      });
    }

    // 12. Camera & HUD update
    this.camera.update(deltaTime, this.player.x, this.player.y, this.player.facing);
    this.hud.update(deltaTime);

    // 13. Area Exit Trigger Check (Smooth level transition)
    const exit = this.currentLevel.exitTrigger;
    if (Collision.aabb(this.player, exit) && this.currentLevel.nextLevelId) {
      this.loadLevel(this.currentLevel.nextLevelId);
      this.camera.flash('#ffffff', 0.5, 2.0);
    }
  }

  public render(): void {
    this.renderer.clear();

    if (this.mode === GameMode.PLAYING || this.mode === GameMode.PAUSED) {
      // 1. Layered Parallax Background
      this.renderer.renderBackground(this.camera, this.currentLevel.skyGradient, this.currentLevel.id);

      // 2. World Elements
      const nearCheckpoint = this.checkpoints.some((c) => c.isNear(this.player));
      this.renderer.renderWorld(
        this.tileMap,
        this.platforms,
        this.doors,
        this.pressurePlates,
        this.switches,
        this.checkpoints,
        this.items,
        this.camera,
        nearCheckpoint
      );

      // 3. Characters & Entities
      this.renderer.renderEntities(
        this.player,
        this.echoSystem,
        this.enemies,
        this.projectiles,
        this.camera
      );

      // 4. Particles
      this.renderer.renderParticles(this.particleSystem, this.camera);

      // 5. Dynamic Lighting & Shadows
      this.renderer.renderLighting(this.lighting, this.camera);

      // 6. Camera Flashes
      this.renderer.renderScreenEffects(this.camera);

      // 7. HUD
      this.renderer.renderHUD(
        this.hud,
        this.player,
        this.echoSystem,
        this.activeBoss,
        this.currentLevel.name,
        this.currentLevel.areaNumber
      );
    }

    // 8. Menus & Modals
    if (this.mode !== GameMode.PLAYING) {
      this.renderer.renderMenu(this.menu, this.mode, this.input, {
        onStart: () => {
          this.mode = GameMode.PLAYING;
          this.audioSystem.unlock();
        },
        onResume: () => {
          this.mode = GameMode.PLAYING;
        },
        onRestart: () => {
          this.loadLevel(this.currentLevel.id);
          this.mode = GameMode.PLAYING;
        },
        onRespawn: () => {
          this.player.respawn();
          this.mode = GameMode.PLAYING;
        },
        onSelectLevel: (levelId: string) => {
          if (this.mode === GameMode.LEVEL_SELECT) {
            this.loadLevel(levelId);
            this.mode = GameMode.PLAYING;
          } else {
            this.mode = GameMode.LEVEL_SELECT;
          }
        },
        onToggleControls: () => {
          if (this.mode === GameMode.CONTROLS) {
            this.mode = this.previousMenuMode;
          } else {
            this.previousMenuMode = this.mode;
            this.mode = GameMode.CONTROLS;
          }
        },
        onToggleSound: () => this.audioSystem.toggleSound(),
        onToggleMusic: () => this.audioSystem.toggleMusic(),
        onMainMenu: () => {
          this.loadLevel('village');
          this.mode = GameMode.MENU;
        },
        isSoundEnabled: () => this.audioSystem.soundEnabled,
        isMusicEnabled: () => this.audioSystem.musicEnabled,
      });
    }
  }

  public destroy(): void {
    this.input.destroy();
    this.audioSystem.destroy();
  }
}
