# Verdant Depths: Dungeon & Harvest

A 16-bit retro pixel-art dungeon survival action game seamlessly intertwined with an enchanted surface farming simulation. Players cultivate magical crops on their homestead to craft restorative tonics, combat buffs, and gear enchantments, then venture into progressively hostile procedural subterranean dungeon floors teeming with monsters, traps, treasures, and boss encounters.

## User Review & Critical Decisions

> [!IMPORTANT]
> The core game loops and visual aesthetic have been aligned with your selections:
> - **Game Loop Intertwining**: Dual-phase loop with a surface farm sanctuary hub where crops are planted, watered, harvested, and cooked/crafted into supplies and permanent upgrades before entering the dungeon depths.
> - **Combat Style**: Real-time 60fps action combat with responsive sword slashes, directional bow archery, dodge rolling with i-frames, and magical crop abilities.
> - **Visual & Audio Style**: Rich 16-bit retro pixel fantasy palette, procedural torchlight illumination in dungeon depths, lush animated farm biomes, and synthesized Web Audio 8-bit sound effects.

- **Confirmed Decision 1**: Surface farm hub acts as the preparation and upgrade sanctuary; descending into the dungeon stairs initiates survival runs across scaling dungeon floors.
- **Confirmed Decision 2**: Real-time fluid combat mechanics including stamina-based dodge rolls, melee combos, projectile aiming, hit-stop impacts, and enemy windup telegraphs.
- **Confirmed Decision 3**: 16-bit pixel aesthetic with canvas-based 2D lighting (circular radial falloff around player torches, wall sconces, and glowing subterranean fungi).
- **Default Game Shell Architecture**: Full-viewport immersive canvas shell without standard website headers or footers, low-occlusion HUD (<15% screen space), and keyboard + optional virtual touch/mouse controls.

---

## 1. Overview & Core Concept

### What It Does
**Verdant Depths** merges cozy agricultural progression with adrenaline-pumping roguelite dungeon survival:
1. **The Farmstead (Sanctuary)**: Players till soil, plant enchanted seeds (Sun-turnips, Iron-root, Blaze-peppers, Frost-berries, Soul-pumpkins), water them with a watering can or well water, harvest mature produce, brew elixirs at the cauldron, and upgrade tools or weapons at the anvil.
2. **The Descent (Dungeon Survival)**: Players step down the dungeon hatch into multi-room procedurally generated labyrinthine floors. Each floor features scaling monster variants (Slimes, Skeleton archers, Shadow bats, Armored dungeon knights, and Level 5/10 Bosses), environmental traps (spikes, poison vents), destructible pots, chest loot, and an exit portal to deeper floors or back to the surface.
3. **The Symbiosis**: Defeated dungeon enemies drop rare seeds and ancient fertilizer; harvested crops yield stat enhancements (speed, attack power, defense, health regen, elemental weapon imbues) vital for surviving deeper floors.

### Target Audience & Persona
Fans of retro roguelites (*Enter the Gungeon*, *Moonlighter*, *The Binding of Isaac*) and classic pixel farming adventures (*Stardew Valley*, *Harvest Moon*, *Rune Factory*).

### Key Value
A frictionless, punchy gameplay loop where cozy farming directly empowers high-stakes dungeon survival, all rendered in an authentic 16-bit aesthetic at a rock-solid 60fps with zero loading delays.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────┐
│                   Title Screen                         │
│  Atmospheric pixel panorama, torch ember particles,    │
│  "Press SPACE or ENTER to Start", Sound Toggle         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Surface Farm (Sanctuary)                 │
│  • Till Soil (Hoe) · Water Crops · Harvest Produce     │
│  • Alchemy Cauldron (Craft Stat Tonics & Meals)        │
│  • Blacksmith Forge (Upgrade Sword, Bow, Quiver)       │
│  • Dungeon Entrance Hatch (Prepare & Descend)          │
└──────────────────────────┬─────────────────────────────┘
                           │ (Descend Stairs)
                           ▼
┌────────────────────────────────────────────────────────┐
│               Dungeon Floors (Floor 1 to N)            │
│  • Dynamic Torch Lighting & Fog of War                 │
│  • Real-time Combat: Sword Slash, Bow Aim, Dodge Roll  │
│  • Enemies with Telegraph Flashes & Hitstop Impacts   │
│  • Treasure Chests, Rare Seed Drops & Gold             │
│  • Exit Portal: Go Deeper or Return Safely to Farm     │
└──────────────────────────┬─────────────────────────────┘
                           │ (Defeat or Victory)
                           ▼
┌────────────────────────────────────────────────────────┐
│         Death / Floor Clear Summary Screen             │
│  Floor reached, monsters vanquished, crops saved,      │
│  instant restart or return to farmstead without reload │
└────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
- **Aesthetic Direction**: 16-bit pixel fantasy RPG with crisp pixel grid rendering (`image-rendering: pixelated`), handcrafted sprite sheets rendered onto HTML5 Canvas, smooth camera tracking with slight interpolation, and dynamic point-light radial illumination.
- **Color Palette & Atmospheric Lighting**:
  - *Farmstead*: Warm daylight amber (`#FDE68A`), fertile soil browns (`#78350F`, `#92400E`), vibrant foliage greens (`#15803D`, `#22C55E`), crystal stream blues (`#0284C7`).
  - *Dungeon Floors*: Deep abyssal stone (`#0F172A`, `#1E293B`), torch flame orange-yellow (`#F59E0B`, `#EA580C`), spectral enemy purple (`#A855F7`), blood-red telegraph flashes (`#EF4444`).
- **Typography & UI Hierarchy**:
  - Retro pixel-styled headings (`'Press Start 2P'`, `'Silkscreen'`, or crisp monospace uppercase) with high-legibility clean body fonts for descriptions.
  - Tabular numerals (`tabular-nums`) for health points, stamina, gold, seed counts, and floor numbers.
- **Low-Occlusion HUD Overlay**:
  - Top-Left: Player Health Hearts / Bar & Stamina Diamond / Meter.
  - Top-Right: Current Depth / Floor indicator, Gold balance, active Crop Buff timers.
  - Bottom-Center: Hotbar quick-slots (Sword, Bow, Hoe, Watering Can, Consumables/Buff Dishes) with keybind labels `[1]-[5]` and mouse click selection.
  - Top Center: Subtle floor title banner that fades out after 2 seconds upon entering.
  - At least 85% of viewport remains unobstructed with `pointer-events: none` on HUD overlay wrappers.

### Interactive Feedback & Sound Design (Web Audio API)
- **Web Audio Procedural Synthesizer**: No external audio files needed; real-time procedural synthesizers generate nostalgic soundscapes:
  - Sword slash: White noise burst with quick high-pass frequency envelope.
  - Bow shot: Pitch-swept square wave pluck.
  - Hit impact & Hitstop: Low square thump + 50ms simulation micro-freeze and camera shake.
  - Crop harvest & watering: Cheerful arpeggiated melodic bell chime.
  - Low health heartbeat: Muffled sine pulse.
  - Mute / Audio toggle in corner.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Pure Canvas 60fps Game Loop vs. React Component Renders
- **Chosen Approach**: Isolated HTML5 Canvas rendered via `requestAnimationFrame` with a pure TypeScript game engine state machine. React acts solely as the lightweight outer shell (handling audio consent, high-level menus, and HUD overlays).
- **Why**: Keeps frame delta time clamped (`Math.min(dt, 0.05)`), eliminates React re-render overhead during high-intensity combat with dozens of particles/projectiles, and guarantees 60fps performance across desktop and mobile.
- **Alternatives Considered**: Rendering game entities as DOM elements or SVG nodes. Passed over due to extreme layout thrashing and DOM overhead during dungeon combat.

### Decision 2: Surface Farm Hub vs. In-Dungeon Farming
- **Chosen Approach**: Dedicated Surface Farm sanctuary with easy transition stairs to the Dungeon. The player can spend as much time cultivating, harvesting, and preparing on the surface without fear of sudden enemy ambushes, then deliberately embark on dungeon runs.
- **Why**: Delivers the relaxing, rewarding pacing of agricultural simulators while building tension and stakes before entering the dungeon. Seeds collected from dungeon runs fuel farm expansion, creating a satisfying gameplay loop.

### Decision 3: Procedural Dungeon Generation (Rooms & Corridors)
- **Chosen Approach**: Grid-based BSP (Binary Space Partitioning) and cellular dungeon layout generating 6–10 connected rooms per floor with wall collisions, decorative torch sconces, destructible pots, spawn points, and exit stairwells.
- **Why**: Ensures infinite replayability, varying tactical spaces (chokepoints, wide arenas), and distinct room configurations as floor levels increase.

### Decision 4: Responsive Input Pipeline (Keyboard, Mouse & Virtual Gamepad)
- **Chosen Approach**: Dual input handler supporting:
  - Desktop: WASD / Arrow keys for movement, Space or Left Click for Primary Action (Attack / Tool Use), Right Click or Shift for Dodge Roll, `[1]-[5]` for hotbar items, `E` to interact.
  - Mobile / Touch: Dynamic on-screen virtual stick and responsive action buttons.
  - Edge-triggered actions (`justPressed`) separated from continuous states (`held`) with 100ms input buffering.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           App.tsx (Root Shell)                         │
│   • Game State: TITLE | FARM | DUNGEON | PAUSE | GAME_OVER             │
│   • Audio Context Manager (Web Audio Synthesizer & Mute State)         │
│   • Local Storage High Scores & Farm Persistence                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│       GameCanvas (Engine)       │   │           GameHUD (Overlay)      │
│ • 60fps RequestAnimationFrame   │   │ • Hearts & Stamina Bar           │
│ • Clamped Delta Time (dt)       │   │ • Floor & Gold Display           │
│ • Camera Tracking & Shake       │   │ • Active Buff Timers             │
│ • Dynamic Radial Lighting       │   │ • 5-Slot Interactive Hotbar      │
│ • Particle System (Sparks/Blood)│   │ • Contextual Interaction Prompt  │
└────────────────┬────────────────┘   └──────────────────────────────────┘
                 │
  ┌──────────────┴──────────────────────────────┐
  ▼                                             ▼
┌───────────────────────────┐     ┌────────────────────────────┐
│    Farm World Module      │     │    Dungeon World Module    │
│ • Tilled Soil Tile Grid   │     │ • Procedural BSP Generator │
│ • Crop Growth Simulation  │     │ • Scaling Monster Spawners │
│ • Well Water & Harvests   │     │ • Slimes, Archers, Knights │
│ • Cauldron Recipe Cooker  │     │ • Projectile & Hitbox Calc │
│ • Blacksmith Forge Craft  │     │ • Boss Encounters (Fl 5,10)│
└───────────────────────────┘     └────────────────────────────┘
                 ▲                              ▲
                 └──────────────┬───────────────┘
                                │
                    ┌───────────┴───────────┐
                    │    Player Controller  │
                    │ • 8-Dir Move & Roll   │
                    │ • Attack Hitbox Arcs  │
                    │ • Inventory & Tools   │
                    │ • Stat Buff Modifiers │
                    └───────────────────────┘
```

### Key Data Entities & Game State

```typescript
// Core Player State
interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'up' | 'down' | 'left' | 'right';
  maxHp: number;
  hp: number;
  stamina: number;
  maxStamina: number;
  isRolling: boolean;
  rollTimer: number;
  attackCooldown: number;
  activeBuffs: ActiveBuff[];
  gold: number;
  inventory: InventoryItem[];
  selectedSlot: number;
}

// Crop & Farm Plot
interface CropPlot {
  x: number;
  y: number;
  tilled: boolean;
  watered: boolean;
  seedType?: SeedType;
  growthStage: number; // 0 (seed) to 3 (mature)
  growthTimer: number;
}

export type SeedType = 'sun_turnip' | 'iron_root' | 'blaze_pepper' | 'frost_berry' | 'soul_pumpkin';

// Crop Buffs
interface ActiveBuff {
  type: 'speed' | 'damage' | 'defense' | 'regen';
  multiplier: number;
  durationRemaining: number;
}

// Dungeon Floor & Enemies
interface Enemy {
  id: string;
  type: 'slime' | 'skeleton' | 'bat' | 'knight' | 'boss';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  attackTelegraph: number;
  isTelegraphing: boolean;
  hitStun: number;
}
```

### Progression & Difficulty Scaling
- **Floors 1-2**: Friendly introduction with wandering Green Slimes and destructible jars.
- **Floors 3-4**: Skeleton archers with visible shot telegraph lines, spike traps, Red Slimes that burst into smaller slimes.
- **Floor 5 (Boss)**: "Corrupted Treant / Crypt Golem" boss with ground slams, area-of-effect thorn bursts, and massive seed drops.
- **Floors 6-9**: Armored Knights with shield blocking, toxic bat swarms, and lava/poison hazards.
- **Floor 10 (Final Boss)**: "Underworld Overlord" with phase transitions, projectile barrages, and heroic victory sequence.
