/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GameScreen,
  Facing,
  PlayerStats,
  FarmPlot,
  Enemy,
  Projectile,
  Particle,
  DungeonFloor,
  ActiveBuff,
  InventoryItem,
  SeedType,
  WeatherType
} from './types';
import { CROPS, TILE_SIZE, WEATHER_CONDITIONS } from './constants';
import { sound } from './audio';
import { DungeonGenerator } from './procedural';
import { PixelRenderer } from './sprites';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;

  // Game Mode & State
  public screen: GameScreen = 'TITLE';
  public onStateChange?: (engine: GameEngine) => void;
  public onOpenModal?: (modalType: 'cauldron' | 'forge' | 'victory' | 'game_over') => void;

  // Player State
  public player = {
    x: 320,
    y: 280,
    vx: 0,
    vy: 0,
    facing: 'down' as Facing,
    isMoving: false,
    walkFrame: 0,
    isRolling: false,
    rollTimer: 0,
    rollDuration: 0.28,
    rollCooldown: 0,
    attackTimer: 0, // Melee attack swing
    attackCooldown: 0,
    aimingBow: false,
    aimAngle: 0,
    flashTimer: 0,
    radius: 9
  };

  public stats: PlayerStats = {
    maxHp: 100,
    hp: 100,
    stamina: 100,
    maxStamina: 100,
    gold: 50,
    waterLevel: 20,
    maxWaterLevel: 20,
    swordTier: 1,
    bowTier: 1,
    highestFloorCleared: 0,
    currentFloor: 1,
    monstersSlain: 0,
    cropsHarvested: 0
  };

  public activeBuffs: ActiveBuff[] = [];

  // Inventory & Hotbar
  public inventory: InventoryItem[] = [
    { id: 'tool_hoe', type: 'hoe', name: 'Forged Hoe', count: 1, icon: '⛏️' },
    { id: 'tool_can', type: 'watering_can', name: 'Water Can', count: 1, icon: '💧' },
    { id: 'tool_sword', type: 'sword', name: 'Iron Sword', count: 1, icon: '⚔️' },
    { id: 'tool_bow', type: 'bow', name: 'Huntsman Bow', count: 1, icon: '🏹' },
    { id: 'seed_sun', type: 'seed', name: 'Sun Seeds', count: 8, seedType: 'sun_turnip', icon: '🌱' }
  ];
  public selectedHotbarIndex: number = 2; // Default to sword

  // Worlds
  public farmPlots: FarmPlot[] = [];
  public currentFloorData: DungeonFloor | null = null;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];

  // Dynamic Weather Simulation (Farm)
  public currentWeather: WeatherType = 'sunny';
  public weatherTimer: number = 50;
  public weatherDuration: number = 50;
  public lightningFlashTimer: number = 0;
  private autoWaterCooldown: number = 0;
  private thunderCooldown: number = 7.0;
  private rainDrops: { x: number; y: number; speed: number; length: number; alpha: number }[] = [];
  private ambientMotes: { x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[] = [];

  // Interactive Hub Locations (Farm)
  public farmWell = { x: 4 * TILE_SIZE, y: 3 * TILE_SIZE };
  public farmWeatherTotem = { x: 7 * TILE_SIZE, y: 3 * TILE_SIZE };
  public farmCauldron = { x: 13 * TILE_SIZE, y: 3 * TILE_SIZE };
  public farmForge = { x: 15 * TILE_SIZE, y: 3 * TILE_SIZE };
  public farmDungeonHatch = { x: 9 * TILE_SIZE, y: 13 * TILE_SIZE };

  // Camera & Shake
  public camera = { x: 0, y: 0 };
  private screenShake = 0;
  private hitstopTimer = 0;

  // Input State
  private keys: Record<string, boolean> = {};
  private mouse = { x: 0, y: 0, isDown: false, rightDown: false };
  private touchVector = { x: 0, y: 0 };
  public interactionPrompt: string | null = null;

  // Loop Control
  private isRunning: boolean = false;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Lighting offscreen buffer
    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d')!;

    this.farmPlots = DungeonGenerator.generateInitialFarmPlots();
    this.setupInputs();
    this.setupWeatherParticles();
    this.resizeCanvases();
  }

  private setupWeatherParticles() {
    for (let i = 0; i < 55; i++) {
      this.rainDrops.push({
        x: Math.random() * 1400,
        y: Math.random() * 900,
        speed: 420 + Math.random() * 160,
        length: 12 + Math.random() * 8,
        alpha: 0.4 + Math.random() * 0.4
      });
    }
    for (let i = 0; i < 35; i++) {
      this.ambientMotes.push({
        x: Math.random() * 1400,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 20,
        vy: -15 - Math.random() * 25,
        color: '#FDE68A',
        size: 2 + Math.random() * 2,
        alpha: 0.35 + Math.random() * 0.45
      });
    }
  }

  public cycleWeather(forced?: WeatherType) {
    const list: WeatherType[] = ['sunny', 'rain', 'thunderstorm', 'heatwave', 'fertility_mist'];
    if (forced) {
      this.currentWeather = forced;
    } else {
      const curIdx = list.indexOf(this.currentWeather);
      this.currentWeather = list[(curIdx + 1) % list.length];
    }
    this.weatherTimer = 50;
    this.weatherDuration = 50;
    sound.playWeatherChange();

    const cond = WEATHER_CONDITIONS[this.currentWeather];
    this.addFloatingText(
      this.farmWeatherTotem.x + 16,
      this.farmWeatherTotem.y - 12,
      `${cond.icon} ${cond.name} (${cond.growthMultiplier}x Growth)`,
      cond.ambientColor
    );
    this.notifyState();
  }

  public resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.floor(rect.width || window.innerWidth);
    const h = Math.floor(rect.height || window.innerHeight);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.lightCanvas.width = w;
      this.lightCanvas.height = h;
    }
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;

      // Hotbar quick keys 1-5
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < this.inventory.length) {
          this.selectedHotbarIndex = idx;
          this.notifyState();
        }
      }

      // Interaction key 'e'
      if (e.key.toLowerCase() === 'e') {
        this.handleInteract();
      }

      // Pause toggle
      if (e.key === 'Escape') {
        if (this.screen === 'FARM' || this.screen === 'DUNGEON') {
          this.screen = 'PAUSE';
          this.notifyState();
        } else if (this.screen === 'PAUSE') {
          this.screen = this.currentFloorData ? 'DUNGEON' : 'FARM';
          this.notifyState();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.mouse.isDown = false;
      this.mouse.rightDown = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;

      // Update aim angle
      const worldPlayerX = this.player.x - this.camera.x;
      const worldPlayerY = this.player.y - this.camera.y;
      this.player.aimAngle = Math.atan2(this.mouse.y - worldPlayerY, this.mouse.x - worldPlayerX);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      sound.unlock();
      if (e.button === 0) {
        this.mouse.isDown = true;
        this.handlePrimaryAction();
      } else if (e.button === 2) {
        e.preventDefault();
        this.mouse.rightDown = true;
        this.triggerDodgeRoll();
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.isDown = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public setTouchInput(vec: { x: number; y: number }) {
    this.touchVector = vec;
  }

  public triggerTouchAction(type: 'action' | 'roll' | 'interact') {
    sound.unlock();
    if (type === 'action') this.handlePrimaryAction();
    if (type === 'roll') this.triggerDodgeRoll();
    if (type === 'interact') this.handleInteract();
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  public stop() {
    this.isRunning = false;
  }

  public startGame() {
    sound.unlock();
    this.screen = 'FARM';
    sound.startAmbientMusic('farm');
    this.player.x = 8 * TILE_SIZE;
    this.player.y = 8 * TILE_SIZE;
    this.stats.hp = this.stats.maxHp;
    this.stats.stamina = this.stats.maxStamina;
    this.notifyState();
  }

  public enterDungeon(floorNumber: number = 1) {
    this.screen = 'DUNGEON';
    this.stats.currentFloor = floorNumber;
    sound.startAmbientMusic('dungeon');
    sound.playStairs();

    const { floor, enemies } = DungeonGenerator.generateFloor(floorNumber);
    this.currentFloorData = floor;
    this.enemies = enemies;
    this.projectiles = [];

    this.player.x = floor.spawnX;
    this.player.y = floor.spawnY;
    this.player.vx = 0;
    this.player.vy = 0;

    this.addFloatingText(this.player.x, this.player.y - 20, `Floor ${floorNumber}`, '#F59E0B');
    this.notifyState();
  }

  public returnToFarm() {
    this.screen = 'FARM';
    sound.startAmbientMusic('farm');
    sound.playStairs();
    this.currentFloorData = null;
    this.enemies = [];
    this.projectiles = [];

    this.player.x = this.farmDungeonHatch.x + TILE_SIZE / 2;
    this.player.y = this.farmDungeonHatch.y + TILE_SIZE + 10;
    this.player.facing = 'down';

    // Passive rest heal
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 25);
    this.addFloatingText(this.player.x, this.player.y - 20, 'Sanctuary Rest +25 HP', '#10B981');
    this.notifyState();
  }

  private loop(timestamp: number) {
    if (!this.isRunning) return;

    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling on lag

    if (this.screen === 'FARM' || this.screen === 'DUNGEON') {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.update(dt);
      }
    }

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number) {
    this.updatePlayer(dt);
    this.updateBuffs(dt);
    this.updateProjectiles(dt);
    this.updateParticles(dt);

    if (this.screen === 'FARM') {
      this.updateFarm(dt);
    } else if (this.screen === 'DUNGEON') {
      this.updateDungeon(dt);
    }

    this.updateCamera(dt);
  }

  private updatePlayer(dt: number) {
    // Cooldowns
    if (this.player.attackCooldown > 0) this.player.attackCooldown -= dt;
    if (this.player.attackTimer > 0) this.player.attackTimer -= dt * 4;
    if (this.player.flashTimer > 0) this.player.flashTimer -= dt;
    if (this.player.rollCooldown > 0) this.player.rollCooldown -= dt;

    // Movement calculation
    let moveX = 0;
    let moveY = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    // Touch vector support
    if (Math.abs(this.touchVector.x) > 0.1 || Math.abs(this.touchVector.y) > 0.1) {
      moveX = this.touchVector.x;
      moveY = this.touchVector.y;
    }

    // Space / Shift shortcuts
    if (this.keys['shift'] || this.keys['space']) {
      if (this.keys['shift']) this.triggerDodgeRoll();
      else if (this.keys['space']) this.handlePrimaryAction();
    }

    // Rolling state
    if (this.player.isRolling) {
      this.player.rollTimer += dt;
      if (this.player.rollTimer >= this.player.rollDuration) {
        this.player.isRolling = false;
        this.player.rollTimer = 0;
        this.player.rollCooldown = 0.2;
      }
    } else {
      // Normal walk speed
      let baseSpeed = 100;
      // Speed buff multiplier
      const speedBuff = this.activeBuffs.find((b) => b.type === 'speed');
      if (speedBuff) baseSpeed *= speedBuff.multiplier;

      if (moveX !== 0 && moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        moveX /= len;
        moveY /= len;
      }

      this.player.vx = moveX * baseSpeed;
      this.player.vy = moveY * baseSpeed;

      if (moveX !== 0 || moveY !== 0) {
        this.player.isMoving = true;
        this.player.walkFrame += dt * 3.5;
        if (Math.abs(moveX) > Math.abs(moveY)) {
          this.player.facing = moveX > 0 ? 'right' : 'left';
        } else {
          this.player.facing = moveY > 0 ? 'down' : 'up';
        }
      } else {
        this.player.isMoving = false;
      }

      // Stamina regeneration
      if (this.stats.stamina < this.stats.maxStamina) {
        this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + dt * 20);
      }
    }

    // Move player with collision checks
    const targetX = this.player.x + this.player.vx * dt;
    const targetY = this.player.y + this.player.vy * dt;

    if (!this.checkWallCollision(targetX, this.player.y)) {
      this.player.x = targetX;
    }
    if (!this.checkWallCollision(this.player.x, targetY)) {
      this.player.y = targetY;
    }

    // Contextual interaction check
    this.checkInteractionPrompt();
  }

  private checkWallCollision(x: number, y: number): boolean {
    const r = this.player.radius;

    if (this.screen === 'FARM') {
      // Farm boundary walls (30x20 tiles)
      if (x - r < 32 || x + r > 29 * TILE_SIZE || y - r < 32 || y + r > 19 * TILE_SIZE) {
        return true;
      }
      return false;
    }

    if (this.screen === 'DUNGEON' && this.currentFloorData) {
      const tileX1 = Math.floor((x - r) / TILE_SIZE);
      const tileX2 = Math.floor((x + r) / TILE_SIZE);
      const tileY1 = Math.floor((y - r) / TILE_SIZE);
      const tileY2 = Math.floor((y + r) / TILE_SIZE);

      const { tiles, width, height } = this.currentFloorData;

      for (let ty = tileY1; ty <= tileY2; ty++) {
        for (let tx = tileX1; tx <= tileX2; tx++) {
          if (tx < 0 || tx >= width || ty < 0 || ty >= height) return true;
          // Tile 2 is solid wall
          if (tiles[ty][tx] === 2) return true;
        }
      }
    }

    return false;
  }

  private triggerDodgeRoll() {
    if (this.player.isRolling || this.player.rollCooldown > 0) return;
    if (this.stats.stamina < 18) return;

    this.stats.stamina -= 18;
    this.player.isRolling = true;
    this.player.rollTimer = 0;

    // Roll boost in moving or facing direction
    let rollSpeed = 220;
    const speedBuff = this.activeBuffs.find((b) => b.type === 'speed');
    if (speedBuff) rollSpeed *= 1.25;

    let dirX = 0;
    let dirY = 0;
    if (this.player.isMoving) {
      const len = Math.hypot(this.player.vx, this.player.vy) || 1;
      dirX = this.player.vx / len;
      dirY = this.player.vy / len;
    } else {
      if (this.player.facing === 'left') dirX = -1;
      if (this.player.facing === 'right') dirX = 1;
      if (this.player.facing === 'up') dirY = -1;
      if (this.player.facing === 'down') dirY = 1;
    }

    this.player.vx = dirX * rollSpeed;
    this.player.vy = dirY * rollSpeed;

    sound.playDodgeRoll();

    // Roll dust particles
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: this.player.x,
        y: this.player.y + 6,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 20,
        size: 3,
        color: 'rgba(255, 255, 255, 0.4)',
        alpha: 0.6,
        decay: 2.0,
        shape: 'smoke'
      });
    }
  }

  private handlePrimaryAction() {
    const selectedItem = this.inventory[this.selectedHotbarIndex];
    if (!selectedItem) return;

    if (selectedItem.type === 'sword') {
      this.performSwordSlash();
    } else if (selectedItem.type === 'bow') {
      this.performBowShot();
    } else if (selectedItem.type === 'hoe') {
      this.performTillSoil();
    } else if (selectedItem.type === 'watering_can') {
      this.performWaterSoil();
    } else if (selectedItem.type === 'seed' && selectedItem.seedType) {
      this.performPlantSeed(selectedItem.seedType);
    } else if (selectedItem.type === 'potion') {
      this.drinkPotion(selectedItem);
    }
  }

  private performSwordSlash() {
    if (this.player.attackCooldown > 0 || this.player.isRolling) return;

    this.player.attackCooldown = 0.32;
    this.player.attackTimer = 1.0;
    sound.playSwordSlash();

    // Calculate attack hitbox in front of player
    let baseDamage = 16 + (this.stats.swordTier - 1) * 8;
    const dmgBuff = this.activeBuffs.find((b) => b.type === 'damage');
    if (dmgBuff) baseDamage = Math.round(baseDamage * dmgBuff.multiplier);

    const hitRange = 28 + this.stats.swordTier * 3;
    let attackAngle = 0;
    if (this.player.facing === 'right') attackAngle = 0;
    if (this.player.facing === 'down') attackAngle = Math.PI / 2;
    if (this.player.facing === 'left') attackAngle = Math.PI;
    if (this.player.facing === 'up') attackAngle = -Math.PI / 2;

    const hitCenterX = this.player.x + Math.cos(attackAngle) * 18;
    const hitCenterY = this.player.y + Math.sin(attackAngle) * 18;

    // Check enemy hits
    let hitCount = 0;
    for (const enemy of this.enemies) {
      const dist = Math.hypot(enemy.x - hitCenterX, enemy.y - hitCenterY);
      if (dist < hitRange + enemy.radius) {
        hitCount++;
        enemy.hp -= baseDamage;
        enemy.flashTimer = 0.12;
        enemy.hitStun = 0.18;

        // Knockback
        const kbAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        enemy.vx = Math.cos(kbAngle) * 160;
        enemy.vy = Math.sin(kbAngle) * 160;

        sound.playEnemyHit();
        this.addFloatingText(enemy.x, enemy.y - 12, `${baseDamage}`, '#F87171');
        this.spawnBloodSparks(enemy.x, enemy.y, '#EF4444');

        if (enemy.hp <= 0) {
          this.handleEnemyDefeated(enemy);
        }
      }
    }

    // Check breakable pots
    if (this.currentFloorData) {
      for (const pot of this.currentFloorData.pots) {
        if (!pot.broken && Math.hypot(pot.x - hitCenterX, pot.y - hitCenterY) < 22) {
          pot.broken = true;
          this.breakPot(pot.x, pot.y);
        }
      }
    }

    if (hitCount > 0) {
      this.hitstopTimer = 0.05; // 50ms hitstop
      this.screenShake = 4.0;
    }
  }

  private performBowShot() {
    if (this.player.attackCooldown > 0 || this.player.isRolling) return;
    if (this.stats.stamina < 8) return;

    this.stats.stamina -= 8;
    this.player.attackCooldown = 0.38;
    sound.playBowShot();

    let baseDamage = 14 + (this.stats.bowTier - 1) * 7;
    const dmgBuff = this.activeBuffs.find((b) => b.type === 'damage');
    if (dmgBuff) baseDamage = Math.round(baseDamage * dmgBuff.multiplier);

    // Aim toward mouse angle
    const angle = this.player.aimAngle;
    const arrowSpeed = 260 + this.stats.bowTier * 30;

    this.projectiles.push({
      id: `arrow_${Date.now()}_${Math.random()}`,
      x: this.player.x,
      y: this.player.y,
      vx: Math.cos(angle) * arrowSpeed,
      vy: Math.sin(angle) * arrowSpeed,
      speed: arrowSpeed,
      damage: baseDamage,
      radius: 4,
      isPlayer: true,
      color: '#FEF08A',
      distanceRemaining: 320
    });
  }

  private performTillSoil() {
    if (this.screen !== 'FARM') return;
    const targetTile = this.getTargetTile();
    sound.playCropTill();

    // Check if plot exists
    let plot = this.farmPlots.find((p) => p.gridX === targetTile.x && p.gridY === targetTile.y);
    if (!plot) {
      plot = {
        gridX: targetTile.x,
        gridY: targetTile.y,
        tilled: true,
        watered: false,
        growthStage: 0,
        growthProgress: 0
      };
      this.farmPlots.push(plot);
    } else {
      plot.tilled = true;
    }

    this.spawnSparks(targetTile.x * TILE_SIZE + 16, targetTile.y * TILE_SIZE + 16, '#78350F');
    this.notifyState();
  }

  private performWaterSoil() {
    if (this.screen !== 'FARM') return;
    if (this.stats.waterLevel <= 0) {
      this.addFloatingText(this.player.x, this.player.y - 18, 'Water Can Empty! Refill at Well', '#38BDF8');
      return;
    }

    const targetTile = this.getTargetTile();
    const plot = this.farmPlots.find((p) => p.gridX === targetTile.x && p.gridY === targetTile.y);
    if (plot && plot.tilled) {
      plot.watered = true;
      this.stats.waterLevel -= 1;
      sound.playCropWater();
      this.spawnSparks(targetTile.x * TILE_SIZE + 16, targetTile.y * TILE_SIZE + 16, '#60A5FA');
      this.notifyState();
    }
  }

  private performPlantSeed(seedType: SeedType) {
    if (this.screen !== 'FARM') return;
    const targetTile = this.getTargetTile();
    const plot = this.farmPlots.find((p) => p.gridX === targetTile.x && p.gridY === targetTile.y);

    if (plot && plot.tilled && !plot.seedType) {
      // Find seed item in inventory
      const seedItem = this.inventory.find((i) => i.type === 'seed' && i.seedType === seedType);
      if (seedItem && seedItem.count > 0) {
        seedItem.count -= 1;
        if (seedItem.count <= 0) {
          this.inventory = this.inventory.filter((i) => i !== seedItem);
          this.selectedHotbarIndex = 0;
        }

        plot.seedType = seedType;
        plot.growthStage = 0;
        plot.growthProgress = 0;

        sound.playCropTill();
        this.addFloatingText(targetTile.x * TILE_SIZE + 16, targetTile.y * TILE_SIZE, 'Planted!', '#22C55E');
        this.notifyState();
      }
    }
  }

  private drinkPotion(item: InventoryItem) {
    if (item.potionEffect && item.potionDuration) {
      sound.playPotionDrink();
      item.count -= 1;
      if (item.count <= 0) {
        this.inventory = this.inventory.filter((i) => i !== item);
        this.selectedHotbarIndex = 0;
      }

      this.addBuff({
        type: item.potionEffect,
        name: item.name,
        multiplier: item.potionEffect === 'damage' ? 1.6 : item.potionEffect === 'speed' ? 1.45 : 0.5,
        durationRemaining: item.potionDuration,
        totalDuration: item.potionDuration,
        color: '#F59E0B'
      });

      this.addFloatingText(this.player.x, this.player.y - 18, `+${item.name}`, '#FBBF24');
      this.notifyState();
    }
  }

  public addBuff(buff: ActiveBuff) {
    this.activeBuffs = this.activeBuffs.filter((b) => b.type !== buff.type);
    this.activeBuffs.push(buff);
  }

  private updateBuffs(dt: number) {
    for (const buff of this.activeBuffs) {
      buff.durationRemaining -= dt;
      if (buff.type === 'regen') {
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + dt * buff.multiplier);
      }
    }
    this.activeBuffs = this.activeBuffs.filter((b) => b.durationRemaining > 0);
  }

  private handleInteract() {
    if (this.screen === 'FARM') {
      const px = this.player.x;
      const py = this.player.y;

      // Well refill
      if (Math.hypot(px - (this.farmWell.x + 16), py - (this.farmWell.y + 16)) < 36) {
        this.stats.waterLevel = this.stats.maxWaterLevel;
        sound.playCropWater();
        this.addFloatingText(this.farmWell.x + 16, this.farmWell.y, 'Can Refilled! (20/20)', '#38BDF8');
        this.notifyState();
        return;
      }

      // Weather Totem communion
      if (Math.hypot(px - (this.farmWeatherTotem.x + 16), py - (this.farmWeatherTotem.y + 16)) < 36) {
        this.cycleWeather();
        return;
      }

      // Cauldron open
      if (Math.hypot(px - (this.farmCauldron.x + 16), py - (this.farmCauldron.y + 16)) < 36) {
        this.onOpenModal?.('cauldron');
        return;
      }

      // Forge open
      if (Math.hypot(px - (this.farmForge.x + 16), py - (this.farmForge.y + 16)) < 36) {
        this.onOpenModal?.('forge');
        return;
      }

      // Dungeon Hatch descend
      if (Math.hypot(px - (this.farmDungeonHatch.x + 16), py - (this.farmDungeonHatch.y + 16)) < 36) {
        this.enterDungeon(1);
        return;
      }

      // Harvest crop under or next to player
      const targetTile = this.getTargetTile();
      const plot = this.farmPlots.find((p) => p.gridX === targetTile.x && p.gridY === targetTile.y);
      if (plot && plot.seedType && plot.growthStage >= 3) {
        this.harvestCrop(plot);
        return;
      }
    } else if (this.screen === 'DUNGEON' && this.currentFloorData) {
      const px = this.player.x;
      const py = this.player.y;

      // Exit stairs
      if (Math.hypot(px - this.currentFloorData.exitX, py - this.currentFloorData.exitY) < 32) {
        if (this.stats.currentFloor >= 10) {
          // Final victory!
          sound.playVictory();
          this.screen = 'VICTORY';
          this.onOpenModal?.('victory');
          this.notifyState();
        } else {
          // Go to next floor
          this.stats.highestFloorCleared = Math.max(this.stats.highestFloorCleared, this.stats.currentFloor);
          this.enterDungeon(this.stats.currentFloor + 1);
        }
        return;
      }

      // Return to surface stairs (Room 0)
      if (Math.hypot(px - this.currentFloorData.spawnX, py - this.currentFloorData.spawnY) < 32) {
        this.returnToFarm();
        return;
      }

      // Chest opening
      for (const chest of this.currentFloorData.chests) {
        if (!chest.opened && Math.hypot(px - chest.x, py - chest.y) < 30) {
          chest.opened = true;
          sound.playCoin();
          if (chest.goldReward) {
            this.stats.gold += chest.goldReward;
            this.addFloatingText(chest.x, chest.y - 12, `+${chest.goldReward} Gold`, '#FBBF24');
          }
          if (chest.seedReward) {
            this.addSeedToInventory(chest.seedReward, 2);
            this.addFloatingText(chest.x, chest.y - 26, `+2 ${CROPS[chest.seedReward].name} Seeds`, '#34D399');
          }
          this.spawnSparks(chest.x, chest.y, '#F59E0B');
          this.notifyState();
          return;
        }
      }
    }
  }

  private harvestCrop(plot: FarmPlot) {
    if (!plot.seedType) return;
    const crop = CROPS[plot.seedType];
    sound.playCropHarvest();

    // Add harvest crop item to inventory
    const existingCrop = this.inventory.find((i) => i.type === 'crop' && i.seedType === plot.seedType);
    if (existingCrop) {
      existingCrop.count += 2;
    } else {
      this.inventory.push({
        id: `crop_${plot.seedType}`,
        type: 'crop',
        name: crop.name,
        count: 2,
        seedType: plot.seedType,
        icon: '🍎'
      });
    }

    // Chance for bonus seed
    this.addSeedToInventory(plot.seedType, 1);
    
    // Weather bonus seed drop chance (e.g. Fertility Mist or Tempest)
    const weatherCond = WEATHER_CONDITIONS[this.currentWeather];
    if (weatherCond.bonusSeedChance > 0 && Math.random() < weatherCond.bonusSeedChance) {
      this.addSeedToInventory(plot.seedType, 1);
      this.addFloatingText(plot.gridX * TILE_SIZE + 16, plot.gridY * TILE_SIZE - 14, `+1 Weather Seed!`, '#34D399');
    }
    
    this.stats.cropsHarvested += 1;

    this.addFloatingText(plot.gridX * TILE_SIZE + 16, plot.gridY * TILE_SIZE, `+2 ${crop.name}`, crop.color);
    this.spawnSparks(plot.gridX * TILE_SIZE + 16, plot.gridY * TILE_SIZE + 16, crop.glowColor);

    // Reset plot
    plot.seedType = undefined;
    plot.growthStage = 0;
    plot.growthProgress = 0;
    plot.watered = false;

    this.notifyState();
  }

  public addSeedToInventory(seedType: SeedType, count: number = 1) {
    const existingSeed = this.inventory.find((i) => i.type === 'seed' && i.seedType === seedType);
    if (existingSeed) {
      existingSeed.count += count;
    } else {
      this.inventory.push({
        id: `seed_${seedType}`,
        type: 'seed',
        name: `${CROPS[seedType].name} Seeds`,
        count,
        seedType,
        icon: '🌱'
      });
    }
  }

  private checkInteractionPrompt() {
    this.interactionPrompt = null;
    const px = this.player.x;
    const py = this.player.y;

    if (this.screen === 'FARM') {
      if (Math.hypot(px - (this.farmWell.x + 16), py - (this.farmWell.y + 16)) < 36) {
        this.interactionPrompt = 'Press [E] to Refill Water Can';
      } else if (Math.hypot(px - (this.farmWeatherTotem.x + 16), py - (this.farmWeatherTotem.y + 16)) < 36) {
        const cond = WEATHER_CONDITIONS[this.currentWeather];
        this.interactionPrompt = `Press [E] to Commune with Weather Obelisk (${cond.name})`;
      } else if (Math.hypot(px - (this.farmCauldron.x + 16), py - (this.farmCauldron.y + 16)) < 36) {
        this.interactionPrompt = 'Press [E] to Brew Cauldron Potions';
      } else if (Math.hypot(px - (this.farmForge.x + 16), py - (this.farmForge.y + 16)) < 36) {
        this.interactionPrompt = 'Press [E] to Upgrade Weapons at Forge';
      } else if (Math.hypot(px - (this.farmDungeonHatch.x + 16), py - (this.farmDungeonHatch.y + 16)) < 36) {
        this.interactionPrompt = 'Press [E] to Descend into Dungeon';
      } else {
        const targetTile = this.getTargetTile();
        const plot = this.farmPlots.find((p) => p.gridX === targetTile.x && p.gridY === targetTile.y);
        if (plot && plot.growthStage >= 3 && plot.seedType) {
          this.interactionPrompt = `Press [E] to Harvest ${CROPS[plot.seedType].name}`;
        }
      }
    } else if (this.screen === 'DUNGEON' && this.currentFloorData) {
      if (Math.hypot(px - this.currentFloorData.exitX, py - this.currentFloorData.exitY) < 36) {
        this.interactionPrompt = this.stats.currentFloor >= 10 ? 'Press [E] to Claim Victory!' : 'Press [E] to Descend to Next Floor';
      } else if (Math.hypot(px - this.currentFloorData.spawnX, py - this.currentFloorData.spawnY) < 36) {
        this.interactionPrompt = 'Press [E] to Return to Farmstead';
      } else {
        for (const chest of this.currentFloorData.chests) {
          if (!chest.opened && Math.hypot(px - chest.x, py - chest.y) < 32) {
            this.interactionPrompt = 'Press [E] to Open Treasure Chest';
            break;
          }
        }
      }
    }
  }

  private getTargetTile(): { x: number; y: number } {
    let offsetDist = 18;
    let ox = 0;
    let oy = 0;
    if (this.player.facing === 'left') ox = -offsetDist;
    if (this.player.facing === 'right') ox = offsetDist;
    if (this.player.facing === 'up') oy = -offsetDist;
    if (this.player.facing === 'down') oy = offsetDist;

    return {
      x: Math.floor((this.player.x + ox) / TILE_SIZE),
      y: Math.floor((this.player.y + oy) / TILE_SIZE)
    };
  }

  private updateFarm(dt: number) {
    const weather = WEATHER_CONDITIONS[this.currentWeather];

    // Weather countdown
    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      const list: WeatherType[] = ['sunny', 'rain', 'thunderstorm', 'heatwave', 'fertility_mist'];
      const nextIdx = (list.indexOf(this.currentWeather) + 1) % list.length;
      this.cycleWeather(list[nextIdx]);
    }

    if (this.lightningFlashTimer > 0) {
      this.lightningFlashTimer -= dt;
    }

    // Auto-watering during Rain and Thunderstorm
    if (weather.autoWater) {
      this.autoWaterCooldown -= dt;
      if (this.autoWaterCooldown <= 0) {
        this.autoWaterCooldown = 2.0;
        const dryPlots = this.farmPlots.filter((p) => p.tilled && !p.watered);
        if (dryPlots.length > 0) {
          const plotToWater = dryPlots[Math.floor(Math.random() * dryPlots.length)];
          plotToWater.watered = true;
          this.spawnSparks(plotToWater.gridX * TILE_SIZE + 16, plotToWater.gridY * TILE_SIZE + 16, '#60A5FA');
        }
      }
    }

    // Thunderstorm lightning strikes
    if (this.currentWeather === 'thunderstorm') {
      this.thunderCooldown -= dt;
      if (this.thunderCooldown <= 0) {
        this.thunderCooldown = 6.0 + Math.random() * 5.0;
        this.lightningFlashTimer = 0.15;
        this.screenShake = 5.0;
        sound.playThunder();
      }
    }

    // Update Rain Drops
    if (this.currentWeather === 'rain' || this.currentWeather === 'thunderstorm') {
      const speedMult = this.currentWeather === 'thunderstorm' ? 1.4 : 1.0;
      for (const drop of this.rainDrops) {
        drop.y += drop.speed * speedMult * dt;
        drop.x -= (drop.speed * 0.25) * dt;
        if (drop.y > this.canvas.height) {
          drop.y = -10;
          drop.x = Math.random() * (this.canvas.width + 200);
        }
      }
    }

    // Update Ambient Motes (Sunbeams, Heat Embers, or Spores)
    for (const mote of this.ambientMotes) {
      mote.x += mote.vx * dt;
      mote.y += mote.vy * dt;
      if (mote.y < -10) {
        mote.y = this.canvas.height + 10;
        mote.x = Math.random() * this.canvas.width;
      }
    }

    // Crop growth logic with Weather Multiplier
    for (const plot of this.farmPlots) {
      if (plot.seedType && plot.watered && plot.growthStage < 3) {
        const crop = CROPS[plot.seedType];
        const growthSpeed = (1 / crop.growTimeSeconds) * weather.growthMultiplier;
        plot.growthProgress += dt * growthSpeed;

        if (plot.growthProgress >= 1.0) {
          plot.growthStage += 1;
          plot.growthProgress = 0;
          if (plot.growthStage >= 3) {
            // Mature!
            this.spawnSparks(plot.gridX * TILE_SIZE + 16, plot.gridY * TILE_SIZE + 16, crop.glowColor);
          }
        }
      }
    }
  }

  private updateDungeon(dt: number) {
    // Update enemies
    for (const enemy of this.enemies) {
      if (enemy.flashTimer > 0) enemy.flashTimer -= dt;
      if (enemy.hitStun > 0) {
        enemy.hitStun -= dt;
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;
        enemy.vx *= 0.85;
        enemy.vy *= 0.85;
        continue;
      }

      const distToPlayer = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      const angleToPlayer = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);

      // Facing
      if (Math.abs(Math.cos(angleToPlayer)) > Math.abs(Math.sin(angleToPlayer))) {
        enemy.facing = Math.cos(angleToPlayer) > 0 ? 'right' : 'left';
      } else {
        enemy.facing = Math.sin(angleToPlayer) > 0 ? 'down' : 'up';
      }

      // Enemy AI behaviors
      if (distToPlayer < 240) {
        if (enemy.type === 'skeleton') {
          // Archer behavior: maintain distance and telegraph arrow shots
          enemy.telegraphAngle = angleToPlayer;

          if (distToPlayer < 90) {
            // Back away if too close
            enemy.x -= Math.cos(angleToPlayer) * enemy.speed * dt;
            enemy.y -= Math.sin(angleToPlayer) * enemy.speed * dt;
          }

          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0 && !enemy.isTelegraphing) {
            enemy.isTelegraphing = true;
            enemy.telegraphTimer = enemy.telegraphMax;
          }

          if (enemy.isTelegraphing) {
            enemy.telegraphTimer -= dt;
            if (enemy.telegraphTimer <= 0) {
              enemy.isTelegraphing = false;
              enemy.attackCooldown = 2.0;

              // Fire arrow
              sound.playBowShot();
              this.projectiles.push({
                id: `enemy_arrow_${Date.now()}_${Math.random()}`,
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angleToPlayer) * 190,
                vy: Math.sin(angleToPlayer) * 190,
                speed: 190,
                damage: enemy.attackPower,
                radius: 4,
                isPlayer: false,
                color: '#EF4444',
                distanceRemaining: 260
              });
            }
          }
        } else {
          // Melee pursuit (slime, bat, knight, boss)
          if (enemy.isTelegraphing) {
            enemy.telegraphTimer -= dt;
            if (enemy.telegraphTimer <= 0) {
              enemy.isTelegraphing = false;
              enemy.attackCooldown = 1.2;

              // Strike player if still in range
              if (distToPlayer < enemy.radius + this.player.radius + 14) {
                this.damagePlayer(enemy.attackPower);
              }
            }
          } else {
            // Chase
            const speed = enemy.speed;
            const targetX = enemy.x + Math.cos(angleToPlayer) * speed * dt;
            const targetY = enemy.y + Math.sin(angleToPlayer) * speed * dt;

            if (!this.checkWallCollision(targetX, enemy.y)) enemy.x = targetX;
            if (!this.checkWallCollision(enemy.x, targetY)) enemy.y = targetY;

            // Attack proximity trigger
            enemy.attackCooldown -= dt;
            if (enemy.attackCooldown <= 0 && distToPlayer < enemy.radius + this.player.radius + 12) {
              enemy.isTelegraphing = true;
              enemy.telegraphTimer = enemy.telegraphMax;
            }
          }
        }
      }
    }
  }

  private damagePlayer(amount: number) {
    if (this.player.isRolling) return; // Invulnerability frames!

    let finalDamage = amount;
    const defBuff = this.activeBuffs.find((b) => b.type === 'defense');
    if (defBuff) finalDamage = Math.max(1, Math.round(amount * defBuff.multiplier));

    this.stats.hp = Math.max(0, this.stats.hp - finalDamage);
    this.player.flashTimer = 0.18;
    this.screenShake = 6.0;
    sound.playPlayerHurt();
    this.addFloatingText(this.player.x, this.player.y - 18, `-${finalDamage}`, '#EF4444');
    this.spawnBloodSparks(this.player.x, this.player.y, '#EF4444');

    if (this.stats.hp <= 0) {
      sound.playGameOver();
      this.screen = 'GAME_OVER';
      this.onOpenModal?.('game_over');
    }

    this.notifyState();
  }

  private handleEnemyDefeated(enemy: Enemy) {
    this.enemies = this.enemies.filter((e) => e !== enemy);
    this.stats.monstersSlain += 1;
    this.stats.gold += Math.floor(6 + this.stats.currentFloor * 3);

    sound.playCoin();
    this.addFloatingText(enemy.x, enemy.y - 10, `+${6 + this.stats.currentFloor * 3} Gold`, '#FBBF24');
    this.spawnSparks(enemy.x, enemy.y, '#34D399');

    // Seed drop probability
    if (Math.random() > 0.45) {
      const seedPool: SeedType[] = ['sun_turnip', 'iron_root', 'blaze_pepper', 'frost_berry', 'soul_pumpkin'];
      const droppedSeed = seedPool[Math.floor(Math.random() * seedPool.length)];
      this.addSeedToInventory(droppedSeed, 1);
      this.addFloatingText(enemy.x, enemy.y - 24, `+1 ${CROPS[droppedSeed].name} Seed`, '#22C55E');
    }

    // Health drop if low
    if (this.stats.hp < this.stats.maxHp * 0.4 && Math.random() > 0.5) {
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 20);
      this.addFloatingText(this.player.x, this.player.y - 14, '+20 HP', '#10B981');
    }

    this.notifyState();
  }

  private breakPot(x: number, y: number) {
    sound.playEnemyHit();
    this.spawnSparks(x, y, '#D97706');

    const roll = Math.random();
    if (roll < 0.5) {
      const gold = Math.floor(3 + Math.random() * 8);
      this.stats.gold += gold;
      this.addFloatingText(x, y - 8, `+${gold} Gold`, '#FBBF24');
    } else if (roll < 0.8) {
      this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + 12);
      this.addFloatingText(x, y - 8, '+12 HP', '#10B981');
    } else {
      this.addSeedToInventory('sun_turnip', 1);
      this.addFloatingText(x, y - 8, '+1 Seed', '#22C55E');
    }
    this.notifyState();
  }

  private updateProjectiles(dt: number) {
    for (const proj of this.projectiles) {
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.distanceRemaining -= proj.speed * dt;

      // Particle trail
      if (Math.random() > 0.3) {
        this.particles.push({
          x: proj.x,
          y: proj.y,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          size: 2,
          color: proj.color,
          alpha: 0.7,
          decay: 3.5,
          shape: 'spark'
        });
      }

      // Check wall collision
      if (this.checkWallCollision(proj.x, proj.y)) {
        proj.distanceRemaining = 0;
        this.spawnSparks(proj.x, proj.y, proj.color);
        continue;
      }

      // Hit checks
      if (proj.isPlayer) {
        for (const enemy of this.enemies) {
          if (Math.hypot(enemy.x - proj.x, enemy.y - proj.y) < enemy.radius + proj.radius) {
            enemy.hp -= proj.damage;
            enemy.flashTimer = 0.12;
            enemy.hitStun = 0.15;
            proj.distanceRemaining = 0;

            sound.playEnemyHit();
            this.addFloatingText(enemy.x, enemy.y - 12, `${proj.damage}`, '#F87171');
            this.spawnBloodSparks(enemy.x, enemy.y, '#EF4444');

            if (enemy.hp <= 0) {
              this.handleEnemyDefeated(enemy);
            }
            break;
          }
        }
      } else {
        // Enemy arrow hits player
        if (Math.hypot(this.player.x - proj.x, this.player.y - proj.y) < this.player.radius + proj.radius) {
          proj.distanceRemaining = 0;
          this.damagePlayer(proj.damage);
        }
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.distanceRemaining > 0);
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt * p.decay;
      if (p.gravity) p.vy += p.gravity * dt;
    }
    this.particles = this.particles.filter((p) => p.alpha > 0);
  }

  private updateCamera(dt: number) {
    // Smooth camera tracking
    const targetX = this.player.x - this.canvas.width / 2;
    const targetY = this.player.y - this.canvas.height / 2;

    this.camera.x += (targetX - this.camera.x) * 0.15;
    this.camera.y += (targetY - this.camera.y) * 0.15;

    // Decay shake
    if (this.screenShake > 0) {
      this.screenShake -= dt * 18;
      if (this.screenShake < 0) this.screenShake = 0;
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const shakeX = (Math.random() - 0.5) * this.screenShake;
    const shakeY = (Math.random() - 0.5) * this.screenShake;

    this.ctx.save();
    this.ctx.translate(Math.round(-this.camera.x + shakeX), Math.round(-this.camera.y + shakeY));

    if (this.screen === 'FARM') {
      this.renderFarm();
    } else if (this.screen === 'DUNGEON') {
      this.renderDungeon();
    }

    // Render Projectiles
    for (const p of this.projectiles) {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Render Player
    PixelRenderer.drawPlayer(
      this.ctx,
      this.player.x,
      this.player.y,
      this.player.facing,
      this.player.isMoving,
      this.player.walkFrame,
      this.player.isRolling,
      this.player.rollTimer / this.player.rollDuration,
      this.player.attackTimer,
      this.inventory[this.selectedHotbarIndex]?.type === 'bow',
      this.player.aimAngle,
      this.player.flashTimer > 0
    );

    // Render Particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      if (p.shape === 'text' && p.text) {
        this.ctx.font = 'bold 11px monospace';
        this.ctx.fillStyle = p.color;
        this.ctx.fillText(p.text, p.x, p.y);
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      this.ctx.restore();
    }

    this.ctx.restore();

    // Render Dynamic Weather Atmospheric Sky Overlay & Particles in Farm
    if (this.screen === 'FARM') {
      this.renderWeatherAtmosphere();
    }

    // Render Dynamic Lighting in Dungeon mode
    if (this.screen === 'DUNGEON') {
      this.renderLighting();
    }
  }

  private renderWeatherAtmosphere() {
    const weather = WEATHER_CONDITIONS[this.currentWeather];
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.save();

    // 1. Full-screen sky tint overlay
    this.ctx.fillStyle = weather.skyTint;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Weather particles & effects
    if (this.currentWeather === 'rain' || this.currentWeather === 'thunderstorm') {
      this.ctx.strokeStyle = this.currentWeather === 'thunderstorm' ? 'rgba(196, 181, 253, 0.7)' : 'rgba(186, 230, 253, 0.6)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      for (const drop of this.rainDrops) {
        this.ctx.moveTo(drop.x, drop.y);
        this.ctx.lineTo(drop.x - drop.length * 0.35, drop.y + drop.length);
      }
      this.ctx.stroke();

      // Lightning flash
      if (this.lightningFlashTimer > 0) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, this.lightningFlashTimer * 7)})`;
        this.ctx.fillRect(0, 0, w, h);
      }
    } else if (this.currentWeather === 'heatwave') {
      // Heat shimmer waves & warm drifting embers
      for (const mote of this.ambientMotes) {
        this.ctx.fillStyle = '#FB923C';
        this.ctx.globalAlpha = mote.alpha * 0.8;
        this.ctx.fillRect(mote.x, mote.y, mote.size, mote.size);
      }
    } else if (this.currentWeather === 'fertility_mist') {
      // Bioluminescent glowing spores
      for (const mote of this.ambientMotes) {
        this.ctx.fillStyle = '#34D399';
        this.ctx.globalAlpha = mote.alpha * 0.85;
        this.ctx.beginPath();
        this.ctx.arc(mote.x, mote.y, mote.size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (this.currentWeather === 'sunny') {
      // Warm subtle golden sunbeams
      const sunGrad = this.ctx.createLinearGradient(0, 0, w, h);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.12)');
      sunGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.03)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = sunGrad;
      this.ctx.fillRect(0, 0, w, h);
    }

    this.ctx.restore();
  }

  private renderFarm() {
    // Render lush grass & farm border
    const farmW = 30;
    const farmH = 20;

    for (let ty = 0; ty < farmH; ty++) {
      for (let tx = 0; tx < farmW; tx++) {
        const plot = this.farmPlots.find((p) => p.gridX === tx && p.gridY === ty);
        PixelRenderer.drawFarmTile(this.ctx, tx, ty, !!plot?.tilled, !!plot?.watered);
      }
    }

    // Render crops
    for (const plot of this.farmPlots) {
      if (plot.seedType) {
        PixelRenderer.drawCrop(
          this.ctx,
          plot.gridX * TILE_SIZE,
          plot.gridY * TILE_SIZE,
          plot.seedType,
          plot.growthStage,
          plot.growthProgress
        );
      }
    }

    // Farm Buildings / Hub Elements
    PixelRenderer.drawWell(this.ctx, this.farmWell.x, this.farmWell.y);
    PixelRenderer.drawWeatherTotem(this.ctx, this.farmWeatherTotem.x, this.farmWeatherTotem.y, this.currentWeather);
    PixelRenderer.drawCauldron(this.ctx, this.farmCauldron.x, this.farmCauldron.y);
    PixelRenderer.drawForge(this.ctx, this.farmForge.x, this.farmForge.y);
    PixelRenderer.drawDungeonHatch(this.ctx, this.farmDungeonHatch.x, this.farmDungeonHatch.y);
  }

  private renderDungeon() {
    if (!this.currentFloorData) return;
    const { tiles, width, height, chests, pots, torches } = this.currentFloorData;

    // Render Dungeon Tiles
    for (let ty = 0; ty < height; ty++) {
      for (let tx = 0; tx < width; tx++) {
        const t = tiles[ty][tx];
        const x = tx * TILE_SIZE;
        const y = ty * TILE_SIZE;

        if (t === 2) {
          // Wall
          this.ctx.fillStyle = '#0F172A';
          this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          this.ctx.fillStyle = '#1E293B';
          this.ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          this.ctx.fillStyle = '#334155';
          this.ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 3);
        } else {
          // Floor
          this.ctx.fillStyle = '#1E293B';
          this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          this.ctx.fillStyle = '#0F172A';
          this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

          // Subtle cobblestone dots
          this.ctx.fillStyle = '#334155';
          this.ctx.fillRect(x + 8, y + 8, 3, 3);
          this.ctx.fillRect(x + 20, y + 18, 3, 3);

          if (t === 5) {
            // Exit portal stairs
            this.ctx.fillStyle = '#3B82F6';
            this.ctx.fillRect(x + 4, y + 4, 24, 24);
            this.ctx.fillStyle = '#60A5FA';
            this.ctx.fillRect(x + 8, y + 8, 16, 16);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x + 12, y + 12, 8, 8);
          } else if (t === 6) {
            // Entrance stairs
            this.ctx.fillStyle = '#78350F';
            this.ctx.fillRect(x + 4, y + 4, 24, 24);
            this.ctx.fillStyle = '#B45309';
            this.ctx.fillRect(x + 8, y + 8, 16, 16);
          }
        }
      }
    }

    // Render Pots
    for (const pot of pots) {
      if (!pot.broken) {
        this.ctx.fillStyle = '#D97706';
        this.ctx.beginPath();
        this.ctx.arc(pot.x, pot.y, 7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#B45309';
        this.ctx.fillRect(pot.x - 3, pot.y - 7, 6, 2);
      }
    }

    // Render Chests
    for (const chest of chests) {
      this.ctx.fillStyle = chest.opened ? '#64748B' : '#F59E0B';
      this.ctx.fillRect(chest.x - 9, chest.y - 7, 18, 14);
      this.ctx.fillStyle = '#78350F';
      this.ctx.fillRect(chest.x - 7, chest.y - 5, 14, 10);
      if (!chest.opened) {
        this.ctx.fillStyle = '#FEF08A';
        this.ctx.fillRect(chest.x - 2, chest.y - 2, 4, 4);
      }
    }

    // Render Wall Torches
    for (const torch of torches) {
      const flicker = Math.sin(Date.now() * 0.01 + torch.flicker * 10) * 2;
      this.ctx.fillStyle = '#78350F';
      this.ctx.fillRect(torch.x + 14, torch.y + 12, 4, 10);
      this.ctx.fillStyle = '#F59E0B';
      this.ctx.beginPath();
      this.ctx.arc(torch.x + 16, torch.y + 10 + flicker, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#EF4444';
      this.ctx.fillRect(torch.x + 15, torch.y + 12, 2, 2);
    }

    // Render Enemies
    for (const enemy of this.enemies) {
      PixelRenderer.drawEnemy(this.ctx, enemy);
    }
  }

  private renderLighting() {
    this.lightCtx.clearRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);

    // Dark ambient fog of war (90% darkness)
    this.lightCtx.fillStyle = 'rgba(7, 11, 20, 0.92)';
    this.lightCtx.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);

    // Cut light circles using 'destination-out'
    this.lightCtx.globalCompositeOperation = 'destination-out';

    const screenPlayerX = Math.round(this.player.x - this.camera.x);
    const screenPlayerY = Math.round(this.player.y - this.camera.y);

    // Player Torch light
    const torchFlicker = Math.sin(Date.now() * 0.008) * 4;
    const playerRadius = 145 + torchFlicker;

    const playerGradient = this.lightCtx.createRadialGradient(
      screenPlayerX,
      screenPlayerY,
      20,
      screenPlayerX,
      screenPlayerY,
      playerRadius
    );
    playerGradient.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    playerGradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.85)');
    playerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    this.lightCtx.fillStyle = playerGradient;
    this.lightCtx.beginPath();
    this.lightCtx.arc(screenPlayerX, screenPlayerY, playerRadius, 0, Math.PI * 2);
    this.lightCtx.fill();

    // Wall Torches Light
    if (this.currentFloorData) {
      for (const t of this.currentFloorData.torches) {
        const tx = Math.round(t.x + 16 - this.camera.x);
        const ty = Math.round(t.y + 10 - this.camera.y);

        if (tx > -100 && tx < this.canvas.width + 100 && ty > -100 && ty < this.canvas.height + 100) {
          const torchRad = 85 + Math.sin(Date.now() * 0.01 + t.flicker * 5) * 3;
          const tGrad = this.lightCtx.createRadialGradient(tx, ty, 10, tx, ty, torchRad);
          tGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
          tGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

          this.lightCtx.fillStyle = tGrad;
          this.lightCtx.beginPath();
          this.lightCtx.arc(tx, ty, torchRad, 0, Math.PI * 2);
          this.lightCtx.fill();
        }
      }

      // Exit stairs portal light
      const ex = Math.round(this.currentFloorData.exitX - this.camera.x);
      const ey = Math.round(this.currentFloorData.exitY - this.camera.y);
      const pGrad = this.lightCtx.createRadialGradient(ex, ey, 10, ex, ey, 90);
      pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.lightCtx.fillStyle = pGrad;
      this.lightCtx.beginPath();
      this.lightCtx.arc(ex, ey, 90, 0, Math.PI * 2);
      this.lightCtx.fill();
    }

    this.lightCtx.globalCompositeOperation = 'source-over';

    // Draw lighting buffer over main canvas
    this.ctx.drawImage(this.lightCanvas, 0, 0);
  }

  private spawnSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        size: 2.5,
        color,
        alpha: 0.9,
        decay: 2.5,
        shape: 'spark'
      });
    }
  }

  private spawnBloodSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 90,
        vy: (Math.random() - 0.5) * 90,
        size: 3,
        color,
        alpha: 1.0,
        decay: 3.0,
        shape: 'spark'
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: -35,
      size: 1,
      color,
      alpha: 1.0,
      decay: 1.2,
      shape: 'text',
      text
    });
  }

  private notifyState() {
    this.onStateChange?.(this);
  }
}
