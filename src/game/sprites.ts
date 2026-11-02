/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Facing, SeedType, Enemy, WeatherType } from './types';
import { CROPS, TILE_SIZE } from './constants';

export class PixelRenderer {
  // Pre-rendered offscreen canvases or direct canvas drawing

  public static drawPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: Facing,
    isMoving: boolean,
    walkFrame: number,
    isRolling: boolean,
    rollProgress: number,
    attackTimer: number, // 0 to 1
    aimingBow: boolean,
    aimAngle: number,
    isFlashing: boolean
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));

    if (isFlashing) {
      ctx.filter = 'brightness(2.5) contrast(1.5)';
    }

    if (isRolling) {
      // Spinning tumble roll
      const rollAngle = rollProgress * Math.PI * 4;
      ctx.rotate(rollAngle);

      // Roll ball silhouette
      ctx.fillStyle = '#065F46'; // Forest green cloak
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#F59E0B'; // Belt/buckle
      ctx.fillRect(-3, -2, 6, 4);

      ctx.restore();
      return;
    }

    const bob = isMoving ? Math.sin(walkFrame * Math.PI * 2) * 2 : 0;

    // Shadow underneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body Offset
    ctx.translate(0, bob);

    // Feet / Boots
    ctx.fillStyle = '#3E2723'; // Dark leather boots
    if (isMoving) {
      const legStride = Math.cos(walkFrame * Math.PI * 2) * 4;
      ctx.fillRect(-6, 9 + legStride, 4, 5);
      ctx.fillRect(2, 9 - legStride, 4, 5);
    } else {
      ctx.fillRect(-5, 9, 4, 4);
      ctx.fillRect(2, 9, 4, 4);
    }

    // Tunic / Body
    ctx.fillStyle = '#047857'; // Emerald tunic
    ctx.fillRect(-6, -2, 13, 12);
    ctx.fillStyle = '#065F46';
    ctx.fillRect(-6, 7, 13, 3); // Lower trim

    // Leather belt & gold buckle
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-6, 3, 13, 3);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-2, 3, 4, 3);

    // Head / Skin
    ctx.fillStyle = '#FED7AA'; // Skin tone
    ctx.fillRect(-5, -12, 11, 10);

    // Hair / Adventurer Hat
    ctx.fillStyle = '#92400E'; // Brown hair
    ctx.fillRect(-6, -14, 13, 5);
    ctx.fillRect(-7, -11, 3, 6);
    ctx.fillRect(5, -11, 3, 6);

    // Hero band / feather
    ctx.fillStyle = '#E11D48';
    ctx.fillRect(-6, -12, 13, 2);

    // Eyes based on facing
    ctx.fillStyle = '#1E293B';
    if (facing === 'down') {
      ctx.fillRect(-3, -8, 2, 3);
      ctx.fillRect(2, -8, 2, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-3, -8, 1, 1);
      ctx.fillRect(2, -8, 1, 1);
    } else if (facing === 'up') {
      // Back of head
      ctx.fillStyle = '#92400E';
      ctx.fillRect(-5, -11, 11, 9);
    } else if (facing === 'left') {
      ctx.fillRect(-4, -8, 2, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-4, -8, 1, 1);
    } else if (facing === 'right') {
      ctx.fillRect(3, -8, 2, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(3, -8, 1, 1);
    }

    // Weapons / Tools rendering
    if (aimingBow) {
      // Draw bow aimed toward cursor
      ctx.save();
      ctx.rotate(aimAngle);
      ctx.strokeStyle = '#B45309'; // Bow wood
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(10, 0, 10, -Math.PI / 2.5, Math.PI / 2.5);
      ctx.stroke();

      // String
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10 + Math.cos(-Math.PI / 2.5) * 10, Math.sin(-Math.PI / 2.5) * 10);
      ctx.lineTo(4, 0);
      ctx.lineTo(10 + Math.cos(Math.PI / 2.5) * 10, Math.sin(Math.PI / 2.5) * 10);
      ctx.stroke();

      // Drawn arrow
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(15, 0);
      ctx.stroke();
      ctx.restore();
    } else if (attackTimer > 0) {
      // Melee Slash Arc
      const swingProgress = 1 - attackTimer;
      ctx.save();
      let baseAngle = 0;
      if (facing === 'up') baseAngle = -Math.PI / 2;
      if (facing === 'down') baseAngle = Math.PI / 2;
      if (facing === 'left') baseAngle = Math.PI;
      if (facing === 'right') baseAngle = 0;

      const slashAngle = baseAngle - Math.PI / 3 + swingProgress * (Math.PI * 0.7);
      ctx.rotate(slashAngle);

      // Sword Blade
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(4, -2, 18, 4);
      ctx.fillStyle = '#FFFFFF'; // Highlight edge
      ctx.fillRect(4, -2, 18, 1.5);
      ctx.fillStyle = '#F59E0B'; // Guard
      ctx.fillRect(3, -5, 3, 10);
      ctx.fillStyle = '#78350F'; // Hilt
      ctx.fillRect(-2, -1.5, 5, 3);

      // Sword Arc Swoosh Trail
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 22, -0.4, 0.4);
      ctx.stroke();

      ctx.restore();
    } else {
      // Sheathed / Idle weapon at side
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(7, 0, 2, 8);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(6, -2, 4, 2);
    }

    ctx.restore();
  }

  public static drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    ctx.save();
    ctx.translate(Math.round(enemy.x), Math.round(enemy.y));

    if (enemy.flashTimer > 0) {
      ctx.filter = 'brightness(3)';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius - 2, enemy.radius * 0.9, enemy.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Windup / Telegraph indicator
    if (enemy.isTelegraphing) {
      const p = 1 - enemy.telegraphTimer / enemy.telegraphMax;
      ctx.save();
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + p * 0.5})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      if (enemy.type === 'skeleton') {
        // Red laser targeting line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(enemy.telegraphAngle) * 220, Math.sin(enemy.telegraphAngle) * 220);
        ctx.stroke();
      } else {
        // Danger circle expansion
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius + 6 + p * 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    switch (enemy.type) {
      case 'slime': {
        // Green / bouncy slime with squash and stretch
        const bounce = Math.sin(Date.now() * 0.008 + parseInt(enemy.id, 10) || 0) * 0.2;
        const scaleX = 1 + bounce;
        const scaleY = 1 - bounce;
        ctx.scale(scaleX, scaleY);

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius, Math.PI, 0);
        ctx.lineTo(enemy.radius, enemy.radius * 0.6);
        ctx.quadraticCurveTo(0, enemy.radius * 0.9, -enemy.radius, enemy.radius * 0.6);
        ctx.closePath();
        ctx.fill();

        // Slime shine & eyes
        ctx.fillStyle = '#34D399';
        ctx.beginPath();
        ctx.arc(-enemy.radius * 0.35, -enemy.radius * 0.4, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#064E3B';
        ctx.fillRect(-4, -2, 3, 4);
        ctx.fillRect(2, -2, 3, 4);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-3, -2, 1, 2);
        ctx.fillRect(3, -2, 1, 2);
        break;
      }

      case 'skeleton': {
        // Bone skeleton archer
        ctx.fillStyle = '#E2E8F0'; // Skull
        ctx.fillRect(-6, -12, 12, 10);
        ctx.fillStyle = '#0F172A'; // Eye sockets
        ctx.fillRect(-4, -9, 3, 3);
        ctx.fillRect(2, -9, 3, 3);
        ctx.fillStyle = '#EF4444'; // Glowing red pupil
        ctx.fillRect(-3, -8, 1.5, 1.5);
        ctx.fillRect(3, -8, 1.5, 1.5);

        // Ribcage
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(-4, -2, 8, 8);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-2, 0, 4, 1.5);
        ctx.fillRect(-2, 3, 4, 1.5);

        // Bow
        ctx.save();
        ctx.rotate(enemy.telegraphAngle);
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(8, 0, 8, -Math.PI / 2.5, Math.PI / 2.5);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'bat': {
        // Shadow bat with flapping wings
        const flap = Math.sin(Date.now() * 0.02) * 8;
        ctx.fillStyle = '#4C1D95'; // Dark purple body
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#6D28D9';
        ctx.beginPath();
        ctx.moveTo(-4, -1);
        ctx.lineTo(-14, -6 + flap);
        ctx.lineTo(-8, 3);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(4, -1);
        ctx.lineTo(14, -6 + flap);
        ctx.lineTo(8, 3);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#F43F5E';
        ctx.fillRect(-3, -2, 2, 2);
        ctx.fillRect(2, -2, 2, 2);
        break;
      }

      case 'knight': {
        // Armored dark knight
        ctx.fillStyle = '#334155'; // Armor
        ctx.fillRect(-9, -14, 18, 22);

        // Helmet visor slit with red menace
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-6, -9, 12, 3);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-4, -8, 8, 1.5);

        // Shield
        ctx.fillStyle = '#475569';
        ctx.fillRect(-14, -6, 5, 14);
        ctx.fillStyle = '#F59E0B'; // Crest
        ctx.fillRect(-13, -2, 3, 6);

        // Broadsword
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(10, -12, 3, 20);
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(8, 2, 7, 2);
        break;
      }

      case 'boss': {
        // Huge Crypt Overlord / Bramble Titan
        const pulse = Math.sin(Date.now() * 0.005) * 2;
        ctx.fillStyle = '#1E1B4B'; // Obsidian bulk
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Horns & Runes
        ctx.fillStyle = '#A855F7';
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Glowing core
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Crown / Thorns
        ctx.fillStyle = '#FBBF24';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 10, -enemy.radius - 2);
          ctx.lineTo(i * 10 + 5, -enemy.radius - 14);
          ctx.lineTo(i * 10 + 10, -enemy.radius - 2);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
    }

    // Health Bar
    if (enemy.hp < enemy.maxHp) {
      const barWidth = enemy.radius * 2;
      const barHeight = 4;
      const yOffset = -enemy.radius - 12;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(-barWidth / 2, yOffset, barWidth, barHeight);

      const healthPct = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = enemy.type === 'boss' ? '#A855F7' : '#EF4444';
      ctx.fillRect(-barWidth / 2, yOffset, barWidth * healthPct, barHeight);
    }

    ctx.restore();
  }

  public static drawCrop(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    seedType: SeedType,
    stage: number, // 0 to 3
    progress: number
  ) {
    const crop = CROPS[seedType];
    ctx.save();
    ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);

    if (stage === 0) {
      // Tiny Seedling / Sprouts
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(0, 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(-1, 0, 2, 5);
    } else if (stage === 1) {
      // Small Young Plant
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.ellipse(-3, 0, 4, 2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(3, 0, 4, 2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803D';
      ctx.fillRect(-1, -3, 2, 9);
    } else if (stage === 2) {
      // Growing Stem with Bud
      ctx.fillStyle = '#15803D';
      ctx.fillRect(-1.5, -6, 3, 14);

      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.ellipse(-5, -2, 5, 2.5, -0.3, 0, Math.PI * 2);
      ctx.ellipse(5, -2, 5, 2.5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Small unripened fruit
      ctx.fillStyle = crop.color;
      ctx.beginPath();
      ctx.arc(0, -6, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Stage 3: Fully Mature & Harvestable!
      const pulse = Math.sin(Date.now() * 0.006) * 1.5;

      // Glow backdrop
      ctx.fillStyle = crop.glowColor;
      ctx.globalAlpha = 0.35 + Math.sin(Date.now() * 0.005) * 0.15;
      ctx.beginPath();
      ctx.arc(0, -2, 10 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Leaves
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.ellipse(-6, 2, 6, 3, -0.4, 0, Math.PI * 2);
      ctx.ellipse(6, 2, 6, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Fruit
      ctx.fillStyle = crop.color;
      ctx.beginPath();
      ctx.arc(0, -3, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Distinct crop details
      if (seedType === 'sun_turnip') {
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(-2, -5, 4, 4);
      } else if (seedType === 'blaze_pepper') {
        ctx.fillStyle = '#B91C1C';
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(-4, -6);
        ctx.lineTo(4, -6);
        ctx.closePath();
        ctx.fill();
      } else if (seedType === 'frost_berry') {
        ctx.fillStyle = '#E0F2FE';
        ctx.fillRect(-3, -5, 2, 2);
        ctx.fillRect(1, -3, 2, 2);
      } else if (seedType === 'soul_pumpkin') {
        ctx.fillStyle = '#6B21A8';
        ctx.fillRect(-2, -8, 4, 3); // stem
        ctx.fillStyle = '#F3E8FF';
        ctx.fillRect(-3, -4, 2, 2); // eye
        ctx.fillRect(1, -4, 2, 2);  // eye
      }

      // Sparkle indicator
      if (Math.sin(Date.now() * 0.008) > 0.3) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(5, -10, 2, 2);
      }
    }

    ctx.restore();
  }

  public static drawFarmTile(
    ctx: CanvasRenderingContext2D,
    tileX: number,
    tileY: number,
    tilled: boolean,
    watered: boolean
  ) {
    const x = tileX * TILE_SIZE;
    const y = tileY * TILE_SIZE;

    if (!tilled) {
      // Grass tile
      ctx.fillStyle = '#166534'; // Base green
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      // Grass blades texture
      ctx.fillStyle = '#15803D';
      ctx.fillRect(x + 4, y + 6, 2, 4);
      ctx.fillRect(x + 18, y + 14, 2, 4);
      ctx.fillRect(x + 10, y + 22, 2, 3);
      ctx.fillRect(x + 24, y + 4, 2, 3);
    } else {
      // Tilled soil
      ctx.fillStyle = watered ? '#3D2314' : '#78350F';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      // Furrows
      ctx.fillStyle = watered ? '#28170C' : '#572608';
      ctx.fillRect(x + 2, y + 6, TILE_SIZE - 4, 3);
      ctx.fillRect(x + 2, y + 15, TILE_SIZE - 4, 3);
      ctx.fillRect(x + 2, y + 24, TILE_SIZE - 4, 3);

      if (watered) {
        // Glistening wet soil speckles
        ctx.fillStyle = '#60A5FA';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x + 8, y + 7, 2, 1);
        ctx.fillRect(x + 20, y + 16, 2, 1);
        ctx.globalAlpha = 1.0;
      }
    }

    // Grid border line
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
  }

  public static drawCauldron(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Stone base
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, 20, 24, 8);

    // Iron pot
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Boiling Liquid
    const bubbleColor = '#8B5CF6';
    ctx.fillStyle = bubbleColor;
    ctx.beginPath();
    ctx.arc(16, 12, 8, 0, Math.PI * 2);
    ctx.fill();

    // Bubbles
    const b1 = (Date.now() * 0.005) % 1;
    ctx.fillStyle = '#D8B4FE';
    ctx.beginPath();
    ctx.arc(14, 12 - b1 * 4, 2, 0, Math.PI * 2);
    ctx.arc(18, 14 - ((b1 + 0.5) % 1) * 4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public static drawForge(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Brick furnace
    ctx.fillStyle = '#78350F';
    ctx.fillRect(2, 4, 28, 24);

    // Fire opening
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(6, 12, 20, 14);

    // Burning Coals
    const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
    ctx.fillRect(8, 16, 16, 8);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(10, 18, 12, 5);

    // Anvil
    ctx.fillStyle = '#475569';
    ctx.fillRect(8, 24, 16, 5);
    ctx.fillRect(10, 21, 12, 3);

    ctx.restore();
  }

  public static drawWell(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Cobblestone well ring
    ctx.fillStyle = '#475569';
    ctx.fillRect(2, 8, 28, 20);
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, 10, 24, 16);

    // Water inside
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(16, 18, 8, 0, Math.PI * 2);
    ctx.fill();

    // Wooden roof posts
    ctx.fillStyle = '#78350F';
    ctx.fillRect(3, 0, 3, 10);
    ctx.fillRect(26, 0, 3, 10);

    // Roof
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(16, -6);
    ctx.lineTo(32, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  public static drawDungeonHatch(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Stone archway / cellar door
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, 32, 32);

    // Stone border
    ctx.fillStyle = '#475569';
    ctx.strokeRect(1, 1, 30, 30);

    // Pitch black abyss inside
    ctx.fillStyle = '#020617';
    ctx.fillRect(4, 4, 24, 24);

    // Descending stairs
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(6, 6, 20, 5);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(8, 11, 16, 5);
    ctx.fillStyle = '#090D16';
    ctx.fillRect(10, 16, 12, 5);

    // Eerie glowing torch light from below
    ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.beginPath();
    ctx.arc(16, 22, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public static drawWeatherTotem(ctx: CanvasRenderingContext2D, x: number, y: number, weather: WeatherType) {
    ctx.save();
    ctx.translate(x, y);

    // Weather crystal color
    let gemColor = '#FBBF24';
    if (weather === 'rain') gemColor = '#60A5FA';
    if (weather === 'thunderstorm') gemColor = '#A855F7';
    if (weather === 'heatwave') gemColor = '#F97316';
    if (weather === 'fertility_mist') gemColor = '#34D399';

    // Stone base pedestal
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, 18, 24, 12);
    ctx.fillStyle = '#1E293B';
    ctx.strokeRect(4, 18, 24, 12);
    ctx.fillStyle = '#475569';
    ctx.fillRect(7, 10, 18, 10);

    // Carved runes on stone
    ctx.fillStyle = gemColor;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(11, 13, 3, 4);
    ctx.fillRect(15, 12, 2, 6);
    ctx.fillRect(18, 13, 3, 4);

    // Floating Weather Crystal atop
    const float = Math.sin(Date.now() * 0.005) * 3;
    ctx.globalAlpha = 0.35 + Math.sin(Date.now() * 0.007) * 0.15;
    ctx.fillStyle = gemColor;
    ctx.beginPath();
    ctx.arc(16, 2 + float, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(16, -5 + float);
    ctx.lineTo(22, 3 + float);
    ctx.lineTo(16, 11 + float);
    ctx.lineTo(10, 3 + float);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = gemColor;
    ctx.beginPath();
    ctx.moveTo(16, -3 + float);
    ctx.lineTo(20, 3 + float);
    ctx.lineTo(16, 9 + float);
    ctx.lineTo(12, 3 + float);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
