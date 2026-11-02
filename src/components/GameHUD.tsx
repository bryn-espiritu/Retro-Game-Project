/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameEngine } from '../game/engine';
import { Volume2, VolumeX, Shield, Swords, Zap, Heart, Droplets, Coins, Flame, CloudSun } from 'lucide-react';
import { sound } from '../game/audio';
import { WEATHER_CONDITIONS } from '../game/constants';

interface GameHUDProps {
  engine: GameEngine;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ engine, isMuted, onToggleMute, onPause }) => {
  const { stats, activeBuffs, inventory, selectedHotbarIndex, interactionPrompt, screen } = engine;

  const healthPct = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const staminaPct = Math.max(0, Math.min(100, (stats.stamina / stats.maxStamina) * 100));
  const waterPct = Math.max(0, Math.min(100, (stats.waterLevel / stats.maxWaterLevel) * 100));

  const weather = WEATHER_CONDITIONS[engine.currentWeather];

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 md:p-5">
      {/* Top Header Strip */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Player Vitality Status */}
        <div className="flex flex-col gap-2 bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 backdrop-blur-xs min-w-[200px] shadow-lg">
          {/* Health Bar */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            <div className="flex-1 bg-slate-800/90 h-3.5 rounded overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded transition-all duration-150"
                style={{ width: `${healthPct}%` }}
              />
            </div>
            <span className="text-[11px] font-mono tabular-nums text-rose-300 font-semibold w-12 text-right">
              {Math.ceil(stats.hp)}/{stats.maxHp}
            </span>
          </div>

          {/* Stamina Bar */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <div className="flex-1 bg-slate-800/90 h-2.5 rounded overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded transition-all duration-100"
                style={{ width: `${staminaPct}%` }}
              />
            </div>
            <span className="text-[10px] font-mono tabular-nums text-amber-300 w-12 text-right">
              {Math.ceil(stats.stamina)}
            </span>
          </div>

          {/* Water Can (Relevant in Farm) */}
          {screen === 'FARM' && (
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="flex-1 bg-slate-800/90 h-2 rounded overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-sky-600 to-cyan-400 h-full rounded transition-all duration-150"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-sky-300 w-12 text-right">
                {stats.waterLevel}/{stats.maxWaterLevel}
              </span>
            </div>
          )}
        </div>

        {/* Top-Right: Location, Weather, Gold & Controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Location & Controls cluster */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Dynamic Weather Badge (in Farm mode) */}
            {screen === 'FARM' && (
              <button
                onClick={() => engine.cycleWeather()}
                className="pointer-events-auto bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-pixel-sm text-slate-200 hover:text-white flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer group"
                title="Click to shift weather or commune with Weather Obelisk on Farm"
              >
                <span>{weather.icon}</span>
                <span className="text-amber-300 hidden sm:inline">{weather.name}</span>
                <span className="text-[10px] font-mono tabular-nums font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-1 py-0.5 rounded">
                  {weather.growthMultiplier}x
                </span>
                <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {Math.ceil(engine.weatherTimer)}s
                </span>
              </button>
            )}

            {/* Location Badge */}
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-pixel-sm text-amber-300 flex items-center gap-2 shadow-lg">
              {screen === 'FARM' ? (
                <>
                  <span className="text-emerald-400">🌱</span>
                  <span className="hidden sm:inline">Farmstead Sanctuary</span>
                  <span className="sm:hidden">Farm</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Dungeon {stats.currentFloor}F</span>
                </>
              )}
            </div>

            {/* Gold Counter */}
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums text-amber-400 font-semibold flex items-center gap-1.5 shadow-lg">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span>{stats.gold}</span>
            </div>

            {/* Audio Mute button */}
            <button
              onClick={onToggleMute}
              className="pointer-events-auto bg-slate-950/80 hover:bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Pause button */}
            <button
              onClick={onPause}
              className="pointer-events-auto bg-slate-950/80 hover:bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-pixel-sm text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg"
            >
              ESC
            </button>
          </div>

          {/* Active Buffs Pill Indicators */}
          {activeBuffs.length > 0 && (
            <div className="flex flex-col items-end gap-1.5 mt-1">
              {activeBuffs.map((buff) => (
                <div
                  key={buff.type}
                  className="bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded-md text-[11px] flex items-center gap-2 shadow"
                >
                  {buff.type === 'damage' && <Swords className="w-3.5 h-3.5 text-rose-400" />}
                  {buff.type === 'defense' && <Shield className="w-3.5 h-3.5 text-slate-300" />}
                  {buff.type === 'speed' && <Zap className="w-3.5 h-3.5 text-sky-400" />}
                  {buff.type === 'regen' && <Heart className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-slate-200">{buff.name}</span>
                  <span className="font-mono tabular-nums text-amber-300 font-bold">
                    {Math.ceil(buff.durationRemaining)}s
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Prompt Banner */}
      {interactionPrompt && (
        <div className="self-center mb-4 animate-bounce">
          <div className="bg-slate-950/90 border-2 border-amber-400 text-amber-300 px-4 py-2 rounded-lg text-xs md:text-sm font-pixel-sm shadow-2xl flex items-center gap-2">
            <span>✨</span>
            <span>{interactionPrompt}</span>
          </div>
        </div>
      )}

      {/* Bottom Center: Hotbar Quick Slots */}
      <div className="self-center flex flex-col items-center gap-1.5">
        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2 bg-slate-950/90 border border-slate-800 p-1.5 rounded-xl shadow-2xl">
          {inventory.slice(0, 5).map((item, index) => {
            const isSelected = selectedHotbarIndex === index;
            return (
              <button
                key={item.id}
                onClick={() => {
                  engine.selectedHotbarIndex = index;
                  sound.unlock();
                }}
                className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/60 border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-900/80 border border-slate-700/80 hover:border-slate-500'
                }`}
              >
                {/* Slot index key number */}
                <span className="absolute top-1 left-1.5 text-[9px] font-pixel text-slate-400">
                  {index + 1}
                </span>

                {/* Item Icon */}
                <span className="text-xl md:text-2xl mt-1">{item.icon}</span>

                {/* Stack count */}
                {item.count > 1 && (
                  <span className="absolute bottom-1 right-1.5 text-[10px] font-mono tabular-nums font-bold text-amber-300 bg-slate-950/80 px-1 rounded">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Item Label */}
        {inventory[selectedHotbarIndex] && (
          <div className="text-[11px] font-pixel-sm text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
            {inventory[selectedHotbarIndex].name}
          </div>
        )}
      </div>
    </div>
  );
};
