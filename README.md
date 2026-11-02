# 🌿 Verdant Depths: Dungeon & Harvest

> **A 16-bit retro pixel-art dungeon crawler and farming simulation built in HTML5 Canvas, React, and TypeScript.**
>
> **Creator:** Bryn Espiritu  
> **Tool Used:** Google AI Studio

---

## 📖 Overview

**Verdant Depths** seamlessly intertwines the cozy progression of an agricultural simulator with the high-stakes adrenaline of an action roguelite. Cultivate magical subterranean crops on your surface homestead to brew restorative tonics and forge powerful combat upgrades, then delve into progressively hostile procedural dungeon floors teeming with monsters, traps, and boss encounters.

---

## ✨ Key Features

### 🚜 1. Surface Farmstead Simulation
- **Full Farming Lifecycle**: Till fertile soil with your Hoe, irrigate dry plots with your Watering Can, and cultivate **5 magical crop varieties**:
  - **Sun Turnip** (`#FACC15`): Radiant root that absorbs sunlight. Brews health-restoring elixirs.
  - **Iron Root** (`#94A3B8`): Dense metallic tuber. Fortifies physical armor (+50% defense).
  - **Blaze Pepper** (`#EF4444`): Fiery subterranean pepper. Boosts melee & bow attack damage (+60%).
  - **Frost Berry** (`#38BDF8`): Freezing cold cluster. Increases movement & dodge roll speed (+45%).
  - **Soul Pumpkin** (`#A855F7`): Ethereal mystical gourd. Fully heals and increases max health.
- **Natural Irrigation & Well**: Refill your watering can at the stone well, or let natural rain showers water your tilled plots automatically.
- **Alchemical Cauldron**: Combine harvested crops and gold into potent combat draughts with real-time buff durations.
- **Blacksmith Forge**: Temper blades (Tiers 1–4), reinforce composite bows (Tiers 1–3), and permanently forge Maximum Health and Stamina upgrades.
- **Subterranean Hatch**: Descend directly into the dungeon depths when prepared.

---

### 🌦️ 2. Dynamic Weather Simulation
The surface homestead features an atmospheric weather engine with dynamic sky color shifts, particle effects, and agricultural modifiers:
- **☀️ Clear Sunlight**: Warm golden daylight; standard baseline (1.0x) crop growth.
- **🌧️ Nourishing Rain**: Slate-blue skies and falling raindrops. **Naturally waters all tilled soil** and boosts growth by **+35% (1.35x)**.
- **⚡ Electrified Tempest**: Heavy rain, lightning flashes, and procedural thunder rumbles. Drenches soil instantly with energized rainwater (**1.5x growth** + 25% bonus seed drops).
- **🔥 Solar Bloom (Heatwave)**: Vibrant amber/orange horizon tint with shimmering embers. Accelerates crop metabolism by **+80% (1.8x)**.
- **✨ Ethereal Spore Mist**: Glowing bioluminescent emerald fog. Accelerates growth by **+60% (1.6x)** and grants a **+65% chance for bonus rare seed yields**.
- **Weather Obelisk**: Approach the runic totem stone and press `[E]` to commune with the elements and shift the weather cycle on demand.

---

### ⚔️ 3. Subterranean Dungeon Roguelite
- **Procedural Floor Generation**: Binary Space Partitioning (BSP) creates connected cobblestone rooms, corridors, wall torches, destructible clay pots, and locked treasure chests.
- **Dynamic 2D Torchlight & Fog of War**: Dark subterranean ambiance with smooth circular radial illumination around player torches, wall sconces, and exit portals.
- **Scaling Monster Variants & Visible Telegraphs**:
  - **Bouncing Green Slimes**: Squash-and-stretch hopping physics with close-range contact damage.
  - **Skeleton Archers**: Snipers that maintain distance and aim with visible red laser windup lines.
  - **Shadow Bats**: High-speed erratic flight patterns that swoop from the shadows.
  - **Armored Dungeon Knights**: Heavy plate armor, broadswords, and defensive shields.
  - **Epic Boss Encounters**: *Floor 5 Crypt Bramble Titan* and *Floor 10 Dread Overlord* featuring area-of-effect ground slams and spread attacks.
- **Game Feel & Combat Juice**: Melee sword slash arcs with knockback, aimed archery with projectile physics, stamina-based dodge rolls with invulnerability frames (i-frames), 50ms simulation hitstop on heavy impacts, white hit-flashes, decaying camera shake, and floating combat text.

---

### 🔊 4. Procedural Web Audio Engine
- Built with the native browser Web Audio API—**100% synthesized in real time with zero external audio files**:
  - Sword slash whoosh envelopes
  - Plucked bowstring pitch-sweeps
  - Crunchy impact hits & damage punches
  - Water splashing & soil tilling effects
  - 4-note ascending crystal chime for crop harvesting
  - Rolling low-frequency thunder rumbles
  - Ambient procedural pentatonic music box melodies (Farm) and ominous low drones (Dungeon)
  - In-game Sound Toggle (`Mute / Unmute`)

---

## 🎮 Controls

| Action | Keyboard / Mouse | Touch / Mobile |
| :--- | :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` or Arrow Keys | Virtual Analog Joystick |
| **Primary Action** (Slash / Shoot / Till / Water) | `Left Click` or `Space` | Action Button (Swords) |
| **Dodge Roll** (i-frames) | `Right Click` or `Shift` | Shield Button |
| **Interact** (Harvest / Cauldron / Forge / Hatch / Obelisk) | `E` | Hand Button |
| **Hotbar Slots** | `1`, `2`, `3`, `4`, `5` or click slot | Tap Hotbar Slot |
| **Pause / Game Guide** | `Escape` | `ESC` Header Button |

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Renderer**: Pure HTML5 Canvas 2D running a decoupled 60fps simulation loop with clamped delta time
- **Styling**: Tailwind CSS v4 + bespoke pixel-art font typography (`Press Start 2P`, `Silkscreen`, `Plus Jakarta Sans`)
- **Audio**: Procedural Web Audio API synthesizer
- **Bundler**: Vite 8
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/your-username/verdant-depths.git

# 2. Enter project directory
cd verdant-depths

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open your browser at `http://localhost:3000` to play!

---

## 📦 Standalone Offline Export

You can build a **single, self-contained HTML file** that requires **no Node.js, server, or internet connection**:

```bash
npm run build:standalone
```

- Output file: `dist/verdant-depths-standalone.html`
- **Double-click** the generated `.html` file on Windows, macOS, or Linux to play offline directly in Chrome, Edge, Safari, or Firefox!

---

## 💾 Save Data Transfer
Under the in-game **Export & Offline Play** menu (`Title Screen` -> `Export Game` or `Esc` -> `Export`):
- **Export Save File**: Download your current farm layout, gold, weapon tiers, and deepest floor cleared as a `.json` backup.
- **Import Save File**: Restore your saved progress onto any computer or browser.

---

## 📜 Credits

- **Creator & Game Designer**: **Bryn Espiritu**
- **Development Tool**: **Google AI Studio**
- **License**: Apache-2.0
