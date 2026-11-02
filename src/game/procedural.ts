/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DungeonFloor, DungeonRoom, Enemy, FarmPlot, SeedType } from './types';
import { TILE_SIZE } from './constants';

export class DungeonGenerator {
  public static generateFloor(floorNumber: number): {
    floor: DungeonFloor;
    enemies: Enemy[];
  } {
    const width = 36;
    const height = 36;
    const tiles: number[][] = Array.from({ length: height }, () => Array(width).fill(2)); // 2 = wall by default

    const rooms: DungeonRoom[] = [];
    const minRooms = 6;
    const maxRooms = 9;
    const roomCount = Math.floor(minRooms + Math.random() * (maxRooms - minRooms + 1));

    // Generate non-overlapping or slightly connected rooms
    for (let attempts = 0; attempts < 100 && rooms.length < roomCount; attempts++) {
      const rw = Math.floor(5 + Math.random() * 5);
      const rh = Math.floor(5 + Math.random() * 5);
      const rx = Math.floor(2 + Math.random() * (width - rw - 4));
      const ry = Math.floor(2 + Math.random() * (height - rh - 4));

      // Check overlap with existing rooms
      let overlaps = false;
      for (const r of rooms) {
        if (
          rx < r.x + r.w + 1 &&
          rx + rw + 1 > r.x &&
          ry < r.y + r.h + 1 &&
          ry + rh + 1 > r.y
        ) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        rooms.push({
          x: rx,
          y: ry,
          w: rw,
          h: rh,
          centerX: rx + Math.floor(rw / 2),
          centerY: ry + Math.floor(rh / 2),
          cleared: false,
          visited: false
        });

        // Carve room floor (1 = floor)
        for (let y = ry; y < ry + rh; y++) {
          for (let x = rx; x < rx + rw; x++) {
            tiles[y][x] = 1;
          }
        }
      }
    }

    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
      const rA = rooms[i];
      const rB = rooms[i + 1];

      let cx = rA.centerX;
      let cy = rA.centerY;

      // Horizontal tunnel
      while (cx !== rB.centerX) {
        tiles[cy][cx] = 1;
        cx += cx < rB.centerX ? 1 : -1;
      }
      // Vertical tunnel
      while (cy !== rB.centerY) {
        tiles[cy][cx] = 1;
        cy += cy < rB.centerY ? 1 : -1;
      }
    }

    // Spawn entrance in room 0
    const startRoom = rooms[0];
    const spawnX = startRoom.centerX * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = startRoom.centerY * TILE_SIZE + TILE_SIZE / 2;
    tiles[startRoom.centerY][startRoom.centerX] = 6; // Entrance stairs

    // Spawn exit in furthest room
    const endRoom = rooms[rooms.length - 1];
    const exitX = endRoom.centerX * TILE_SIZE + TILE_SIZE / 2;
    const exitY = endRoom.centerY * TILE_SIZE + TILE_SIZE / 2;
    tiles[endRoom.centerY][endRoom.centerX] = 5; // Exit stairs

    // Torches on walls
    const torches: { x: number; y: number; flicker: number }[] = [];
    for (const r of rooms) {
      torches.push({ x: (r.x + 1) * TILE_SIZE, y: r.y * TILE_SIZE, flicker: Math.random() });
      torches.push({ x: (r.x + r.w - 1) * TILE_SIZE, y: r.y * TILE_SIZE, flicker: Math.random() });
    }

    // Chests & breakable pots
    const chests: { x: number; y: number; opened: boolean; seedReward?: SeedType; goldReward?: number }[] = [];
    const pots: { x: number; y: number; broken: boolean }[] = [];

    const seedPool: SeedType[] = ['sun_turnip', 'iron_root', 'blaze_pepper', 'frost_berry', 'soul_pumpkin'];

    // Place chests in rooms
    for (let i = 1; i < rooms.length; i++) {
      const r = rooms[i];
      if (Math.random() > 0.4 || i === rooms.length - 1) {
        const cx = r.x + 1;
        const cy = r.y + 1;
        tiles[cy][cx] = 4; // Chest tile
        const rewardSeed = seedPool[Math.floor(Math.random() * seedPool.length)];
        chests.push({
          x: cx * TILE_SIZE + TILE_SIZE / 2,
          y: cy * TILE_SIZE + TILE_SIZE / 2,
          opened: false,
          seedReward: rewardSeed,
          goldReward: Math.floor(15 + floorNumber * 8 + Math.random() * 10)
        });
      }

      // Pots
      for (let p = 0; p < 2; p++) {
        const px = r.x + Math.floor(Math.random() * (r.w - 2)) + 1;
        const py = r.y + Math.floor(Math.random() * (r.h - 2)) + 1;
        if (tiles[py][px] === 1) {
          tiles[py][px] = 7; // Pot tile
          pots.push({
            x: px * TILE_SIZE + TILE_SIZE / 2,
            y: py * TILE_SIZE + TILE_SIZE / 2,
            broken: false
          });
        }
      }
    }

    // Spawn Enemies
    const enemies: Enemy[] = [];
    const isBossFloor = floorNumber === 5 || floorNumber === 10;

    for (let i = 1; i < rooms.length; i++) {
      const r = rooms[i];
      const isFinalRoom = i === rooms.length - 1;

      if (isBossFloor && isFinalRoom) {
        // Spawn Floor Boss!
        enemies.push({
          id: `boss_${floorNumber}`,
          type: 'boss',
          x: r.centerX * TILE_SIZE,
          y: r.centerY * TILE_SIZE,
          vx: 0,
          vy: 0,
          radius: 24,
          hp: 200 + floorNumber * 45,
          maxHp: 200 + floorNumber * 45,
          speed: 40,
          attackPower: 22,
          attackCooldown: 1.5,
          telegraphTimer: 0,
          telegraphMax: 1.2,
          isTelegraphing: false,
          telegraphAngle: 0,
          facing: 'down',
          hitStun: 0,
          flashTimer: 0
        });
      } else {
        // Normal room enemy pack
        const packSize = Math.floor(2 + (floorNumber * 0.7));
        for (let k = 0; k < packSize; k++) {
          const ex = (r.x + 1 + Math.random() * (r.w - 2)) * TILE_SIZE;
          const ey = (r.y + 1 + Math.random() * (r.h - 2)) * TILE_SIZE;

          let enemyType: 'slime' | 'skeleton' | 'bat' | 'knight' = 'slime';
          const roll = Math.random();

          if (floorNumber <= 2) {
            enemyType = roll < 0.65 ? 'slime' : 'bat';
          } else if (floorNumber <= 4) {
            if (roll < 0.4) enemyType = 'slime';
            else if (roll < 0.75) enemyType = 'skeleton';
            else enemyType = 'bat';
          } else {
            if (roll < 0.25) enemyType = 'slime';
            else if (roll < 0.5) enemyType = 'skeleton';
            else if (roll < 0.75) enemyType = 'bat';
            else enemyType = 'knight';
          }

          let hp = 15 + floorNumber * 4;
          let speed = 45;
          let attackPower = 6 + floorNumber * 2;
          let radius = 10;

          if (enemyType === 'slime') {
            radius = 11;
            speed = 35;
            hp = 18 + floorNumber * 5;
          } else if (enemyType === 'skeleton') {
            radius = 10;
            speed = 40;
            hp = 22 + floorNumber * 4;
            attackPower = 8 + floorNumber * 2;
          } else if (enemyType === 'bat') {
            radius = 8;
            speed = 70;
            hp = 12 + floorNumber * 3;
            attackPower = 5 + floorNumber * 2;
          } else if (enemyType === 'knight') {
            radius = 13;
            speed = 30;
            hp = 40 + floorNumber * 8;
            attackPower = 14 + floorNumber * 3;
          }

          enemies.push({
            id: `enemy_${i}_${k}_${Date.now()}_${Math.random()}`,
            type: enemyType,
            x: ex,
            y: ey,
            vx: 0,
            vy: 0,
            radius,
            hp,
            maxHp: hp,
            speed,
            attackPower,
            attackCooldown: 1.0 + Math.random() * 0.5,
            telegraphTimer: 0,
            telegraphMax: 0.7,
            isTelegraphing: false,
            telegraphAngle: 0,
            facing: 'down',
            hitStun: 0,
            flashTimer: 0
          });
        }
      }
    }

    const floor: DungeonFloor = {
      floorNumber,
      width,
      height,
      tiles,
      rooms,
      spawnX,
      spawnY,
      exitX,
      exitY,
      chests,
      pots,
      torches
    };

    return { floor, enemies };
  }

  public static generateInitialFarmPlots(): FarmPlot[] {
    const plots: FarmPlot[] = [];
    // 6x4 garden plot in center of farm
    const startX = 6;
    const startY = 6;
    const gridW = 6;
    const gridH = 4;

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        // First 4 plots pre-tilled and planted for a warm start
        const isPreplanted = (x === 0 || x === 1) && y === 0;
        plots.push({
          gridX: startX + x,
          gridY: startY + y,
          tilled: true,
          watered: isPreplanted,
          seedType: isPreplanted ? 'sun_turnip' : undefined,
          growthStage: isPreplanted ? 1 : 0,
          growthProgress: isPreplanted ? 0.35 : 0
        });
      }
    }

    return plots;
  }
}
