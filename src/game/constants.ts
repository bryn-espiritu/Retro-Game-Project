/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CropInfo, Recipe, BlacksmithUpgrade, SeedType, WeatherCondition, WeatherType } from './types';

export const TILE_SIZE = 32;

export const WEATHER_CONDITIONS: Record<WeatherType, WeatherCondition> = {
  sunny: {
    id: 'sunny',
    name: 'Clear Sunlight',
    icon: '☀️',
    growthMultiplier: 1.0,
    skyTint: 'rgba(254, 240, 138, 0.05)',
    ambientColor: '#FDE68A',
    description: 'Crisp warm daylight. Standard baseline crop growth.',
    autoWater: false,
    bonusSeedChance: 0
  },
  rain: {
    id: 'rain',
    name: 'Nourishing Rain',
    icon: '🌧️',
    growthMultiplier: 1.35,
    skyTint: 'rgba(30, 58, 138, 0.28)',
    ambientColor: '#93C5FD',
    description: 'Steady rainfall naturally irrigates all tilled plots (+35% Growth).',
    autoWater: true,
    bonusSeedChance: 0.15
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: 'Electrified Tempest',
    icon: '⚡',
    growthMultiplier: 1.5,
    skyTint: 'rgba(49, 46, 129, 0.42)',
    ambientColor: '#C4B5FD',
    description: 'Heavy lightning storm drenches soil instantly with energized rainwater (+50% Growth).',
    autoWater: true,
    bonusSeedChance: 0.25
  },
  heatwave: {
    id: 'heatwave',
    name: 'Solar Bloom',
    icon: '🔥',
    growthMultiplier: 1.8,
    skyTint: 'rgba(234, 88, 12, 0.26)',
    ambientColor: '#FDBA74',
    description: 'Intense thermal energy accelerates crop metabolism by +80%!',
    autoWater: false,
    bonusSeedChance: 0.2
  },
  fertility_mist: {
    id: 'fertility_mist',
    name: 'Ethereal Spore Mist',
    icon: '✨',
    growthMultiplier: 1.6,
    skyTint: 'rgba(16, 185, 129, 0.22)',
    ambientColor: '#86EFAC',
    description: 'Enchanted glowing fog accelerates growth (+60%) and greatly increases seed harvest!',
    autoWater: false,
    bonusSeedChance: 0.65
  }
};

export const CROPS: Record<SeedType, CropInfo> = {
  sun_turnip: {
    id: 'sun_turnip',
    name: 'Sun Turnip',
    growTimeSeconds: 12,
    color: '#FACC15',
    glowColor: '#FEF08A',
    description: 'A radiant root that absorbs sunlight. Essential for restorative tonics.',
    buffDescription: 'Regenerates Health over time.'
  },
  iron_root: {
    id: 'iron_root',
    name: 'Iron Root',
    growTimeSeconds: 18,
    color: '#94A3B8',
    glowColor: '#E2E8F0',
    description: 'A dense, metallic tuber grown in mineral soil. Fortifies physical armor.',
    buffDescription: '+50% Physical Armor defense.'
  },
  blaze_pepper: {
    id: 'blaze_pepper',
    name: 'Blaze Pepper',
    growTimeSeconds: 22,
    color: '#EF4444',
    glowColor: '#FCA5A5',
    description: 'Spicy subterranean pepper that burns with subterranean embers.',
    buffDescription: '+60% Melee & Bow Attack damage.'
  },
  frost_berry: {
    id: 'frost_berry',
    name: 'Frost Berry',
    growTimeSeconds: 16,
    color: '#38BDF8',
    glowColor: '#BAE6FD',
    description: 'A glistening berry that stays freezing cold even in summer heat.',
    buffDescription: '+45% Movement & Dash speed.'
  },
  soul_pumpkin: {
    id: 'soul_pumpkin',
    name: 'Soul Pumpkin',
    growTimeSeconds: 30,
    color: '#A855F7',
    glowColor: '#E9D5FF',
    description: 'A mystical gourd harvested from enchanted ethereal seeds.',
    buffDescription: 'Grants +100 Max Health & immediate full heal.'
  }
};

export const ALCHEMY_RECIPES: Recipe[] = [
  {
    id: 'elixir_sun',
    name: 'Solar Vitality Draught',
    requiredCrops: [{ seedType: 'sun_turnip', count: 2 }],
    goldCost: 15,
    resultPotion: {
      name: 'Solar Vitality Draught',
      effect: 'regen',
      multiplier: 3, // heals 3 HP per second
      duration: 35,
      color: '#EAB308',
      description: 'Restores 3 HP every second for 35s.'
    }
  },
  {
    id: 'elixir_iron',
    name: 'Ironhide Decoction',
    requiredCrops: [{ seedType: 'iron_root', count: 2 }],
    goldCost: 20,
    resultPotion: {
      name: 'Ironhide Decoction',
      effect: 'defense',
      multiplier: 0.5, // 50% damage reduction
      duration: 40,
      color: '#64748B',
      description: 'Reduces incoming monster damage by 50% for 40s.'
    }
  },
  {
    id: 'elixir_blaze',
    name: 'Berserker Fire Infusion',
    requiredCrops: [{ seedType: 'blaze_pepper', count: 2 }],
    goldCost: 25,
    resultPotion: {
      name: 'Berserker Fire Infusion',
      effect: 'damage',
      multiplier: 1.6, // +60% attack
      duration: 35,
      color: '#DC2626',
      description: 'Increases sword and bow damage by 60% for 35s.'
    }
  },
  {
    id: 'elixir_frost',
    name: 'Zephyr Frost Nectar',
    requiredCrops: [{ seedType: 'frost_berry', count: 2 }],
    goldCost: 20,
    resultPotion: {
      name: 'Zephyr Frost Nectar',
      effect: 'speed',
      multiplier: 1.45, // +45% move speed
      duration: 40,
      color: '#0284C7',
      description: 'Increases movement & roll recovery speed by 45% for 40s.'
    }
  }
];

export const BLACKSMITH_UPGRADES: BlacksmithUpgrade[] = [
  {
    id: 'upgrade_sword',
    name: 'Sword Tempering',
    category: 'sword',
    currentTier: 1,
    maxTier: 4,
    goldCost: 40,
    requiredCrops: [{ seedType: 'iron_root', count: 1 }, { seedType: 'blaze_pepper', count: 1 }],
    description: 'Increases sword slash damage and hit range.'
  },
  {
    id: 'upgrade_bow',
    name: 'Bow String Reinforcement',
    category: 'bow',
    currentTier: 1,
    maxTier: 3,
    goldCost: 35,
    requiredCrops: [{ seedType: 'frost_berry', count: 1 }, { seedType: 'sun_turnip', count: 1 }],
    description: 'Increases bow arrow velocity, damage, and projectile penetration.'
  },
  {
    id: 'upgrade_hp',
    name: 'Vitality Elixir Cauldron',
    category: 'hp',
    currentTier: 1,
    maxTier: 5,
    goldCost: 50,
    requiredCrops: [{ seedType: 'sun_turnip', count: 2 }, { seedType: 'soul_pumpkin', count: 1 }],
    description: 'Permanently increases maximum player health (+25 HP).'
  },
  {
    id: 'upgrade_stamina',
    name: 'Endurance Band',
    category: 'stamina',
    currentTier: 1,
    maxTier: 4,
    goldCost: 35,
    requiredCrops: [{ seedType: 'frost_berry', count: 1 }, { seedType: 'iron_root', count: 1 }],
    description: 'Permanently increases stamina and reduces dodge roll exhaustion.'
  }
];
