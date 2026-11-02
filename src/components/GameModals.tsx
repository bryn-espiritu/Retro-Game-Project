/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameEngine } from '../game/engine';
import { Volume2, VolumeX, Play, RotateCcw, Home, Trophy, Skull, Download } from 'lucide-react';
import { sound } from '../game/audio';

interface ModalProps {
  engine: GameEngine;
  isMuted: boolean;
  onToggleMute: () => void;
  onResume?: () => void;
  onReturnToFarm?: () => void;
  onRestartNewGame?: () => void;
  onOpenExport?: () => void;
}

export const PauseModal: React.FC<ModalProps> = ({ engine, isMuted, onToggleMute, onResume, onReturnToFarm, onOpenExport }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-md p-6 flex flex-col items-center text-center shadow-2xl">
        <h2 className="text-sm font-pixel text-slate-100 mb-6">GAME PAUSED</h2>

        <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME</span>
          </button>

          {engine.screen === 'DUNGEON' && (
            <button
              onClick={onReturnToFarm}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs py-3 px-4 rounded-xl transition-all cursor-pointer border border-slate-600"
            >
              <Home className="w-4 h-4" />
              <span>RETREAT TO FARM</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-600/50 font-pixel text-xs py-3 px-4 rounded-xl transition-all cursor-pointer shadow"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>EXPORT GAME / OFFLINE</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-pixel-sm text-xs py-3 px-4 rounded-xl transition-all cursor-pointer border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>
        </div>

        <div className="w-full border-t border-slate-800 pt-4 text-left">
          <p className="text-[11px] font-mono text-slate-400 mb-2">Controls Reference:</p>
          <ul className="text-[11px] font-mono text-slate-400 space-y-1">
            <li>• <strong className="text-slate-200">WASD / Arrows:</strong> Move & Face direction</li>
            <li>• <strong className="text-slate-200">Space / Left Click:</strong> Primary tool/weapon action</li>
            <li>• <strong className="text-slate-200">Shift / Right Click:</strong> Dodge roll (i-frames)</li>
            <li>• <strong className="text-slate-200">E:</strong> Interact / Harvest / Open Cauldron & Forge</li>
            <li>• <strong className="text-slate-200">1 - 5:</strong> Select Hotbar slot</li>
          </ul>
        </div>

        <div className="w-full text-center mt-4 pt-3 border-t border-slate-800">
          <p className="text-[10px] font-pixel-sm text-slate-500 tracking-wide">
            Created by <span className="text-emerald-400 font-semibold">Bryn Espiritu</span> · Built with <span className="text-amber-400 font-semibold">Google AI Studio</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const GameOverModal: React.FC<ModalProps> = ({ engine, onReturnToFarm }) => {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border-2 border-rose-600/80 rounded-2xl w-full max-w-md p-6 flex flex-col items-center text-center shadow-[0_0_50px_rgba(225,29,72,0.3)]">
        <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-600 flex items-center justify-center mb-4">
          <Skull className="w-7 h-7 text-rose-500 animate-pulse" />
        </div>

        <h2 className="text-sm md:text-base font-pixel text-rose-400 mb-2">FELL IN THE DEPTHS</h2>
        <p className="text-xs text-slate-400 mb-6">
          The subterranean darkness overwhelmed you, but the surface sanctuary still blossoms.
        </p>

        {/* Run Stats */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Depth Reached:</span>
            <span className="text-amber-300 font-bold tabular-nums">Floor {engine.stats.currentFloor}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Monsters Slain:</span>
            <span className="text-rose-400 font-bold tabular-nums">{engine.stats.monstersSlain}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Crops Harvested:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{engine.stats.cropsHarvested}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Gold Retained:</span>
            <span className="text-yellow-400 font-bold tabular-nums">{engine.stats.gold}</span>
          </div>
        </div>

        <button
          onClick={onReturnToFarm}
          className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RETURN TO HOMESTEAD</span>
        </button>
      </div>
    </div>
  );
};

export const VictoryModal: React.FC<ModalProps> = ({ engine, onReturnToFarm }) => {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border-2 border-amber-400/80 rounded-2xl w-full max-w-md p-6 flex flex-col items-center text-center shadow-[0_0_50px_rgba(251,191,36,0.35)]">
        <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-400 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        <h2 className="text-sm md:text-base font-pixel text-amber-400 mb-2">DUNGEON CONQUERED!</h2>
        <p className="text-xs text-slate-300 mb-6">
          You have conquered the 10th floor Dread Overlord! Your farmstead has restored vitality to the realm.
        </p>

        {/* Victory Stats */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 text-xs font-mono">
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Deepest Floor:</span>
            <span className="text-amber-300 font-bold tabular-nums">Floor 10 (Mastered)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Monsters Vanquished:</span>
            <span className="text-rose-400 font-bold tabular-nums">{engine.stats.monstersSlain}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">Crops Harvested:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{engine.stats.cropsHarvested}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Total Gold:</span>
            <span className="text-yellow-400 font-bold tabular-nums">{engine.stats.gold}</span>
          </div>
        </div>

        <button
          onClick={onReturnToFarm}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer font-bold shadow-lg"
        >
          <Home className="w-4 h-4" />
          <span>RETURN TRIUMPHANT TO FARM</span>
        </button>

        <p className="text-[10px] font-pixel-sm text-slate-500 mt-4 tracking-wide">
          Created by <span className="text-emerald-400 font-semibold">Bryn Espiritu</span> · Built with <span className="text-amber-400 font-semibold">Google AI Studio</span>
        </p>
      </div>
    </div>
  );
};
