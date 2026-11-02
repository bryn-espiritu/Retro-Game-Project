/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameScreen = 'TITLE' | 'FARM' | 'DUNGEON' | 'PAUSE' | 'GAME_OVER' | 'VICTORY';

export type Facing = 'up' | 'down' | 'left' | 'right';

export type SeedType = 'sun_turnip' | 'iron_root' | 'blaze_pepper' | 'frost_berry' | 'soul_pumpkin';

export type WeatherType = 'sunny' | 'rain' | 'thunderstorm' | 'heatwave' | 'fertility_mist';

export interface WeatherCondition {
  id: WeatherType;
  name: string;
  icon: string;
  growthMultiplier: number;
  skyTint: string;
  ambientColor: string;
  description: string;
  autoWater: boolean;
  bonusSeedChance: number;
}

export interface CropInfo {
  id: SeedType;
  name: string;
  growTimeSeconds: number; // in seconds
  color: string;
  glowColor: string;
  description: string;
  buffDescription: string;
}

export type ItemType = 
  | 'hoe' 
  | 'watering_can' 
  | 'sword' 
  | 'bow' 
  | 'seed' 
  | 'crop' 
  | 'potion';

export interface InventoryItem {
  id: string;
  type: ItemType;
  name: string;
  count: number;
  seedType?: SeedType;
  potionEffect?: BuffType;
  potionDuration?: number;
  tier?: number;
  icon: string;
}

export type BuffType = 'regen' | 'defense' | 'damage' | 'speed';

export interface ActiveBuff {
  type: BuffType;
  name: string;
  multiplier: number;
  durationRemaining: number;
  totalDuration: number;
  color: string;
}

export interface PlayerStats {
  maxHp: number;
  hp: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  waterLevel: number;
  maxWaterLevel: number;
  swordTier: number; // 1: Rusty, 2: Iron, 3: Obsidian, 4: Sunblade
  bowTier: number;   // 1: Shortbow, 2: Composite, 3: Stormbow
  highestFloorCleared: number;
  currentFloor: number;
  monstersSlain: number;
  cropsHarvested: number;
}

export interface FarmPlot {
  gridX: number;
  gridY: number;
  tilled: boolean;
  watered: boolean;
  seedType?: SeedType;
  growthStage: number; // 0: seed, 1: sprout, 2: growing, 3: mature
  growthProgress: number; // 0 to 1
}

export interface Enemy {
  id: string;
  type: 'slime' | 'skeleton' | 'bat' | 'knight' | 'boss';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  attackPower: number;
  attackCooldown: number;
  telegraphTimer: number;
  telegraphMax: number;
  isTelegraphing: boolean;
  telegraphAngle: number;
  facing: Facing;
  hitStun: number;
  flashTimer: number;
  deathTimer?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  damage: number;
  radius: number;
  isPlayer: boolean;
  color: string;
  element?: 'frost' | 'fire' | 'normal';
  distanceRemaining: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity?: number;
  shape?: 'pixel' | 'spark' | 'smoke' | 'leaf' | 'text';
  text?: string;
}

export interface DungeonRoom {
  x: number;
  y: number;
  w: number;
  h: number;
  centerX: number;
  centerY: number;
  cleared: boolean;
  visited: boolean;
}

export interface DungeonFloor {
  floorNumber: number;
  width: number;
  height: number;
  tiles: number[][]; // 0: void, 1: floor, 2: wall, 3: door, 4: chest, 5: exit_stairs, 6: entrance_stairs, 7: pot
  rooms: DungeonRoom[];
  spawnX: number;
  spawnY: number;
  exitX: number;
  exitY: number;
  chests: { x: number; y: number; opened: boolean; seedReward?: SeedType; goldReward?: number }[];
  pots: { x: number; y: number; broken: boolean }[];
  torches: { x: number; y: number; flicker: number }[];
}

export interface Recipe {
  id: string;
  name: string;
  requiredCrops: { seedType: SeedType; count: number }[];
  goldCost: number;
  resultPotion: {
    name: string;
    effect: BuffType;
    multiplier: number;
    duration: number;
    color: string;
    description: string;
  };
}

export interface BlacksmithUpgrade {
  id: string;
  name: string;
  category: 'sword' | 'bow' | 'hp' | 'stamina';
  currentTier: number;
  maxTier: number;
  goldCost: number;
  requiredCrops: { seedType: SeedType; count: number }[];
  description: string;
}
